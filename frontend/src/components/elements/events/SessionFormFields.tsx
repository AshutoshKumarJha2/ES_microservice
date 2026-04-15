import styles from '../../../css/events/EventsPanel.module.css'
import type { ScheduleRequestDto } from '../../../types/events'

export const parseTimeSlot = (slot: string) => {
  const [start = '', end = ''] = slot.split('-')
  return { start, end }
}

export const buildTimeSlot = (start: string, end: string) => `${start}-${end}`

type SessionValues = Omit<ScheduleRequestDto, 'eventId'>

interface Props {
  values: SessionValues
  onChange: (patch: Partial<SessionValues>) => void
}

export const SessionFormFields = ({ values, onChange }: Props) => (
  <div className={styles['session-row-fields']}>
    <div className={styles.field}>
      <label>Date</label>
      <input
        type="date"
        value={values.date}
        onChange={(e) => onChange({ date: e.target.value })}
        required
      />
    </div>

    <div className={styles.field}>
      <label>Time Slot</label>
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        <input
          type="time"
          value={parseTimeSlot(values.timeSlot).start}
          onChange={(e) => onChange({ timeSlot: buildTimeSlot(e.target.value, parseTimeSlot(values.timeSlot).end) })}
          style={{ flex: 1, minWidth: 0 }}
          required
        />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', flexShrink: 0 }}>to</span>
        <input
          type="time"
          value={parseTimeSlot(values.timeSlot).end}
          min={parseTimeSlot(values.timeSlot).start || undefined}
          onChange={(e) => onChange({ timeSlot: buildTimeSlot(parseTimeSlot(values.timeSlot).start, e.target.value) })}
          style={{ flex: 1, minWidth: 0 }}
          required
        />
      </div>
    </div>

    <div className={styles.field}>
      <label>Activity</label>
      <input
        type="text"
        placeholder="Session title"
        value={values.activity}
        onChange={(e) => onChange({ activity: e.target.value })}
        required
      />
    </div>

    <div className={styles.field}>
      <label>Status</label>
      <select
        value={values.status}
        onChange={(e) => onChange({ status: e.target.value as ScheduleRequestDto['status'] })}
      >
        <option value="DRAFT">Draft</option>
        <option value="ACTIVE">Active</option>
        <option value="COMPLETED">Completed</option>
        <option value="TERMINATED">Terminated</option>
      </select>
    </div>
  </div>
)
