import { useEffect, useState, useMemo } from 'react'
import {
  Container, Card, Table, Button, Modal, Form,
  Spinner, Alert, Badge, InputGroup, Row, Col,
} from 'react-bootstrap'
import { PageBanner } from '../../elements/common/PageBanner'
import { Search, FileEarmarkArrowDown } from 'react-bootstrap-icons'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllInvoices,
  fetchAllContracts,
  fetchAllVendors,
  createInvoice,
} from '../../../store/slices/vendor/vendorSlice'
import { invoiceService } from '../../../services/vendor/invoiceService'
import type { InvoiceRequestDto, InvoiceStatus } from '../../../types/vendor'

const FILTER_STATUSES: InvoiceStatus[] = ['ISSUED', 'PAID', 'OVERDUE', 'CANCELLED']

const toLocalDT = (s: string) => s.length === 16 ? s + ':00' : s

const EMPTY_FORM: InvoiceRequestDto = { contractId: '', totalAmount: 0, dueDate: '', status: 'ISSUED' }

const statusBadgeClass = (s: InvoiceStatus): string => {
  if (s === 'ISSUED')    return 'es-badge-pending'
  if (s === 'PAID')      return 'es-badge-paid'
  if (s === 'OVERDUE')   return 'es-badge-suspended'
  if (s === 'CANCELLED') return 'es-badge-cancelled'
  return 'es-badge-draft'
}

