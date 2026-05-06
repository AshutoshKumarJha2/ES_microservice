import { useEffect, useState, useMemo } from 'react'
import {
  Container, Card, Table, Button, Modal, Form, Row, Col,
  Spinner, Alert, Badge, InputGroup,
} from 'react-bootstrap'
import { PageBanner } from '../../elements/common/PageBanner'
import { Search } from 'react-bootstrap-icons'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllContracts,
  fetchAllVendors,
  createContract,
  updateContractStatus,
  createInvoiceViaContract,
} from '../../../store/slices/vendor/vendorSlice'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'
import { fetchAllEvents } from '../../../store/slices/eventsSlice'
import type {
  ContractResponseDto, ContractRequestDto, ContractStatus,
  InvoiceRequestDto,
} from '../../../types/vendor'

// Role helpers — mirrors backend @PreAuthorize annotations:
// POST  /contracts        → ORGANIZER
// PATCH /{id}/status      → ORGANIZER | VENDOR
// POST  /{id}/invoice     → FINANCE_OFFICER

const FILTER_STATUSES: ContractStatus[] = ['DRAFT', 'ACTIVE', 'COMPLETED', 'TERMINATED']

// datetime-local inputs return "yyyy-MM-ddTHH:mm" (no seconds).
// Spring Boot's LocalDateTime requires seconds; never send a Z-offset string.
const toLocalDT = (s: string) => s.length === 16 ? s + ':00' : s

const statusBadgeClass = (s: ContractStatus): string => {
  if (s === 'DRAFT')      return 'es-badge-draft'
  if (s === 'ACTIVE')     return 'es-badge-active'
  if (s === 'COMPLETED')  return 'es-badge-completed'
  if (s === 'TERMINATED') return 'es-badge-cancelled'
  return 'es-badge-draft'
}

const EMPTY_CONTRACT: ContractRequestDto = {
  vendorId: '', eventId: '', startDate: '', endDate: '', value: 0, status: 'DRAFT',
}

const EMPTY_INVOICE: Omit<InvoiceRequestDto, 'contractId'> = {
  totalAmount: 0, dueDate: '', status: 'ISSUED',
}

