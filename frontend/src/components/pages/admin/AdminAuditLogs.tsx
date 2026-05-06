import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchAuditLogs } from '../../../store/slices/adminSlice'
import { adminService } from '../../../services/admin/adminService'
import { AdminSubNav } from '../../elements/admin/AdminSubNav'
import { PageBanner } from '../../elements/common/PageBanner'
import { formatDateTime } from '../../../utils/dateHelpers'
import { PaginationBar } from '../../elements/common/PaginationBar'
import {
  Container, Card, Table, Badge, Button, Form, InputGroup, Row, Col,
  Spinner, Modal,
} from 'react-bootstrap'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'
import { Search, Download, CalendarRange } from 'react-bootstrap-icons'
import type { AuditLogDto } from '../../../types/admin'

const PAGE_SIZE      = 25
const DOWNLOAD_BATCH = 200

const AUDIT_ACTIONS = [
  'ACCESS_DENIED', 'APPROVE', 'CANCEL', 'CONFIG_CHANGE', 'CREATE', 'DELETE',
  'EXPORT', 'LOGIN_FAILURE', 'LOGIN_SUCCESS', 'LOGOUT', 'PERMISSION_CHANGE',
  'READ', 'REGISTRATION_FAILURE', 'REGISTRATION_SUCCESS', 'REJECT', 'RESTORE',
  'SYSTEM_JOB_EXECUTION', 'UPDATE',
]

export const AdminAuditLogs: React.FC = () => {
  const dispatch = useAppDispatch()
  const { auditLogs, loadingLogs } = useAppSelector((state) => state.admin)

  const [search, setSearch]           = useState('')
  const [from, setFrom]               = useState('')
  const [to, setTo]                   = useState('')
  const [actionFilter, setActionFilter] = useState('')

  const [showExport, setShowExport]   = useState(false)
  const [exportMode, setExportMode]   = useState<'last-n' | 'date-range'>('last-n')
  const [exportLimit, setExportLimit] = useState('500')
  const [exportFrom, setExportFrom]   = useState('')
  const [exportTo, setExportTo]       = useState('')
  const [dlLoading, setDlLoading]     = useState(false)

  const [page, setLocalPage]   = useState(0)

  const displayedLogs  = auditLogs?.audits ?? []
  const totalPages     = auditLogs?.totalPages ?? 1
  const totalElements  = auditLogs?.totalElements ?? 0
  const activeFilterCount = [search, actionFilter, from, to].filter(Boolean).length
  const hasFilters = activeFilterCount > 0

  const doFetch = useCallback((q: string, act: string, f: string, t: string, p: number) => {
    dispatch(fetchAuditLogs({
      page: p, size: PAGE_SIZE,
      search:   q   || undefined,
      action:   act || undefined,
      fromDate: f   || undefined,
      toDate:   t   || undefined,
    }))
  }, [dispatch])

  useEffect(() => {
    setLocalPage(0)
    const timer = setTimeout(() => doFetch(search, actionFilter, from, to, 0), 300)
    return () => clearTimeout(timer)
  }, [search, actionFilter, from, to, doFetch])

  const handlePageChange = (p: number) => {
    setLocalPage(p)
    doFetch(search, actionFilter, from, to, p)
  }

  const clearFilters = () => { setSearch(''); setFrom(''); setTo(''); setActionFilter('') }

  // ── CSV export ──────────────────────────────────────────────────────────────

  const buildAndDownloadCSV = (rows: AuditLogDto[]) => {
    const header = 'ID,Timestamp,UserId,Action,EntityId,EntityName\n'
    const body = rows.map((log) =>
      [log.auditId, log.timeStamp, log.userId, log.action, log.entityId,
       `"${log.entityName?.replace(/"/g, '""') ?? ''}"`].join(',')
    ).join('\n')
    const blob = new Blob([header + body], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'audit-logs.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownload = async () => {
    setDlLoading(true)
    try {
      const collected: AuditLogDto[] = []

      if (exportMode === 'last-n') {
        const target = Math.max(1, parseInt(exportLimit) || 500)
        let p = 0
        while (collected.length < target) {
          const remaining = target - collected.length
          const res = await adminService.getAuditLogs({
            page: p, size: Math.min(remaining, DOWNLOAD_BATCH),
          })
          collected.push(...res.audits)
          if (res.audits.length === 0 || p + 1 >= res.totalPages) break
          p++
        }
      } else {
        let p = 0
        while (true) {
          const res = await adminService.getAuditLogs({
            page: p, size: DOWNLOAD_BATCH,
            fromDate: exportFrom || undefined,
            toDate:   exportTo   || undefined,
          })
          collected.push(...res.audits)
          if (res.audits.length === 0 || p + 1 >= res.totalPages) break
          p++
        }
      }

      if (!collected.length) return
      buildAndDownloadCSV(collected)
      setShowExport(false)
    } finally {
      setDlLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <PageBanner title="Audit Logs" subtitle="Full activity history across the platform" />

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
                {auditLogs ? `${totalElements.toLocaleString()} total` : '—'}
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
                    type="date" value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="es-form-control" title="From date"
                    style={{ borderLeft: 0 }}
                  />
                  <InputGroup.Text style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    →
                  </InputGroup.Text>
                  <Form.Control
                    type="date" value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="es-form-control" title="To date"
                  />
                </InputGroup>
              </Col>
              <Col xs="auto" className="ms-auto d-flex gap-2">
                {hasFilters && (
                  <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={clearFilters}>
                    Clear
                  </Button>
                )}
                <Button
                  variant="outline-secondary" size="sm"
                  className="rounded-3 d-flex align-items-center gap-2"
                  onClick={() => setShowExport(true)}
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
                ) : displayedLogs.map((log) => (
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
                ))}
              </tbody>
            </Table>

            <PaginationBar page={page} totalPages={totalPages} totalElements={totalElements} label="logs" onChange={handlePageChange} />
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
            Download is independent of current page and filters.
          </p>

          <Form.Check
            type="radio" id="export-last-n"
            label="Last N records"
            checked={exportMode === 'last-n'}
            onChange={() => setExportMode('last-n')}
            className="mb-2"
            style={{ color: 'var(--text-primary)' }}
          />
          {exportMode === 'last-n' && (
            <Form.Control
              type="number" min={1} max={9999}
              value={exportLimit}
              onChange={(e) => setExportLimit(e.target.value)}
              className="es-form-control mb-3"
              style={{ maxWidth: 140 }}
              placeholder="e.g. 500"
            />
          )}

          <Form.Check
            type="radio" id="export-date-range"
            label="Date range"
            checked={exportMode === 'date-range'}
            onChange={() => setExportMode('date-range')}
            className="mb-2"
            style={{ color: 'var(--text-primary)' }}
          />
          {exportMode === 'date-range' && (
            <InputGroup className="mb-3">
              <Form.Control
                type="date" value={exportFrom}
                onChange={(e) => setExportFrom(e.target.value)}
                className="es-form-control" title="Export from"
              />
              <InputGroup.Text style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                →
              </InputGroup.Text>
              <Form.Control
                type="date" value={exportTo}
                onChange={(e) => setExportTo(e.target.value)}
                className="es-form-control" title="Export to"
              />
            </InputGroup>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => setShowExport(false)}>
            Cancel
          </Button>
          <Button
            size="sm" className="rounded-3 d-flex align-items-center gap-2"
            style={{ background: 'var(--blue)', border: 'none' }}
            onClick={handleDownload}
            disabled={dlLoading}
          >
            {dlLoading
              ? <Spinner animation="border" size="sm" />
              : <><Download size={14} /> Download</>
            }
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
