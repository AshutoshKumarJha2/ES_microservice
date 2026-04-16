import type { ReactNode } from 'react'
import styles from '../../../css/events/EventsPanel.module.css'

interface Props {
  title: string
  children?: ReactNode
}

export const PanelHeader = ({ title, children }: Props) => (
  <div className={styles['panel-header']}>
    <h3 className={styles['panel-title']}>{title}</h3>
    {children}
  </div>
)
