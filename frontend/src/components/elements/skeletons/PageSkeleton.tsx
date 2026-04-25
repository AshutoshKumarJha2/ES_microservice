/**
 * PageSkeleton.tsx
 * ─────────────────
 * Reusable skeleton-loading components built with Bootstrap placeholder utilities.
 * Import whichever variant fits the page layout.
 */
import { Row, Col } from 'react-bootstrap'

// ─── For <tbody> inside a react-bootstrap / HTML table ──────────────────────

export const TableRowsSkeleton = ({
  rows = 5,
  cols = 4,
}: {
  rows?: number
  cols?: number
  colWidths?: string[]
}) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i}>
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} style={{ padding: '10px 8px' }}>
            <div className="placeholder-glow">
              <span className="placeholder rounded" style={{ width: '72%', height: 14, display: 'block' }} />
            </div>
          </td>
        ))}
      </tr>
    ))}
  </>
)

// ─── Inline single-line skeleton for field values (label-value layouts) ──────

export const InlineFieldSkeleton = ({ width = '60%' }: { width?: string | number }) => (
  <span className="placeholder-glow">
    <span className="placeholder rounded" style={{ width, height: 14, display: 'inline-block' }} />
  </span>
)

// ─── Block of stacked skeleton lines (replaces loading text / spinners) ──────

export const BlockSkeleton = ({
  rows = 6,
  height = 18,
}: {
  rows?: number
  height?: number
}) => (
  <div className="placeholder-glow" style={{ padding: '16px 0' }}>
    {Array.from({ length: rows }).map((_, i) => (
      <span
        key={i}
        className="placeholder rounded d-block"
        style={{ height, marginBottom: 10 }}
      />
    ))}
  </div>
)

// ─── Card-grid skeleton (for event / registration card grids) ─────────────

export const CardGridSkeleton = ({
  count = 6,
  cardHeight = 160,
}: {
  count?: number
  cardHeight?: number
}) => (
  <Row className="g-3">
    {Array.from({ length: count }).map((_, i) => (
      <Col key={i} xs={12} md={6} lg={4}>
        <div className="placeholder-glow">
          <span className="placeholder rounded d-block" style={{ height: cardHeight }} />
        </div>
      </Col>
    ))}
  </Row>
)

// ─── Stat-cards row skeleton (react-bootstrap pages) ─────────────────────────

export const StatCardsSkeleton = ({
  count = 4,
}: {
  count?: number
}) => (
  <Row className="g-3 mb-4">
    {Array.from({ length: count }).map((_, i) => (
      <Col key={i} xs={6} lg={3}>
        <div className="placeholder-glow">
          <span className="placeholder rounded d-block" style={{ height: 82 }} />
        </div>
      </Col>
    ))}
  </Row>
)

// ─── Stat grid skeleton (plain CSS grid pages: Vendor / Venue dashboards) ────

export const StatGridSkeleton = ({
  count = 4,
  minColWidth = 180,
}: {
  count?: number
  minColWidth?: number
}) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${minColWidth}px, 1fr))`,
    gap: 16,
    marginBottom: 28,
  }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="placeholder-glow">
        <span className="placeholder rounded d-block" style={{ height: 90 }} />
      </div>
    ))}
  </div>
)

// ─── Full-page skeleton for detail / single-resource pages ────────────────────

export const DetailPageSkeleton = () => (
  <div className="placeholder-glow" style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
    <span className="placeholder rounded d-block" style={{ height: 36, width: '55%', marginBottom: 18 }} />
    <span className="placeholder rounded d-block" style={{ height: 18, marginBottom: 8 }} />
    <span className="placeholder rounded d-block" style={{ height: 18, marginBottom: 18 }} />
    <span className="placeholder rounded d-block" style={{ height: 120, marginBottom: 28 }} />
    {Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className="placeholder rounded d-block" style={{ height: 18, marginBottom: 8 }} />
    ))}
  </div>
)
