import * as XLSX from 'xlsx'

/**
 * Generic Excel parser — works with any workbook that has:
 *   • A contributions table: columns for person name + amount (+ optional date)
 *   • An expense table:      columns for category + amount (+ optional date/description)
 *
 * Both tables can coexist in the same header row (combined format like "gastos-piso")
 * or appear as separate tables in the same sheet or different sheets.
 */
export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const wb = XLSX.read(data, { type: 'array', cellDates: true })
        resolve(parseWorkbook(wb))
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsArrayBuffer(file)
  })
}

// ─── Column keyword sets ──────────────────────────────────────────────────────

const KW_PERSON   = ['persona', 'nombre', 'inquilino', 'miembro', 'who']
const KW_AMOUNT   = ['dinero', 'importe', 'cantidad', 'euros', '€']
const KW_DATE     = ['fecha', 'date', 'día', 'dia']
const KW_CATEGORY = ['categoria', 'categoría', 'tipo', 'concepto']
const KW_DESC     = ['descripcion', 'descripción', 'detalle', 'nota', 'observ']

const ALL_KW = [...KW_PERSON, ...KW_AMOUNT, ...KW_DATE, ...KW_CATEGORY, ...KW_DESC]

function matchesAny(cell, keywords) {
  if (cell == null) return false
  const h = String(cell).toLowerCase().trim()
  return keywords.some(kw => h.includes(kw))
}

// ─── Header detection ─────────────────────────────────────────────────────────

/** True if a row contains at least one recognised column keyword → it's a table header. */
function isHeaderRow(row) {
  return row.some(cell => cell != null && typeof cell === 'string' && matchesAny(cell, ALL_KW))
}

// ─── Column-group detection ───────────────────────────────────────────────────

/**
 * Finds a contribution column group in a header (0-based string array).
 * Returns { personIdx, amountIdx, dateIdx } or null.
 *
 * Algorithm: find a "person" column followed (within 5 cols) by an amount column
 * that does NOT include "total" (to skip summary "dinero total" blocks).
 */
function findContribCols(lc) {
  for (let i = 0; i < lc.length; i++) {
    if (!matchesAny(lc[i], KW_PERSON)) continue

    // Look for an amount col within the next 3 columns (keeps summary cols like
    // "dinero total" from matching when the real contribution col is nearby)
    let amountIdx = -1
    for (let j = i + 1; j <= i + 3 && j < lc.length; j++) {
      const h = lc[j]
      if (h == null) continue
      if (matchesAny(h, KW_AMOUNT) && !h.includes('total') && !h.includes('entre')) {
        amountIdx = j
        break
      }
    }
    if (amountIdx === -1) continue

    // Date col: nearest date-col after the person col (before amount + 3)
    let dateIdx = -1
    for (let j = i + 1; j <= amountIdx + 3 && j < lc.length; j++) {
      if (matchesAny(lc[j], KW_DATE)) { dateIdx = j; break }
    }

    return { personIdx: i, amountIdx, dateIdx }
  }
  return null
}

/**
 * Finds an expense column group in a header.
 * Returns { catIdx, amountIdx, dateIdx, descIdx } or null.
 *
 * Requires at least a category column; amount must come after the category col.
 */
function findExpenseCols(lc) {
  // Find the first category col
  let catIdx = -1
  for (let i = 0; i < lc.length; i++) {
    if (matchesAny(lc[i], KW_CATEGORY)) { catIdx = i; break }
  }
  if (catIdx === -1) return null

  // Amount: first amount col after catIdx, not containing 'entre'
  let amountIdx = -1
  for (let i = catIdx + 1; i < lc.length; i++) {
    const h = lc[i]
    if (h == null) continue
    if (matchesAny(h, KW_AMOUNT) && !h.includes('entre')) { amountIdx = i; break }
  }
  if (amountIdx === -1) amountIdx = catIdx + 1  // fallback: column right after category

  // Date: first date col after amountIdx
  let dateIdx = -1
  for (let i = amountIdx + 1; i < lc.length; i++) {
    if (matchesAny(lc[i], KW_DATE)) { dateIdx = i; break }
  }

  // Desc: first desc col after catIdx (but not catIdx itself)
  let descIdx = -1
  const searchFrom = dateIdx !== -1 ? dateIdx + 1 : amountIdx + 1
  for (let i = searchFrom; i < lc.length; i++) {
    if (lc[i] != null && matchesAny(lc[i], KW_DESC)) { descIdx = i; break }
  }
  // Also check between catIdx and amountIdx for a description col
  if (descIdx === -1) {
    for (let i = catIdx + 1; i < amountIdx; i++) {
      if (matchesAny(lc[i], KW_DESC)) { descIdx = i; break }
    }
  }

  return { catIdx, amountIdx, dateIdx, descIdx }
}

// ─── Row parsers ──────────────────────────────────────────────────────────────

