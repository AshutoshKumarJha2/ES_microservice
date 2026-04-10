import { Link } from 'react-router-dom'
import styles from '../../css/layout/Footer.module.css'

const year = new Date().getFullYear()

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>

        {/* Brand */}
        <div>
          <Link to="/" className={styles['brand-logo']}>
            <span className={styles['logo-event']}>event</span>
            <span className={styles['logo-sphere']}>sphere</span>
          </Link>
          <p className={styles['brand-desc']}>
            A unified platform for organizers, attendees, and vendors to plan, manage, and experience events seamlessly.
          </p>
        </div>

        {/* Platform */}
        <div>
          <p className={styles['col-heading']}>Platform</p>
          <ul className={styles['link-list']}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
          </ul>
        </div>

        {/* Organizers */}
        <div>
          <p className={styles['col-heading']}>Organizers</p>
          <ul className={styles['link-list']}>
            <li><Link to="/organizer/dashboard">Organizer Portal</Link></li>
            <li><Link to="/organizer/events/create">Create Event</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <p className={styles['col-heading']}>Legal</p>
          <ul className={styles['link-list']}>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Cookie Policy</a></li>
          </ul>
        </div>

      </div>

      <div className={styles.bottom}>
        <div className={styles['bottom-inner']}>
          <span className={styles.copyright}>
            © {year} EventSphere. All rights reserved.
          </span>
          <div className={styles['bottom-links']}>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <Link to="/contact">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
