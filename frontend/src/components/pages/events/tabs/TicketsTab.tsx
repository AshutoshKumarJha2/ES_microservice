import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { createTicket, updateTicket, deleteTicket, fetchTicketsByEvent } from '../../../../store/slices/ticketsSlice'
import { TicketModal } from '../../../elements/events/TicketModal'
import { EventStatusBadge } from '../../../elements/events/EventStatusBadge'
import type { CreateTicketRequest, TicketResponseDto } from '../../../../types/events'
import { Card, Table, Button, Spinner } from 'react-bootstrap'

interface Props { eventId: string }

export const TicketsTab = ({ eventId }: Props) => {
  const dispatch = useAppDispatch()
  const { tickets, loading } = useAppSelector((s) => s.tickets)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<TicketResponseDto | null>(null)

  const handleSave = async (payload: CreateTicketRequest) => {
    if (editingTicket) {
      await dispatch(updateTicket({ ticketId: editingTicket.ticketId, payload })).unwrap()
    } else {
      await dispatch(createTicket({ eventId, payload })).unwrap()
      dispatch(fetchTicketsByEvent({ eventId }))
    }
    setEditingTicket(null)
  }

  return (
    <Card className="es-card border shadow-sm">
      <Card.Body className="p-3 p-md-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>Tickets</Card.Title>
          <Button
            variant="primary"
            size="sm"
            className="rounded-3"
            onClick={() => { setEditingTicket(null); setModalOpen(true) }}
          >
            + Add Ticket
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-4"><Spinner animation="border" style={{ color: 'var(--blue)' }} /></div>
        ) : tickets.length === 0 ? (
          <p className="text-center py-3" style={{ color: 'var(--text-muted)' }}>No tickets yet. Add one to get started.</p>
        ) : (
          <Table hover responsive className="mb-0" style={{ fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)' }}>
                <th className="fw-medium border-0 pb-2">Type</th>
                <th className="fw-medium border-0 pb-2">Price</th>
                <th className="fw-medium border-0 pb-2">Status</th>
                <th className="fw-medium border-0 pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.ticketId}>
                  <td className="align-middle fw-semibold" style={{ color: 'var(--text-primary)' }}>{t.type}</td>
                  <td className="align-middle" style={{ color: 'var(--text-secondary)' }}>₹{t.price.toFixed(2)}</td>
                  <td className="align-middle"><EventStatusBadge status={t.status} variant="event" /></td>
                  <td className="align-middle">
                    <div className="d-flex gap-1">
                      <Button variant="outline-primary" size="sm" className="rounded-3" style={{ fontSize: '0.78rem' }}
                        onClick={() => { setEditingTicket(t); setModalOpen(true) }}>Edit</Button>
                      <Button variant="outline-danger" size="sm" className="rounded-3" style={{ fontSize: '0.78rem' }}
                        onClick={() => dispatch(deleteTicket(t.ticketId))}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>

      {modalOpen && (
        <TicketModal
          onClose={() => { setModalOpen(false); setEditingTicket(null) }}
          onSave={handleSave}
          existing={editingTicket}
        />
      )}
    </Card>
  )
}
