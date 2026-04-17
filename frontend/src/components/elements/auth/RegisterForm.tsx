import { useState } from "react";
import styles from '../../../css/auth/RegisterForm.module.css'
import { toast, Bounce } from 'react-toastify';
import axiosInstance from '../../../api/axiosInstance';
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { formSchema } from "../../../validations/authValidation";

type FormState = z.infer<typeof formSchema>;

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
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const result = formSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      result.error.issues.forEach(err => {
        const field = err.path[0] as keyof FormState;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }
    setErrors({});

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
      navigate('/login', {
        replace: true,
        state: {
          prefill: {
            email: form.email,
            password: form.password,
          },
        },
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
      navigate('/login', {replace:true})
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

          <form className={styles.form} onSubmit={handleSubmit}>
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
                {errors.fullName && <span className={styles.error}>{errors.fullName}</span>}
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
                {errors.phone && <span className={styles.error}>{errors.phone}</span>}
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
                {errors.email && <span className={styles.error}>{errors.email}</span>}
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
                {errors.password && <span className={styles.error}>{errors.password}</span>}
              </div>
            </div>

            {/* Feedback */}
            {/* {error && <p className={styles.error}>{error}erty</p>} */}
            {/* Toastify.success('Title', 'This is the body of the notification'); */}
            {/* {success && <p className={styles.success}>{success}</p>} */}

            {/* Submit */}
            <button
              type="submit"
              className={styles['btn-submit']}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className={styles['footer-text']}>
            Already have an account? <a href="/login" className={styles['footer-link']}>Sign In</a>
          </p>
        </div>
      </div>
    </>
  )
}