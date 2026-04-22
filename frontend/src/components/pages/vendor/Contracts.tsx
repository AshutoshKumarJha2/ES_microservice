import { useEffect, useState, useMemo } from 'react'
import {
  Container, Card, Table, Button, Modal, Form, Row, Col,
  Spinner, Alert, Badge, InputGroup,
} from 'react-bootstrap'
import { PageBanner } from '../../elements/common/PageBanner'
import { Search } from 'react-bootstrap-icons'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllContracts,
  fetchAllVendors,
  fetchAllInvoices,
  updateContractStatus,
  createInvoiceViaContract,
  addDeliveryViaContract,
} from '../../../store/slices/vendor/vendorSlice'
import type {
  ContractResponseDto, ContractStatus,
  InvoiceRequestDto, DeliveryRequestDto, DeliveryStatus,
} from '../../../types/vendor'

const FILTER_STATUSES: ContractStatus[] = ['DRAFT', 'ACTIVE', 'COMPLETED', 'TERMINATED']
const DELIVERY_STATUSES: DeliveryStatus[] = ['SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED']

const statusBadgeClass = (s: ContractStatus): string => {
  if (s === 'DRAFT')      return 'es-badge-draft'
  if (s === 'ACTIVE')     return 'es-badge-active'
  if (s === 'COMPLETED')  return 'es-badge-completed'
  if (s === 'TERMINATED') return 'es-badge-cancelled'
  return 'es-badge-draft'
}

const EMPTY_INVOICE: Omit<InvoiceRequestDto, 'contractId'> = {
  totalAmount: 0, dueDate: '', status: 'ISSUED',
}

const EMPTY_DELIVERY: Omit<DeliveryRequestDto, 'invoiceId'> = {
  item: '', quantity: 1, deliveryDate: '', status: 'SCHEDULED', trackingNumber: '',
}

