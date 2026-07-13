import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import userApi from "../api/userApi";
import OtpStep from "../components/OtpStep";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  ShieldCheck, Truck, RotateCcw,
} from "lucide-react";
import { toast } from "react-toastify";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Hàng chính hãng 100%" },
  { icon: Truck,       label: "Giao hàng nhanh 24h" },
  { icon: RotateCcw,   label: "Đổi trả dễ dàng trong 30 ngày" },
];

export default function Login() {
  // ── Step 1 state ────────────────────────────────────────────
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [step1Loading, setStep1Loading] = useState(false);

  // ── Step 2 state ────────────────────────────────────────────
  const [step, setStep]           = useState(1);           // 1 | 2
  const [tempToken, setTempToken] = useState("");
  const [maskedEmail, setMasked]  = useState("");
  const [otp, setOtp]             = useState("");
  const [otpError, setOtpError]   = useState(false);
  const [step2Loading, setStep2Loading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const { login, user } = useAuth();
  const nav      = useNavigate();
  const location = useLocation();
  const from     = location.state?.from?.pathname || "/";

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (!user) return;
    if (user.role === "ADMIN" || user.role === "STAFF") {
      nav("/admin/dashboard", { replace: true });
    } else {
      nav(from === "/login" ? "/" : from, { replace: true });
    }
  }, [user, nav, from]);

  // Hiển thị thông báo nếu phiên đăng nhập hết hạn
  useEffect(() => {
    const expired = new URLSearchParams(location.search).get("expired");
    if (expired === "true") {
      toast.warning("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", {
        toastId: "session-expired",
        theme: "colored",
      });
      nav("/login", { replace: true });
    }
  }, [location, nav]);

  // ── BƯỚC 1: Validate + gửi OTP ──────────────────────────────
  const handleStep1 = async (e) => {
    e.preventDefault();
    if (step1Loading) return;
    setStep1Loading(true);
    try {
      const res = await userApi.otpSend({ type: "LOGIN", email, password });
      const { tempToken: tok, maskedEmail: masked } = res.data;
      setTempToken(tok);
      setMasked(masked);
      setOtp("");
      setOtpError(false);
      setStep(2);
      toast.info(`Mã OTP đã gửi tới ${masked}`, { autoClose: 3000 });
    } catch (err) {
      toast.error(err.response?.data?.message || "Email hoặc mật khẩu không đúng!", { theme: "colored" });
    } finally {
      setStep1Loading(false);
    }
  };

  // ── BƯỚC 2: Xác thực OTP ────────────────────────────────────
  const handleStep2 = async () => {
    if (otp.length !== 6 || step2Loading) return;
    setStep2Loading(true);
    setOtpError(false);
    try {
      const res = await userApi.otpVerify({ tempToken, code: otp });
      const { token, role, fullName, id } = res.data;

      localStorage.setItem("token", token);
      const userRes = await userApi.getMe();
      const fu = userRes.data;

      login(token, {
        id:       fu.id       || id,
        email:    fu.email    || email,
        role:     fu.role     || role,
        fullName: fu.fullName || fullName,
        phone:    fu.phone,
        address:  fu.address,
      });

      toast.success("Đăng nhập thành công!", { theme: "colored" });

      if (role === "ADMIN" || role === "STAFF") {
        nav("/admin/dashboard", { replace: true });
      } else {
        nav(from === "/login" ? "/" : from, { replace: true });
      }
    } catch (err) {
      setOtpError(true);
      setOtp("");
      toast.error(err.response?.data?.message || "Mã OTP không đúng!", { theme: "colored" });
    } finally {
      setStep2Loading(false);
    }
  };

  // ── Gửi lại OTP ─────────────────────────────────────────────
  const handleResend = async () => {
    setResendLoading(true);
    try {
      const res = await userApi.otpSend({ type: "LOGIN", email, password });
      setTempToken(res.data.tempToken);
      setOtp("");
      setOtpError(false);
      toast.info("Đã gửi lại mã OTP mới!", { autoClose: 3000 });
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể gửi lại OTP!", { theme: "colored" });
    } finally {
      setResendLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-gray-50/50">

      {/* ── Left panel — brand (desktop) ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative overflow-hidden bg-gradient-to-br from-[#E30019] via-[#C90014] to-[#99000D] flex-col justify-between p-12 xl:p-16">
        {/* Grid background pattern */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "24px 24px" }}
        />
        {/* Blur highlights */}
        <div className="absolute -top-24 -left-24 w-[380px] h-[380px] rounded-full bg-white/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-[360px] h-[360px] rounded-full bg-black/25 blur-[90px] pointer-events-none" />

        {/* Logo Container */}
        <div className="relative z-10">
          <div className="inline-flex p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl">
            <img src="/images/logo-navbar.png" alt="TechShop" className="h-10 w-auto object-contain" />
          </div>
        </div>

        {/* Slogan and Trust Elements */}
        <div className="relative z-10 space-y-9">
          <div className="space-y-3.5">
            <p className="text-red-100 text-xs font-bold tracking-[0.2em] uppercase">Thiết bị chính hãng</p>
            <h1 className="text-white text-4xl xl:text-5xl font-black leading-[1.15] tracking-tight">
              Mua sắm thông minh,<br />
              <span className="text-[#FFE600] drop-shadow-sm">giá trị thật.</span>
            </h1>
            <p className="text-red-100 text-sm leading-relaxed max-w-[42ch] font-medium opacity-90">
              Hàng nghìn sản phẩm điện tử, linh kiện máy tính chất lượng vượt trội. Giao hàng siêu tốc, bảo hành chuẩn mực.
            </p>
          </div>

          <ul className="space-y-4">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0 shadow-inner">
                  <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <span className="text-white text-sm font-semibold tracking-wide">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-red-200 text-xs font-medium opacity-75">© 2026 TechShop · Hệ thống bán lẻ thiết bị công nghệ chính hãng</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-10">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
          <div className="p-3 bg-white rounded-2xl shadow-md border border-gray-100">
            <img src="/images/logo-navbar.png" alt="TechShop" className="h-9 w-auto object-contain" />
          </div>
        </div>

        <div className="w-full max-w-[400px]">

          {/* ══════════════ BƯỚC 1: Form ══════════════ */}
          {step === 1 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="space-y-2">
                <h2 className="text-gray-900 text-3xl font-black tracking-tight">Chào mừng trở lại</h2>
                <p className="text-gray-500 text-sm font-medium">Đăng nhập để tiếp tục trải nghiệm mua sắm</p>
              </div>

              <form onSubmit={handleStep1} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-gray-700 text-xs font-bold uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" strokeWidth={2} />
                    <input
                      type="email" required value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={step1Loading}
                      className="w-full h-12 pl-11 pr-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#E30019]/10 focus:border-[#E30019] transition duration-200 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-700 text-xs font-bold uppercase tracking-wider">Mật khẩu</label>
                    <Link to="/forgot-password" className="text-xs text-[#E30019] hover:text-[#B80014] font-bold transition duration-150">
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" strokeWidth={2} />
                    <input
                      type={showPw ? "text" : "password"} required value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={step1Loading}
                      className="w-full h-12 pl-11 pr-11 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#E30019]/10 focus:border-[#E30019] transition duration-200 disabled:opacity-50"
                    />
                    <button
                      type="button" onClick={() => setShowPw(!showPw)} tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition duration-150"
                    >
                      {showPw ? <EyeOff className="w-4.5 h-4.5" strokeWidth={2} /> : <Eye className="w-4.5 h-4.5" strokeWidth={2} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit" disabled={step1Loading}
                  className="w-full h-12 mt-2 rounded-xl bg-[#E30019] hover:bg-[#B80014] active:scale-[0.98] text-white text-sm font-bold flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-[#E30019]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {step1Loading ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><span>Tiếp tục</span><ArrowRight className="w-4 h-4" strokeWidth={2} /></>
                  )}
                </button>
              </form>

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Hoặc</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <Link
                to="/register"
                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-gray-200 bg-white hover:border-[#E30019] hover:text-[#E30019] text-gray-700 text-sm font-bold transition duration-200 active:scale-[0.98]"
              >
                Tạo tài khoản miễn phí
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>

              <p className="text-center text-xs">
                <Link to="/" className="text-gray-400 hover:text-[#E30019] font-semibold transition duration-150 underline underline-offset-4">
                  ← Quay về trang chủ
                </Link>
              </p>
            </div>
          )}

          {/* ══════════════ BƯỚC 2: OTP ══════════════ */}
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
              submitText="Xác nhận & Đăng nhập"
              backText="Quay lại thay đổi email/mật khẩu"
            />
          )}

        </div>
      </div>
    </div>
  );
}
