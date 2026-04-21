import { useEffect, useState, useMemo } from 'react'
import {
  Container, Card, Table, Button,
  Spinner, Alert, Badge, InputGroup, Form,
} from 'react-bootstrap'
import { Search } from 'react-bootstrap-icons'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllInvoices,
  fetchAllContracts,
} from '../../../store/slices/vendor/vendorSlice'
import { invoiceService } from '../../../services/vendor/invoiceService'
import type { InvoiceStatus } from '../../../types/vendor'

const FILTER_STATUSES: InvoiceStatus[] = ['ISSUED', 'PAID', 'OVERDUE', 'CANCELLED']

const statusBadgeClass = (s: InvoiceStatus): string => {
  if (s === 'ISSUED')    return 'es-badge-pending'
  if (s === 'PAID')      return 'es-badge-paid'
  if (s === 'OVERDUE')   return 'es-badge-suspended'
  if (s === 'CANCELLED') return 'es-badge-cancelled'
  return 'es-badge-draft'
}

export const Invoices = () => {
  const dispatch = useAppDispatch()
  const { invoices, invoicesLoading, invoicesError, contracts } = useAppSelector((s) => s.vendor)

  const [search, setSearch]           = useState('')
  const [filter, setFilter]           = useState<InvoiceStatus | 'ALL'>('ALL')
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchAllInvoices())
    dispatch(fetchAllContracts())
  }, [dispatch])

  const contractLabel = (id: string) => {
    const c = contracts.find(c => c.contractId === id)
    return c ? `${id.slice(0, 8)}… ($${Number(c.value).toLocaleString()})` : `${id.slice(0, 8)}…`
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return invoices.filter(i => {
      const matchStatus = filter === 'ALL' || i.status === filter
      const matchSearch = !q || i.invoiceId.toLowerCase().includes(q) || i.contractId.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [invoices, search, filter])

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

  return (
    <div>
      {/* Banner */}
      <div className="es-banner text-white">
        <Container fluid className="px-3 px-md-4 py-3">
          <h1 className="fw-bold fs-3 mb-1">Invoices</h1>
          <p className="mb-0 text-white-50 small">Billing records — auto-generated on contract signing</p>
        </Container>
      </div>

      <Container fluid className="px-3 px-md-4 py-4">
        {invoicesError && (
          <Alert variant="danger" className="py-2 mb-3">
            {invoicesError}{' '}
            <Button variant="link" size="sm" className="p-0 align-baseline" onClick={() => dispatch(fetchAllInvoices())}>
              Retry
            </Button>
          </Alert>
        )}

        {/* Search */}
        <InputGroup className="mb-3" style={{ maxWidth: 360 }}>
          <InputGroup.Text className="es-form-control border-end-0 rounded-start-3">
            <Search size={14} style={{ color: 'var(--text-secondary)' }} />
          </InputGroup.Text>
          <Form.Control
            className="es-form-control border-start-0 rounded-end-3"
            placeholder="Search by invoice or contract ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </InputGroup>

        {/* Filter chips */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {(['ALL', ...FILTER_STATUSES] as const).map(s => (
            <Button
              key={s}
              size="sm"
              variant={filter === s ? 'primary' : 'outline-secondary'}
              className="rounded-pill"
              onClick={() => setFilter(s)}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>

        {/* Invoices Table */}
        <Card className="es-card border shadow-sm">
          <Card.Body className="p-0">
            <div className="d-flex justify-content-between align-items-center px-3 pt-3 pb-2">
              <span className="small fw-semibold" style={{ color: 'var(--text-primary)' }}>Invoices</span>
              <span className="small" style={{ color: 'var(--text-muted)' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            </div>
            {(!invoicesLoading && filtered.length === 0) ? (
              <p className="text-center py-4 mb-0" style={{ color: 'var(--text-muted)' }}>No invoices found.</p>
            ) : (
              <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
                <thead style={{ background: 'var(--bg-subtle)' }}>
                  <tr>
                    {['Invoice ID', 'Contract', 'Amount', 'Issue Date', 'Due Date', 'Status', 'PDF'].map(h => (
                      <th key={h} className="fw-semibold border-0 pb-2 px-3 pt-3" style={{ color: 'var(--text-primary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoicesLoading ? <TableRowsSkeleton rows={5} cols={7} /> : filtered.map(i => (
                    <tr key={i.invoiceId}>
                      <td className="align-middle px-3" style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
                        {i.invoiceId.slice(0, 8)}…
                      </td>
                      <td className="align-middle px-3" style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
                        {contractLabel(i.contractId)}
                      </td>
                      <td className="align-middle fw-semibold px-3" style={{ color: 'var(--text-primary)' }}>
                        ${Number(i.totalAmount).toLocaleString()}
                      </td>
                      <td className="align-middle px-3" style={{ color: 'var(--text-secondary)' }}>
                        {i.issueDate ? new Date(i.issueDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="align-middle px-3" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(i.dueDate).toLocaleDateString()}
                      </td>
                      <td className="align-middle px-3">
                        <Badge className={`${statusBadgeClass(i.status)} border-0`} style={{ fontSize: '0.7rem' }}>
                          {i.status}
                        </Badge>
                      </td>
                      <td className="align-middle px-3">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          className="rounded-2"
                          onClick={() => handleDownloadPdf(i.invoiceId)}
                          disabled={downloading === i.invoiceId}
                          title="Download PDF"
                        >
                          {downloading === i.invoiceId ? <Spinner animation="border" size="sm" /> : '⬇ PDF'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}
