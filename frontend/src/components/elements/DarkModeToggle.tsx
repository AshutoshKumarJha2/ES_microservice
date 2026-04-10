import { useTheme } from '../../hooks/useTheme'
import styles from '../../css/DarkModeToggle.module.css'

export const DarkModeToggle = () => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div
      className={styles['theme-toggle']}
      onClick={toggleTheme}
      title="Toggle dark mode"
      role="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className={styles['toggle-track']}>
        <div className={styles['toggle-knob']} />
      </div>
      <span className={styles['toggle-label']}>{isDark ? 'Light' : 'Dark'}</span>
    </div>
  )
}
