import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { approveRegistration, rejectRegistration } from '../../../../store/slices/registrationsSlice'
import { EventStatusBadge } from '../../../elements/events/EventStatusBadge'
import { Card, Table, Button, ButtonGroup, Spinner } from 'react-bootstrap'

type RegFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

export const RegistrationsTab = () => {
  const dispatch = useAppDispatch()
  const { registrations, loading, actionLoading } = useAppSelector((s) => s.registrations)

  const [regFilter, setRegFilter] = useState<RegFilter>('ALL')

  const filtered = regFilter === 'ALL' ? registrations : registrations.filter((r) => r.status === regFilter)

  return (
    <Card className="es-card border shadow-sm">
      <Card.Body className="p-3 p-md-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>Registrations</Card.Title>
        </div>

        {/* Filters */}
        <ButtonGroup className="mb-3 flex-wrap gap-1">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as RegFilter[]).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={regFilter === f ? 'primary' : 'outline-secondary'}
              className="rounded-pill"
              onClick={() => setRegFilter(f)}
              style={{ fontSize: '0.78rem' }}
            >
              {f}
            </Button>
          ))}
        </ButtonGroup>

        {loading ? (
          <div className="text-center py-4"><Spinner animation="border" style={{ color: 'var(--blue)' }} /></div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-3" style={{ color: 'var(--text-muted)' }}>No registrations found.</p>
        ) : (
          <Table hover responsive className="mb-0" style={{ fontSize: '0.85rem' }}>
            <thead style={{ background: 'var(--bg-subtle)' }}>
              <tr>
                <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Registration ID</th>
                <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Attendee</th>
                <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Ticket ID</th>
                <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Status</th>
                <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.registrationId}>
                  <td className="align-middle" style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {r.registrationId}
                  </td>
                  <td className="align-middle">
                    {r.attendeeDetails ? (
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.attendeeDetails.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.attendeeDetails.email}</div>
                      </div>
                    ) : (
                      <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{r.attendeeId}</span>
                    )}
                  </td>
                  <td className="align-middle" style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {r.ticketId}
                  </td>
                  <td className="align-middle">
                    <EventStatusBadge status={r.status} variant="registration" />
                  </td>
                  <td className="align-middle">
                    {r.status === 'PENDING' && (
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-success" size="sm" className="rounded-3" style={{ fontSize: '0.78rem' }}
                          disabled={actionLoading === r.registrationId}
                          onClick={() => dispatch(approveRegistration(r.registrationId))}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline-danger" size="sm" className="rounded-3" style={{ fontSize: '0.78rem' }}
                          disabled={actionLoading === r.registrationId}
                          onClick={() => dispatch(rejectRegistration(r.registrationId))}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  )
}
