/**
 * Motor de cálculo de saldos y settlement optimizado.
 *
 * Algoritmo:
 * 1. Calcula el saldo neto de cada persona a partir del historial de transacciones.
 * 2. Usa un algoritmo greedy para encontrar la lista mínima de transferencias
 *    que liquida todas las deudas (similar a Tricount/Splitwise).
 *
 * Terminología:
 * - "saldo neto" = lo que cada persona ha aportado MENOS lo que le corresponde pagar
 * - Saldo positivo → le deben dinero
 * - Saldo negativo → debe dinero
 */

/**
 * Calcula el saldo neto de cada usuario dada la lista de transacciones.
 *
 * Acepta tanto el formato Firestore (type/amount/paidBy/splitAmong) como
 * el formato legacy (tipo/monto/pagado_por/dividido_entre) para compatibilidad.
 *
 * @param {Array} transactions - Array de transacciones
 * @param {Array} users        - Array de usuarios del grupo
 * @returns {Object}           - Map { userId: saldoNeto }
 */
export function calculateBalances(transactions, users) {
  // Inicializa todos los saldos a 0
  const balances = {}
  users.forEach(u => { balances[u.id] = 0 })

  transactions.forEach(tx => {
    // Normaliza campos (Firebase usa camelCase, el código legacy usa snake_case)
    const tipo          = tx.type        || tx.tipo
    const monto         = tx.amount      || tx.monto
    const pagado_por    = tx.paidBy      || tx.pagado_por
    const dividido_entre = tx.splitAmong || tx.dividido_entre

    if (tipo === 'income' || tipo === 'ingreso') {
      // Los ingresos (incluidas liquidaciones) suman al saldo de quien aportó
      if (balances[pagado_por] !== undefined) {
        balances[pagado_por] += monto
      }
      return
    }

    // Para gastos: quien paga adelanta el dinero y lo reparte
    const participantes = dividido_entre || []
    if (participantes.length === 0) return

    const partePorPersona = monto / participantes.length

    // Quien pagó adelantó el total → suma el total a su saldo (a su favor)
    if (balances[pagado_por] !== undefined) {
      balances[pagado_por] += monto
    }

    // Cada participante debe su parte → resta de su saldo
    participantes.forEach(userId => {
      if (balances[userId] !== undefined) {
        balances[userId] -= partePorPersona
      }
    })
  })

  return balances
}

/**
 * Calcula la lista MÍNIMA de pagos necesarios para liquidar todas las deudas.
 * Algoritmo greedy O(n log n): el mayor deudor le paga al mayor acreedor.
 *
 * @param {Object} balances - Map { userId: saldoNeto }
 * @returns {Array} - Array de { de, a, monto } con los pagos óptimos
 */
export function calculateOptimalPayments(balances) {
  const EPSILON = 0.01 // Diferencia mínima para considerar una deuda real

  // Separa acreedores (saldo > 0) y deudores (saldo < 0)
  const creditors = []
  const debtors   = []

  Object.entries(balances).forEach(([userId, saldo]) => {
    if (saldo > EPSILON)  creditors.push({ userId, amount:  saldo })
    if (saldo < -EPSILON) debtors.push(  { userId, amount: -saldo })
  })

  // Ordena de mayor a menor para maximizar liquidaciones por paso
  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const payments = []
  let i = 0 // índice acreedor
  let j = 0 // índice deudor

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i]
    const debtor   = debtors[j]

    // El pago es el mínimo entre lo que debe el deudor y lo que se le debe al acreedor
    const amount = Math.min(creditor.amount, debtor.amount)

    payments.push({
      de:    debtor.userId,
      a:     creditor.userId,
      monto: parseFloat(amount.toFixed(2)),
    })

    creditor.amount -= amount
    debtor.amount   -= amount

    // Si el acreedor quedó saldado, pasa al siguiente
    if (creditor.amount < EPSILON) i++
    // Si el deudor quedó saldado, pasa al siguiente
    if (debtor.amount   < EPSILON) j++
  }

  return payments
}

/**
 * Calcula el resumen financiero completo del grupo.
 *
 * @param {Array} transactions
 * @param {Array} users
 * @returns {Object} - { totalIngresos, totalGastos, saldoColectivo, balances, pagosOptimos }
 */
export function calculateGroupSummary(transactions, users) {
  let totalIngresos  = 0
  let totalGastos    = 0

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
