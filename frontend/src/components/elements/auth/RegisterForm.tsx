import { useState } from "react";
import styles from '../../../css/auth/RegisterForm.module.css'

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  // role: Role;
}

export const RegisterForm:React.FC = () => {
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    // role: 'ATTENDEE',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('Form submitted:', form);
    // Add your submission logic here
  };

  return(
    <>
      <div className={styles['page-wrapper']}>
        <div className={styles.card}>
          {/* Logo */}
          <div className={styles.logo}>
            <span className={styles.event}>event</span>
            <span className={styles.sphere}>sphere</span>
          </div>

          <h1 className={styles.heading}>Create Account</h1>
          <p className={styles.subheading}>Join EventSphere</p>

          <div className={styles.form}>
            {/* Row 1: Full Name + Phone */}
            <div className={styles['form-row']}>
              <div className={styles.field}>
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Row 2: Email + Password */}
            <div className={styles['form-row']}>
              <div className={styles.field}>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="user@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Submit */}
            <button className={styles['btn-submit']} onClick={handleSubmit}>
              Create Account
            </button>
          </div>

          <p className={styles['footer-text']}>
            Already have an account? <a href="/login" className={styles['footer-link']}>Sign In</a>
          </p>
        </div>
      </div>
    </>
  )
}