import { useEffect, useState } from 'react'
import { Modal, Button, Spinner } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  fetchAllContracts,
  fetchAllVendors,
  updateContractStatus,
} from '../../../store/slices/vendor/vendorSlice'
import type { ContractResponseDto, ContractStatus } from '../../../types/vendor'
import styles from '../../../css/vendor/Vendor.module.css'

const FILTER_STATUSES: ContractStatus[] = ['DRAFT', 'ACTIVE', 'COMPLETED', 'TERMINATED']

const statusBadgeClass = (s: ContractStatus) => {
  if (s === 'DRAFT')      return styles.badgePurple
  if (s === 'ACTIVE')     return styles.badgeGreen
  if (s === 'COMPLETED')  return styles.badgeBlue
  if (s === 'TERMINATED') return styles.badgeRed
  return styles.badgeGray
}

export const Contracts = () => {
  const dispatch = useAppDispatch()
  const { contracts, contractsLoading, contractsError, vendors } = useAppSelector((s) => s.vendor)

  const [filter, setFilter]       = useState<ContractStatus | 'ALL'>('ALL')
  const [showSign, setShowSign]   = useState(false)
  const [target, setTarget]       = useState<ContractResponseDto | null>(null)
  const [signing, setSigning]     = useState(false)

  useEffect(() => {
    dispatch(fetchAllContracts())
    dispatch(fetchAllVendors())
  }, [dispatch])

  const filtered = filter === 'ALL' ? contracts : contracts.filter(c => c.status === filter)

  const openSign = (c: ContractResponseDto) => { setTarget(c); setShowSign(true) }

  const handleSign = async () => {
    if (!target) return
    setSigning(true)
    try {
      await dispatch(updateContractStatus({ contractId: target.contractId, status: 'ACTIVE' })).unwrap()
      toast.success('Contract signed — status set to ACTIVE.')
      setShowSign(false)
    } catch {
      toast.error('Failed to sign contract. Please try again.')
    } finally {
      setSigning(false)
    }
  }

  const vendorName = (id: string) => vendors.find(v => v.vendorId === id)?.name ?? id.slice(0, 8) + '…'

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>My Contracts</div>
          <div className={styles.pageSubtitle}>View and sign vendor agreements</div>
        </div>
      </div>

      {contractsError && (
        <div className={styles.errorBanner}>
          <span>{contractsError}</span>
          <button onClick={() => dispatch(fetchAllContracts())} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Retry</button>
        </div>
      )}

      <div className={styles.filterRow}>
        {(['ALL', ...FILTER_STATUSES] as const).map(s => (
          <button
            key={s}
            className={`${styles.filterChip} ${filter === s ? styles.filterChipActive : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        {contractsLoading ? (
          <div className={styles.spinnerWrap}><Spinner animation="border" /></div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Contract ID</th>
                <th>Vendor</th>
                <th>Event ID</th>
                <th>Value</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className={styles.emptyCell}>No contracts found.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.contractId}>
                  <td><span className={styles.idCell}>{c.contractId}</span></td>
                  <td><strong>{vendorName(c.vendorId)}</strong></td>
                  <td><span className={styles.idCell}>{c.eventId}</span></td>
                  <td>${Number(c.value).toLocaleString()}</td>
                  <td>{new Date(c.startDate).toLocaleDateString()}</td>
                  <td>{new Date(c.endDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`${styles.badge} ${statusBadgeClass(c.status)}`}>{c.status}</span>
                  </td>
                  <td>
                    {c.status === 'DRAFT' && (
                      <button
                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
                        onClick={() => openSign(c)}
                      >
                        ✍ Sign
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Sign Confirm Modal ──────────────────────────────────────────────── */}
      <Modal show={showSign} onHide={() => setShowSign(false)} centered size="sm">
        <Modal.Header closeButton><Modal.Title>Sign Contract</Modal.Title></Modal.Header>
        <Modal.Body>
          <p style={{ marginBottom: 8 }}>
            Sign contract <strong>{target?.contractId?.slice(0, 8)}…</strong>?
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Signing will set the status to <strong>ACTIVE</strong> and automatically generate an invoice via the Finance Service.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSign(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSign} disabled={signing}>
            {signing ? <Spinner animation="border" size="sm" /> : 'Confirm & Sign'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
