import * as XLSX from 'xlsx'

/**
 * Reads an Excel File object and returns structured contributions + expenses.
 *
 * Supports the "gastos-piso" format (auto-detects column positions from header row):
 *   Contribution section — header labels: persona / dinero / fecha
 *   Expense section      — header labels: categoria/gasto / dinero / fecha / descripcion (optional)
 */
export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const wb = XLSX.read(data, { type: 'array', cellDates: true })
        resolve(parseGastosPisoFormat(wb))
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsArrayBuffer(file)
  })
}

// ─── Column detection ─────────────────────────────────────────────────────────

/**
 * Reads a header row (0-based array) and returns the indices of each relevant
 * column. Returns null if the contribution section cannot be located.
 */
function detectColumns(headerRow) {
  const lc = headerRow.map(h => (h != null ? String(h).toLowerCase().trim() : null))

  // ── Contribution section ──
  // Locate "persona" that comes AFTER the summary "dinero total" (or similar)
  let contribPersonaIdx = -1
  {
    let pastSummary = false
    for (let i = 0; i < lc.length; i++) {
      if (!pastSummary && lc[i]?.includes('total')) pastSummary = true
      if (pastSummary && lc[i] === 'persona') { contribPersonaIdx = i; break }
    }
    // Fallback: second occurrence of "persona"
    if (contribPersonaIdx === -1) {
      let seen = 0
      for (let i = 0; i < lc.length; i++) {
        if (lc[i] === 'persona' && ++seen === 2) { contribPersonaIdx = i; break }
      }
    }
    // Fallback: any "persona" followed within 2 columns by "dinero"
    if (contribPersonaIdx === -1) {
      for (let i = 0; i < lc.length - 1; i++) {
        if (lc[i] === 'persona' && (lc[i + 1]?.includes('dinero') || lc[i + 2]?.includes('dinero'))) {
          contribPersonaIdx = i; break
        }
      }
    }
  }
  if (contribPersonaIdx === -1) return null

  const contrib = {
    persona: contribPersonaIdx,
    dinero:  contribPersonaIdx + 1,
    fecha:   contribPersonaIdx + 2,
  }

  // ── Expense section ──
  // First non-null column after contribFecha (there's usually a null separator)
  let expCatIdx = -1
  for (let i = contrib.fecha + 1; i < lc.length; i++) {
    if (lc[i] != null) { expCatIdx = i; break }
  }
  if (expCatIdx === -1) return null

  // Expense amount: first "dinero…" column after expense category (skip "total")
  let expAmountIdx = -1
  for (let i = expCatIdx + 1; i < lc.length; i++) {
    if (lc[i]?.startsWith('dinero') && !lc[i].includes('total')) {
      expAmountIdx = i; break
    }
  }
  if (expAmountIdx === -1) expAmountIdx = expCatIdx + 1

  // Expense date: "fecha" or "date" after amount
  let expFechaIdx = -1
  for (let i = expAmountIdx + 1; i < lc.length; i++) {
    if (lc[i]?.includes('fecha') || lc[i]?.includes('date')) { expFechaIdx = i; break }
  }
  // Fallback: first non-null non-"entre" column after amount
  if (expFechaIdx === -1) {
    for (let i = expAmountIdx + 1; i < lc.length; i++) {
      if (lc[i] != null && !lc[i].includes('entre')) { expFechaIdx = i; break }
    }
  }

  // Expense description: any non-null column after date (may not exist)
  let expDescIdx = -1
  if (expFechaIdx !== -1) {
    for (let i = expFechaIdx + 1; i < lc.length; i++) {
      if (lc[i] != null) { expDescIdx = i; break }
    }
  }

  return { contrib, expCatIdx, expAmountIdx, expFechaIdx, expDescIdx }
}

// ─── Main parser ──────────────────────────────────────────────────────────────

