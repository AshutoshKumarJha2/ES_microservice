import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllVendors,
  fetchAllContracts,
  fetchAllDeliveries,
  fetchAllInvoices,
} from '../../../store/slices/vendor/vendorSlice'
import styles from '../../../css/vendor/Vendor.module.css'
import { StatGridSkeleton } from '../../elements/skeletons/PageSkeleton'

export const VendorManagerDashboard = () => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((s) => s.auth)
  const { vendors, contracts, deliveries, invoices, vendorsLoading, contractsLoading } = useAppSelector((s) => s.vendor)

  useEffect(() => {
    dispatch(fetchAllVendors())
    dispatch(fetchAllContracts())
    dispatch(fetchAllDeliveries())
    dispatch(fetchAllInvoices())
  }, [dispatch])

  const firstName = user?.name?.split(' ')[0] ?? 'Vendor'

  // Vendor profile exists if any vendor record is registered
  const hasProfile = vendors.length > 0

  // Contract stats
  const draftContracts    = contracts.filter(c => c.status === 'DRAFT').length
  const activeContracts   = contracts.filter(c => c.status === 'ACTIVE').length
  const completedContracts = contracts.filter(c => c.status === 'COMPLETED').length

  // Delivery stats
  const scheduledDeliveries = deliveries.filter(d => d.status === 'SCHEDULED').length
  const inTransitDeliveries = deliveries.filter(d => d.status === 'IN_TRANSIT').length
  const deliveredCount      = deliveries.filter(d => d.status === 'DELIVERED').length

  // Invoice stats
  const pendingInvoices  = invoices.filter(i => i.status === 'ISSUED').length
  const overdueInvoices  = invoices.filter(i => i.status === 'OVERDUE').length
  const paidInvoices     = invoices.filter(i => i.status === 'PAID').length

  const stats = [
    { label: 'Contracts to Sign', value: draftContracts,     icon: '✍️',  color: '#3730a3', borderColor: '#3730a3' },
    { label: 'Active Contracts',  value: activeContracts,    icon: '📄',  color: '#065f46', borderColor: '#065f46' },
    { label: 'Pending Deliveries',value: scheduledDeliveries + inTransitDeliveries, icon: '🚚', color: '#92400e', borderColor: '#92400e' },
    { label: 'Delivered',         value: deliveredCount,     icon: '✅',  color: '#065f46', borderColor: '#1d4ed8' },
    { label: 'Unpaid Invoices',   value: pendingInvoices + overdueInvoices, icon: '💰', color: '#991b1b', borderColor: '#991b1b' },
    { label: 'Paid Invoices',     value: paidInvoices,       icon: '🧾',  color: '#1e40af', borderColor: '#1e40af' },
  ]

  const actions = [
    {
      to: '/vendor/profile',
      icon: hasProfile ? '🏢' : '➕',
      title: hasProfile ? 'My Profile' : 'Register as Vendor',
      desc: hasProfile ? 'View and update your vendor profile' : 'Create your vendor profile to start',
    },
    {
      to: '/vendor/contracts',
      icon: '📄',
      title: 'My Contracts',
      desc: draftContracts > 0
        ? `${draftContracts} contract${draftContracts > 1 ? 's' : ''} waiting to be signed`
        : 'View all your vendor agreements',
    },
    {
      to: '/vendor/deliveries',
      icon: '🚚',
      title: 'Log Delivery',
      desc: 'Confirm and track goods & equipment delivered',
    },
    {
      to: '/vendor/invoices',
      icon: '🧾',
      title: 'Invoices',
      desc: overdueInvoices > 0
        ? `${overdueInvoices} overdue invoice${overdueInvoices > 1 ? 's' : ''} — action needed`
        : 'View billing records and download PDFs',
    },
  ]

  return (
    <div>
      {/* Welcome */}
      <div className={styles.welcomeCard}>
        <h2>Welcome back, {firstName}!</h2>
        <p>
          {hasProfile
            ? `You have ${draftContracts} contract${draftContracts !== 1 ? 's' : ''} to sign, ${scheduledDeliveries + inTransitDeliveries} active deliveries, and ${pendingInvoices + overdueInvoices} unpaid invoices.`
            : 'Get started by registering your vendor profile below.'}
        </p>
      </div>

      {/* Flow hint banner when there are contracts to sign */}
      {draftContracts > 0 && (
        <div style={{
          background: 'rgba(55,48,163,0.08)', border: '1.5px solid #a5b4fc',
          borderRadius: 8, padding: '10px 16px', marginBottom: 20,
          fontSize: 12, color: '#3730a3', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>📋 <strong>{draftContracts}</strong> contract{draftContracts !== 1 ? 's' : ''} in DRAFT — review and sign to activate.</span>
          <Link to="/vendor/contracts" style={{ color: '#3730a3', fontWeight: 700, fontSize: 11 }}>View Contracts →</Link>
        </div>
      )}

      {/* Overdue invoice alert */}
      {overdueInvoices > 0 && (
        <div style={{
          background: 'rgba(153,27,27,0.07)', border: '1.5px solid #fca5a5',
          borderRadius: 8, padding: '10px 16px', marginBottom: 20,
          fontSize: 12, color: '#991b1b', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>⚠️ <strong>{overdueInvoices}</strong> overdue invoice{overdueInvoices !== 1 ? 's' : ''} — follow up with the finance team.</span>
          <Link to="/vendor/invoices" style={{ color: '#991b1b', fontWeight: 700, fontSize: 11 }}>View Invoices →</Link>
        </div>
      )}

      {/* Stats */}
      {(vendorsLoading || contractsLoading) ? <StatGridSkeleton count={6} /> : (
        <div className={styles.statsGrid}>
          {stats.map((s) => (
            <div key={s.label} className={styles.statCard} style={{ borderLeftColor: s.borderColor }}>
              <span className={styles.statIcon}>{s.icon}</span>
              <div>
                <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div style={{ marginBottom: 10 }}>
        <div className={styles.pageTitle} style={{ marginBottom: 14 }}>Quick Actions</div>
        <div className={styles.actionsGrid}>
          {actions.map((a) => (
            <Link key={a.to} to={a.to} className={styles.actionCard}>
              <div className={styles.actionCardIcon}>{a.icon}</div>
              <div className={styles.actionCardTitle}>{a.title}</div>
              <div className={styles.actionCardDesc}>{a.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Vendor flow guide */}
      <div className={styles.card} style={{ padding: '20px 24px', marginTop: 24 }}>
        <div className={styles.pageTitle} style={{ marginBottom: 12, fontSize: 14 }}>Vendor Flow Guide</div>
        <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
          {[
            { step: '1', label: 'Register Profile', sub: '/vendor/profile', color: '#1a1a2e' },
            { step: '2', label: 'Sign Contract',    sub: '/vendor/contracts', color: '#3730a3' },
            { step: '3', label: 'Log Delivery',     sub: '/vendor/deliveries', color: '#92400e' },
            { step: '4', label: 'Check Invoice',    sub: '/vendor/invoices', color: '#065f46' },
          ].map((f, i, arr) => (
            <div key={f.step} style={{ display: 'flex', alignItems: 'center' }}>
              <Link to={f.sub} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', borderRadius: 8,
                  background: 'var(--bg-hover)', transition: 'background 0.15s',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: f.color, color: '#fff',
                    fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>{f.step}</div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Urbanist, sans-serif' }}>{f.label}</span>
                </div>
              </Link>
              {i < arr.length - 1 && (
                <span style={{ color: 'var(--text-muted)', fontSize: 16, padding: '0 4px' }}>→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
