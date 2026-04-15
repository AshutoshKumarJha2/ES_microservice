import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { approveRegistration, rejectRegistration } from '../../../../store/slices/registrationsSlice'
import { PanelHeader } from '../../../elements/events/PanelHeader'
import { EventStatusBadge } from '../../../elements/events/EventStatusBadge'
import styles from '../../../../css/events/EventsPanel.module.css'

type RegFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

export const RegistrationsTab = () => {
  const dispatch = useAppDispatch()
  const { registrations, loading, actionLoading } = useAppSelector((s) => s.registrations)

  const [regFilter, setRegFilter] = useState<RegFilter>('ALL')

  const filtered = regFilter === 'ALL' ? registrations : registrations.filter((r) => r.status === regFilter)

  return (
    <div className={styles.card}>
      <PanelHeader title="Registrations" />

      <div className={styles['filter-row']}>
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as RegFilter[]).map((f) => (
          <button
            key={f}
            className={`${styles.chip}${regFilter === f ? ` ${styles.active}` : ''}`}
            onClick={() => setRegFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className={styles.loading}>Loading registrations…</p>
      ) : filtered.length === 0 ? (
        <p className={styles.empty}>No registrations found.</p>
      ) : (
        <div className={styles['table-wrapper']}>
          <table>
            <thead>
              <tr><th>Registration ID</th><th>Attendee ID</th><th>Ticket ID</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.registrationId}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.registrationId}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.attendeeId}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.ticketId}</td>
                  <td><EventStatusBadge status={r.status} variant="registration" /></td>
                  <td>
                    {r.status === 'PENDING' && (
                      <div className={styles.actions}>
                        <button
                          className={styles['btn-success']}
                          disabled={actionLoading === r.registrationId}
                          onClick={() => dispatch(approveRegistration(r.registrationId))}
                        >
                          Approve
                        </button>
                        <button
                          className={styles['btn-danger']}
                          disabled={actionLoading === r.registrationId}
                          onClick={() => dispatch(rejectRegistration(r.registrationId))}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
