import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence }         from 'framer-motion'
import {
  X, Upload, ArrowRight, Check, AlertTriangle,
  FileSpreadsheet, Users, Tag, ChevronDown,
} from 'lucide-react'
import {
  collection, writeBatch, doc,
  serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db }              from '../../config/firebase'
import { useApp }          from '../../context/AppContext'
import { useChat }         from '../../hooks/useChat'
import {
  parseExcelFile,
  detectPeriods,
  guessCategoryId,
} from '../../utils/excelParser'

const STEPS = ['Archivo', 'Personas', 'Categorías', 'Revisar', 'Listo']

// ─── Step 0 — Upload ─────────────────────────────────────────────────────────

function StepUpload({ onFile, parseError }) {
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    onFile(e.dataTransfer.files[0])
  }, [onFile])

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors
          ${dragOver
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-slate-600 hover:border-slate-500 bg-slate-800/30'}`}
      >
        <FileSpreadsheet className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <p className="text-white font-medium mb-1">Arrastra tu archivo Excel aquí</p>
        <p className="text-sm text-slate-500 mb-4">o selecciona uno desde tu dispositivo</p>
        <label className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold cursor-pointer transition-colors">
          <Upload className="inline w-4 h-4 mr-2 -mt-0.5" />
          Seleccionar archivo
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={e => onFile(e.target.files[0])}
          />
        </label>
        <p className="text-xs text-slate-500 mt-3">Formatos soportados: .xlsx, .xls</p>
      </div>

      {parseError && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {parseError}
        </div>
      )}

      <div className="bg-slate-800/50 rounded-xl p-4 text-sm text-slate-400 space-y-1">
        <p className="font-medium text-slate-300 mb-2">Formato esperado (gastos-piso):</p>
        <p>• Cabeceras en la fila que tenga <code className="text-slate-300">persona / dinero / fecha</code></p>
        <p>• Columna de categoría justo después del separador</p>
        <p>• Columna de descripción opcional al final</p>
        <p>• Se procesan todas las hojas del libro</p>
      </div>
    </div>
  )
}

// ─── Step 1 — Name mapping + period config ────────────────────────────────────