function parseGastosPisoFormat(workbook) {
  const contributions = []
  const expenses = []
  const personSet = new Set()
  const personsBySheet = {}
  // null key → expenses with no category name
  const categorySet = new Set()

  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })

    // Find header row: first row that has "persona" in the contribution persona column
    let headerIdx = -1
    let cols = null
    for (let i = 0; i < Math.min(5, rows.length); i++) {
      cols = detectColumns(rows[i] ?? [])
      if (cols) { headerIdx = i; break }
    }
    if (headerIdx === -1 || !cols) continue

    const sheetPersons = new Set()

    for (let i = headerIdx + 1; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.every(c => c == null)) continue

      // ── Aportación ──
      const persona    = row[cols.contrib.persona]
      const dineroAport = row[cols.contrib.dinero]
      const fechaAport  = row[cols.contrib.fecha]

      if (
        persona && typeof persona === 'string' &&
        dineroAport != null && !isNaN(Number(dineroAport)) && Number(dineroAport) !== 0
      ) {
        const name = persona.toLowerCase().trim()
        personSet.add(name)
        sheetPersons.add(name)
        contributions.push({
          persona: name,
          amount:  Number(dineroAport),
          date:    toDate(fechaAport),
          sheet:   sheetName,
          rowIdx:  i + 1,
        })
      }

      // ── Gasto común ──
      const rawCat     = row[cols.expCatIdx]
      const dineroGasto = row[cols.expAmountIdx]
      const fechaGasto  = cols.expFechaIdx !== -1 ? row[cols.expFechaIdx] : null
      const rawDesc     = cols.expDescIdx  !== -1 ? row[cols.expDescIdx]  : null

      if (dineroGasto != null && !isNaN(Number(dineroGasto)) && Number(dineroGasto) > 0) {
        const excelCategory = rawCat && typeof rawCat === 'string' ? rawCat.trim() : null
        const extraDesc = rawDesc && typeof rawDesc === 'string' ? rawDesc.trim() : null

        // Description to store: prefer the explicit description column, then category name
        const description = extraDesc || excelCategory || 'Gasto común'

        // Track unique categories (null = no category header)
        categorySet.add(excelCategory)

        expenses.push({
          excelCategory,
          description,
          amount: Number(dineroGasto),
          date:   toDate(fechaGasto),
          sheet:  sheetName,
          rowIdx: i + 1,
        })
      }
    }

    personsBySheet[sheetName] = [...sheetPersons]
  }

  return {
    contributions,
    expenses,
    personNames:  [...personSet],
    personsBySheet,
    // null represents "no category" rows
    uniqueCategories: [...categorySet],
  }
}

function toDate(val) {
  if (!val) return null
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d
}

// ─── Period auto-detection ────────────────────────────────────────────────────

/**
 * Returns { cutoffDate, prePeople, postPeople } or null if no transition detected.
 * The "cutoff" is the first date the newest flatmate started contributing.
 */
export function detectPeriods(contributions) {
  const byPerson = {}
  for (const c of contributions) {
    if (!byPerson[c.persona]) byPerson[c.persona] = []
    if (c.date && c.amount > 0) byPerson[c.persona].push(c.date)
  }
  for (const k of Object.keys(byPerson)) byPerson[k].sort((a, b) => a - b)

  let transitionDate = null
  for (const dates of Object.values(byPerson)) {
    if (!dates.length) continue
    if (!transitionDate || dates[0] > transitionDate) transitionDate = dates[0]
  }
  if (!transitionDate) return null

  const prePeople  = new Set()
  const postPeople = new Set()
  for (const [name, dates] of Object.entries(byPerson)) {
    if (dates.some(d => d < transitionDate))  prePeople.add(name)
    if (dates.some(d => d >= transitionDate)) postPeople.add(name)
  }

  return {
    cutoffDate: transitionDate.toISOString().split('T')[0],
    prePeople:  [...prePeople],
    postPeople: [...postPeople],
  }
}

// ─── Category auto-guess ──────────────────────────────────────────────────────

const CATEGORY_RULES = [
  { keywords: ['piso', 'alquiler', 'renta', 'rent', 'arrendamiento'],              id: 'bills'     },
  { keywords: ['luz', 'electricidad', 'electric', 'endesa', 'iberdrola'],          id: 'bills'     },
  { keywords: ['agua', 'water'],                                                    id: 'bills'     },
  { keywords: ['digi', 'internet', 'fibra', 'wifi', 'movistar', 'vodafone'],       id: 'bills'     },
  { keywords: ['gas'],                                                              id: 'bills'     },
  { keywords: ['mercadona', 'carrefour', 'lidl', 'aldi', 'supermercado', 'compra'], id: 'food'     },
  { keywords: ['restaurante', 'pizza', 'burger', 'kebab'],                         id: 'food'      },
  { keywords: ['ikea', 'amazon', 'zara', 'tienda'],                                id: 'shopping'  },
  { keywords: ['bus', 'metro', 'tren', 'taxi', 'uber', 'gasolina'],                id: 'transport' },
  { keywords: ['cine', 'teatro', 'concierto', 'ocio', 'gym'],                      id: 'leisure'   },
  { keywords: ['farmacia', 'medico', 'doctor', 'medicina', 'salud'],               id: 'health'    },
  { keywords: ['limpieza', 'papel', 'detergente', 'suavizante', 'cubo', 'fregona', 'tele'], id: 'home' },
]

export function guessCategoryId(label, categories) {
  const fallback =
    categories.find(c => c.id === 'other')?.id ||
    categories.find(c => c.id === 'home')?.id  ||
    categories[0]?.id

  if (!label) return fallback

  const desc = label.toLowerCase()
  for (const { keywords, id } of CATEGORY_RULES) {
    if (keywords.some(kw => desc.includes(kw))) {
      const found = categories.find(c => c.id === id)
      if (found) return found.id
    }
  }
  return fallback
}
