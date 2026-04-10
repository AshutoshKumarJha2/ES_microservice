import { useState } from 'react'
import {
  EnvelopeFill,
  ClockFill,
  CheckCircleFill,
  QuestionCircleFill,
} from 'react-bootstrap-icons'
import styles from '../../css/Contact.module.css'

const FAQS = [
  {
    q: 'How do I create an event?',
    a: 'Register or sign in as an Organizer, then navigate to the Organizer Portal and click "Create Event". Fill in the event details, select a venue, and configure your sessions.',
  },
  {
    q: 'Can I change my role after registration?',
    a: 'Role changes require an Admin to update your account. Send us a message using the form and our team will coordinate with your platform administrator.',
  },
  {
    q: 'How does ticket management work?',
    a: 'Organizers can create multiple ticket types (e.g. General, VIP) with custom pricing. Attendees register with a ticket, and organisers approve or reject registrations from the event dashboard.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. EventSphere uses JWT-based authentication, role-based access control, and centralised audit logs to ensure your data is protected at every layer of the platform.',
  },
]

type FormState = {
  name: string
  email: string
  subject: string
  message: string
}

export const Contact = () => {
  const [form, setForm] = useState<FormState>({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleReset = () => {
    setForm({ name: '', email: '', subject: '', message: '' })
    setSubmitted(false)
  }

  return (
    <div className={styles.page}>

      {/* ── Banner ───────────────────────────────────────────────────────── */}
      <div className={styles.banner}>
        <div className={styles['banner-inner']}>
          <p className={styles['banner-overline']}>Contact Us</p>
          <h1 className={styles['banner-title']}>We're here to help</h1>
          <p className={styles['banner-sub']}>
            Have a question, feedback, or need support? Send us a message and we'll get back to you.
          </p>
        </div>
      </div>

      {/* ── Contact form + info ───────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles['section-inner']}>
          <div className={styles['contact-grid']}>

            {/* Form card */}
            <div className={styles.card}>
              <h2 className={styles['card-title']}>Send a Message</h2>

              {submitted ? (
                <div className={styles['success-state']}>
                  <CheckCircleFill size={40} className={styles['success-icon']} />
                  <p className={styles['success-title']}>Message sent!</p>
                  <p className={styles['success-sub']}>
                    Thanks for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button className={styles['btn-reset']} onClick={handleReset}>
                    Send another message
                  </button>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles['form-row']}>
                    <div className={styles.field}>
                      <label className={styles.label}>Full Name</label>
                      <input
                        className={styles.input}
                        type="text"
                        name="name"
                        placeholder="Your name"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Email</label>
                      <input
                        className={styles.input}
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Subject</label>
                    <select
                      className={styles.input}
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a topic</option>
                      <option value="general">General Enquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing &amp; Accounts</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Message</label>
                    <textarea
                      className={`${styles.input} ${styles.textarea}`}
                      name="message"
                      placeholder="Tell us how we can help..."
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      required
                    />
                  </div>

                  <button type="submit" className={styles['btn-submit']}>
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Info column */}
            <div className={styles['info-col']}>
              <div className={styles['info-card']}>
                <div className={styles['info-icon']}>
                  <EnvelopeFill size={18} />
                </div>
                <div>
                  <p className={styles['info-label']}>Email Support</p>
                  <p className={styles['info-value']}>support@eventsphere.dev</p>
                  <p className={styles['info-hint']}>For account &amp; technical issues</p>
                </div>
              </div>

              <div className={styles['info-card']}>
                <div className={styles['info-icon']}>
                  <ClockFill size={18} />
                </div>
                <div>
                  <p className={styles['info-label']}>Availability</p>
                  <p className={styles['info-value']}>Monday – Friday</p>
                  <p className={styles['info-hint']}>9:00 AM – 6:00 PM IST</p>
                </div>
              </div>

              <div className={styles['response-card']}>
                <p className={styles['response-label']}>Typical response time</p>
                <p className={styles['response-value']}>Within 24 hours</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className={`${styles.section} ${styles['section-alt']}`}>
        <div className={styles['section-inner']}>
          <p className={styles['section-overline']}>FAQ</p>
          <h2 className={styles['section-title']}>Frequently asked questions</h2>
          <div className={styles['faq-grid']}>
            {FAQS.map((faq) => (
              <div key={faq.q} className={styles['faq-card']}>
                <div className={styles['faq-header']}>
                  <QuestionCircleFill size={16} className={styles['faq-icon']} />
                  <h3 className={styles['faq-q']}>{faq.q}</h3>
                </div>
                <p className={styles['faq-a']}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
