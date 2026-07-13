import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import userApi from "../api/userApi";
import OtpStep from "../components/OtpStep";
import {
  Mail, ArrowRight, ShieldCheck,
  Eye, EyeOff, Lock, Check,
} from "lucide-react";
import { toast } from "react-toastify";

const PW_RULES = [
  { id: "len", label: "Ít nhất 6 ký tự", test: (v) => v.length >= 6 },
  { id: "num", label: "Có chứa chữ số",  test: (v) => /\d/.test(v) },
];

export default function ForgotPassword() {
  const [step, setStep]           = useState(1);
  const [email, setEmail]         = useState("");
  const [step1Loading, setS1Load] = useState(false);

  const [tempToken, setTempToken] = useState("");
  const [maskedEmail, setMasked]  = useState("");
  const [otp, setOtp]             = useState("");
  const [otpError, setOtpError]   = useState(false);
  const [step2Loading, setS2Load] = useState(false);

  const [newPw, setNewPw]         = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step3Loading, setS3Load] = useState(false);
  const [resendLoading, setResendLoad]  = useState(false);

  const nav = useNavigate();

  // ── Bước 1: gửi OTP ─────────────────────────────────────────
  const handleStep1 = async (e) => {
    e.preventDefault();
    setS1Load(true);
    try {
      const res = await userApi.forgotPassword({ email });
      setTempToken(res.data.tempToken);
      setMasked(res.data.maskedEmail);
      setOtp("");
      setOtpError(false);
      setStep(2);
      toast.info(`Mã OTP đã gửi tới ${res.data.maskedEmail}`, { autoClose: 3500 });
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể gửi OTP!", { theme: "colored" });
    } finally {
      setS1Load(false);
    }
  };

  // ── Bước 2: xác thực OTP → chuyển bước 3 ───────────────────
  const handleStep2 = () => {
    setS2Load(true);
    setOtpError(false);
    // OTP code will be sent to the backend along with new password in Step 3.
    // In Step 2, we simply transition to Step 3.
    setStep(3);
    setS2Load(false);
  };

  // ── Gửi lại OTP ─────────────────────────────────────────────
  const handleResend = async () => {
    setResendLoad(true);
    try {
      const res = await userApi.forgotPassword({ email });
      setTempToken(res.data.tempToken);
      setOtp("");
      setOtpError(false);
      toast.info("Đã gửi lại mã OTP mới!", { autoClose: 3000 });
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể gửi lại OTP!", { theme: "colored" });
    } finally {
      setResendLoad(false);
    }
  };

  // ── Bước 3: đặt mật khẩu mới ────────────────────────────────
  const handleStep3 = async (e) => {
    e.preventDefault();
    if (newPw.length < 6) {
      toast.error("Mật khẩu tối thiểu 6 ký tự");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    setS3Load(true);
    try {
      await userApi.resetPassword({ tempToken, code: otp, newPassword: newPw });
      setStep(4);
      toast.success("Đặt lại mật khẩu thành công!");
    } catch (err) {
      const msg = err.response?.data?.message || "Đặt lại mật khẩu thất bại!";
      toast.error(msg, { theme: "colored" });
      if (err.response?.status === 400) {
        setStep(2);
        setOtp("");
        setOtpError(true);
      }
    } finally {
      setS3Load(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50/50">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-gradient-to-br from-[#E30019] via-[#C90014] to-[#99000D] flex-col justify-between p-12 xl:p-16">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -bottom-24 -right-24 w-[360px] h-[360px] rounded-full bg-black/25 blur-[90px] pointer-events-none" />
        <div className="absolute -top-20 -left-20 w-[320px] h-[320px] rounded-full bg-white/10 blur-[70px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="inline-flex p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl">
            <img src="/images/logo-navbar.png" alt="TechShop" className="h-10 w-auto object-contain" />
          </div>
        </div>

        {/* Info Area */}
        <div className="relative z-10 space-y-9">
          <div className="space-y-3.5">
            <p className="text-red-100 text-xs font-bold tracking-[0.2em] uppercase">Hỗ trợ tài khoản</p>
            <h1 className="text-white text-3xl xl:text-4xl font-black leading-[1.15] tracking-tight">
              Quên mật khẩu?<br />
              <span className="text-[#FFE600] drop-shadow-sm">Lấy lại nhanh chóng.</span>
            </h1>
            <p className="text-red-100 text-sm leading-relaxed max-w-[38ch] font-medium opacity-90">
              Nhận mã xác thực OTP qua email và tiến hành cài đặt lại mật khẩu mới chỉ trong vài bước đơn giản.
            </p>
          </div>

          <ul className="space-y-4">
            {["Mã OTP bảo mật 6 chữ số gửi về email", "Đổi mật khẩu an toàn với mã hoá một chiều", "Hỗ trợ kỹ thuật và chăm sóc khách hàng 24/7"].map((item) => (
              <li
                key={item}
                className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0 shadow-inner">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <span className="text-white text-sm font-semibold tracking-wide">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-red-200 text-xs font-medium opacity-75">© 2026 TechShop · Hệ thống bán lẻ thiết bị công nghệ chính hãng</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-10">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
          <div className="p-3 bg-white rounded-2xl shadow-md border border-gray-100">
            <img src="/images/logo-navbar.png" alt="TechShop" className="h-9 w-auto object-contain" />
          </div>
        </div>

        <div className="w-full max-w-[400px]">

          {/* Progress Stepper */}
          {step < 4 && (
            <div className="flex items-center justify-between mb-8 px-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1 last:flex-initial">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition duration-200 ${
                      step > s
                        ? "bg-green-500 text-white shadow-md shadow-green-500/20"
                        : step === s
                        ? "bg-[#E30019] text-white shadow-md shadow-[#E30019]/20 font-black"
                        : "bg-gray-200 text-gray-400"
                    }`}>
                      {step > s ? "✓" : s}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider hidden sm:inline ${
                      step === s ? "text-[#E30019]" : step > s ? "text-green-600" : "text-gray-400"
                    }`}>
                      {s === 1 ? "Email" : s === 2 ? "Xác thực" : "Mật khẩu"}
                    </span>
                  </div>
                  {s < 3 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded transition duration-300 ${
                      step > s ? "bg-green-500" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ══ BƯỚC 1: Nhập email ══ */}
          {step === 1 && (
            <div className="space-y-7 animate-fadeIn">
              <div className="space-y-2">
                <h2 className="text-gray-900 text-3xl font-black tracking-tight">Quên mật khẩu</h2>
                <p className="text-gray-500 text-sm font-medium">Nhập email đã đăng ký để nhận mã xác thực</p>
              </div>

              <form onSubmit={handleStep1} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-gray-700 text-xs font-bold uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" strokeWidth={2} />
                    <input
                      type="email" required value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" disabled={step1Loading}
                      className="w-full h-12 pl-11 pr-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#E30019]/10 focus:border-[#E30019] transition duration-200 disabled:opacity-50"
                    />
                  </div>
                </div>

                <button type="submit" disabled={step1Loading}
                  className="w-full h-12 mt-2 rounded-xl bg-[#E30019] hover:bg-[#B80014] active:scale-[0.98] text-white text-sm font-bold flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-[#E30019]/20 disabled:opacity-60 disabled:cursor-not-allowed">
                  {step1Loading ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><span>Gửi mã OTP</span><ArrowRight className="w-4 h-4" strokeWidth={2} /></>
                  )}
                </button>
              </form>

              <p className="text-center text-xs">
                <Link to="/login" className="text-gray-400 hover:text-[#E30019] font-semibold transition duration-150 underline underline-offset-4">
                  ← Quay lại đăng nhập
                </Link>
              </p>
            </div>
          )}

          {/* ══ BƯỚC 2: Nhập OTP ══ */}
          {step === 2 && (
            <OtpStep
              email={maskedEmail}
              tempToken={tempToken}
              otp={otp}
              setOtp={setOtp}
              otpError={otpError}
              setOtpError={setOtpError}
              onSubmit={handleStep2}
              submitLoading={step2Loading}
              onResend={handleResend}
              resendLoading={resendLoading}
              onBack={() => { setStep(1); setOtp(""); setOtpError(false); }}
              title="Xác thực OTP"
              submitText="Xác nhận mã OTP"
              backText="Quay lại đổi email nhận mã"
            />
          )}

          {/* ══ BƯỚC 3: Đặt mật khẩu mới ══ */}
          {step === 3 && (
            <div className="space-y-7 animate-fadeIn">
              <div className="space-y-2">
                <h2 className="text-gray-900 text-3xl font-black tracking-tight">Đặt mật khẩu mới</h2>
                <p className="text-gray-500 text-sm font-medium">Mật khẩu mới phải có ít nhất 6 ký tự</p>
              </div>

              <form onSubmit={handleStep3} className="space-y-4">
                {/* New password */}
                <div className="space-y-2">
                  <label className="text-gray-700 text-xs font-bold uppercase tracking-wider">Mật khẩu mới</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" strokeWidth={2} />
                    <input type={showPw ? "text" : "password"} required value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự" disabled={step3Loading} autoComplete="new-password"
                      className="w-full h-12 pl-11 pr-11 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#E30019]/10 focus:border-[#E30019] transition duration-200 disabled:opacity-50" />
                    <button type="button" onClick={() => setShowPw(!showPw)} tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition duration-150">
                      {showPw ? <EyeOff className="w-4.5 h-4.5" strokeWidth={2} /> : <Eye className="w-4.5 h-4.5" strokeWidth={2} />}
                    </button>
                  </div>
                  {newPw.length > 0 && (
                    <ul className="flex gap-4 pt-1">
                      {PW_RULES.map((rule) => {
                        const ok = rule.test(newPw);
                        return (
                          <li key={rule.id} className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${ok ? "text-green-600 font-bold" : "text-gray-400"}`}>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors duration-200 ${ok ? "bg-green-500 border-green-500 shadow-sm" : "border-gray-300"}`}>
                              {ok && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                            </div>
                            {rule.label}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-2">
                  <label className="text-gray-700 text-xs font-bold uppercase tracking-wider">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" strokeWidth={2} />
                    <input type={showConfirm ? "text" : "password"} required value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="Nhập lại mật khẩu" disabled={step3Loading} autoComplete="new-password"
                      className={`w-full h-12 pl-11 pr-11 bg-gray-50/50 border rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-4 transition duration-200 disabled:opacity-50 ${
                        confirmPw && confirmPw !== newPw
                          ? "border-[#E30019] focus:ring-[#E30019]/10 focus:border-[#E30019]"
                          : "border-gray-200 focus:ring-[#E30019]/10 focus:border-[#E30019]"
                      }`} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition duration-150">
                      {showConfirm ? <EyeOff className="w-4.5 h-4.5" strokeWidth={2} /> : <Eye className="w-4.5 h-4.5" strokeWidth={2} />}
                    </button>
                  </div>
                  {confirmPw && confirmPw !== newPw && (
                    <p className="text-xs text-[#E30019] font-semibold mt-1">Mật khẩu xác nhận không khớp</p>
                  )}
                  {confirmPw && confirmPw === newPw && newPw.length >= 6 && (
                    <p className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" strokeWidth={3} /> Mật khẩu khớp hoàn toàn
                    </p>
                  )}
                </div>

                <button type="submit"
                  disabled={step3Loading || newPw.length < 6 || newPw !== confirmPw}
                  className="w-full h-12 mt-2 rounded-xl bg-[#E30019] hover:bg-[#B80014] active:scale-[0.98] text-white text-sm font-bold flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-[#E30019]/20 disabled:opacity-60 disabled:cursor-not-allowed">
                  {step3Loading ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><span>Đặt lại mật khẩu</span></>
                  )}
                </button>
              </form>

              <button type="button" onClick={() => { setStep(2); setOtp(""); setOtpError(false); }}
                className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-gray-400 hover:text-gray-600 transition duration-150">
                Quay lại nhập mã OTP
              </button>
            </div>
          )}

          {/* ══ BƯỚC 4: Thành công ══ */}
          {step === 4 && (
            <div className="text-center space-y-6 animate-fadeIn">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-10 h-10 text-green-500 animate-pulse" strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h2 className="text-gray-900 text-3xl font-black tracking-tight font-black">Đặt lại thành công!</h2>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                  Mật khẩu của bạn đã được cập nhật.<br />
                  Hãy sử dụng mật khẩu mới để đăng nhập tài khoản.
                </p>
              </div>

              <Link to="/login"
                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#E30019] hover:bg-[#B80014] text-white text-sm font-bold transition duration-200 shadow-md shadow-[#E30019]/20 active:scale-[0.98]">
                Đăng nhập ngay
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>
              <p className="text-xs">
                <Link to="/" className="text-gray-400 hover:text-[#E30019] font-semibold transition duration-150 underline underline-offset-4">
                  ← Về trang chủ
                </Link>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
