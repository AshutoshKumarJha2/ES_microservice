import { useEffect, useState, useMemo } from 'react'
import {
  Container, Card, Table, Button, Modal,
  Spinner, Alert, Badge, InputGroup, Form, Row, Col,
} from 'react-bootstrap'
import { Search } from 'react-bootstrap-icons'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllInvoices,
  fetchAllContracts,
  fetchAllVendors,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from '../../../store/slices/vendor/vendorSlice'
import { invoiceService } from '../../../services/vendor/invoiceService'
import type { InvoiceRequestDto, InvoiceResponseDto, InvoiceStatus } from '../../../types/vendor'

const FILTER_STATUSES: InvoiceStatus[] = ['ISSUED', 'PAID', 'OVERDUE', 'CANCELLED']

const statusBadgeClass = (s: InvoiceStatus): string => {
  if (s === 'ISSUED')    return 'es-badge-pending'
  if (s === 'PAID')      return 'es-badge-paid'
  if (s === 'OVERDUE')   return 'es-badge-suspended'
  if (s === 'CANCELLED') return 'es-badge-cancelled'
  return 'es-badge-draft'
}

const EMPTY_FORM: InvoiceRequestDto = {
  contractId: '',
  totalAmount: 0,
  dueDate: '',
  status: 'ISSUED',
  transactionId: '',
}

