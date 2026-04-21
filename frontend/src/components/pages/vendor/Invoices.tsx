import { useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllInvoices,
  fetchAllContracts,
} from '../../../store/slices/vendor/vendorSlice'
import { invoiceService } from '../../../services/vendor/invoiceService'
import type { InvoiceStatus } from '../../../types/vendor'
import styles from '../../../css/vendor/Vendor.module.css'

const FILTER_STATUSES: InvoiceStatus[] = ['ISSUED', 'PAID', 'OVERDUE', 'CANCELLED']

const statusBadgeClass = (s: InvoiceStatus) => {
  if (s === 'ISSUED')    return styles.badgeYellow
  if (s === 'PAID')      return styles.badgeGreen
  if (s === 'OVERDUE')   return styles.badgeRed
  if (s === 'CANCELLED') return styles.badgeGray
  return styles.badgeGray
}

export const Invoices = () => {
  const dispatch = useAppDispatch()
  const { invoices, invoicesLoading, invoicesError, contracts } = useAppSelector((s) => s.vendor)

  const [filter, setFilter]           = useState<InvoiceStatus | 'ALL'>('ALL')
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchAllInvoices())
    dispatch(fetchAllContracts())
  }, [dispatch])

  const filtered = filter === 'ALL' ? invoices : invoices.filter(i => i.status === filter)

  const handleDownloadPdf = async (invoiceId: string) => {
    setDownloading(invoiceId)
    try {
      const blob = await invoiceService.downloadInvoicePdf(invoiceId)
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `invoice_${invoiceId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF downloaded.')
    } catch {
      toast.error('PDF generation failed.')
    } finally {
      setDownloading(null)
    }
  }

  const contractLabel = (id: string) => {
    const c = contracts.find(c => c.contractId === id)
    return c ? `${id.slice(0, 8)}… ($${Number(c.value).toLocaleString()})` : `${id.slice(0, 8)}…`
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>Invoices</div>
          <div className={styles.pageSubtitle}>Billing records — auto-generated on contract signing</div>
        </div>
      </div>

      {invoicesError && (
        <div className={styles.errorBanner}>
          <span>{invoicesError}</span>
          <button onClick={() => dispatch(fetchAllInvoices())} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Retry</button>
        </div>
      )}

      <div className={styles.filterRow}>
        {(['ALL', ...FILTER_STATUSES] as const).map(s => (
          <button
            key={s}
            className={`${styles.filterChip} ${filter === s ? styles.filterChipActive : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Contract</th>
              <th>Amount</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {invoicesLoading ? <TableRowsSkeleton rows={5} cols={7} /> : filtered.length === 0 ? (
              <tr><td colSpan={7} className={styles.emptyCell}>No invoices found.</td></tr>
            ) : filtered.map(i => (
                <tr key={i.invoiceId}>
                  <td><span className={styles.idCell}>{i.invoiceId}</span></td>
                  <td><span className={styles.idCell}>{contractLabel(i.contractId)}</span></td>
                  <td><strong>${Number(i.totalAmount).toLocaleString()}</strong></td>
                  <td>{i.issueDate ? new Date(i.issueDate).toLocaleDateString() : '—'}</td>
                  <td>{new Date(i.dueDate).toLocaleDateString()}</td>
                  <td><span className={`${styles.badge} ${statusBadgeClass(i.status)}`}>{i.status}</span></td>
                  <td>
                    <button
                      className={`${styles.btn} ${styles.btnSmall}`}
                      onClick={() => handleDownloadPdf(i.invoiceId)}
                      disabled={downloading === i.invoiceId}
                      title="Download PDF"
                    >
                      {downloading === i.invoiceId ? <Spinner animation="border" size="sm" /> : '⬇ PDF'}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
