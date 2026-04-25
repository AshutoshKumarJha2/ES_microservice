import { Modal, Button, Spinner } from 'react-bootstrap'
import { ExclamationTriangleFill, TrashFill, CheckCircleFill } from 'react-bootstrap-icons'

export type ConfirmVariant = 'danger' | 'warning' | 'primary'

export interface ConfirmModalProps {
  show: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const VARIANT_STYLES: Record<ConfirmVariant, { iconBg: string; iconColor: string; btnVariant: string }> = {
  danger:  { iconBg: 'var(--red-subtle)',   iconColor: 'var(--red)',   btnVariant: 'danger'  },
  warning: { iconBg: 'var(--amber-subtle)', iconColor: 'var(--amber)', btnVariant: 'warning' },
  primary: { iconBg: 'var(--blue-subtle)',  iconColor: 'var(--blue)',  btnVariant: 'primary' },
}

const VariantIcon = ({ variant }: { variant: ConfirmVariant }) => {
  if (variant === 'danger')  return <TrashFill size={22} />
  if (variant === 'warning') return <ExclamationTriangleFill size={22} />
  return <CheckCircleFill size={22} />
}

export const ConfirmModal = ({
  show, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'danger', loading = false, onConfirm, onCancel,
}: ConfirmModalProps) => {
  const styles = VARIANT_STYLES[variant]

  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      size="sm"
      contentClassName="border-0"
      style={{ '--bs-modal-border-radius': 'var(--radius-lg)' } as React.CSSProperties}
    >
      <Modal.Body className="p-4 text-center">
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
          style={{ width: 52, height: 52, background: styles.iconBg, color: styles.iconColor }}
        >
          <VariantIcon variant={variant} />
        </div>

        <h6 className="fw-bold mb-2" style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>
          {title}
        </h6>
        <p className="mb-0 small" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {message}
        </p>
      </Modal.Body>

      <Modal.Footer
        className="border-0 pt-0 pb-4 px-4 d-flex gap-2 justify-content-center"
        style={{ flexDirection: 'row' }}
      >
        <Button
          variant="outline-secondary"
          size="sm"
          className="rounded-3 fw-semibold px-4"
          onClick={onCancel}
          disabled={loading}
          style={{ minWidth: 90, color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={styles.btnVariant}
          size="sm"
          className="rounded-3 fw-semibold px-4"
          onClick={onConfirm}
          disabled={loading}
          style={{ minWidth: 90 }}
        >
          {loading
            ? <><Spinner animation="border" size="sm" className="me-1" />Working…</>
            : confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
