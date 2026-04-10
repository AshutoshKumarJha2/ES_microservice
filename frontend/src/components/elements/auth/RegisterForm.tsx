import { useState } from "react";
import styles from '../../../css/auth/RegisterForm.module.css'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import axiosInstance from '../../../api/axiosInstance';
import { Eye, EyeSlash } from 'react-bootstrap-icons';

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

interface RegisterResponse {
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  phone: string;
  status: string;
  message: string;
}

export const RegisterForm: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);

    const payload: RegisterRequest = {
      name: form.fullName,
      email: form.email,
      password: form.password,
      phone: form.phone,
    };

    try {
      const { data } = await axiosInstance.post<RegisterResponse>(
        '/api/v1/auth-manager/auth/register',
        payload
      );
      toast.success(data.message,{
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
      const message =
        axiosErr.response?.data?.message ||
        axiosErr.response?.data?.error ||
        (err instanceof Error ? err.message : 'Registration failed. Please try again.');
      toast.error(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
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
                <div className={styles['input-wrapper']}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles['toggle-password']}
                    onClick={() => setShowPassword(prev => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeSlash size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Feedback */}
            {/* {error && <p className={styles.error}>{error}erty</p>} */}
            {/* Toastify.success('Title', 'This is the body of the notification'); */}
            {/* {success && <p className={styles.success}>{success}</p>} */}

            {/* Submit */}
            <button
              className={styles['btn-submit']}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              transition={Bounce}
            />
          </div>

          <p className={styles['footer-text']}>
            Already have an account? <a href="/login" className={styles['footer-link']}>Sign In</a>
          </p>
        </div>
      </div>
    </>
  )
}