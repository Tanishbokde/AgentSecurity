import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, AlertCircle, Info } from 'lucide-react';
import { loginSchema } from '../lib/validation';
import type { LoginFormData } from '../lib/validation';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import { AegisShieldLogo } from './AegisShieldLogo';
import { FormField } from './FormField';
import { PasswordField } from './PasswordField';
import { PrimaryButton } from './PrimaryButton';

export const LoginCard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sessionExpiredMessage, clearExpiredMessage } = useAuth();

  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rememberedEmail = (() => {
    try {
      return localStorage.getItem('aegis_remembered_email') || '';
    } catch {
      return '';
    }
  })();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: rememberedEmail || '',
      password: '',
      rememberMe: Boolean(rememberedEmail),
    },
  });

  const rememberMe = watch('rememberMe');

  useEffect(() => {
    if (rememberedEmail) {
      setValue('email', rememberedEmail);
      setValue('rememberMe', true);
    }
  }, [rememberedEmail, setValue]);

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    clearExpiredMessage();
    setIsSubmitting(true);

    try {
      await login(data.email, data.password);

      // Handle remember me persistence
      try {
        if (data.rememberMe) {
          localStorage.setItem('aegis_remembered_email', data.email);
        } else {
          localStorage.removeItem('aegis_remembered_email');
        }
      } catch {
        // Ignore storage errors
      }

      // Check redirect param
      const searchParams = new URLSearchParams(location.search);
      const redirectPath = searchParams.get('redirect') || '/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setAuthError('Invalid email or password.');
        } else {
          setAuthError(err.message || 'Authentication failed. Please verify your connection.');
        }
      } else {
        setAuthError('An unexpected authentication error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[436px] mx-auto px-4 sm:px-0">
      <div
        className="w-full rounded-[24px] sm:rounded-[28px] border border-[rgba(192,192,192,0.14)] bg-[rgba(15,15,18,0.75)] p-6 sm:py-7 sm:px-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.1)] relative backdrop-blur-2xl hover:border-[#E10600]/40 transition-all duration-300"
      >
        {/* Card Header: Shield Icon, Title, Subtitle */}
        <div className="flex flex-col items-center justify-center mb-5">
          <div className="mb-3">
            <AegisShieldLogo size={56} variant="card" />
          </div>

          <h1 className="hero-title-silver text-[24px] font-black uppercase tracking-widest font-display mb-1 leading-tight">
            AGENT GUARD
          </h1>

          <p className="text-[#8A8A92] text-[13px] font-medium leading-normal tracking-wide">
            Zero-Trust Autonomous Security Enclave
          </p>
        </div>

        {/* Session Expired Notice */}
        {sessionExpiredMessage && (
          <div
            role="status"
            className="mb-4 flex items-center gap-2 p-3 rounded-[10px] bg-[rgba(225,6,0,0.1)] border border-[#FF2A2A]/40 text-[#E8E8EC] text-[13px] font-medium text-left"
          >
            <Info size={16} className="shrink-0 text-[#FF2A2A]" />
            <span>{sessionExpiredMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-3.5"
        >
          {/* Email Address */}
          <FormField
            id="email"
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            autoFocus
            error={errors.email}
            {...register('email')}
          />

          {/* Password */}
          <PasswordField
            id="password"
            label="Password"
            placeholder="••••••••••••"
            autoComplete="current-password"
            error={errors.password}
            {...register('password')}
          />

          {/* Authentication Error Banner */}
          {authError && (
            <div
              role="alert"
              className="flex items-center gap-2 p-3 rounded-[10px] bg-[rgba(139,0,0,0.25)] border border-[#E10600]/40 text-[#FF2A2A] text-[13px] font-medium text-left transition-all"
            >
              <AlertCircle size={16} className="shrink-0 text-[#FF2A2A]" />
              <span>{authError}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <PrimaryButton isLoading={isSubmitting}>SECURE SIGN IN</PrimaryButton>
          </div>

          {/* Links: Forgot password & Register */}
          <div className="pt-2 pb-0.5 flex items-center justify-between text-center px-1">
            <Link
              to="/forgot-password"
              className="text-[#8A8A92] hover:text-[#E8E8EC] text-[13px] underline underline-offset-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2A2A] rounded px-1 py-0.5"
            >
              Forgot password?
            </Link>

            <Link
              to="/register"
              className="text-[#FF2A2A] hover:text-white text-[13px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2A2A] rounded px-1 py-0.5"
            >
              Create an account &rarr;
            </Link>
          </div>

          {/* Remember me Row */}
          <div className="flex items-center justify-center pt-1">
            <label
              htmlFor="rememberMe"
              className="group flex items-center gap-2 cursor-pointer text-[#8A8A92] hover:text-[#E8E8EC] transition-colors select-none text-[13.5px] focus-within:ring-2 focus-within:ring-[#FF2A2A] rounded px-2 py-1"
            >
              <input
                id="rememberMe"
                type="checkbox"
                className="sr-only"
                {...register('rememberMe')}
              />
              <Shield
                size={17}
                className={`transition-colors duration-150 ${
                  rememberMe
                    ? 'text-[#FF2A2A] fill-[#FF2A2A]/20 stroke-[#FF2A2A]'
                    : 'text-[#8A8A92] group-hover:text-[#E8E8EC] stroke-[1.75]'
                }`}
                aria-hidden="true"
              />
              <span className={rememberMe ? 'text-[#E8E8EC] font-medium' : 'text-[#8A8A92]'}>
                Remember me
              </span>
            </label>
          </div>
        </form>
      </div>
    </div>
  );
};
