import { useState, useCallback, useRef } from 'react'
import { ConfirmModal } from '../components/elements/common/ConfirmModal'
import type { ConfirmVariant } from '../components/elements/common/ConfirmModal'

interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
}

interface ConfirmState extends ConfirmOptions {
  open: boolean
}

export const useConfirm = () => {
  const [state, setState] = useState<ConfirmState>({ open: false, message: '' })
  const resolveRef = useRef<(v: boolean) => void>()

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setState({ open: true, ...options })
    })
  }, [])

  const handleConfirm = () => {
    setState((s) => ({ ...s, open: false }))
    resolveRef.current?.(true)
  }

  const handleCancel = () => {
    setState((s) => ({ ...s, open: false }))
    resolveRef.current?.(false)
  }

  const ConfirmDialog = (
    <ConfirmModal
      show={state.open}
      title={state.title ?? 'Are you sure?'}
      message={state.message}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      variant={state.variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )

  return { confirm, ConfirmDialog }
}
