import * as XLSX from 'xlsx'

/**
 * Reads an Excel File object and returns structured contributions + expenses.
 * Supports the "gastos-piso" format:
 *   - Columns D/E/F: persona, dinero, fecha  (aportaciones individuales)
 *   - Columns I/J/L/M/N: descripción, importe, pagado, fecha, info extra  (gastos comunes)
 *   - Row 2 contains headers; data starts from row 3
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

function parseGastosPisoFormat(workbook) {
  const contributions = []
  const expenses = []
  const personSet = new Set()
  // Tracks which person names appear as contributors in each sheet.
  // Used to assign the correct splitAmong per expense (each sheet may
  // represent a different era of flatmates).
  const personsBySheet = {}   // { sheetName: string[] }

  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName]
    // header:1 → array of arrays, defval fills empty cells with null
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })

    // Find the header row that has "persona" in column D (index 3, 0-based)
    let dataStart = -1
    for (let i = 0; i < Math.min(5, rows.length); i++) {
      const cell = rows[i]?.[3]
      if (cell && typeof cell === 'string' && cell.toLowerCase().includes('persona')) {
        dataStart = i + 1
        break
      }
    }
    if (dataStart === -1) continue

    const sheetPersons = new Set()

    for (let i = dataStart; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.every(c => c == null)) continue

      // --- Aportaciones (D=3, E=4, F=5) ---
      const persona = row[3]
      const dineroAport = row[4]
      const fechaAport = row[5]

      if (
        persona && typeof persona === 'string' &&
        dineroAport != null && !isNaN(Number(dineroAport)) && Number(dineroAport) !== 0
      ) {
        const name = persona.toLowerCase().trim()
        personSet.add(name)
        sheetPersons.add(name)
        contributions.push({
          persona: name,
          amount: Number(dineroAport),
          date: toDate(fechaAport),
          sheet: sheetName,
          rowIdx: i + 1,
        })
      }

      // --- Gastos comunes (I=8, J=9, L=11, M=12, N=13) ---
      const gastoDesc = row[8]
      const dineroGasto = row[9]
      // row[10] = K = per-person share (J/3), skip
      const pagado = row[11]
      const fechaGasto = row[12]
      const infoExtra = row[13]

      if (dineroGasto != null && !isNaN(Number(dineroGasto)) && Number(dineroGasto) > 0) {
        const rawDesc =
          (gastoDesc && typeof gastoDesc === 'string' ? gastoDesc.trim() : '') ||
          (infoExtra && typeof infoExtra === 'string' ? infoExtra.trim() : '') ||
          'Gasto común'

        expenses.push({
          description: rawDesc,
          amount: Number(dineroGasto),
          paid: pagado === true || pagado === 1,
          date: toDate(fechaGasto),
          info: infoExtra && typeof infoExtra === 'string' ? infoExtra.trim() : null,
          sheet: sheetName,
          rowIdx: i + 1,
        })
      }
    }

    personsBySheet[sheetName] = [...sheetPersons]
  }

  return {
    contributions,
    expenses,
    personNames: [...personSet],
    personsBySheet,
  }
}

function toDate(val) {
  if (!val) return null
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Maps an expense description to the closest category id.
 */
export function guessCategoryId(description, categories) {
  const fallback =
    categories.find(c => c.id === 'other')?.id ||
    categories.find(c => c.id === 'home')?.id ||
    categories[0]?.id

  if (!description) return fallback

  const desc = description.toLowerCase()
  const RULES = [
    { keywords: ['piso', 'alquiler', 'renta', 'rent', 'arrendamiento'], id: 'bills' },
    { keywords: ['luz', 'electricidad', 'electric', 'endesa', 'iberdrola'], id: 'bills' },
    { keywords: ['agua', 'water'], id: 'bills' },
    { keywords: ['digi', 'internet', 'fibra', 'wifi', 'movistar', 'vodafone', 'orange', 'jazztel'], id: 'bills' },
    { keywords: ['gas'], id: 'bills' },
    { keywords: ['mercadona', 'carrefour', 'lidl', 'aldi', 'alcampo', 'supermercado', 'super', 'compra'], id: 'food' },
    { keywords: ['restaurante', 'pizza', 'burger', 'kebab'], id: 'food' },
    { keywords: ['ikea', 'amazon', 'zara', 'tienda'], id: 'shopping' },
    { keywords: ['bus', 'metro', 'tren', 'taxi', 'uber', 'gasolina', 'parking'], id: 'transport' },
    { keywords: ['cine', 'teatro', 'concierto', 'ocio', 'gym', 'gimnasio'], id: 'leisure' },
    { keywords: ['farmacia', 'medico', 'doctor', 'medicina', 'salud'], id: 'health' },
    { keywords: ['limpieza', 'papel', 'detergente', 'suavizante', 'fregona'], id: 'home' },
  ]

  for (const { keywords, id } of RULES) {
    if (keywords.some(kw => desc.includes(kw))) {
      const found = categories.find(c => c.id === id)
      if (found) return found.id
    }
  }

  return fallback
}