export const FinanceInvoices = () => {
  const dispatch = useAppDispatch()
  const { invoices, invoicesLoading, invoicesError, contracts, vendors } = useAppSelector((s) => s.vendor)
  const { user } = useAppSelector((s) => s.auth)

  const isAdmin = user?.role === 'ADMIN'
  const isFinance = user?.role === 'FINANCE_OFFICER' || user?.role === 'FINANCE_MANAGER'

  const [search, setSearch]           = useState('')
  const [filter, setFilter]           = useState<InvoiceStatus | 'ALL'>('ALL')
  const [downloading, setDownloading] = useState<string | null>(null)

  // Create / Edit modal
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState<InvoiceResponseDto | null>(null)
  const [form, setForm]           = useState<InvoiceRequestDto>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  // Delete modal
  const [showDelete, setShowDelete] = useState(false)
  const [target, setTarget]         = useState<InvoiceResponseDto | null>(null)
  const [deleting, setDeleting]     = useState(false)

  useEffect(() => {
    dispatch(fetchAllInvoices())
    dispatch(fetchAllContracts())
    dispatch(fetchAllVendors())
  }, [dispatch])

  const vendorName = (id: string) => vendors.find(v => v.vendorId === id)?.name ?? 'Unknown Vendor'

  const contractLabel = (id: string) => {
    const c = contracts.find(c => c.contractId === id)
    if (!c) return `Contract #${id.slice(0, 8)}…`
    return `${vendorName(c.vendorId)} — $${Number(c.value).toLocaleString()} (${c.status})`
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return invoices.filter(i => {
      const matchStatus = filter === 'ALL' || i.status === filter
      const matchSearch = !q
        || i.invoiceId.toLowerCase().includes(q)
        || i.contractId.toLowerCase().includes(q)
        || (i.transactionId ?? '').toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [invoices, search, filter])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (inv: InvoiceResponseDto) => {
    setEditing(inv)
    setForm({
      contractId:    inv.contractId,
      totalAmount:   inv.totalAmount,
      dueDate:       inv.dueDate ? inv.dueDate.slice(0, 16) : '',
      status:        inv.status,
      transactionId: inv.transactionId ?? '',
    })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.contractId.trim()) { toast.error('Contract ID is required.'); return }
    if (!form.dueDate)           { toast.error('Due date is required.'); return }
    if (form.totalAmount <= 0)   { toast.error('Amount must be greater than 0.'); return }

    setSubmitting(true)
    const payload: InvoiceRequestDto = {
      ...form,
      dueDate: new Date(form.dueDate).toISOString(),
      transactionId: form.transactionId?.trim() || undefined,
    }

    try {
      if (editing) {
        await dispatch(updateInvoice({ invoiceId: editing.invoiceId, payload })).unwrap()
        toast.success('Invoice updated.')
      } else {
        await dispatch(createInvoice(payload)).unwrap()
        toast.success('Invoice created.')
      }
      setShowForm(false)
    } catch {
      toast.error('Operation failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const openDelete = (inv: InvoiceResponseDto) => {
    setTarget(inv)
    setShowDelete(true)
  }

  const handleDelete = async () => {
    if (!target) return
    setDeleting(true)
    try {
      await dispatch(deleteInvoice(target.invoiceId)).unwrap()
      toast.success('Invoice deleted.')
      setShowDelete(false)
    } catch {
      toast.error('Delete failed. Please try again.')
    } finally {
      setDeleting(false)
    }
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

  return (
    <div>
      {/* Banner */}
      <div className="es-banner text-white">
        <Container fluid className="px-3 px-md-4 py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h1 className="fw-bold fs-3 mb-1">Vendor Invoices</h1>
            <p className="mb-0 text-white-50 small">Manage and track all vendor invoice records</p>
          </div>
          {isFinance && (
            <Button variant="light" size="sm" className="rounded-2 fw-semibold" onClick={openCreate}>
              + New Invoice
            </Button>
          )}
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
        <InputGroup className="mb-3" style={{ maxWidth: 380 }}>
          <InputGroup.Text className="es-form-control border-end-0 rounded-start-3">
            <Search size={14} style={{ color: 'var(--text-secondary)' }} />
          </InputGroup.Text>
          <Form.Control
            className="es-form-control border-start-0 rounded-end-3"
            placeholder="Search by invoice ID, contract ID, transaction…"
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
            {invoicesLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: 'var(--blue)' }} />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center py-4 mb-0" style={{ color: 'var(--text-muted)' }}>No invoices found.</p>
            ) : (
              <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
                <thead style={{ background: 'var(--bg-subtle)' }}>
                  <tr>
                    {['Invoice ID', 'Contract', 'Amount', 'Issue Date', 'Due Date', 'Status', 'Transaction', 'Actions'].map(h => (
                      <th key={h} className="fw-semibold border-0 pb-2 px-3 pt-3" style={{ color: 'var(--text-primary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(i => (
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
                      <td className="align-middle px-3" style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
                        {i.transactionId ? `${i.transactionId.slice(0, 8)}…` : '—'}
                      </td>
                      <td className="align-middle px-3">
                        <div className="d-flex gap-1 flex-wrap">
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
                          {isFinance && (
                            <Button size="sm" variant="outline-primary" className="rounded-2" onClick={() => openEdit(i)}>
                              Edit
                            </Button>
                          )}
                          {isAdmin && (
                            <Button size="sm" variant="outline-danger" className="rounded-2" onClick={() => openDelete(i)}>
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Create / Edit Modal */}
      <Modal show={showForm} onHide={() => setShowForm(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>
            {editing ? 'Edit Invoice' : 'New Invoice'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Label className="es-label">Contract ID</Form.Label>
              <Form.Select
                className="es-form-control"
                value={form.contractId}
                onChange={e => setForm(f => ({ ...f, contractId: e.target.value }))}
                disabled={!!editing || contracts.filter(c => c.status === 'ACTIVE').length === 0}
              >
                <option value="">
                  {contracts.filter(c => c.status === 'ACTIVE').length === 0 ? 'No active contracts available' : '— Select contract —'}
                </option>
                {contracts.filter(c => c.status === 'ACTIVE').map(c => (
                  <option key={c.contractId} value={c.contractId}>
                    {vendorName(c.vendorId)} — ${Number(c.value).toLocaleString()}
                  </option>
                ))}
              </Form.Select>
              )}
            </Col>
            <Col xs={12} md={6}>
              <Form.Label className="es-label">Total Amount ($)</Form.Label>
              <Form.Control
                type="number"
                min={0}
                className="es-form-control"
                value={form.totalAmount}
                onChange={e => setForm(f => ({ ...f, totalAmount: Number(e.target.value) }))}
              />
            </Col>
            <Col xs={12} md={6}>
              <Form.Label className="es-label">Due Date</Form.Label>
              <Form.Control
                type="datetime-local"
                className="es-form-control"
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              />
            </Col>
            <Col xs={12} md={6}>
              <Form.Label className="es-label">Status</Form.Label>
              <Form.Select
                className="es-form-control"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as InvoiceStatus }))}
              >
                {FILTER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </Form.Select>
            </Col>
            <Col xs={12} md={6}>
              <Form.Label className="es-label">Transaction ID <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></Form.Label>
              <Form.Control
                className="es-form-control"
                placeholder="Payment transaction reference"
                value={form.transactionId ?? ''}
                onChange={e => setForm(f => ({ ...f, transactionId: e.target.value }))}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setShowForm(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Spinner animation="border" size="sm" /> : editing ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>
            Delete Invoice
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-1 small" style={{ color: 'var(--text-secondary)' }}>
            Permanently delete invoice <code>{target?.invoiceId.slice(0, 8)}…</code>?
          </p>
          <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>
            Amount: <strong>${Number(target?.totalAmount ?? 0).toLocaleString()}</strong> — this action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setShowDelete(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spinner animation="border" size="sm" /> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
