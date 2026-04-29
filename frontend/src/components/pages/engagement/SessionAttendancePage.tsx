import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Table, Badge, Button, Spinner, InputGroup, Form, ProgressBar } from 'react-bootstrap'
import { ArrowLeft, Search, XCircle, PersonCheck, People, PersonDash, CheckCircleFill } from 'react-bootstrap-icons'
import { toast } from 'react-toastify'
import { PageBanner } from '../../elements/common/PageBanner'
import { StatCard } from '../../elements/common/StatCard'
import { EmptyState } from '../../elements/common/EmptyState'
import { TableRowsSkeleton } from '../../elements/skeletons/PageSkeleton'
import { PaginationBar } from '../../elements/common/PaginationBar'
import { usePaginatedQuery } from '../../../hooks/usePaginatedQuery'
import { analyticsService } from '../../../services/engagement/analyticsService'
import { registrationService } from '../../../services/events/registrationService'
import { userInitials } from '../../../utils/badgeHelpers'
import type { RegistrationDto, ScheduleResponseDto } from '../../../types/events'

const COL_WIDTHS = ['40%', '20%', '20%', '20%']

export const SessionAttendancePage = () => {
  const { eventId, scheduleId } = useParams<{ eventId: string; scheduleId: string }>()
  const navigate = useNavigate()

  const [session, setSession]     = useState<ScheduleResponseDto | null>(null)
  const [markedSet, setMarkedSet] = useState<Set<string>>(new Set())
  const [marking, setMarking]     = useState<Set<string>>(new Set())
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [summary, setSummary]     = useState({ totalRegistrations: 0, presentCount: 0, absentCount: 0 })

  // ── Load session details + existing attendance ────────────────────────────────
  const loadSummary = useCallback(async () => {
    if (!eventId || !scheduleId) return
    const s = await analyticsService.getSessionAttendanceSummary(eventId, scheduleId)
    setSummary({ totalRegistrations: s.totalRegistrations, presentCount: s.presentCount, absentCount: s.absentCount })
  }, [eventId, scheduleId])

  const load = useCallback(async () => {
    if (!eventId || !scheduleId) return
    setLoading(true)
    try {
      const [schedules, engagements] = await Promise.all([
        analyticsService.getSchedulesByEvent(eventId),
        analyticsService.getSessionEngagements(scheduleId),
        loadSummary(),
      ])
      setSession(schedules.find((s) => s.scheduleId === scheduleId) ?? null)
      setMarkedSet(
        new Set(
          engagements
            .filter((e) => e.activity === 'SESSION_JOIN')
            .map((e) => e.attendeeId)
            .filter((id): id is string => Boolean(id))
        )
      )
    } catch {
      toast.error('Failed to load session data.')
    } finally {
      setLoading(false)
    }
  }, [eventId, scheduleId, loadSummary])

  useEffect(() => { load() }, [load])

  // ── Paginated + server-side-searched registrations ────────────────────────────
  const regFetcher = useCallback(
    (params: { search?: string; page: number; size: number }) =>
      registrationService.getByEventId(
        eventId!, undefined, 'CONFIRMED,CHECKED_IN', undefined, params.search, params.page, params.size
      ),
    [eventId]
  )

  const {
    data: registrations,
    page,
    totalPages,
    totalElements,
    loading: regLoading,
    setPage,
    refetch,
  } = usePaginatedQuery<RegistrationDto, { search?: string }>({
    fetcher: regFetcher,
    itemsKey: 'registrations',
    params: { search: search || undefined },
    size: 20,
  })

  // ── Mark present ──────────────────────────────────────────────────────────────
  const markPresent = async (reg: RegistrationDto) => {
    if (!eventId || !scheduleId) return
    setMarking((prev) => new Set(prev).add(reg.attendeeId))
    try {
      await analyticsService.logEngagement({
        eventId,
        attendeeId: reg.attendeeId,
        activity: 'SESSION_JOIN',
        activityTimestamp: new Date().toISOString().slice(0, 19),
        scheduleId,
      })
      setMarkedSet((prev) => new Set(prev).add(reg.attendeeId))
      toast.success(`${reg.attendeeDetails?.name ?? 'Attendee'} marked present.`)
      refetch()
      loadSummary()
    } catch {
      toast.error('Failed to mark attendance. Try again.')
    } finally {
      setMarking((prev) => { const s = new Set(prev); s.delete(reg.attendeeId); return s })
    }
  }

  const pct = summary.totalRegistrations > 0
    ? Math.round((summary.presentCount / summary.totalRegistrations) * 100) : 0
  const showProgress = !loading || summary.totalRegistrations > 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <PageBanner
        title={loading ? 'Session Attendance' : (session?.activity ?? 'Session Attendance')}
        subtitle={
          loading
            ? 'Loading…'
            : session
              ? `${session.date} · ${session.timeSlot}`
              : scheduleId ?? ''
        }
        actions={
          <Button
            variant="outline-light"
            size="sm"
            className="rounded-3"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="me-1" />
            Back
          </Button>
        }
      />

      <Container className="py-4">

        {/* Stats row */}
        <Row className="g-3 mb-4">
          <Col xs={12} sm={4}>
            <StatCard
              label="Total Registrations"
              value={summary.totalRegistrations}
              icon={<People size={16} />}
              iconBg="var(--blue-subtle)"
              iconColor="var(--blue)"
              accent=""
              loading={loading}
            />
          </Col>
          <Col xs={12} sm={4}>
            <StatCard
              label="Present"
              value={summary.presentCount}
              icon={<PersonCheck size={16} />}
              iconBg="var(--green-subtle)"
              iconColor="var(--green)"
              accent=""
              loading={loading}
            />
          </Col>
          <Col xs={12} sm={4}>
            <StatCard
              label="Absent"
              value={summary.absentCount}
              icon={<PersonDash size={16} />}
              iconBg="var(--amber-subtle)"
              iconColor="var(--amber)"
              accent=""
              loading={loading}
            />
          </Col>
        </Row>

        {/* Attendance progress bar */}
        {showProgress && (
          <div className="mb-4">
            <div
              className="d-flex justify-content-between mb-1"
              style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}
            >
              <span>Attendance Progress</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {summary.presentCount} / {summary.totalRegistrations} marked ({pct}%)
              </span>
            </div>
            <ProgressBar
              now={pct}
              variant={pct === 100 ? 'success' : 'primary'}
              style={{ height: 8, borderRadius: 4 }}
            />
          </div>
        )}

        {/* Search */}
        <div className="mb-3">
          <InputGroup style={{ maxWidth: 340 }}>
            <InputGroup.Text style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            />
            {search && (
              <Button variant="outline-secondary" onClick={() => setSearch('')}>
                <XCircle size={14} />
              </Button>
            )}
          </InputGroup>
        </div>

        {/* Table */}
        <div
          className="rounded-3 overflow-hidden"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
        >
          <Table hover responsive className="mb-0" style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>
            <thead style={{ background: 'var(--bg-subtle)' }}>
              <tr>
                <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Attendee</th>
                <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Ticket</th>
                <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Reg. Status</th>
                <th className="fw-semibold border-0 pb-2" style={{ color: 'var(--text-primary)' }}>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {regLoading ? (
                <TableRowsSkeleton rows={6} cols={4} colWidths={COL_WIDTHS} />
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState
                      icon={<PersonCheck size={32} />}
                      title={search ? 'No matching attendees' : 'No confirmed attendees yet'}
                      subtitle={search ? 'Try a different search term.' : 'Attendees appear here once their registration is confirmed.'}
                    />
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => {
                  const present = markedSet.has(reg.attendeeId)
                  const busy    = marking.has(reg.attendeeId)
                  return (
                    <tr key={reg.registrationId}>
                      {/* Attendee — initials avatar + name + email */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            background: 'var(--blue-subtle)', color: 'var(--blue)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.72rem', fontWeight: 700,
                          }}>
                            {userInitials(reg.attendeeDetails?.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, lineHeight: 1.25, color: 'var(--text-primary)' }}>
                              {reg.attendeeDetails?.name ?? reg.attendeeId}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.25 }}>
                              {reg.attendeeDetails?.email ?? ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ fontSize: '0.88rem', verticalAlign: 'middle' }}>
                        {reg.ticketType ?? '—'}
                      </td>

                      <td style={{ verticalAlign: 'middle' }}>
                        <Badge
                          bg={reg.status === 'CHECKED_IN' ? 'primary' : 'success'}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {reg.status === 'CHECKED_IN' ? 'Checked In' : 'Confirmed'}
                        </Badge>
                      </td>

                      <td style={{ verticalAlign: 'middle' }}>
                        {present ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.25rem 0.65rem', borderRadius: 20,
                            background: 'var(--green-subtle)',
                            color: 'var(--green)',
                            fontSize: '0.78rem', fontWeight: 600,
                            border: '1px solid var(--green-border)',
                          }}>
                            <CheckCircleFill size={12} />
                            Present
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="rounded-3"
                            style={{ fontSize: '0.78rem' }}
                            disabled={busy}
                            onClick={() => markPresent(reg)}
                          >
                            {busy
                              ? <><Spinner animation="border" size="sm" className="me-1" />Marking…</>
                              : 'Mark Present'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </Table>
        </div>

        <PaginationBar
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          label="attendees"
          onChange={setPage}
        />
      </Container>
    </div>
  )
}
