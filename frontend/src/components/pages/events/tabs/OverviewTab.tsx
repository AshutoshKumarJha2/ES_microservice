import { useEffect, useState } from 'react'
import { useAppSelector } from '../../../../store/hooks'
import { eventService } from '../../../../services/events/eventService'
import { PanelHeader } from '../../../elements/events/PanelHeader'
import { SessionFormFields } from '../../../elements/events/SessionFormFields'
import { EventStatusBadge } from '../../../elements/events/EventStatusBadge'
import type { ScheduleResponseDto, ScheduleRequestDto } from '../../../../types/events'
import styles from '../../../../css/events/EventsPanel.module.css'

interface Props {
  eventId: string
  eventStartAt: string
}

export const OverviewTab = ({ eventId, eventStartAt }: Props) => {
  const { tickets } = useAppSelector((s) => s.tickets)
  const { registrations } = useAppSelector((s) => s.registrations)

  const [schedules, setSchedules] = useState<ScheduleResponseDto[]>([])
  const [schedulesLoading, setSchedulesLoading] = useState(false)
  const [showAddSession, setShowAddSession] = useState(false)
  const [newSession, setNewSession] = useState<Omit<ScheduleRequestDto, 'eventId'>>({
    date: '', timeSlot: '', activity: '', status: 'DRAFT',
  })
  const [sessionSaving, setSessionSaving] = useState(false)
  const [editingSession, setEditingSession] = useState<ScheduleResponseDto | null>(null)
  const [sessionUpdating, setSessionUpdating] = useState(false)

  const loadSchedules = () => {
    setSchedulesLoading(true)
    eventService.getSchedules(eventId)
      .then(setSchedules)
      .catch(console.error)
      .finally(() => setSchedulesLoading(false))
  }

  useEffect(() => { loadSchedules() }, [eventId])

  const handleAddSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSessionSaving(true)
    try {
      await eventService.createSchedule(eventId, { ...newSession, eventId })
      setNewSession({ date: '', timeSlot: '', activity: '', status: 'DRAFT' })
      setShowAddSession(false)
      loadSchedules()
    } catch { /* ignore */ } finally {
      setSessionSaving(false)
    }
  }

  const handleUpdateSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingSession) return
    setSessionUpdating(true)
    try {
      const { scheduleId, eventId: _eid, ...rest } = editingSession as ScheduleResponseDto & { eventId?: string }
      await eventService.updateSchedule(eventId, scheduleId, { ...rest, eventId })
      setEditingSession(null)
      loadSchedules()
    } catch { /* ignore */ } finally {
      setSessionUpdating(false)
    }
  }

  const handleDeleteSession = async (scheduleId: string) => {
    if (!window.confirm('Delete this session?')) return
    await eventService.deleteSchedule(scheduleId)
    loadSchedules()
  }

  return (
    <>
      <div className={styles['quick-stats']}>
        <div className={styles['qs-card']}>
          <div className={styles['qs-label']}>Total Tickets</div>
          <div className={styles['qs-value']}>{tickets.length}</div>
        </div>
        <div className={styles['qs-card']}>
          <div className={styles['qs-label']}>Registrations</div>
          <div className={styles['qs-value']}>{registrations.length}</div>
        </div>
        <div className={styles['qs-card']}>
          <div className={styles['qs-label']}>Sessions</div>
          <div className={styles['qs-value']}>{schedules.length}</div>
        </div>
      </div>

      <div className={styles.card}>
        <PanelHeader title="Schedule">
          <button
            className={styles['btn-primary']}
            onClick={() => {
              if (!showAddSession) setNewSession((p) => ({ ...p, date: eventStartAt }))
              setShowAddSession((v) => !v)
            }}
          >
            {showAddSession ? 'Cancel' : '+ Add Session'}
          </button>
        </PanelHeader>

        {showAddSession && (
          <form onSubmit={handleAddSession} className={styles['session-row']} style={{ marginBottom: '1rem' }}>
            <SessionFormFields
              values={newSession}
              onChange={(patch) => setNewSession((p) => ({ ...p, ...patch }))}
            />
            <div className={styles['session-row-actions']}>
              <button type="submit" className={styles['btn-add-session']} disabled={sessionSaving}>
                {sessionSaving ? '…' : '↑ Save'}
              </button>
            </div>
          </form>
        )}

        {schedulesLoading ? (
          <p className={styles.loading}>Loading schedule…</p>
        ) : schedules.length === 0 ? (
          <p className={styles.empty}>No sessions added yet.</p>
        ) : (
          <div className={styles['table-wrapper']}>
            <table>
              <thead>
                <tr><th>Date</th><th>Time Slot</th><th>Activity</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {schedules.map((s) => {
                  if (editingSession?.scheduleId === s.scheduleId) {
                    return (
                      <tr key={s.scheduleId}>
                        <td colSpan={5} style={{ padding: '0.5rem 0' }}>
                          <form onSubmit={handleUpdateSession} className={styles['session-row']} style={{ margin: 0 }}>
                            <SessionFormFields
                              values={editingSession}
                              onChange={(patch) => setEditingSession((p) => p && ({ ...p, ...patch }))}
                            />
                            <div className={styles['session-row-actions']}>
                              <button type="submit" className={styles['btn-add-session']} disabled={sessionUpdating}>
                                {sessionUpdating ? '…' : '↑ Save'}
                              </button>
                              <button type="button" className={styles['btn-remove']} onClick={() => setEditingSession(null)}>
                                Cancel
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )
                  }
                  return (
                    <tr key={s.scheduleId}>
                      <td>{s.date}</td>
                      <td>{s.timeSlot}</td>
                      <td>{s.activity}</td>
                      <td><EventStatusBadge status={s.status} variant="schedule" /></td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles['btn-sm']} onClick={() => setEditingSession(s)}>Edit</button>
                          <button className={styles['btn-danger']} onClick={() => handleDeleteSession(s.scheduleId)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
