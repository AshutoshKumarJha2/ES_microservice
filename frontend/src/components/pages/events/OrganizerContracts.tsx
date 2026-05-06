import { useEffect, useState, useMemo } from 'react'
import {
  Container, Card, Table, Button, Modal, Form, Row, Col,
  Spinner, Alert, Badge, InputGroup,
} from 'react-bootstrap'
import { Search } from 'react-bootstrap-icons'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllContracts,
  fetchAllVendors,
  createContract,
  updateContract,
  updateContractStatus,
} from '../../../store/slices/vendor/vendorSlice'
import { fetchAllEvents } from '../../../store/slices/eventsSlice'
import type { ContractResponseDto, ContractRequestDto, ContractStatus } from '../../../types/vendor'

const FILTER_STATUSES: ContractStatus[] = ['DRAFT', 'ACTIVE', 'COMPLETED', 'TERMINATED']
const ALL_STATUSES: ContractStatus[] = ['DRAFT', 'ACTIVE', 'COMPLETED', 'TERMINATED']

const statusBadgeClass = (s: ContractStatus): string => {
  if (s === 'DRAFT')      return 'es-badge-draft'
  if (s === 'ACTIVE')     return 'es-badge-active'
  if (s === 'COMPLETED')  return 'es-badge-completed'
  if (s === 'TERMINATED') return 'es-badge-cancelled'
  return 'es-badge-draft'
}

const EMPTY_FORM: ContractRequestDto = {
  vendorId: '', eventId: '', startDate: '', endDate: '', value: 0, status: 'DRAFT',
}

export const OrganizerContracts = () => {
  const dispatch = useAppDispatch()
  const { contracts, contractsLoading, contractsError, vendors } = useAppSelector((s) => s.vendor)
  const events = useAppSelector((s) => s.events.events)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ContractStatus | 'ALL'>('ALL')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<ContractResponseDto | null>(null)
  const [form, setForm] = useState<ContractRequestDto>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    dispatch(fetchAllContracts())
    dispatch(fetchAllVendors())
    dispatch(fetchAllEvents())
  }, [dispatch])

  const vendorName = (id: string) => vendors.find(v => v.vendorId === id)?.name ?? '—'
  const eventName  = (id: string) => events.find(e => e.id === id)?.eventName ?? '—'

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return contracts.filter(c => {
      const matchStatus = filter === 'ALL' || c.status === filter
      const matchSearch = !q
        || vendorName(c.vendorId).toLowerCase().includes(q)
        || eventName(c.eventId).toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [contracts, search, filter, vendors, events])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (c: ContractResponseDto) => {
    setEditing(c)
    setForm({
      vendorId: c.vendorId,
      eventId: c.eventId,
      startDate: c.startDate.slice(0, 16),
      endDate: c.endDate.slice(0, 16),
      value: c.value,
      status: c.status,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.vendorId.trim() || !form.eventId.trim()) {
      toast.error('Vendor ID and Event ID are required.')
      return
    }
    if (!form.startDate || !form.endDate) {
      toast.error('Start and end dates are required.')
      return
    }
    if (form.value <= 0) {
      toast.error('Contract value must be positive.')
      return
    }
    setSaving(true)
    try {
      const toLocalDT = (s: string) => s.length === 16 ? s + ':00' : s
      const payload = {
        ...form,
        startDate: toLocalDT(form.startDate),
        endDate: toLocalDT(form.endDate),
      }
      if (editing) {
        await dispatch(updateContract({ contractId: editing.contractId, payload })).unwrap()
        toast.success('Contract updated.')
      } else {
        await dispatch(createContract(payload)).unwrap()
        toast.success('Contract created.')
      }
      setShowModal(false)
    } catch {
      toast.error('Operation failed. Please try again.')
    } finally { setSaving(false) }
  }

  const handleStatusChange = (contractId: string, status: ContractStatus) => {
    dispatch(updateContractStatus({ contractId, status }))
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Banner */}
      <div className="es-banner text-white">
        <Container fluid className="px-3 px-md-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h1 className="fw-bold fs-3 mb-1">Contracts</h1>
            <p className="mb-0 text-white-50 small">Manage vendor contracts for your events</p>
          </div>
          <Button variant="light" size="sm" className="fw-semibold rounded-3" onClick={openCreate}>
            + New Contract
          </Button>
        </Container>
      </div>

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
            placeholder="Search by vendor, event, or contract ID…"
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
            {contractsLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: 'var(--blue)' }} />
              </div>
            ) : filtered.length === 0 ? (
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
                  {filtered.map(c => (
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
                        <div className="d-flex gap-2 align-items-center">
                          <Form.Select
                            size="sm"
                            className="es-form-control rounded-2"
                            style={{ width: 'auto' }}
                            value={c.status}
                            onChange={e => handleStatusChange(c.contractId, e.target.value as ContractStatus)}
                          >
                            {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </Form.Select>
                          <Button size="sm" variant="outline-secondary" className="rounded-2" onClick={() => openEdit(c)}>Edit</Button>
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
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Modal.Title className="fs-6 fw-semibold" style={{ color: 'var(--text-primary)' }}>
            {editing ? 'Edit Contract' : 'New Contract'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-surface)' }}>
          <Form>
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="es-label">Vendor *</Form.Label>
                  <Form.Select
                    className="es-form-control rounded-3"
                    value={form.vendorId}
                    onChange={e => setForm(p => ({ ...p, vendorId: e.target.value }))}
                    disabled={vendors.length === 0}
                  >
                    <option value="">{vendors.length === 0 ? 'No vendors available' : '— Select vendor —'}</option>
                    {vendors.map(v => (
                      <option key={v.vendorId} value={v.vendorId}>{v.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="es-label">Event *</Form.Label>
                  <Form.Select
                    className="es-form-control rounded-3"
                    value={form.eventId}
                    onChange={e => setForm(p => ({ ...p, eventId: e.target.value }))}
                    disabled={events.length === 0}
                  >
                    <option value="">{events.length === 0 ? 'No events available' : '— Select event —'}</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.eventName}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="es-label">Start Date *</Form.Label>
                  <Form.Control
                    className="es-form-control rounded-3"
                    type="datetime-local"
                    value={form.startDate}
                    onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="es-label">End Date *</Form.Label>
                  <Form.Control
                    className="es-form-control rounded-3"
                    type="datetime-local"
                    value={form.endDate}
                    onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="es-label">Contract Value ($) *</Form.Label>
                  <Form.Control
                    className="es-form-control rounded-3"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.value}
                    onChange={e => setForm(p => ({ ...p, value: Number(e.target.value) }))}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="es-label">Initial Status</Form.Label>
                  <Form.Select
                    className="es-form-control rounded-3"
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value as ContractStatus }))}
                  >
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" size="sm" className="fw-semibold rounded-3" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner animation="border" size="sm" /> : editing ? 'Save Changes' : 'Create Contract'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
