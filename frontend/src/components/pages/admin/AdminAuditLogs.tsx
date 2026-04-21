import { useEffect, useState, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchAuditLogs } from '../../../store/slices/adminSlice'
import { AdminSubNav } from '../../elements/admin/AdminSubNav'
import { PageBanner } from '../../elements/common/PageBanner'
import { formatDateTime } from '../../../utils/dateHelpers'
import {
  Container, Card, Table, Badge, Button, Form, InputGroup, Row, Col, Pagination,
} from 'react-bootstrap'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'
import { Search, Download } from 'react-bootstrap-icons'

const PAGE_SIZE = 15

export const AdminAuditLogs: React.FC = () => {
  const dispatch = useAppDispatch()
  const { auditLogs, loadingLogs } = useAppSelector((state) => state.admin)

  const [search, setSearch] = useState('')
  const [from, setFrom]     = useState('')
  const [to, setTo]         = useState('')
  const [page, setPage]     = useState(0)

  useEffect(() => { dispatch(fetchAuditLogs({ size: 500 })) }, [dispatch])

  const filtered = useMemo(() => {
    const logs = auditLogs?.audits ?? []
    const q = search.toLowerCase()
    const fromTs = from ? new Date(from).getTime() : null
    const toTs   = to   ? new Date(to + 'T23:59:59').getTime() : null
    return logs.filter((log) => {
      const matchSearch = !q ||
        log.userId?.toLowerCase().includes(q) ||
        log.action?.toLowerCase().includes(q) ||
        log.entityName?.toLowerCase().includes(q) ||
        log.entityId?.toLowerCase().includes(q)
      const ts = new Date(log.timeStamp).getTime()
      const matchFrom = !fromTs || ts >= fromTs
      const matchTo   = !toTs   || ts <= toTs
      return matchSearch && matchFrom && matchTo
    })
  }, [auditLogs, search, from, to])

  useEffect(() => { setPage(0) }, [search, from, to])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageLogs   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleExportCSV = () => {
    if (!filtered.length) return
    const header = 'ID,Timestamp,UserId,Action,EntityId,EntityName\n'
    const rows = filtered.map((log) =>
      [log.auditId, log.timeStamp, log.userId, log.action, log.entityId,
       `"${log.entityName?.replace(/"/g, '""') ?? ''}"`].join(',')
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'audit-logs.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const hasFilters = !!(search || from || to)

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <PageBanner
        title="Audit Logs"
        subtitle="Full activity history across the platform"
        actions={
          <Button
            variant="outline-light"
            size="sm"
            className="rounded-3 d-flex align-items-center gap-2"
            onClick={handleExportCSV}
            disabled={!filtered.length}
          >
            <Download size={14} /> Export CSV
          </Button>
        }
      />

      <AdminSubNav />

      <Container fluid className="px-3 px-md-4 py-4">
        <Card className="es-card border shadow-sm">
          <Card.Body className="p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Card.Title className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>Audit Logs</Card.Title>
              <span className="small" style={{ color: 'var(--text-muted)' }}>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Filters */}
            <Row className="g-2 mb-3 align-items-end">
              <Col xs={12} md>
                <InputGroup>
                  <InputGroup.Text style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                    <Search size={14} style={{ color: 'var(--text-muted)' }} />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search actor, action, details…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="es-form-control"
                  />
                </InputGroup>
              </Col>
              <Col xs={6} md="auto">
                <Form.Control
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="es-form-control"
                  title="From date"
                />
              </Col>
              <Col xs={6} md="auto">
                <Form.Control
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="es-form-control"
                  title="To date"
                />
              </Col>
              {hasFilters && (
                <Col xs="auto">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="rounded-3"
                    onClick={() => { setSearch(''); setFrom(''); setTo('') }}
                  >
                    Clear
                  </Button>
                </Col>
              )}
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
                {loadingLogs ? <TableRowsSkeleton rows={15} cols={5} /> : pageLogs.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4" style={{ color: 'var(--text-muted)' }}>No audit logs found</td></tr>
                  ) : pageLogs.map((log) => (
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
                        style={{
                          maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap', color: 'var(--text-secondary)',
                        }}
                        title={log.entityName}
                      >
                        {log.entityName || '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>

            {/* Pagination */}
            {filtered.length > PAGE_SIZE && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <small style={{ color: 'var(--text-muted)' }}>
                  Page {page + 1} of {totalPages} · {filtered.length} logs
                </small>
                <Pagination size="sm" className="mb-0">
                  <Pagination.Prev disabled={page === 0} onClick={() => setPage((p) => p - 1)} />
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                    <Pagination.Item key={i} active={i === page} onClick={() => setPage(i)}>{i + 1}</Pagination.Item>
                  ))}
                  <Pagination.Next disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)} />
                </Pagination>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}