export const Invoices = () => {
  const dispatch = useAppDispatch()
  const { invoices, invoicesLoading, invoicesError, contracts, vendors } = useAppSelector((s) => s.vendor)
  const { user } = useAppSelector((s) => s.auth)

  // Role gates — mirrors InvoiceController @PreAuthorize rules:
  // GET /invoices, GET /invoices/{id} → FINANCE_OFFICER | VENDOR | ADMIN
  // GET /invoices/{id}/download      → any authenticated user (no PreAuthorize)
  // POST /invoices                   → FINANCE_OFFICER
  const canView   = user?.role === 'FINANCE_OFFICER' || user?.role === 'VENDOR' || user?.role === 'ADMIN'
  const canCreate = user?.role === 'FINANCE_OFFICER'

  const [search, setSearch]           = useState('')
  const [filter, setFilter]           = useState<InvoiceStatus | 'ALL'>('ALL')
  const [downloading, setDownloading] = useState<string | null>(null)
  const [showCreate, setShowCreate]   = useState(false)
  const [form, setForm]               = useState<InvoiceRequestDto>(EMPTY_FORM)
  const [saving, setSaving]           = useState(false)

  useEffect(() => {
    dispatch(fetchAllInvoices())
    dispatch(fetchAllContracts())
    dispatch(fetchAllVendors())
  }, [dispatch])

  const vendorForContract = (contractId: string) => {
    const c = contracts.find(c => c.contractId === contractId)
    return vendors.find(v => v.vendorId === c?.vendorId)?.name ?? '—'
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return invoices.filter(i => {
      const matchStatus = filter === 'ALL' || i.status === filter
      const matchSearch = !q || i.invoiceId.toLowerCase().includes(q) || i.contractId.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [invoices, search, filter])

  const handleCreateInvoice = async () => {
    if (!form.contractId.trim()) { toast.error('Contract is required.'); return }
    if (form.totalAmount <= 0) { toast.error('Amount must be positive.'); return }
    if (!form.dueDate) { toast.error('Due date is required.'); return }
    setSaving(true)
    try {
      await dispatch(createInvoice({ ...form, dueDate: toLocalDT(form.dueDate) })).unwrap()
      toast.success('Invoice created.')
      setShowCreate(false)
      setForm(EMPTY_FORM)
    } catch {
      toast.error('Failed to create invoice.')
    } finally { setSaving(false) }
  }

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

  if (!canView) {
    return (
      <div>
        <PageBanner title="Invoices" subtitle="Billing records linked to vendor contracts" />
        <Container fluid className="px-3 px-md-4 py-4">
          <p className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
            You do not have permission to view invoices. This section is restricted to Vendors, Finance Officers, and Admins.
          </p>
        </Container>
      </div>
    )
  }

  return (
    <div>
      <PageBanner
        title="Invoices"
        subtitle="Billing records linked to vendor contracts"
        actions={
          canCreate
            ? <Button variant="light" size="sm" className="fw-semibold rounded-3" onClick={() => { setForm(EMPTY_FORM); setShowCreate(true) }}>+ Create Invoice</Button>
            : undefined
        }
      />

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
                    {['Invoice ID', 'Contract', 'Amount', 'Issue Date', 'Due Date', 'Status', 'Transaction ID', 'PDF'].map(h => (
                      <th key={h} className="fw-semibold border-0 pb-2 px-3 pt-3" style={{ color: 'var(--text-primary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoicesLoading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
                        <Spinner animation="border" size="sm" style={{ color: 'var(--blue)' }} />
                      </td>
                    </tr>
                  ) : filtered.map(i => (
                    <tr key={i.invoiceId}>
                      <td className="align-middle px-3 fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        INV-{i.invoiceId.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="align-middle px-3" style={{ color: 'var(--text-secondary)' }}>
                        {vendorForContract(i.contractId)}
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
                      <td className="align-middle px-3" style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
                        {i.transactionId
                          ? i.transactionId.length > 12 ? i.transactionId.slice(0, 12) + '…' : i.transactionId
                          : '—'}
                      </td>
                      <td className="align-middle px-3">
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="rounded-2"
                          onClick={() => handleDownloadPdf(i.invoiceId)}
                          disabled={downloading === i.invoiceId}
                          title="Download Invoice PDF"
                        >
                          {downloading === i.invoiceId
                            ? <Spinner animation="border" size="sm" />
                            : <FileEarmarkArrowDown size={14} />
                          }
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
      {/* Create Invoice Modal — FINANCE_OFFICER only */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>Create Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-surface)' }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="es-label">Contract *</Form.Label>
              <Form.Select
                className="es-form-control rounded-3"
                value={form.contractId}
                onChange={e => setForm(p => ({ ...p, contractId: e.target.value }))}
                disabled={contracts.length === 0}
              >
                <option value="">{contracts.length === 0 ? 'No contracts available' : '— Select contract —'}</option>
                {contracts.map(c => (
                  <option key={c.contractId} value={c.contractId}>
                    {vendors.find(v => v.vendorId === c.vendorId)?.name ?? c.contractId} — {c.status}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Row className="g-3 mb-3">
              <Col xs={6}>
                <Form.Group>
                  <Form.Label className="es-label">Total Amount *</Form.Label>
                  <Form.Control
                    className="es-form-control rounded-3"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="e.g. 50000"
                    value={form.totalAmount}
                    onChange={e => setForm(p => ({ ...p, totalAmount: Number(e.target.value) }))}
                  />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label className="es-label">Status *</Form.Label>
                  <Form.Select
                    className="es-form-control rounded-3"
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value as InvoiceStatus }))}
                  >
                    {FILTER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label className="es-label">Due Date *</Form.Label>
              <Form.Control
                className="es-form-control rounded-3"
                type="datetime-local"
                value={form.dueDate}
                onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="es-label">Transaction ID (optional)</Form.Label>
              <Form.Control
                className="es-form-control rounded-3"
                placeholder="e.g. TXN-20260420-001"
                value={form.transactionId ?? ''}
                onChange={e => setForm(p => ({ ...p, transactionId: e.target.value || undefined }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button variant="primary" size="sm" className="fw-semibold rounded-3" onClick={handleCreateInvoice} disabled={saving}>
            {saving ? <Spinner animation="border" size="sm" /> : 'Create Invoice'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
