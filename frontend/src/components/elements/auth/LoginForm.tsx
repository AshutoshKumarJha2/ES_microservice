import { useState } from "react";
import styles from '../../../css/auth/LoginForm.module.css'

interface FormState {
  email: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('Login submitted:', form);
    // Add your login logic here
  };

  return (
    <>
      <div className={styles['page-wrapper']}>
        <div className={styles.card}>
          {/* Logo */}
          <div className={styles.logo}>
            <span className={styles.event}>event</span>
            <span className={styles.sphere}>sphere</span>
          </div>

          <h1 className={styles.heading}>Welcome Back</h1>
          <p className={styles.subheading}>Sign in to your EventSphere account</p>

          <div className={styles.form}>
            {/* Row: Email + Password */}
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
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Forgot password */}
            <div className={styles['forgot-link']}>
              <a href="/forgot-password" className={styles['forgot-link-anchor']}>Forgot password?</a>
            </div>

            {/* Submit */}
            <button className={styles['btn-submit']} onClick={handleSubmit}>
              Sign In
            </button>
          </div>

          <p className={styles['footer-text']}>
            Don't have an account? <a href="/register" className={styles['footer-link']}>Create one</a>
          </p>
        </div>
      </div>
    </>
  );
};
