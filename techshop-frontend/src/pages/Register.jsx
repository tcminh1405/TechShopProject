import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import userApi from "../api/userApi";
import OtpStep from "../components/OtpStep";
import {
  Mail, Lock, User, Phone, Eye, EyeOff, Check, ArrowRight
} from "lucide-react";
import { toast } from "react-toastify";

const PW_RULES = [
  { id: "len", label: "Ít nhất 6 ký tự", test: (v) => v.length >= 6 },
  { id: "num", label: "Có chứa chữ số",  test: (v) => /\d/.test(v) },
];

export default function Register() {
  // ── Bước 1 state ────────────────────────────────────────────
  const [form, setForm]     = useState({ fullName: "", email: "", password: "", phone: "" });
  const [showPw, setShowPw] = useState(false);
  const [step1Loading, setStep1Loading] = useState(false);

  // ── Bước 2 state ────────────────────────────────────────────
  const [step, setStep]           = useState(1);
  const [tempToken, setTempToken] = useState("");
  const [maskedEmail, setMasked]  = useState("");
  const [otp, setOtp]             = useState("");
  const [otpError, setOtpError]   = useState(false);
  const [step2Loading, setStep2Loading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const { login } = useAuth();
  const nav = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // ── BƯỚC 1: Validate + gửi OTP ──────────────────────────────
  const handleStep1 = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Mật khẩu tối thiểu 6 ký tự");
      return;
    }
    setStep1Loading(true);
    try {
      const res = await userApi.otpSend({
        type:     "REGISTER",
        email:    form.email,
        password: form.password,
        fullName: form.fullName,
        phone:    form.phone,
      });
      const { tempToken: tok, maskedEmail: masked } = res.data;
      setTempToken(tok);
      setMasked(masked);
      setOtp("");
      setOtpError(false);
      setStep(2);
      toast.info(`Mã OTP đã gửi tới ${masked}`, { autoClose: 3000 });
    } catch (err) {
      toast.error(err.response?.data?.message || "Đăng ký thất bại!", { theme: "colored" });
    } finally {
      setStep1Loading(false);
    }
  };

  // ── BƯỚC 2: Xác thực OTP → tạo tài khoản ───────────────────
  const handleStep2 = async () => {
    if (otp.length !== 6 || step2Loading) return;
    setStep2Loading(true);
    setOtpError(false);
    try {
      const res = await userApi.otpVerify({ tempToken, code: otp });
      const { token, ...userData } = res.data;

      localStorage.setItem("token", token);
      const userRes = await userApi.getMe();
      const fu = userRes.data;

      login(token, {
        id:       fu.id       || userData.id,
        email:    fu.email    || userData.email,
        role:     fu.role     || userData.role,
        fullName: fu.fullName || userData.fullName,
        phone:    fu.phone    || form.phone,
        address:  fu.address  || userData.address,
      });

      toast.success("Đăng ký thành công! Chào mừng đến TechShop 🎉");
      nav("/");
    } catch (err) {
      setOtpError(true);
      setOtp("");
      toast.error(err.response?.data?.message || "Mã OTP không đúng!", { theme: "colored" });
    } finally {
      setStep2Loading(false);
    }
  };

  // Gửi lại OTP
  const handleResend = async () => {
    setResendLoading(true);
    try {
      const res = await userApi.otpSend({
        type: "REGISTER", email: form.email, password: form.password,
        fullName: form.fullName, phone: form.phone,
      });
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

  const textFields = [
    { name: "fullName", label: "Họ và tên",    icon: User,  type: "text",  placeholder: "Nguyễn Văn A",    autoComplete: "name",  required: true  },
    { name: "email",    label: "Email",          icon: Mail,  type: "email", placeholder: "you@example.com",  autoComplete: "email", required: true  },
    { name: "phone",    label: "Số điện thoại", icon: Phone, type: "tel",   placeholder: "0901 234 567",     autoComplete: "tel",   required: false },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50/50">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[46%] relative overflow-hidden bg-gradient-to-br from-[#E30019] via-[#C90014] to-[#99000D] flex-col justify-between p-12 xl:p-16">
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "24px 24px" }}
        />
        <div className="absolute -top-20 -right-20 w-[320px] h-[320px] rounded-full bg-white/10 blur-[70px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-[360px] h-[360px] rounded-full bg-black/25 blur-[90px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="inline-flex p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl">
            <img src="/images/logo-navbar.png" alt="TechShop" className="h-10 w-auto object-contain" />
          </div>
        </div>

        {/* Brand Copy & Features */}
        <div className="relative z-10 space-y-9">
          <div className="space-y-3.5">
            <p className="text-red-100 text-xs font-bold tracking-[0.2em] uppercase">Tham gia cùng chúng tôi</p>
            <h1 className="text-white text-3xl xl:text-4xl font-black leading-[1.15] tracking-tight">
              Tạo tài khoản miễn phí,<br />
              <span className="text-[#FFE600] drop-shadow-sm">mua sắm không giới hạn.</span>
            </h1>
            <p className="text-red-100 text-sm leading-relaxed max-w-[38ch] font-medium opacity-90">
              Đăng ký thành viên để dễ dàng quản lý đơn hàng, theo dõi giao hàng và tích luỹ điểm thưởng đổi ưu đãi.
            </p>
          </div>

          <ul className="space-y-4">
            {["Theo dõi hành trình đơn hàng Real-time", "Nhận mã giảm giá & ưu đãi độc quyền", "Quản lý và tái đặt hàng dễ dàng"].map((benefit) => (
              <li
                key={benefit}
                className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0 shadow-inner">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <span className="text-white text-sm font-semibold tracking-wide">{benefit}</span>
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

          {/* ══════════════ PROGRESS INDICATOR ══════════════ */}
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition duration-200 ${
                step === 1 ? "bg-[#E30019] text-white shadow-md shadow-[#E30019]/20" : "bg-green-500 text-white shadow-md shadow-green-500/20"
              }`}>
                {step > 1 ? "✓" : "1"}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${step === 1 ? "text-[#E30019]" : "text-green-600"}`}>Thông tin</span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 rounded transition duration-300 ${step > 1 ? "bg-green-500" : "bg-gray-200"}`} />
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition duration-200 ${
                step === 2 ? "bg-[#E30019] text-white shadow-md shadow-[#E30019]/20" : "bg-gray-200 text-gray-400"
              }`}>
                2
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${step === 2 ? "text-[#E30019]" : "text-gray-400"}`}>Xác thực</span>
            </div>
          </div>

          {/* ══════════════ BƯỚC 1: Form đăng ký ══════════════ */}
          {step === 1 && (
            <div className="space-y-7 animate-fadeIn">
              <div className="space-y-2">
                <h2 className="text-gray-900 text-3xl font-black tracking-tight">Đăng ký thành viên</h2>
                <p className="text-gray-500 text-sm font-medium">Bắt đầu mua sắm ưu đãi cùng TechShop</p>
              </div>

              <form onSubmit={handleStep1} className="space-y-4">
                {textFields.map(({ name, label, icon: Icon, type, placeholder, autoComplete, required: req }) => (
                  <div key={name} className="space-y-2">
                    <label className="text-gray-700 text-xs font-bold uppercase tracking-wider">
                      {label}
                      {!req && <span className="text-gray-400 font-bold ml-1 lowercase italic">(tuỳ chọn)</span>}
                    </label>
                    <div className="relative">
                      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" strokeWidth={2} />
                      <input
                        type={type} name={name} required={req}
                        value={form[name]} onChange={handleChange}
                        placeholder={placeholder} autoComplete={autoComplete}
                        disabled={step1Loading}
                        className="w-full h-12 pl-11 pr-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#E30019]/10 focus:border-[#E30019] transition duration-200 disabled:opacity-50"
                      />
                    </div>
                  </div>
                ))}

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-gray-700 text-xs font-bold uppercase tracking-wider">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" strokeWidth={2} />
                    <input
                      type={showPw ? "text" : "password"} name="password" required
                      value={form.password} onChange={handleChange}
                      placeholder="Tối thiểu 6 ký tự" autoComplete="new-password"
                      disabled={step1Loading}
                      className="w-full h-12 pl-11 pr-11 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#E30019]/10 focus:border-[#E30019] transition duration-200 disabled:opacity-50"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition duration-150">
                      {showPw ? <EyeOff className="w-4.5 h-4.5" strokeWidth={2} /> : <Eye className="w-4.5 h-4.5" strokeWidth={2} />}
                    </button>
                  </div>

                  {/* Password hints */}
                  {form.password.length > 0 && (
                    <ul className="flex gap-4 pt-1">
                      {PW_RULES.map((rule) => {
                        const ok = rule.test(form.password);
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
                to="/login"
                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-gray-200 bg-white hover:border-[#E30019] hover:text-[#E30019] text-gray-700 text-sm font-bold transition duration-200 active:scale-[0.98]"
              >
                Đăng nhập ngay
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>

              <p className="text-center text-xs text-gray-400 leading-relaxed font-medium">
                Bằng cách đăng ký, bạn đồng ý với{" "}
                <Link to="/terms-of-service" target="_blank" className="text-gray-600 underline hover:text-[#E30019] transition duration-150">Điều khoản dịch vụ</Link>
                {" và "}
                <Link to="/privacy-policy" target="_blank" className="text-gray-600 underline hover:text-[#E30019] transition duration-150">Chính sách bảo mật</Link>.
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
              title="Xác thực email"
              submitText="Hoàn tất đăng ký"
              backText="Quay lại thay đổi thông tin đăng ký"
            />
          )}

        </div>
      </div>
    </div>
  );
}
