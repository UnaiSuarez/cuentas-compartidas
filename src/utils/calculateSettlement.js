/**
 * Motor de cálculo de saldos y settlement optimizado.
 *
 * Modos de pago soportados:
 *  - individual: paidBy=uid, el pagador adelantó el dinero
 *  - common:     paidBy='common', el gasto sale del fondo colectivo (nadie adelanta)
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
      if (balances[pagado_por] !== undefined) {
        balances[pagado_por] += monto
      }
      return
    }

    const participantes = dividido_entre || []
    if (participantes.length === 0) return

    const partePorPersona = monto / participantes.length

    if (pagado_por === 'common') {
      // Gasto común: solo se debita a cada participante, nadie recibe crédito
      participantes.forEach(userId => {
        if (balances[userId] !== undefined) {
          balances[userId] -= partePorPersona
        }
      })
    } else {
      // Gasto individual: el pagador adelantó el total
      if (balances[pagado_por] !== undefined) {
        balances[pagado_por] += monto
      }
      participantes.forEach(userId => {
        if (balances[userId] !== undefined) {
          balances[userId] -= partePorPersona
        }
      })
    }
  })

  return balances
}

export function calculateOptimalPayments(balances) {
  const EPSILON = 0.01

  const creditors = []
  const debtors   = []

  Object.entries(balances).forEach(([userId, saldo]) => {
    if (saldo > EPSILON)  creditors.push({ userId, amount:  saldo })
    if (saldo < -EPSILON) debtors.push(  { userId, amount: -saldo })
  })

  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const payments = []
  let i = 0
  let j = 0

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i]
    const debtor   = debtors[j]
    const amount   = Math.min(creditor.amount, debtor.amount)

    payments.push({
      de:    debtor.userId,
      a:     creditor.userId,
      monto: parseFloat(amount.toFixed(2)),
    })

    creditor.amount -= amount
    debtor.amount   -= amount

    if (creditor.amount < EPSILON) i++
    if (debtor.amount   < EPSILON) j++
  }

  return payments
}

export function calculateGroupSummary(transactions, users) {
  let totalIngresos = 0
  let totalGastos   = 0

  transactions.forEach(tx => {
    const tipo  = tx.type   || tx.tipo
    const monto = tx.amount || tx.monto
    if (tipo === 'income' || tipo === 'ingreso') totalIngresos += monto
    else                                          totalGastos   += monto
  })

  const balances     = calculateBalances(transactions, users)
  const pagosOptimos = calculateOptimalPayments(balances)

  return {
    totalIngresos,
    totalGastos,
    saldoColectivo: totalIngresos - totalGastos,
    balances,
    pagosOptimos,
  }
}
