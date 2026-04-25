/**
 * Funciones de exportación de datos.
 *
 * Las transacciones que llegan aquí ya están normalizadas por el componente
 * que llama (TransactionList), en formato:
 *   { fecha: Date, tipo: string, monto: number, categoria: string,
 *     descripcion: string, pagado_por: string (nombre ya resuelto) }
 *
 * Así estos exportadores no dependen del contexto ni de Firebase.
 */

import * as XLSX  from 'xlsx'
import jsPDF      from 'jspdf'
import autoTable  from 'jspdf-autotable'
import { format } from 'date-fns'
import { es }     from 'date-fns/locale'
import { formatCurrency } from './formatters'

const today = () => format(new Date(), 'yyyy-MM-dd')
const fmtDate = d => format(d instanceof Date ? d : new Date(d), 'dd/MM/yyyy', { locale: es })

// ─── Excel ────────────────────────────────────────────────────────────────────
/**
 * Exporta transacciones + resumen a un archivo Excel (.xlsx).
 *
 * @param {Array}  txData       - Transacciones normalizadas
 * @param {Array}  members      - Miembros del grupo (para resumen de saldos)
 */
export function exportToExcel(txData, members) {
  const wb = XLSX.utils.book_new()

  // Hoja 1: Transacciones
  const txRows = txData.map(tx => ({
    Fecha:           fmtDate(tx.fecha),
    Tipo:            tx.tipo,
    Descripción:     tx.descripcion,
    Categoría:       tx.categoria,
    'Monto (€)':     tx.monto,
    'Pagado por':    tx.pagado_por,
  }))
  const ws1 = XLSX.utils.json_to_sheet(txRows)
  ws1['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 30 }, { wch: 18 }, { wch: 12 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Transacciones')

  // Hoja 2: Resumen
  const totalGastos   = txData.filter(t => t.tipo === 'Gasto').reduce((s, t) => s + t.monto, 0)
  const totalIngresos = txData.filter(t => t.tipo === 'Ingreso').reduce((s, t) => s + t.monto, 0)
  const resumen = [
    { Concepto: 'Total Ingresos',  Valor: totalIngresos },
    { Concepto: 'Total Gastos',    Valor: totalGastos   },
    { Concepto: 'Saldo Neto',      Valor: totalIngresos - totalGastos },
    { Concepto: '' },
    { Concepto: 'Total registros', Valor: txData.length },
    { Concepto: 'Exportado el',    Valor: fmtDate(new Date()) },
  ]
  const ws2 = XLSX.utils.json_to_sheet(resumen)
  ws2['!cols'] = [{ wch: 25 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Resumen')

  XLSX.writeFile(wb, `cuentas_compartidas_${today()}.xlsx`)
}

// ─── PDF ──────────────────────────────────────────────────────────────────────
/**
 * Exporta un resumen visual a PDF.
 *
 * @param {Array} txData    - Transacciones normalizadas
 * @param {Array} members   - Miembros del grupo
 */
export function exportToPDF(txData, members) {
  const doc     = new jsPDF({ unit: 'mm', format: 'a4' })
  const todayFmt = fmtDate(new Date())

  // Cabecera
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, 210, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.text('💰 Cuentas Compartidas', 14, 18)
  doc.setFontSize(10)
  doc.setTextColor(148, 163, 184)
  doc.text(`Generado el ${todayFmt}  ·  ${txData.length} transacciones`, 14, 28)

  // Resumen financiero
  const totalGastos   = txData.filter(t => t.tipo === 'Gasto').reduce((s, t) => s + t.monto, 0)
  const totalIngresos = txData.filter(t => t.tipo === 'Ingreso').reduce((s, t) => s + t.monto, 0)

  doc.setTextColor(30, 41, 59)
  doc.setFontSize(13)
  doc.text('Resumen Financiero', 14, 52)

  autoTable(doc, {
    startY: 56,
    head: [['Concepto', 'Importe']],
    body: [
      ['Total Ingresos',  formatCurrency(totalIngresos)],
      ['Total Gastos',    formatCurrency(totalGastos)],
      ['Saldo Neto',      formatCurrency(totalIngresos - totalGastos)],
    ],
    styles:     { fontSize: 10 },
    headStyles: { fillColor: [37, 99, 235] },
    theme:      'striped',
  })

  // Historial completo en nueva página
  doc.addPage()
  doc.setFontSize(13)
  doc.setTextColor(30, 41, 59)
  doc.text('Historial de Transacciones', 14, 18)

  autoTable(doc, {
    startY: 22,
    head: [['Fecha', 'Tipo', 'Descripción', 'Categoría', 'Monto', 'Pagado por']],
    body: txData.map(tx => [
      fmtDate(tx.fecha),
      tx.tipo,
      tx.descripcion,
      tx.categoria,
      formatCurrency(tx.monto),
      tx.pagado_por,
    ]),
    styles:       { fontSize: 8 },
    headStyles:   { fillColor: [37, 99, 235] },
    theme:        'striped',
    columnStyles: { 4: { halign: 'right' } },
  })

  doc.save(`resumen_cuentas_${today()}.pdf`)
}

// ─── CSV ──────────────────────────────────────────────────────────────────────
/**
 * Exporta transacciones a CSV (con BOM para compatibilidad con Excel en español).
 *
 * @param {Array} txData - Transacciones normalizadas
 */
export function exportToCSV(txData) {
  const headers = ['Fecha', 'Tipo', 'Descripcion', 'Categoria', 'Monto', 'Pagado_por']
  const rows = txData.map(tx => [
    fmtDate(tx.fecha),
    tx.tipo,
    `"${(tx.descripcion || '').replace(/"/g, '""')}"`,
    tx.categoria,
    tx.monto.toString().replace('.', ','),  // formato decimal europeo
    tx.pagado_por,
  ])

  const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n')
  // BOM UTF-8 para que Excel en español lo abra correctamente
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `cuentas_compartidas_${today()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
