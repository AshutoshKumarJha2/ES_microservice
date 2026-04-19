import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchAllVenues } from '../../../store/slices/venue/venueSlice'
import styles from '../../../css/venue/Venue.module.css'

/* ── Stat Card ──────────────────────────────────────────────────────────────── */

const ACCENT: Record<string, { color: string; bg: string }> = {
  blue:   { color: 'var(--blue)',    bg: 'var(--blue-subtle)' },
  green:  { color: 'var(--green)',   bg: 'var(--green-subtle)' },
  red:    { color: 'var(--red)',     bg: 'var(--red-subtle)' },
  yellow: { color: 'var(--saffron)', bg: 'var(--saffron-subtle)' },
}

const StatCard = ({
  label, value, accent,
}: {
  label: string; value: string; accent: keyof typeof ACCENT
}) => (
  <div className={styles.card} style={{ padding: '20px 24px' }}>
    <div style={{
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '.08em', color: ACCENT[accent].color,
      fontFamily: 'Urbanist, sans-serif', marginBottom: 8,
    }}>
      {label}
    </div>
    <div style={{
      fontSize: 34, fontWeight: 800, fontFamily: 'Urbanist, sans-serif',
      color: 'var(--text-primary)', lineHeight: 1,
    }}>
      {value}
    </div>
  </div>
)

/* ── Action Card ────────────────────────────────────────────────────────────── */

const ActionCard = ({
  title, desc, linkLabel, onClick, accentColor,
}: {
  title: string; desc: string; linkLabel: string
  onClick: () => void; accentColor: string
}) => (
  <div
    className={styles.card}
    onClick={onClick}
    style={{
      padding: '20px 24px', cursor: 'pointer',
      borderTop: `3px solid ${accentColor}`,
      transition: 'box-shadow .18s, transform .15s',
    }}
    onMouseEnter={(e) => {
      const el = e.currentTarget as HTMLDivElement
      el.style.boxShadow = 'var(--shadow-md)'
      el.style.transform = 'translateY(-2px)'
    }}
    onMouseLeave={(e) => {
      const el = e.currentTarget as HTMLDivElement
      el.style.boxShadow = ''
      el.style.transform = ''
    }}
  >
    <div style={{
      fontSize: 14, fontWeight: 700, fontFamily: 'Urbanist, sans-serif',
      color: 'var(--text-primary)', marginBottom: 6,
    }}>
      {title}
    </div>
    <div style={{
      fontSize: 12, color: 'var(--text-secondary)',
      fontFamily: 'Noto Sans, sans-serif', lineHeight: 1.55,
    }}>
      {desc}
    </div>
    <div style={{
      marginTop: 14, fontSize: 11, fontWeight: 700,
      fontFamily: 'Urbanist, sans-serif', color: accentColor,
    }}>
      {linkLabel} →
    </div>
  </div>
)

/* ── Dashboard ──────────────────────────────────────────────────────────────── */

export const VenueManagerDashboard = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { venues, venuesLoading } = useAppSelector((s) => s.venue)
  const { user } = useAppSelector((s) => s.auth)

  useEffect(() => { dispatch(fetchAllVenues()) }, [dispatch])

  const val = (n: number) => (venuesLoading ? '…' : String(n))

  const counts = {
    total:       venues.length,
    available:   venues.filter((v) => v.availabilityStatus === 'AVAILABLE').length,
    unavailable: venues.filter((v) => v.availabilityStatus === 'UNAVAILABLE').length,
    maintenance: venues.filter((v) => v.availabilityStatus === 'MAINTENENCE').length,
  }

  const firstName = user?.name?.split(' ')[0] ?? 'Manager'

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Welcome back, {firstName}</h1>
          <p className={styles.pageSubtitle}>
            Venue Manager Portal — overview of your venues, bookings and resources
          </p>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16, marginBottom: 28,
      }}>
        <StatCard label="Total Venues"  value={val(counts.total)}       accent="blue" />
        <StatCard label="Available"     value={val(counts.available)}   accent="green" />
        <StatCard label="Unavailable"   value={val(counts.unavailable)} accent="red" />
        <StatCard label="Maintenance"   value={val(counts.maintenance)} accent="yellow" />
      </div>

      {/* ── Section label ──────────────────────────────────────────────────── */}
      <div style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '.08em', color: 'var(--text-secondary)',
        fontFamily: 'Urbanist, sans-serif', marginBottom: 12,
      }}>
        Quick Access
      </div>

      {/* ── Action Cards ───────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
      }}>
        <ActionCard
          title="Venues"
          desc="Add, edit and update venue listings. Set capacity and toggle availability status."
          linkLabel="Manage Venues"
          onClick={() => navigate('/venue-manager/venues')}
          accentColor="#004AD4"
        />
        <ActionCard
          title="Bookings"
          desc="Review incoming booking requests. Confirm or cancel bookings per venue."
          linkLabel="View Bookings"
          onClick={() => navigate('/venue-manager/venue/bookings')}
          accentColor="#16a34a"
        />

        
        <ActionCard
          title="Resources"
          desc="Manage equipment and staff resources assigned to each venue."
          linkLabel="Manage Resources"
          onClick={() => navigate('/venue-manager/venue/resources')}
          accentColor="#F47920"
        />
      </div>
    </>
  )
}