export const Contracts = () => {
  const dispatch = useAppDispatch()
  const { contracts, contractsLoading, contractsError, vendors, invoices } =
    useAppSelector((s) => s.vendor)

  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState<ContractStatus | 'ALL'>('ALL')
  const [target, setTarget]         = useState<ContractResponseDto | null>(null)

  // Sign modal
  const [showSign, setShowSign]     = useState(false)
  const [signing, setSigning]       = useState(false)

  // Invoice modal
  const [showInvoice, setShowInvoice] = useState(false)
  const [invoiceForm, setInvoiceForm] = useState(EMPTY_INVOICE)
  const [savingInvoice, setSavingInvoice] = useState(false)

  // Delivery modal
  const [showDelivery, setShowDelivery]   = useState(false)
  const [deliveryInvoiceId, setDeliveryInvoiceId] = useState('')
  const [deliveryForm, setDeliveryForm]   = useState(EMPTY_DELIVERY)
  const [savingDelivery, setSavingDelivery] = useState(false)

  useEffect(() => {
    dispatch(fetchAllContracts())
    dispatch(fetchAllVendors())
    dispatch(fetchAllInvoices())
  }, [dispatch])

  const vendorName = (id: string) => vendors.find(v => v.vendorId === id)?.name ?? id.slice(0, 8) + '…'

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

  // Invoices linked to the selected contract (for delivery invoice select)
  const contractInvoices = invoices.filter(i => i.contractId === target?.contractId)

  /* ── Sign ── */
  const openSign = (c: ContractResponseDto) => { setTarget(c); setShowSign(true) }
  const handleSign = async () => {
    if (!target) return
    setSigning(true)
    try {
      await dispatch(updateContractStatus({ contractId: target.contractId, status: 'ACTIVE' })).unwrap()
      toast.success('Contract signed — status set to ACTIVE.')
      setShowSign(false)
    } catch {
      toast.error('Failed to sign contract.')
    } finally { setSigning(false) }
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
        payload: { ...invoiceForm, contractId: target.contractId },
      })).unwrap()
      toast.success('Invoice created successfully.')
      setShowInvoice(false)
    } catch {
      toast.error('Failed to create invoice.')
    } finally { setSavingInvoice(false) }
  }

  /* ── Add Delivery via Contract ── */
  const openDelivery = (c: ContractResponseDto) => {
    setTarget(c)
    setDeliveryInvoiceId('')
    setDeliveryForm(EMPTY_DELIVERY)
    setShowDelivery(true)
  }
  const handleAddDelivery = async () => {
    if (!target) return
    if (!deliveryInvoiceId.trim()) { toast.error('Invoice ID is required.'); return }
    if (!deliveryForm.item.trim() || !deliveryForm.deliveryDate || !deliveryForm.trackingNumber.trim()) {
      toast.error('All fields are required.')
      return
    }
    setSavingDelivery(true)
    try {
      await dispatch(addDeliveryViaContract({
        contractId: target.contractId,
        payload: {
          ...deliveryForm,
          invoiceId: deliveryInvoiceId,
          deliveryDate: new Date(deliveryForm.deliveryDate).toISOString(),
        },
      })).unwrap()
      toast.success('Delivery logged successfully.')
      setShowDelivery(false)
    } catch {
      toast.error('Failed to add delivery.')
    } finally { setSavingDelivery(false) }
  }

  return (
    <div>
      <PageBanner title="My Contracts" subtitle="View and manage vendor agreements" />

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
                    {['Contract ID', 'Vendor', 'Event ID', 'Value', 'Start', 'End', 'Status', 'Actions'].map(h => (
                      <th key={h} className="fw-semibold border-0 pb-2 px-3 pt-3" style={{ color: 'var(--text-primary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contractsLoading ? <TableRowsSkeleton rows={5} cols={8} /> : filtered.map(c => (
                    <tr key={c.contractId}>
                      <td className="align-middle px-3" style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
                        {c.contractId.slice(0, 8)}…
                      </td>
                      <td className="align-middle fw-semibold px-3" style={{ color: 'var(--text-primary)' }}>{vendorName(c.vendorId)}</td>
                      <td className="align-middle px-3" style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
                        {c.eventId.slice(0, 8)}…
                      </td>
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
                        <div className="d-flex gap-1 flex-wrap">
                          {c.status === 'DRAFT' && (
                            <Button size="sm" variant="outline-primary" className="rounded-2" onClick={() => openSign(c)}>
                              ✍ Sign
                            </Button>
                          )}
                          {c.status === 'ACTIVE' && (
                            <>
                              <Button size="sm" variant="outline-success" className="rounded-2" onClick={() => openInvoice(c)}>
                                + Invoice
                              </Button>
                              <Button size="sm" variant="outline-secondary" className="rounded-2" onClick={() => openDelivery(c)}>
                                + Delivery
                              </Button>
                            </>
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

      {/* Sign Modal */}
      <Modal show={showSign} onHide={() => setShowSign(false)} centered>
        <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>Sign Contract</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-surface)' }}>
          <p className="mb-2" style={{ color: 'var(--text-body)' }}>
            Sign contract <strong>{target?.contractId?.slice(0, 8)}…</strong>?
          </p>
          <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>
            Status will be set to <strong>ACTIVE</strong>.
          </p>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => setShowSign(false)}>Cancel</Button>
          <Button variant="primary" size="sm" className="fw-semibold rounded-3" onClick={handleSign} disabled={signing}>
            {signing ? <Spinner animation="border" size="sm" /> : 'Confirm & Sign'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Invoice Modal */}
      <Modal show={showInvoice} onHide={() => setShowInvoice(false)} centered>
        <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>
            Create Invoice — {target?.contractId?.slice(0, 8)}…
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

      {/* Add Delivery Modal */}
      <Modal show={showDelivery} onHide={() => setShowDelivery(false)} centered>
        <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>
            Add Delivery — {target?.contractId?.slice(0, 8)}…
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-surface)' }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="es-label">Invoice ID *</Form.Label>
              <Form.Select
                className="es-form-control rounded-3"
                value={deliveryInvoiceId}
                onChange={e => setDeliveryInvoiceId(e.target.value)}
                disabled={contractInvoices.length === 0}
              >
                <option value="">{contractInvoices.length === 0 ? 'No invoices for this contract' : '— Select invoice —'}</option>
                {contractInvoices.map(i => (
                  <option key={i.invoiceId} value={i.invoiceId}>
                    ${Number(i.totalAmount).toLocaleString()} — Due {new Date(i.dueDate).toLocaleDateString()} ({i.status})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="es-label">Item Description *</Form.Label>
              <Form.Control
                className="es-form-control rounded-3"
                placeholder="e.g. AV Equipment Setup"
                value={deliveryForm.item}
                onChange={e => setDeliveryForm(p => ({ ...p, item: e.target.value }))}
              />
            </Form.Group>
            <Row className="g-3 mb-3">
              <Col xs={6}>
                <Form.Group>
                  <Form.Label className="es-label">Quantity *</Form.Label>
                  <Form.Control
                    className="es-form-control rounded-3"
                    type="number"
                    min={1}
                    value={deliveryForm.quantity}
                    onChange={e => setDeliveryForm(p => ({ ...p, quantity: Number(e.target.value) }))}
                  />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label className="es-label">Status</Form.Label>
                  <Form.Select
                    className="es-form-control rounded-3"
                    value={deliveryForm.status}
                    onChange={e => setDeliveryForm(p => ({ ...p, status: e.target.value as DeliveryStatus }))}
                  >
                    {DELIVERY_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label className="es-label">Tracking Number *</Form.Label>
              <Form.Control
                className="es-form-control rounded-3"
                placeholder="e.g. TRK-20260420-001"
                value={deliveryForm.trackingNumber}
                onChange={e => setDeliveryForm(p => ({ ...p, trackingNumber: e.target.value }))}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="es-label">Delivery Date *</Form.Label>
              <Form.Control
                className="es-form-control rounded-3"
                type="datetime-local"
                value={deliveryForm.deliveryDate}
                onChange={e => setDeliveryForm(p => ({ ...p, deliveryDate: e.target.value }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => setShowDelivery(false)}>Cancel</Button>
          <Button variant="primary" size="sm" className="fw-semibold rounded-3" onClick={handleAddDelivery} disabled={savingDelivery}>
            {savingDelivery ? <Spinner animation="border" size="sm" /> : 'Log Delivery'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
