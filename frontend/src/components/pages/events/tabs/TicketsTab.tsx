import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { createTicket, updateTicket, deleteTicket, fetchTicketsByEvent } from '../../../../store/slices/ticketsSlice'
import { TicketModal } from '../../../elements/events/TicketModal'
import { PanelHeader } from '../../../elements/events/PanelHeader'
import { EventStatusBadge } from '../../../elements/events/EventStatusBadge'
import type { CreateTicketRequest, TicketResponseDto } from '../../../../types/events'
import styles from '../../../../css/events/EventsPanel.module.css'

interface Props {
  eventId: string
}

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
    <div className={styles.card}>
      <PanelHeader title="Tickets">
        <button
          className={styles['btn-primary']}
          onClick={() => { setEditingTicket(null); setModalOpen(true) }}
        >
          + Add Ticket
        </button>
      </PanelHeader>

      {loading ? (
        <p className={styles.loading}>Loading tickets…</p>
      ) : tickets.length === 0 ? (
        <p className={styles.empty}>No tickets yet. Add one to get started.</p>
      ) : (
        <div className={styles['table-wrapper']}>
          <table>
            <thead>
              <tr><th>Type</th><th>Price</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.ticketId}>
                  <td style={{ fontWeight: 600 }}>{t.type}</td>
                  <td>₹{t.price.toFixed(2)}</td>
                  <td>
                    <EventStatusBadge
                      status={t.status}
                      variant="event"
                    />
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles['btn-sm']} onClick={() => { setEditingTicket(t); setModalOpen(true) }}>
                        Edit
                      </button>
                      <button className={styles['btn-danger']} onClick={() => dispatch(deleteTicket(t.ticketId))}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <TicketModal
          onClose={() => { setModalOpen(false); setEditingTicket(null) }}
          onSave={handleSave}
          existing={editingTicket}
        />
      )}
    </div>
  )
}
