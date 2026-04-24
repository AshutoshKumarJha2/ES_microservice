/**
 * PageSkeleton.tsx
 * ─────────────────
 * Reusable skeleton-loading components built with react-loading-skeleton.
 * Import whichever variant fits the page layout.
 */
import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Row, Col } from 'react-bootstrap'
import { useTheme } from '../../../hooks/useTheme'

const ThemedSkeletonTheme = ({ children }: { children: React.ReactNode }) => {
  const { isDark } = useTheme()
  return (
    <SkeletonTheme
      baseColor={isDark ? '#2a2f3d' : '#e8eaed'}
      highlightColor={isDark ? '#353b4d' : '#f4f5f7'}
    >
      {children}
    </SkeletonTheme>
  )
}

// ─── For <tbody> inside a react-bootstrap / HTML table ──────────────────────

export const TableRowsSkeleton = ({
  rows = 5,
  cols = 4,
  colWidths,
}: {
  rows?: number
  cols?: number
  colWidths?: string[]
}) => (
  <ThemedSkeletonTheme>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i}>
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} style={{ padding: '10px 8px' }}>
            <Skeleton height={14} borderRadius={4} width={colWidths?.[j] ?? '72%'} />
          </td>
        ))}
      </tr>
    ))}
  </ThemedSkeletonTheme>
)

// ─── Inline single-line skeleton for field values (label-value layouts) ──────

export const InlineFieldSkeleton = ({ width = '60%' }: { width?: string | number }) => (
  <ThemedSkeletonTheme>
    <Skeleton height={14} width={width} borderRadius={4} />
  </ThemedSkeletonTheme>
)

// ─── Block of stacked skeleton lines (replaces loading text / spinners) ──────

export const BlockSkeleton = ({
  rows = 6,
  height = 18,
}: {
  rows?: number
  height?: number
}) => (
  <ThemedSkeletonTheme>
    <div style={{ padding: '16px 0' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton
          key={i}
          height={height}
          borderRadius={5}
          style={{ marginBottom: 10, display: 'block' }}
        />
      ))}
    </div>
  </ThemedSkeletonTheme>
)

// ─── Card-grid skeleton (for event / registration card grids) ─────────────

export const CardGridSkeleton = ({
  count = 6,
  cardHeight = 160,
}: {
  count?: number
  cardHeight?: number
}) => (
  <ThemedSkeletonTheme>
    <Row className="g-3">
      {Array.from({ length: count }).map((_, i) => (
        <Col key={i} xs={12} md={6} lg={4}>
          <Skeleton height={cardHeight} borderRadius={10} />
        </Col>
      ))}
    </Row>
  </ThemedSkeletonTheme>
)

// ─── Stat-cards row skeleton (react-bootstrap pages) ─────────────────────────

export const StatCardsSkeleton = ({
  count = 4,
}: {
  count?: number
}) => (
  <ThemedSkeletonTheme>
    <Row className="g-3 mb-4">
      {Array.from({ length: count }).map((_, i) => (
        <Col key={i} xs={6} lg={3}>
          <Skeleton height={82} borderRadius={10} />
        </Col>
      ))}
    </Row>
  </ThemedSkeletonTheme>
)

// ─── Stat grid skeleton (plain CSS grid pages: Vendor / Venue dashboards) ────

export const StatGridSkeleton = ({
  count = 4,
  minColWidth = 180,
}: {
  count?: number
  minColWidth?: number
}) => (
  <ThemedSkeletonTheme>
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${minColWidth}px, 1fr))`,
      gap: 16,
      marginBottom: 28,
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height={90} borderRadius={10} />
      ))}
    </div>
  </ThemedSkeletonTheme>
)

// ─── Full-page skeleton for detail / single-resource pages ────────────────────

export const DetailPageSkeleton = () => (
  <ThemedSkeletonTheme>
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <Skeleton height={36} width="55%" borderRadius={8} style={{ marginBottom: 18 }} />
      <Skeleton height={18} count={2} borderRadius={5} style={{ marginBottom: 8 }} />
      <Skeleton height={120} borderRadius={10} style={{ marginBottom: 28 }} />
      <Skeleton height={18} count={5} borderRadius={5} style={{ marginBottom: 8 }} />
    </div>
  </ThemedSkeletonTheme>
)
