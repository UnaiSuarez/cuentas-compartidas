/** Devuelve solo una multa activa por tarea, incluso si existen duplicados históricos. */
export function activeUniqueFines(fines = []) {
  const seen = new Set()
  return fines.filter(fine => {
    if (fine.status === 'reversed') return false
    const key = fine.taskKey || fine.id
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function activeFinesForTask(fines = [], taskKey) {
  return fines.filter(fine => fine.status !== 'reversed' && fine.taskKey === taskKey)
}