export const Contracts = () => {
  const dispatch = useAppDispatch()
  const { contracts, contractsLoading, contractsError, vendors } =
    useAppSelector((s) => s.vendor)
  const events = useAppSelector((s) => s.events.events)
  const { user } = useAppSelector((s) => s.auth)

  // Role gates — kept in sync with ContractController @PreAuthorize rules
  const isOrganizer = user?.role === 'ORGANIZER'
  const canSign     = user?.role === 'ORGANIZER' || user?.role === 'VENDOR'
  const canInvoice  = user?.role === 'FINANCE_OFFICER'

  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState<ContractStatus | 'ALL'>('ALL')
  const [target, setTarget]         = useState<ContractResponseDto | null>(null)

  // Create contract modal (ORGANIZER only)
  const [showCreate, setShowCreate]       = useState(false)
  const [contractForm, setContractForm]   = useState<ContractRequestDto>(EMPTY_CONTRACT)
  const [savingContract, setSavingContract] = useState(false)


  // Invoice modal
  const [showInvoice, setShowInvoice] = useState(false)
  const [invoiceForm, setInvoiceForm] = useState(EMPTY_INVOICE)
  const [savingInvoice, setSavingInvoice] = useState(false)

  useEffect(() => {
    dispatch(fetchAllContracts())
    dispatch(fetchAllVendors())
    dispatch(fetchAllEvents())
  }, [dispatch])

  const vendorName = (id: string) => vendors.find(v => v.vendorId === id)?.name ?? '—'
  const eventName  = (id: string) => events.find(e => e.id === id)?.eventName ?? '—'
  const contractLabel = (c: typeof target) =>
    c ? `${vendorName(c.vendorId)} / ${eventName(c.eventId)}` : '—'

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return contracts.filter(c => {
      const matchStatus = filter === 'ALL' || c.status === filter
      const matchSearch = !q
        || vendorName(c.vendorId).toLowerCase().includes(q)
        || c.contractId.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [contracts, search, filter, vendors])

  /* ── Create Contract (ORGANIZER) ── */
  const handleCreateContract = async () => {
    if (!contractForm.vendorId.trim() || !contractForm.eventId.trim()) {
      toast.error('Vendor ID and Event ID are required.')
      return
    }
    if (!contractForm.startDate || !contractForm.endDate) {
      toast.error('Start and end dates are required.')
      return
    }
    if (contractForm.value <= 0) {
      toast.error('Contract value must be positive.')
      return
    }
    setSavingContract(true)
    try {
      await dispatch(createContract({
        ...contractForm,
        startDate: toLocalDT(contractForm.startDate),
        endDate: toLocalDT(contractForm.endDate),
      })).unwrap()
      toast.success('Contract created.')
      setShowCreate(false)
      setContractForm(EMPTY_CONTRACT)
    } catch {
      toast.error('Failed to create contract.')
    } finally { setSavingContract(false) }
  }

  /* ── Update Status (ORGANIZER | VENDOR) ── */
  const handleStatusChange = (contractId: string, status: ContractStatus) => {
    dispatch(updateContractStatus({ contractId, status }))
  }

  /* ── Create Invoice via Contract ── */
  const openInvoice = (c: ContractResponseDto) => {
    setTarget(c)
    setInvoiceForm({ ...EMPTY_INVOICE, totalAmount: c.value })
    setShowInvoice(true)
  }
  const handleCreateInvoice = async () => {
    if (!target) return
    if (!invoiceForm.dueDate) { toast.error('Due date is required.'); return }
    if (invoiceForm.totalAmount <= 0) { toast.error('Amount must be positive.'); return }
    setSavingInvoice(true)
    try {
      await dispatch(createInvoiceViaContract({
        contractId: target.contractId,
        payload: { ...invoiceForm, contractId: target.contractId, dueDate: toLocalDT(invoiceForm.dueDate) },
      })).unwrap()
      toast.success('Invoice created successfully.')
      setShowInvoice(false)
    } catch {
      toast.error('Failed to create invoice.')
    } finally { setSavingInvoice(false) }
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <PageBanner
        title="Contracts"
        subtitle="View and manage vendor agreements"
        actions={
          isOrganizer
            ? <Button variant="light" size="sm" className="fw-semibold rounded-3" onClick={() => { setContractForm(EMPTY_CONTRACT); setShowCreate(true) }}>
                + New Contract
              </Button>
            : undefined
        }
      />

      <Container fluid className="px-3 px-md-4 py-4">
        {contractsError && (
          <Alert variant="danger" className="py-2 mb-3">
            {contractsError}{' '}
            <Button variant="link" size="sm" className="p-0 align-baseline" onClick={() => dispatch(fetchAllContracts())}>
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
            placeholder="Search by vendor or contract ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </InputGroup>

        {/* Filter chips */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {(['ALL', ...FILTER_STATUSES] as const).map(s => (
            <Button key={s} size="sm"
              variant={filter === s ? 'primary' : 'outline-secondary'}
              className="rounded-pill"
              onClick={() => setFilter(s)}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>

        {/* Contracts Table */}
        <Card className="es-card border shadow-sm">
          <Card.Body className="p-0">
            <div className="d-flex justify-content-between align-items-center px-3 pt-3 pb-2">
              <span className="small fw-semibold" style={{ color: 'var(--text-primary)' }}>Contracts</span>
              <span className="small" style={{ color: 'var(--text-muted)' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            </div>
            {(!contractsLoading && filtered.length === 0) ? (
              <p className="text-center py-4 mb-0" style={{ color: 'var(--text-muted)' }}>No contracts found.</p>
            ) : (
              <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
                <thead style={{ background: 'var(--bg-subtle)' }}>
                  <tr>
                    {['Contract ID', 'Vendor', 'Event', 'Value', 'Start', 'End', 'Status', 'Actions'].map(h => (
                      <th key={h} className="fw-semibold border-0 pb-2 px-3 pt-3" style={{ color: 'var(--text-primary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contractsLoading ? (
                    <TableRowsSkeleton rows={5} cols={8} />
                  ) : filtered.map(c => (
                    <tr key={c.contractId}>
                      <td className="align-middle px-3 fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        CON-{c.contractId.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="align-middle fw-semibold px-3" style={{ color: 'var(--text-primary)' }}>{vendorName(c.vendorId)}</td>
                      <td className="align-middle px-3" style={{ color: 'var(--text-secondary)' }}>{eventName(c.eventId)}</td>
                      <td className="align-middle px-3" style={{ color: 'var(--text-secondary)' }}>
                        ${Number(c.value).toLocaleString()}
                      </td>
                      <td className="align-middle px-3" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(c.startDate).toLocaleDateString()}
                      </td>
                      <td className="align-middle px-3" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(c.endDate).toLocaleDateString()}
                      </td>
                      <td className="align-middle px-3">
                        <Badge className={`${statusBadgeClass(c.status)} border-0`} style={{ fontSize: '0.7rem' }}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="align-middle px-3">
                        <div className="d-flex gap-1 flex-wrap align-items-center">
                          {canSign && (
                            <Form.Select
                              size="sm"
                              className="es-form-control rounded-2"
                              style={{ width: 'auto' }}
                              value={c.status}
                              onChange={e => handleStatusChange(c.contractId, e.target.value as ContractStatus)}
                            >
                              {FILTER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </Form.Select>
                          )}
                          {c.status === 'ACTIVE' && canInvoice && (
                            <Button size="sm" variant="outline-success" className="rounded-2" onClick={() => openInvoice(c)}>
                              + Invoice
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

      {/* Create Contract Modal (ORGANIZER only) */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>New Contract</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-surface)' }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="es-label">Vendor *</Form.Label>
              <Form.Select
                className="es-form-control rounded-3"
                value={contractForm.vendorId}
                onChange={e => setContractForm(p => ({ ...p, vendorId: e.target.value }))}
                disabled={vendors.length === 0}
              >
                <option value="">{vendors.length === 0 ? 'No vendors available' : '— Select vendor —'}</option>
                {vendors.map(v => (
                  <option key={v.vendorId} value={v.vendorId}>{v.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="es-label">Event *</Form.Label>
              <Form.Select
                className="es-form-control rounded-3"
                value={contractForm.eventId}
                onChange={e => setContractForm(p => ({ ...p, eventId: e.target.value }))}
                disabled={events.length === 0}
              >
                <option value="">{events.length === 0 ? 'No events available' : '— Select event —'}</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.eventName}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Row className="g-3 mb-3">
              <Col xs={6}>
                <Form.Group>
                  <Form.Label className="es-label">Start Date *</Form.Label>
                  <Form.Control
                    className="es-form-control rounded-3"
                    type="datetime-local"
                    value={contractForm.startDate}
                    onChange={e => setContractForm(p => ({ ...p, startDate: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label className="es-label">End Date *</Form.Label>
                  <Form.Control
                    className="es-form-control rounded-3"
                    type="datetime-local"
                    value={contractForm.endDate}
                    onChange={e => setContractForm(p => ({ ...p, endDate: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label className="es-label">Contract Value *</Form.Label>
              <Form.Control
                className="es-form-control rounded-3"
                type="number"
                min={0}
                step="0.01"
                placeholder="e.g. 50000"
                value={contractForm.value}
                onChange={e => setContractForm(p => ({ ...p, value: Number(e.target.value) }))}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="es-label">Initial Status</Form.Label>
              <Form.Select
                className="es-form-control rounded-3"
                value={contractForm.status}
                onChange={e => setContractForm(p => ({ ...p, status: e.target.value as ContractStatus }))}
              >
                {FILTER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button variant="primary" size="sm" className="fw-semibold rounded-3" onClick={handleCreateContract} disabled={savingContract}>
            {savingContract ? <Spinner animation="border" size="sm" /> : 'Create Contract'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Invoice Modal */}
      <Modal show={showInvoice} onHide={() => setShowInvoice(false)} centered>
        <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>
            Create Invoice — {contractLabel(target)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-surface)' }}>
          <Form>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="es-label">Total Amount *</Form.Label>
                  <Form.Control
                    className="es-form-control rounded-3"
                    type="number"
                    min={0}
                    step="0.01"
                    value={invoiceForm.totalAmount}
                    onChange={e => setInvoiceForm(p => ({ ...p, totalAmount: Number(e.target.value) }))}
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="es-label">Due Date *</Form.Label>
                  <Form.Control
                    className="es-form-control rounded-3"
                    type="datetime-local"
                    value={invoiceForm.dueDate}
                    onChange={e => setInvoiceForm(p => ({ ...p, dueDate: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="es-label">Transaction ID (optional)</Form.Label>
                  <Form.Control
                    className="es-form-control rounded-3"
                    placeholder="e.g. TXN-20260420-001"
                    value={invoiceForm.transactionId ?? ''}
                    onChange={e => setInvoiceForm(p => ({ ...p, transactionId: e.target.value || undefined }))}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => setShowInvoice(false)}>Cancel</Button>
          <Button variant="success" size="sm" className="fw-semibold rounded-3" onClick={handleCreateInvoice} disabled={savingInvoice}>
            {savingInvoice ? <Spinner animation="border" size="sm" /> : 'Create Invoice'}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  )
}