function PeriodChips({ label, people, allNames, nameMap, groupMembers, onChange }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <div className="flex flex-wrap gap-2">
        {allNames.map(name => {
          const uid     = nameMap[name]
          const display = uid && uid !== 'skip'
            ? (groupMembers.find(m => m.id === uid)?.name ?? name)
            : name
          const active = people.includes(name)
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(active ? people.filter(n => n !== name) : [...people, name])}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize
                ${active ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
            >
              {display}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepPersonas({
  personNames, nameMap, setNameMap, groupMembers,
  contributions, expenses,
  cutoffDate, setCutoffDate,
  prePeople, setPrePeople,
  postPeople, setPostPeople,
  noDatePeriod, setNoDatePeriod,
}) {
  const assignedCount = Object.values(nameMap).filter(v => v && v !== 'skip').length
  const hasTransition = prePeople.join() !== postPeople.join()

  return (
    <div className="space-y-5">
      {/* Name assignment */}
      <div>
        <p className="text-sm text-slate-400 mb-3">
          Encontré{' '}
          <span className="text-white font-medium">{contributions.length}</span> aportaciones
          y{' '}
          <span className="text-white font-medium">{expenses.length}</span> gastos comunes.
          Asigna cada nombre del Excel a un miembro del grupo.
        </p>

        <div className="space-y-3">
          {personNames.map(name => {
            const count = contributions.filter(c => c.persona === name).length
            return (
              <div key={name}
                className="flex items-center justify-between gap-4 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <div>
                  <span className="font-medium text-white capitalize">{name}</span>
                  <span className="text-xs text-slate-500 ml-2">{count} aportaciones</span>
                </div>
                <div className="relative">
                  <select
                    value={nameMap[name] ?? ''}
                    onChange={e => setNameMap(m => ({ ...m, [name]: e.target.value || null }))}
                    className="pl-3 pr-8 py-1.5 rounded-lg bg-slate-700 text-sm text-white border border-slate-600 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Sin asignar (omitir aportaciones)</option>
                    <option value="skip">Ignorar completamente</option>
                    {groupMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )
          })}
        </div>

        {assignedCount === 0 && (
          <div className="flex items-start gap-2 p-3 mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-sm text-yellow-400">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            Asigna al menos un nombre para poder continuar.
          </div>
        )}
      </div>

      {/* Period config */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          <p className="text-sm font-medium text-white">
            Cambio de inquilinos
            {!hasTransition && <span className="text-xs text-slate-500 font-normal ml-2">(no detectado)</span>}
          </p>
        </div>
        <p className="text-xs text-slate-400">
          Los gastos se reparten solo entre quienes vivían en ese momento.
          Ajusta la fecha y los miembros si es necesario.
        </p>

        <div>
          <p className="text-xs font-medium text-slate-400 mb-1.5">Fecha del cambio</p>
          <input
            type="date"
            value={cutoffDate}
            onChange={e => setCutoffDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-700 text-sm text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <PeriodChips
          label={`Antes del ${cutoffDate || '…'}`}
          people={prePeople} allNames={personNames}
          nameMap={nameMap} groupMembers={groupMembers}
          onChange={setPrePeople}
        />
        <PeriodChips
          label={`Desde el ${cutoffDate || '…'}`}
          people={postPeople} allNames={personNames}
          nameMap={nameMap} groupMembers={groupMembers}
          onChange={setPostPeople}
        />

        <div className="flex items-center gap-3">
          <p className="text-xs text-slate-400 shrink-0">Gastos sin fecha →</p>
          <select
            value={noDatePeriod}
            onChange={e => setNoDatePeriod(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-700 text-xs text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="pre">Periodo anterior</option>
            <option value="post">Periodo actual</option>
          </select>
        </div>
      </div>
    </div>
  )
}

// ─── Step 2 — Category mapping ────────────────────────────────────────────────

// Sentinel key used in catMap for expenses with no category header
const NO_CAT_KEY = '__ninguna__'

function StepCategorias({ uniqueCategories, catMap, setCatMap, expenses, categories }) {
  // Build display list: each unique Excel category + example descriptions + count
  const catInfo = useMemo(() => {
    return uniqueCategories.map(excelCat => {
      const key = excelCat ?? NO_CAT_KEY
      const matching = expenses.filter(e =>
        excelCat === null ? e.excelCategory === null : e.excelCategory === excelCat
      )
      const descriptions = [...new Set(
        matching.map(e => e.description).filter(d => d && d !== excelCat)
      )].slice(0, 4)
      return { key, excelCat, count: matching.length, descriptions }
    })
  }, [uniqueCategories, expenses])

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Asigna cada categoría del Excel a una categoría de la app.
        La descripción se guarda tal cual en cada transacción.
      </p>

      <div className="space-y-3">
        {catInfo.map(({ key, excelCat, count, descriptions }) => (
          <div key={key}
            className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="font-medium text-white">
                  {excelCat ?? '(Sin categoría)'}
                </span>
                <span className="text-xs text-slate-500 ml-2">{count} gastos</span>
                {descriptions.length > 0 && (
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {descriptions.join(' · ')}
                  </p>
                )}
              </div>
              <div className="relative shrink-0">
                <select
                  value={catMap[key] ?? ''}
                  onChange={e => setCatMap(m => ({ ...m, [key]: e.target.value || null }))}
                  className="pl-3 pr-8 py-1.5 rounded-lg bg-slate-700 text-sm text-white border border-slate-600 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">Auto-detectar</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-slate-800/40 rounded-xl text-xs text-slate-400">
        "Auto-detectar" asigna la categoría por el nombre del gasto. Puedes cambiarlo manualmente.
      </div>
    </div>
  )
}

// ─── Step 3 — Preview ────────────────────────────────────────────────────────

function StepPreview({ incomeItems, expenseItems, skippedCount, groupMembers, categories }) {
  const [activeTab, setActiveTab] = useState('income')
  const displayItems = activeTab === 'income' ? incomeItems : expenseItems

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        <span className="text-white font-medium">{incomeItems.length + expenseItems.length}</span> transacciones
        listas para importar
        {skippedCount > 0 && <span className="text-yellow-400 ml-2">({skippedCount} omitidas)</span>}
      </p>

      <div className="flex gap-2">
        {[['income', 'Aportaciones', incomeItems.length], ['expense', 'Gastos comunes', expenseItems.length]].map(([tab, label, count]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}>
            {label} ({count})
          </button>
        ))}
      </div>

      <div className="overflow-auto max-h-64 rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-400 sticky top-0">
            <tr>
              {activeTab === 'income' ? (
                <>
                  <th className="px-3 py-2 text-left font-medium">Persona</th>
                  <th className="px-3 py-2 text-right font-medium">Importe</th>
                  <th className="px-3 py-2 text-left font-medium">Fecha</th>
                </>
              ) : (
                <>
                  <th className="px-3 py-2 text-left font-medium">Descripción</th>
                  <th className="px-3 py-2 text-right font-medium">Importe</th>
                  <th className="px-3 py-2 text-left font-medium">Fecha</th>
                  <th className="px-3 py-2 text-left font-medium">Categoría</th>
                  <th className="px-3 py-2 text-left font-medium">Reparto</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {displayItems.length === 0
              ? <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-500">Sin datos</td></tr>
              : displayItems.map((item, idx) => {
                const dateStr = item.date
                  ? item.date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })
                  : '—'

                if (activeTab === 'income') {
                  const name = item.uid ? (groupMembers.find(m => m.id === item.uid)?.name ?? '?') : '?'
                  return (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="px-3 py-1.5 capitalize text-white">{name}</td>
                      <td className={`px-3 py-1.5 text-right font-mono tabular-nums ${item.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {item.amount < 0 ? '' : '+'}{item.amount.toFixed(2)} €
                      </td>
                      <td className="px-3 py-1.5 text-slate-400">{dateStr}</td>
                    </tr>
                  )
                } else {
                  const catLabel = categories.find(c => c.id === item.categoryId)?.label ?? item.categoryId
                  const splitNames = item.splitAmong
                    .map(uid => groupMembers.find(m => m.id === uid)?.name ?? uid)
                    .join(', ')
                  return (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="px-3 py-1.5 text-white max-w-[160px] truncate">{item.description}</td>
                      <td className="px-3 py-1.5 text-right font-mono tabular-nums text-red-400">
                        -{item.amount.toFixed(2)} €
                      </td>
                      <td className="px-3 py-1.5 text-slate-400">{dateStr}</td>
                      <td className="px-3 py-1.5 text-slate-400 text-xs">{catLabel}</td>
                      <td className="px-3 py-1.5 text-slate-500 text-xs">{splitNames || '—'}</td>
                    </tr>
                  )
                }
              })
            }
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
          <p className="text-2xl font-bold text-green-400">{incomeItems.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Aportaciones</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <p className="text-2xl font-bold text-red-400">{expenseItems.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Gastos comunes</p>
        </div>
      </div>
    </div>
  )
}

// ─── Step 4 — Done ───────────────────────────────────────────────────────────

function StepDone({ importedCount, errors, onClose }) {
  return (
    <div className="text-center space-y-5 py-4">
      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-green-400" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-1">¡Importación completada!</h3>
        <p className="text-slate-400">
          <span className="text-white font-semibold">{importedCount}</span> transacciones importadas correctamente
        </p>
      </div>
      {errors.length > 0 && (
        <div className="text-left bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <p className="text-sm text-red-400 font-medium mb-1">{errors.length} errores:</p>
          <ul className="text-xs text-red-300 space-y-0.5 max-h-28 overflow-y-auto">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}
      <button onClick={onClose}
        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors">
        Ver transacciones
      </button>
    </div>
  )
}

// ─── Main modal ──────────────────────────────────────────────────────────────

export default function ExcelImportModal({ onClose }) {
  const { groupId, groupMembers, userProfile, categories } = useApp()
  const { sendSystemMessage } = useChat()

  const [step,         setStep]         = useState(0)
  const [parsed,       setParsed]       = useState(null)
  const [nameMap,      setNameMap]      = useState({})
  const [catMap,       setCatMap]       = useState({})  // excelCatKey → appCategoryId

  // Period config
  const [cutoffDate,   setCutoffDate]   = useState('')
  const [prePeople,    setPrePeople]    = useState([])
  const [postPeople,   setPostPeople]   = useState([])
  const [noDatePeriod, setNoDatePeriod] = useState('pre')

  const [importing,     setImporting]     = useState(false)
  const [progress,      setProgress]      = useState({ done: 0, total: 0 })
  const [importErrors,  setImportErrors]  = useState([])
  const [importedCount, setImportedCount] = useState(0)
  const [parseError,    setParseError]    = useState(null)

  const handleFile = useCallback(async (file) => {
    if (!file) return
    if (!file.name.match(/\.xlsx?$/i)) { setParseError('Solo se aceptan archivos .xlsx o .xls'); return }
    setParseError(null)
    try {
      const result = await parseExcelFile(file)
      if (!result.contributions.length && !result.expenses.length) {
        setParseError('No se encontraron datos. Verifica el formato del archivo.')
        return
      }
      setParsed(result)

      // Auto-match person names
      const autoMap = {}
      for (const name of result.personNames) {
        const match = groupMembers.find(m => {
          const mn = m.name.toLowerCase()
          return mn === name || mn.startsWith(name) || name.startsWith(mn)
        })
        autoMap[name] = match?.id ?? null
      }
      setNameMap(autoMap)

      // Auto-detect transition date
      const detected = detectPeriods(result.contributions)
      if (detected) {
        setCutoffDate(detected.cutoffDate)
        setPrePeople(detected.prePeople)
        setPostPeople(detected.postPeople)
      } else {
        setCutoffDate('')
        setPrePeople(result.personNames)
        setPostPeople(result.personNames)
      }

      // Init category map with auto-guesses
      const initCatMap = {}
      for (const excelCat of result.uniqueCategories) {
        const key = excelCat ?? NO_CAT_KEY
        initCatMap[key] = guessCategoryId(excelCat, categories)
      }
      setCatMap(initCatMap)

      setStep(1)
    } catch (err) {
      setParseError('Error al procesar el archivo: ' + err.message)
    }
  }, [groupMembers, categories])

  // Resolve UIDs from a list of person names
  const resolveUids = useCallback((names) =>
    names.map(n => nameMap[n]).filter(uid => uid && uid !== 'skip'),
  [nameMap])

  // Derived preview lists
  const { incomeItems, expenseItems, skippedCount } = useMemo(() => {
    if (!parsed) return { incomeItems: [], expenseItems: [], skippedCount: 0 }

    const cutoff    = cutoffDate ? new Date(cutoffDate) : null
    const preUids   = resolveUids(prePeople)
    const postUids  = resolveUids(postPeople)
    const allUids   = groupMembers.map(m => m.id)

    const getSplit = (date) => {
      if (!cutoff) return preUids.length ? preUids : allUids
      if (!date)   return noDatePeriod === 'pre'
        ? (preUids.length  ? preUids  : allUids)
        : (postUids.length ? postUids : allUids)
      return date < cutoff
        ? (preUids.length  ? preUids  : allUids)
        : (postUids.length ? postUids : allUids)
    }

    const income = []
    let skipped = 0
    for (const c of parsed.contributions) {
      const uid = nameMap[c.persona]
      if (!uid || uid === 'skip') { skipped++; continue }
      income.push({ kind: 'income', uid, persona: c.persona, amount: c.amount, date: c.date, rowIdx: c.rowIdx })
    }

    const expense = parsed.expenses.map(e => {
      const key       = e.excelCategory ?? NO_CAT_KEY
      const categoryId = catMap[key] || guessCategoryId(e.excelCategory, categories)
      return {
        kind: 'expense',
        excelCategory: e.excelCategory,
        description:   e.description,
        amount:        e.amount,
        date:          e.date,
        categoryId,
        splitAmong:    getSplit(e.date),
        rowIdx:        e.rowIdx,
      }
    })

    return { incomeItems: income, expenseItems: expense, skippedCount: skipped }
  }, [parsed, nameMap, catMap, cutoffDate, prePeople, postPeople, noDatePeriod, groupMembers, categories, resolveUids])

  const totalValid    = incomeItems.length + expenseItems.length
  const hasAssigned   = Object.values(nameMap).some(v => v && v !== 'skip')

  async function doImport() {
    setImporting(true)
    const allItems = [...incomeItems, ...expenseItems]
    setProgress({ done: 0, total: allItems.length })
    const errors = []
    let done = 0

    const BATCH_SIZE = 490
    for (let start = 0; start < allItems.length; start += BATCH_SIZE) {
      const batch = writeBatch(db)
      const chunk = allItems.slice(start, start + BATCH_SIZE)

      for (const item of chunk) {
        try {
          const dateObj = item.date instanceof Date ? item.date : new Date()
          const ref     = doc(collection(db, 'groups', groupId, 'transactions'))

          if (item.kind === 'income') {
            batch.set(ref, {
              type: 'income', paymentMode: 'individual',
              amount: item.amount,
              category: 'income',
              categoryLabel: categories.find(c => c.id === 'income')?.label ?? 'Ingreso',
              description: 'Aportación',
              paidBy: item.uid, splitAmong: [item.uid],
              date: Timestamp.fromDate(dateObj),
              createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
              createdBy: userProfile?.id ?? '',
            })
          } else {
            const catLabel = categories.find(c => c.id === item.categoryId)?.label ?? item.categoryId
            batch.set(ref, {
              type: 'expense', paymentMode: 'common',
              amount: item.amount,
              category: item.categoryId,
              categoryLabel: catLabel,
              description: item.description,
              paidBy: 'common', splitAmong: item.splitAmong,
              date: Timestamp.fromDate(dateObj),
              createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
              createdBy: userProfile?.id ?? '',
            })
          }
          done++
        } catch (err) {
          errors.push(`Fila ${item.rowIdx}: ${err.message}`)
        }
      }

      try {
        await batch.commit()
        setProgress(p => ({ ...p, done }))
      } catch (err) {
        errors.push(`Error en lote: ${err.message}`)
      }
    }

    try {
      await sendSystemMessage(`📥 Importación completada: ${done} transacciones importadas desde Excel`)
    } catch { /* non-critical */ }

    setImportedCount(done)
    setImportErrors(errors)
    setImporting(false)
    setStep(4)
  }

  const canAdvance =
    step === 0 ? !!parsed :
    step === 1 ? hasAssigned :
    step === 2 ? true :           // categories always OK (auto-guesses applied)
    step === 3 ? totalValid > 0 : false

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && !importing && onClose()}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 16 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Importar desde Excel</h2>
              <p className="text-xs text-slate-400 mt-0.5">Formato gastos-piso</p>
            </div>
          </div>
          <button onClick={() => !importing && onClose()}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 px-5 py-3 border-b border-slate-700/60 overflow-x-auto">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-1.5 shrink-0">
              <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center
                ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-sm ${i === step ? 'text-white' : 'text-slate-500'}`}>{label}</span>
              {i < STEPS.length - 1 && <div className="w-4 h-px bg-slate-700 mx-1" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>
              {step === 0 && <StepUpload onFile={handleFile} parseError={parseError} />}
              {step === 1 && parsed && (
                <StepPersonas
                  personNames={parsed.personNames} nameMap={nameMap} setNameMap={setNameMap}
                  groupMembers={groupMembers} contributions={parsed.contributions} expenses={parsed.expenses}
                  cutoffDate={cutoffDate} setCutoffDate={setCutoffDate}
                  prePeople={prePeople} setPrePeople={setPrePeople}
                  postPeople={postPeople} setPostPeople={setPostPeople}
                  noDatePeriod={noDatePeriod} setNoDatePeriod={setNoDatePeriod}
                />
              )}
              {step === 2 && parsed && (
                <StepCategorias
                  uniqueCategories={parsed.uniqueCategories}
                  catMap={catMap} setCatMap={setCatMap}
                  expenses={parsed.expenses} categories={categories}
                />
              )}
              {step === 3 && (
                <StepPreview
                  incomeItems={incomeItems} expenseItems={expenseItems}
                  skippedCount={skippedCount} groupMembers={groupMembers} categories={categories}
                />
              )}
              {step === 4 && (
                <StepDone importedCount={importedCount} errors={importErrors} onClose={onClose} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step < 4 && (
          <div className="flex justify-between items-center p-5 border-t border-slate-700">
            <button
              onClick={() => step > 0 && setStep(s => s - 1)}
              disabled={step === 0 || importing}
              className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Atrás
            </button>

            {step === 3 ? (
              <button onClick={doImport} disabled={importing || totalValid === 0}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
                {importing
                  ? `Importando ${progress.done}/${progress.total}…`
                  : `Importar ${totalValid} transacciones`}
              </button>
            ) : (
              <button onClick={() => setStep(s => s + 1)} disabled={!canAdvance}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
