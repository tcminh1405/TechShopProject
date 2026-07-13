import { useState, useEffect } from "react";
import OtpInput from "./OtpInput";
import { MailCheck, ShieldCheck, RefreshCw, ArrowLeft } from "lucide-react";

/**
 * Reusable OTP Verification view for Login, Register, and ForgotPassword steps.
 */
export default function OtpStep({
  email,
  tempToken,
  otp,
  setOtp,
  otpError,
  setOtpError,
  onSubmit,
  submitLoading,
  onResend,
  resendLoading,
  onBack,
  title = "Xác thực OTP",
  subtitle = "Mã xác thực 6 số đã gửi tới",
  submitText = "Xác nhận",
  backText = "Quay lại và thay đổi email"
}) {
  const OTP_SECONDS = 300;
  const [countdown, setCountdown] = useState(OTP_SECONDS);

  // Handle countdown timer
  useEffect(() => {
    setCountdown(OTP_SECONDS);
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [tempToken]);

  const formatCountdown = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // Submit handler
  const handleFormSubmit = (e) => {
    e?.preventDefault();
    if (otp.length === 6 && !submitLoading && countdown > 0) {
      onSubmit();
    }
  };

  // Auto-submit when exactly 6 digits are typed
  useEffect(() => {
    if (otp.length === 6 && countdown > 0 && !submitLoading) {
      onSubmit();
    }
  }, [otp]);

  const handleResendClick = async () => {
    if (countdown > 0 || resendLoading) return;
    await onResend();
  };

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* Icon + Title info */}
      <div className="text-center space-y-3">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 border border-[#E30019]/15 flex items-center justify-center shadow-sm">
          <MailCheck className="w-8 h-8 text-[#E30019]" strokeWidth={1.5} />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-gray-900 text-2xl font-black tracking-tight">{title}</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {subtitle}<br />
            <span className="font-bold text-gray-700">{email}</span>
          </p>
        </div>
      </div>

      {/* Countdown Ring Badge */}
      <div className="flex justify-center">
        <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all duration-300 ${
          countdown > 60
            ? "bg-green-50 text-green-700 border border-green-200"
            : countdown > 0
            ? "bg-orange-50 text-orange-600 border border-orange-200"
            : "bg-red-50 text-[#E30019] border border-red-200"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full bg-current ${countdown > 0 ? "animate-pulse" : ""}`} />
          {countdown > 0 ? `Hết hạn sau ${formatCountdown(countdown)}` : "Mã đã hết hạn"}
        </div>
      </div>

      {/* 6 Digit Input Form */}
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <OtpInput
          value={otp}
          onChange={(v) => { setOtp(v); setOtpError(false); }}
          disabled={submitLoading || countdown === 0}
          error={otpError}
        />

        {otpError && (
          <p className="text-center text-xs text-[#E30019] font-semibold -mt-2 animate-bounce">
            Mã OTP không đúng. Vui lòng kiểm tra lại email.
          </p>
        )}

        <button
          type="submit"
          disabled={otp.length !== 6 || submitLoading || countdown === 0}
          className="w-full h-11 rounded-xl bg-[#E30019] hover:bg-[#B80014] active:scale-[0.98] text-white text-sm font-bold flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-[#E30019]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {submitLoading ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" strokeWidth={2} />
              <span>{submitText}</span>
            </>
          )}
        </button>
      </form>

      {/* Resend and Back options */}
      <div className="space-y-3.5 pt-1">
        <div className="flex items-center justify-center gap-1.5 text-sm font-medium">
          <span className="text-gray-400">Không nhận được?</span>
          <button
            type="button"
            onClick={handleResendClick}
            disabled={countdown > 0 || resendLoading}
            className="flex items-center gap-1.5 font-bold text-[#E30019] hover:text-[#B80014] disabled:text-gray-400 disabled:cursor-not-allowed transition duration-150"
          >
            {resendLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" strokeWidth={2.5} />
            )}
            Gửi lại mã
          </button>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-gray-400 hover:text-gray-600 transition duration-150"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
          {backText}
        </button>
      </div>
    </div>
  );
}
