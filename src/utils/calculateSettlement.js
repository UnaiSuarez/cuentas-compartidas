/**
 * Motor de cálculo de saldos y settlement optimizado.
 *
 * Modos de pago:
 *  - individual: paidBy=uid → el pagador adelantó; los demás le deben su parte
 *  - common:     paidBy='common' → gasto del fondo colectivo; nadie adelanta
 *
 * Nota sobre saldoColectivo:
 *   Los gastos individuales son "zero-sum" (el pagador recibe crédito, los demás
 *   se debitan por la misma cantidad neta). Por tanto, el saldo del fondo colectivo
 *   real = total ingresos − total gastos COMUNES (no los individuales).
 *   La suma de todos los balances personales = saldoColectivo siempre.
 */

export function calculateBalances(transactions, users) {
  const balances = {}
  users.forEach(u => { balances[u.id] = 0 })

  transactions.forEach(tx => {
    const tipo           = tx.type        || tx.tipo
    const monto          = tx.amount      || tx.monto
    const pagado_por     = tx.paidBy      || tx.pagado_por
    const dividido_entre = tx.splitAmong  || tx.dividido_entre

    if (tipo === 'income' || tipo === 'ingreso') {
      if (balances[pagado_por] !== undefined) balances[pagado_por] += monto
      return
    }

    const participantes = dividido_entre || []
    if (participantes.length === 0) return
    const partePorPersona = monto / participantes.length

    if (pagado_por === 'common') {
      participantes.forEach(uid => {
        if (balances[uid] !== undefined) balances[uid] -= partePorPersona
      })
    } else {
      if (balances[pagado_por] !== undefined) balances[pagado_por] += monto
      participantes.forEach(uid => {
        if (balances[uid] !== undefined) balances[uid] -= partePorPersona
      })
    }
  })

  return balances
}

export function calculateOptimalPayments(balances) {
  const EPSILON   = 0.01
  const creditors = []
  const debtors   = []

  Object.entries(balances).forEach(([userId, saldo]) => {
    if (saldo > EPSILON)  creditors.push({ userId, amount:  saldo })
    if (saldo < -EPSILON) debtors.push(  { userId, amount: -saldo })
  })

  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const payments = []
  let i = 0, j = 0

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i]
    const debtor   = debtors[j]
    const amount   = Math.min(creditor.amount, debtor.amount)

    payments.push({ de: debtor.userId, a: creditor.userId, monto: parseFloat(amount.toFixed(2)) })

    creditor.amount -= amount
    debtor.amount   -= amount
    if (creditor.amount < EPSILON) i++
    if (debtor.amount   < EPSILON) j++
  }

  return payments
}

export function calculateGroupSummary(transactions, users) {
  let totalIngresos        = 0
  let totalGastos          = 0
  let totalGastosComunes   = 0
  let totalGastosIndividuales = 0

  transactions.forEach(tx => {
    const tipo  = tx.type   || tx.tipo
    const monto = tx.amount || tx.monto
    const isCommon = (tx.paidBy || tx.pagado_por) === 'common' || tx.paymentMode === 'common'

    if (tipo === 'income' || tipo === 'ingreso') {
      totalIngresos += monto
    } else {
      totalGastos += monto
      if (isCommon) totalGastosComunes    += monto
      else          totalGastosIndividuales += monto
    }
  })

  const balances     = calculateBalances(transactions, users)
  const pagosOptimos = calculateOptimalPayments(balances)

  // saldoColectivo = dinero real en el fondo = ingresos − gastos comunes
  // (gastos individuales son zero-sum: no afectan el saldo del fondo)
  const saldoColectivo = totalIngresos - totalGastosComunes

  return {
    totalIngresos,
    totalGastos,
    totalGastosComunes,
    totalGastosIndividuales,
    saldoColectivo,
    balances,
    pagosOptimos,
  }
}

/**
 * Desglosa el saldo de cada usuario en componentes explicativos:
 *   collectivePosition = lo que le corresponde del fondo (ingresos propios − parte gastos comunes)
 *   peerPosition       = crédito/deuda neta con otros miembros (gastos individuales)
 *   balance            = collectivePosition + peerPosition
 *
 * @param {Array}  transactions
 * @param {Array}  users          — [{ id }]
 * @returns {{ userBreakdowns, poolBalance, totalCommonExpenses }}
 */
export function calculateBalanceBreakdown(transactions, users) {
  const data = {}
  users.forEach(u => {
    data[u.id] = {
      contributed:   0,   // ingresos aportados
      commonShare:   0,   // parte en gastos comunes
      advanced:      0,   // gastos individuales que pagó (adelantó por otros)
      selfPaidShare: 0,   // su propia parte cuando él mismo pagó
      owedShare:     0,   // su parte de gastos pagados por otros
    }
  })

  let poolBalance        = 0
  let totalCommonExpenses = 0

  transactions.filter(tx => !tx.isSettlement).forEach(tx => {
    const paidBy       = tx.paidBy || tx.pagado_por
    const participants = tx.splitAmong || tx.dividido_entre || []
    const n            = participants.length || 1
    const sharePerPerson = tx.amount / n
    const isCommon     = paidBy === 'common' || tx.paymentMode === 'common'

    if (tx.type === 'income' || tx.tipo === 'ingreso') {
      if (data[paidBy]) {
        data[paidBy].contributed += tx.amount
        poolBalance += tx.amount
      }
    } else if (isCommon) {
      poolBalance          -= tx.amount
      totalCommonExpenses  += tx.amount
      participants.forEach(pid => {
        if (data[pid]) data[pid].commonShare += sharePerPerson
      })
    } else {
      // Gasto individual: el pagador adelantó el dinero
      if (data[paidBy]) {
        data[paidBy].advanced += tx.amount
        if (participants.includes(paidBy)) {
          data[paidBy].selfPaidShare += sharePerPerson
        }
      }
      participants.forEach(pid => {
        if (pid !== paidBy && data[pid]) {
          data[pid].owedShare += sharePerPerson
        }
      })
    }
  })

  const userBreakdowns = {}
  Object.entries(data).forEach(([uid, b]) => {
    const collectivePosition = b.contributed - b.commonShare
    const peerPosition       = (b.advanced - b.selfPaidShare) - b.owedShare
    userBreakdowns[uid] = {
      ...b,
      collectivePosition,
      peerPosition,
      balance: collectivePosition + peerPosition,
    }
  })

  return { userBreakdowns, poolBalance, totalCommonExpenses }
}
