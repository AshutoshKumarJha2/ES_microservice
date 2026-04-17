import { useTheme } from '../../hooks/useTheme'
import { SunFill, MoonFill } from 'react-bootstrap-icons'
import { Button } from 'react-bootstrap'

export const DarkModeToggle = () => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <Button
      variant="link"
      size="sm"
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="d-flex align-items-center gap-2 text-decoration-none px-2 py-1 rounded-3"
      style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}
    >
      {isDark
        ? <><SunFill size={14} /> Light</>
        : <><MoonFill size={14} /> Dark</>
      }
    </Button>
  )
}
