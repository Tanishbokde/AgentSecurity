import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { registerSchema } from '../lib/validation';
import type { RegisterFormData } from '../lib/validation';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BackgroundLayer } from '../components/BackgroundLayer';
import { AegisShieldLogo } from '../components/AegisShieldLogo';
import { FormField } from '../components/FormField';
import { PasswordField } from '../components/PasswordField';
import { PrimaryButton } from '../components/PrimaryButton';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();

  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const currentPassword = watch('password') || '';
  const isLengthValid = currentPassword.length >= 12 && currentPassword.length <= 128;

  const onSubmit = async (data: RegisterFormData) => {
    setRegisterError(null);
    setIsSubmitting(true);

    try {
      await authRegister(data.email, data.password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setRegisterError('This email is already registered. Please sign in or use another email.');
        } else if (err.status === 422) {
          setRegisterError(err.message || 'Validation error: Password must be 12-128 characters.');
        } else {
          setRegisterError(err.message || 'Registration failed. Please try again.');
        }
      } else {
        setRegisterError('An unexpected error occurred during account creation.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-[#050506] text-[#E8E8EC] overflow-x-hidden font-sans">
      <BackgroundLayer />
      <Header />

      <main className="flex-1 flex items-center justify-center relative z-10 py-6 px-4 w-full my-auto">
        <div className="w-full max-w-[436px] mx-auto">
          <div className="w-full rounded-[24px] sm:rounded-[28px] border border-[rgba(192,192,192,0.14)] bg-[rgba(15,15,18,0.75)] p-6 sm:py-7 sm:px-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.1)] relative backdrop-blur-2xl hover:border-[#E10600]/40 transition-all duration-300">
            {/* Header */}
            <div className="flex flex-col items-center justify-center mb-5">
              <div className="mb-3">
                <AegisShieldLogo size={56} variant="card" />
              </div>
              <h1 className="hero-title-silver text-[24px] font-black uppercase tracking-widest font-display mb-1 leading-tight">
                CREATE ACCOUNT
              </h1>
              <p className="text-[#8A8A92] text-[13px] font-medium leading-normal tracking-wide">
                Register for Agent Guard security evaluation enclave
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
              <FormField
                id="email"
                label="Corporate Email"
                type="email"
                placeholder="operator@company.com"
                autoComplete="email"
                autoFocus
                error={errors.email}
                {...register('email')}
              />

              <PasswordField
                id="password"
                label="Master Security Password"
                placeholder="Minimum 12 characters"
                autoComplete="new-password"
                error={errors.password}
                {...register('password')}
              />

              {/* Realtime Password Length Indicator */}
              <div className="text-left text-xs space-y-1 pt-0.5">
                <div className="flex items-center gap-1.5 font-mono">
                  <CheckCircle2
                    size={14}
                    className={isLengthValid ? 'text-white' : 'text-[#8A8A92]'}
                  />
                  <span className={isLengthValid ? 'text-[#E8E8EC] font-semibold' : 'text-[#8A8A92]'}>
                    At least 12 characters ({currentPassword.length}/12)
                  </span>
                </div>
              </div>

              {registerError && (
                <div
                  role="alert"
                  className="flex items-center gap-2 p-3 rounded-[10px] bg-[rgba(139,0,0,0.25)] border border-[#E10600]/40 text-[#FF2A2A] text-[13px] font-medium text-left"
                >
                  <AlertCircle size={16} className="shrink-0 text-[#FF2A2A]" />
                  <span>{registerError}</span>
                </div>
              )}

              <div className="pt-2">
                <PrimaryButton isLoading={isSubmitting}>INITIALIZE ACCOUNT</PrimaryButton>
              </div>

              <div className="pt-2 text-center">
                <span className="text-[#8A8A92] text-xs">
                  Already hold credentials?{' '}
                  <Link
                    to="/login"
                    className="text-[#FF2A2A] hover:text-white font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2A2A] rounded px-1"
                  >
                    Sign in here &rarr;
                  </Link>
                </span>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