function parseContribRow(row, cols, rowIdx, sheetName, contributions, personSet) {
  const persona     = row[cols.personIdx]
  const dineroAport = row[cols.amountIdx]
  const fechaAport  = cols.dateIdx !== -1 ? row[cols.dateIdx] : null

  if (
    persona && typeof persona === 'string' &&
    !persona.toLowerCase().startsWith('total') &&
    dineroAport != null && !isNaN(Number(dineroAport)) && Number(dineroAport) !== 0
  ) {
    const name = persona.toLowerCase().trim()
    personSet.add(name)
    contributions.push({
      persona: name,
      amount:  Number(dineroAport),
      date:    toDate(fechaAport),
      sheet:   sheetName,
      rowIdx,
    })
  }
}

function parseExpenseRow(row, cols, rowIdx, sheetName, expenses, categorySet) {
  const rawCat      = row[cols.catIdx]
  const dineroGasto = row[cols.amountIdx]
  const fechaGasto  = cols.dateIdx  !== -1 ? row[cols.dateIdx]  : null
  const rawDesc     = cols.descIdx  !== -1 ? row[cols.descIdx]  : null

  if (dineroGasto != null && !isNaN(Number(dineroGasto)) && Number(dineroGasto) > 0) {
    const excelCategory = rawCat  && typeof rawCat  === 'string' ? rawCat.trim()  : null
    const extraDesc     = rawDesc && typeof rawDesc === 'string' ? rawDesc.trim() : null
    const description   = extraDesc || excelCategory || 'Gasto común'

    categorySet.add(excelCategory)
    expenses.push({
      excelCategory,
      description,
      amount: Number(dineroGasto),
      date:   toDate(fechaGasto),
      sheet:  sheetName,
      rowIdx,
    })
  }
}

// ─── Main parser ──────────────────────────────────────────────────────────────

function parseWorkbook(workbook) {
  const contributions = []
  const expenses      = []
  const personSet     = new Set()
  const personsBySheet = {}
  const categorySet   = new Set()

  for (const sheetName of workbook.SheetNames) {
    const ws   = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })

    const sheetPersonsBefore = personSet.size
    let i = 0

    while (i < rows.length) {
      const row = rows[i]

      // Skip fully empty rows
      if (!row || row.every(c => c == null)) { i++; continue }

      const lc = row.map(h => h != null ? String(h).toLowerCase().trim() : null)

      const contribCols  = findContribCols(lc)
      const expenseCols  = findExpenseCols(lc)

      if (!contribCols && !expenseCols) { i++; continue }

      // This row is a table header — parse data rows below it
      i++
      while (i < rows.length) {
        const dataRow = rows[i]

        // Stop at empty row (end of this table)
        if (!dataRow || dataRow.every(c => c == null)) { i++; break }

        // Stop if we hit another header row
        if (isHeaderRow(dataRow)) break

        if (contribCols) parseContribRow(dataRow, contribCols, i + 1, sheetName, contributions, personSet)
        if (expenseCols)  parseExpenseRow(dataRow, expenseCols,  i + 1, sheetName, expenses,      categorySet)

        i++
      }
    }

    // Track persons that appeared in this sheet
    const sheetPersons = new Set()
    for (const c of contributions) {
      if (c.sheet === sheetName) sheetPersons.add(c.persona)
    }
    personsBySheet[sheetName] = [...sheetPersons]
  }

  interpolateDates(contributions)
  interpolateDates(expenses)

  return {
    contributions,
    expenses,
    personNames:      [...personSet],
    personsBySheet,
    uniqueCategories: [...categorySet],
  }
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function toDate(val) {
  if (!val) return null
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d
}

/** Fill null dates with the midpoint between the previous and next dated entry. */
function interpolateDates(items) {
  for (let i = 0; i < items.length; i++) {
    if (items[i].date != null) continue
    let prev = null
    for (let j = i - 1; j >= 0; j--) {
      if (items[j].date != null) { prev = items[j].date; break }
    }
    let next = null
    for (let j = i + 1; j < items.length; j++) {
      if (items[j].date != null) { next = items[j].date; break }
    }
    if (prev && next)     items[i].date = new Date((prev.getTime() + next.getTime()) / 2)
    else if (prev)        items[i].date = prev
    else if (next)        items[i].date = next
  }
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
  { keywords: ['piso', 'alquiler', 'renta', 'rent', 'arrendamiento'],               id: 'bills'     },
  { keywords: ['luz', 'electricidad', 'electric', 'endesa', 'iberdrola'],           id: 'bills'     },
  { keywords: ['agua', 'water'],                                                     id: 'bills'     },
  { keywords: ['digi', 'internet', 'fibra', 'wifi', 'movistar', 'vodafone'],        id: 'bills'     },
  { keywords: ['gas'],                                                               id: 'bills'     },
  { keywords: ['mercadona', 'carrefour', 'lidl', 'aldi', 'supermercado', 'compra'], id: 'food'      },
  { keywords: ['restaurante', 'pizza', 'burger', 'kebab'],                          id: 'food'      },
  { keywords: ['ikea', 'amazon', 'zara', 'tienda'],                                 id: 'shopping'  },
  { keywords: ['bus', 'metro', 'tren', 'taxi', 'uber', 'gasolina'],                 id: 'transport' },
  { keywords: ['cine', 'teatro', 'concierto', 'ocio', 'gym'],                       id: 'leisure'   },
  { keywords: ['farmacia', 'medico', 'doctor', 'medicina', 'salud'],                id: 'health'    },
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
