import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchAuditLogs } from '../../../store/slices/adminSlice'
import { AdminSubNav } from '../../elements/admin/AdminSubNav'
import { PageBanner } from '../../elements/common/PageBanner'
import { formatDateTime } from '../../../utils/dateHelpers'
import {
  Container, Card, Table, Badge, Button, Form, InputGroup, Row, Col, Spinner, Modal,
} from 'react-bootstrap'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'
import { Search, Download, CalendarRange } from 'react-bootstrap-icons'

const PAGE_SIZE = 25

const AUDIT_ACTIONS = [
  'ACCESS_DENIED', 'APPROVE', 'CANCEL', 'CONFIG_CHANGE', 'CREATE', 'DELETE',
  'EXPORT', 'LOGIN_FAILURE', 'LOGIN_SUCCESS', 'LOGOUT', 'PERMISSION_CHANGE',
  'READ', 'REGISTRATION_FAILURE', 'REGISTRATION_SUCCESS', 'REJECT', 'RESTORE',
  'SYSTEM_JOB_EXECUTION', 'UPDATE',
]

export const AdminAuditLogs: React.FC = () => {
  const dispatch = useAppDispatch()
  const { auditLogs, loadingLogs, loadingMoreLogs } = useAppSelector((state) => state.admin)

  // Page-level filters
  const [search, setSearch]           = useState('')
  const [from, setFrom]               = useState('')
  const [to, setTo]                   = useState('')
  const [actionFilter, setActionFilter] = useState('')

  // Export modal
  const [showExport, setShowExport]     = useState(false)
  const [exportMode, setExportMode]     = useState<'last-n' | 'date-range'>('last-n')
  const [exportLimit, setExportLimit]   = useState('500')
  const [exportFrom, setExportFrom]     = useState('')
  const [exportTo, setExportTo]         = useState('')

  const debounceRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sentinelRef    = useRef<HTMLDivElement | null>(null)
  const observerRef    = useRef<IntersectionObserver | null>(null)
  // Refs always hold the latest filter values so observer closure never stales
  const searchRef      = useRef(search)
  const actionRef      = useRef(actionFilter)
  // True while a page-0 reset is pending — blocks observer from loading a stale next page
  const pendingResetRef = useRef(false)

  searchRef.current = search
  actionRef.current = actionFilter

  const hasMore = auditLogs ? auditLogs.currentPage + 1 < auditLogs.totalPages : false

  // Clear the pending-reset guard once page 0 of the new filter lands
  useEffect(() => {
    if (auditLogs?.currentPage === 0) pendingResetRef.current = false
  }, [auditLogs])

  // Search: debounced 300ms → page-0 reset
  useEffect(() => {
    pendingResetRef.current = true
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      dispatch(fetchAuditLogs({ page: 0, size: PAGE_SIZE, search: searchRef.current, action: actionRef.current }))
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search, dispatch])

  // Action filter: immediate → cancel pending debounce, page-0 reset
  useEffect(() => {
    pendingResetRef.current = true
    if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null }
    dispatch(fetchAuditLogs({ page: 0, size: PAGE_SIZE, search: searchRef.current, action: actionRef.current }))
  }, [actionFilter, dispatch])

  // Infinite scroll sentinel — observer does NOT depend on search/actionFilter;
  // it reads them from refs so it never triggers a stale-filter loadMore
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMoreLogs && !loadingLogs && !pendingResetRef.current) {
          const nextPage = (auditLogs?.currentPage ?? 0) + 1
          dispatch(fetchAuditLogs({ page: nextPage, size: PAGE_SIZE, search: searchRef.current, action: actionRef.current }))
        }
      },
      { threshold: 0.1 }
    )
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current)
    return () => observerRef.current?.disconnect()
  }, [hasMore, loadingMoreLogs, loadingLogs, auditLogs?.currentPage, dispatch])

  // Client-side date filter only (action + search handled server-side)
  const displayedLogs = useMemo(() => {
    const logs = auditLogs?.audits ?? []
    const fromTs = from ? new Date(from).getTime()             : null
    const toTs   = to   ? new Date(to + 'T23:59:59').getTime() : null
    if (!fromTs && !toTs) return logs
    return logs.filter((log) => {
      const ts = new Date(log.timeStamp).getTime()
      return (!fromTs || ts >= fromTs) && (!toTs || ts <= toTs)
    })
  }, [auditLogs?.audits, from, to])

  const activeFilterCount = [search, actionFilter, from, to].filter(Boolean).length
  const hasFilters = activeFilterCount > 0

  // --- CSV export ---
  const buildCSV = (rows: typeof displayedLogs) => {
    const header = 'ID,Timestamp,UserId,Action,EntityId,EntityName\n'
    const body = rows.map((log) =>
      [log.auditId, log.timeStamp, log.userId, log.action, log.entityId,
       `"${log.entityName?.replace(/"/g, '""') ?? ''}"`].join(',')
    ).join('\n')
    return header + body
  }

  const handleDownload = () => {
    let rows = displayedLogs
    if (exportMode === 'last-n') {
      const n = Math.max(1, parseInt(exportLimit) || 500)
      rows = displayedLogs.slice(0, n)
    } else {
      const fromTs = exportFrom ? new Date(exportFrom).getTime()             : null
      const toTs   = exportTo   ? new Date(exportTo + 'T23:59:59').getTime() : null
      rows = displayedLogs.filter((log) => {
        const ts = new Date(log.timeStamp).getTime()
        return (!fromTs || ts >= fromTs) && (!toTs || ts <= toTs)
      })
    }
    if (!rows.length) return
    const blob = new Blob([buildCSV(rows)], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'audit-logs.csv'; a.click()
    URL.revokeObjectURL(url)
    setShowExport(false)
  }

  const clearFilters = () => { setSearch(''); setFrom(''); setTo(''); setActionFilter('') }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <PageBanner
        title="Audit Logs"
        subtitle="Full activity history across the platform"
      />

      <AdminSubNav />

      <Container fluid className="px-3 px-md-4 py-4">
        <Card className="es-card border shadow-sm">
          <Card.Body className="p-3 p-md-4">

            {/* Header row */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <Card.Title className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>
                  Audit Logs
                </Card.Title>
                {activeFilterCount > 0 && (
                  <Badge
                    style={{ background: 'var(--blue)', fontSize: '0.65rem', fontWeight: 500 }}
                    className="rounded-pill"
                  >
                    {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <span className="small" style={{ color: 'var(--text-muted)' }}>
                {auditLogs
                  ? activeFilterCount > 0
                    ? `${displayedLogs.length.toLocaleString()} shown · ${auditLogs.totalElements.toLocaleString()} total`
                    : `${auditLogs.totalElements.toLocaleString()} total`
                  : '—'}
              </span>
            </div>

            {/* Filter Row 1: Search + Action */}
            <Row className="g-2 mb-2 align-items-center">
              <Col xs={12} md>
                <InputGroup>
                  <InputGroup.Text style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                    <Search size={14} style={{ color: 'var(--text-muted)' }} />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search actor, action, entity…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="es-form-control"
                  />
                </InputGroup>
              </Col>
              <Col xs={12} md="auto">
                <Form.Select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="es-form-control"
                  style={{ minWidth: 180 }}
                >
                  <option value="">All Actions</option>
                  {AUDIT_ACTIONS.map((a) => (
                    <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            {/* Filter Row 2: Date range + Clear + Export */}
            <Row className="g-2 mb-3 align-items-center">
              <Col xs={12} md="auto">
                <InputGroup>
                  <InputGroup.Text style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                    <CalendarRange size={14} style={{ color: 'var(--text-muted)' }} />
                  </InputGroup.Text>
                  <Form.Control
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="es-form-control"
                    title="From date"
                    style={{ borderLeft: 0 }}
                  />
                  <InputGroup.Text style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    →
                  </InputGroup.Text>
                  <Form.Control
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="es-form-control"
                    title="To date"
                  />
                </InputGroup>
              </Col>
              <Col xs="auto" className="ms-auto d-flex gap-2">
                {hasFilters && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="rounded-3"
                    onClick={clearFilters}
                  >
                    Clear
                  </Button>
                )}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="rounded-3 d-flex align-items-center gap-2"
                  onClick={() => setShowExport(true)}
                  disabled={!displayedLogs.length}
                >
                  <Download size={14} /> Export CSV
                </Button>
              </Col>
            </Row>

            {/* Table */}
            <Table hover responsive className="mb-0" style={{ fontSize: '0.85rem' }}>
              <thead style={{ background: 'var(--bg-subtle)' }}>
                <tr>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Timestamp</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>User ID</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Action</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Entity</th>
                  <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Entity Name</th>
                </tr>
              </thead>
              <tbody>
                {loadingLogs ? (
                  <TableRowsSkeleton rows={15} cols={5} colWidths={['52%','58%','42%','32%','68%']} />
                ) : displayedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  displayedLogs.map((log) => (
                    <tr key={log.auditId}>
                      <td className="align-middle" style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                        {formatDateTime(log.timeStamp)}
                      </td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white flex-shrink-0"
                            style={{ width: 24, height: 24, fontSize: '0.6rem', background: 'var(--blue)' }}
                          >
                            {(log.userId || '?').slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{log.userId}</span>
                        </div>
                      </td>
                      <td className="align-middle">
                        <code style={{ fontSize: '0.78rem', color: 'var(--saffron)' }}>{log.action}</code>
                      </td>
                      <td className="align-middle">
                        <Badge className="es-badge-draft border-0" style={{ fontSize: '0.65rem' }}>
                          {log.entityId}
                        </Badge>
                      </td>
                      <td
                        className="align-middle"
                        style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}
                        title={log.entityName}
                      >
                        {log.entityName || '—'}
                      </td>
                    </tr>
                  ))
                )}
                {loadingMoreLogs && (
                  <tr>
                    <td colSpan={5} className="text-center py-3">
                      <Spinner animation="border" size="sm" style={{ color: 'var(--text-muted)' }} />
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} style={{ height: 1 }} />

            {/* End-of-list */}
            {!loadingLogs && !hasMore && (auditLogs?.audits.length ?? 0) > 0 && (
              <div className="text-center py-3 small" style={{ color: 'var(--text-muted)' }}>
                All {auditLogs!.totalElements.toLocaleString()} records loaded
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Export Modal */}
      <Modal show={showExport} onHide={() => setShowExport(false)} centered size="sm">
        <Modal.Header closeButton style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Modal.Title style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Export CSV</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-surface)' }}>
          <p className="small mb-3" style={{ color: 'var(--text-muted)' }}>
            Exports rows matching current search &amp; filters.
            {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} active)`}
          </p>

          <Form.Check
            type="radio"
            id="export-last-n"
            label="Last N records"
            checked={exportMode === 'last-n'}
            onChange={() => setExportMode('last-n')}
            className="mb-2"
            style={{ color: 'var(--text-primary)' }}
          />
          {exportMode === 'last-n' && (
            <Form.Control
              type="number"
              min={1}
              max={9999}
              value={exportLimit}
              onChange={(e) => setExportLimit(e.target.value)}
              className="es-form-control mb-3"
              style={{ maxWidth: 140 }}
              placeholder="e.g. 500"
            />
          )}

          <Form.Check
            type="radio"
            id="export-date-range"
            label="Date range"
            checked={exportMode === 'date-range'}
            onChange={() => setExportMode('date-range')}
            className="mb-2"
            style={{ color: 'var(--text-primary)' }}
          />
          {exportMode === 'date-range' && (
            <InputGroup className="mb-3">
              <Form.Control
                type="date"
                value={exportFrom}
                onChange={(e) => setExportFrom(e.target.value)}
                className="es-form-control"
                title="Export from"
              />
              <InputGroup.Text style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                →
              </InputGroup.Text>
              <Form.Control
                type="date"
                value={exportTo}
                onChange={(e) => setExportTo(e.target.value)}
                className="es-form-control"
                title="Export to"
              />
            </InputGroup>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => setShowExport(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="rounded-3 d-flex align-items-center gap-2"
            style={{ background: 'var(--blue)', border: 'none' }}
            onClick={handleDownload}
          >
            <Download size={14} /> Download
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
