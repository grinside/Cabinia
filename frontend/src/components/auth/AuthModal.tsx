import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { PhoneInput } from './PhoneInput';
import { OtpInput } from './OtpInput';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

type AuthStep = 'phone' | 'otp' | 'success';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('CI');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const { login, verifyOtp, isLoading, isAuthenticated } = useAuthStore();

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('phone');
        setPhone('');
        setOtp('');
        setError('');
      }, 300);
    }
  }, [isOpen]);

  // Auto close on success
  useEffect(() => {
    if (isAuthenticated && step === 'success') {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, step, onClose]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handlePhoneSubmit = async () => {
    if (phone.length < 8) {
      setError('Please enter a valid phone number');
      return;
    }

    setError('');
    try {
      await login(phone, countryCode);
      setStep('otp');
      setCountdown(60);
    } catch {
      setError('Failed to send verification code. Please try again.');
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.length < 6) {
      setError('Please enter the complete code');
      return;
    }

    setError('');
    try {
      await verifyOtp(otp);
      setStep('success');
    } catch {
      setError('Invalid code. Please try again.');
      setOtp('');
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setOtp('');
    setError('');
    try {
      await login(phone, countryCode);
      setCountdown(60);
    } catch {
      setError('Failed to resend code. Please try again.');
    }
  };

  // Auto-submit OTP when complete
  useEffect(() => {
    if (otp.length === 6 && step === 'otp') {
      handleOtpSubmit();
    }
  }, [otp]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-dark-900 rounded-t-3xl sm:rounded-3xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-800">
              {step === 'otp' ? (
                <button
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setError('');
                  }}
                  className="p-2 -ml-2 hover:bg-dark-800 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
              ) : (
                <div className="w-9" />
              )}

              <h2 className="text-lg font-semibold text-white">
                {step === 'phone' && 'Sign in'}
                {step === 'otp' && 'Verify'}
                {step === 'success' && 'Welcome'}
              </h2>

              <button
                onClick={onClose}
                className="p-2 -mr-2 hover:bg-dark-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {step === 'phone' && (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <p className="text-dark-400 text-center mb-6">
                      Enter your phone number to continue
                    </p>

                    <PhoneInput
                      value={phone}
                      countryCode={countryCode}
                      onChange={(p, c) => {
                        setPhone(p);
                        setCountryCode(c);
                        setError('');
                      }}
                      error={error}
                      autoFocus
                    />

                    <button
                      onClick={handlePhoneSubmit}
                      disabled={isLoading || phone.length < 8}
                      className={cn(
                        'btn-primary w-full mt-6',
                        (isLoading || phone.length < 8) && 'opacity-50'
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : (
                        'Continue'
                      )}
                    </button>

                    <p className="text-dark-500 text-xs text-center mt-4">
                      By continuing, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </motion.div>
                )}

                {step === 'otp' && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <p className="text-dark-400 text-center mb-2">
                      Enter the 6-digit code sent to
                    </p>
                    <p className="text-white text-center font-medium mb-6">
                      +{phone}
                    </p>

                    <OtpInput
                      value={otp}
                      onChange={setOtp}
                      error={error}
                      disabled={isLoading}
                    />

                    <div className="mt-6 text-center">
                      {countdown > 0 ? (
                        <p className="text-dark-400 text-sm">
                          Resend code in {countdown}s
                        </p>
                      ) : (
                        <button
                          onClick={handleResendOtp}
                          disabled={isLoading}
                          className="text-primary-500 text-sm font-medium hover:underline"
                        >
                          Resend code
                        </button>
                      )}
                    </div>

                    <button
                      onClick={handleOtpSubmit}
                      disabled={isLoading || otp.length < 6}
                      className={cn(
                        'btn-primary w-full mt-6',
                        (isLoading || otp.length < 6) && 'opacity-50'
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : (
                        'Verify'
                      )}
                    </button>
                  </motion.div>
                )}

                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                    >
                      <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Welcome to Cabinia!
                    </h3>
                    <p className="text-dark-400">
                      Your account is ready
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Safe area padding for iOS */}
            <div className="h-safe-bottom" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
