import { useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import userApi from "../api/userApi";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function OAuth2Callback() {
  const { provider } = useParams();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const nav = useNavigate();
  const processedRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      toast.error("Không tìm thấy mã xác thực từ " + (provider === "google" ? "Google" : "Facebook"), { theme: "colored" });
      nav("/login", { replace: true });
      return;
    }

    if (processedRef.current) return;
    processedRef.current = true;

    const processLogin = async () => {
      try {
        // Exchange code for JWT from backend
        const res = await userApi.socialLogin(provider, code);
        const { token, role, fullName, id, email, phone, address } = res.data;

        // Save token & call getMe for fresh profile info
        localStorage.setItem("token", token);
        const userRes = await userApi.getMe();
        const fu = userRes.data;

        login(token, {
          id:       fu.id       || id,
          email:    fu.email    || email,
          role:     fu.role     || role,
          fullName: fu.fullName || fullName,
          phone:    fu.phone    || phone,
          address:  fu.address  || address,
        });

        toast.success(`Đăng nhập bằng ${provider === "google" ? "Google" : "Facebook"} thành công! 🎉`, { theme: "colored" });
        
        if (role === "ADMIN" || role === "STAFF") {
          nav("/admin/dashboard", { replace: true });
        } else {
          nav("/", { replace: true });
        }
      } catch (err) {
        console.error("Social login processing failed: ", err);
        toast.error(err.response?.data?.message || `Đăng nhập bằng ${provider === "google" ? "Google" : "Facebook"} thất bại. Vui lòng thử lại!`, { theme: "colored" });
        nav("/login", { replace: true });
      }
    };

    processLogin();
  }, [provider, searchParams, login, nav]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50/50 relative overflow-hidden">
      {/* Dynamic Background Patterns */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle,#000 1px,transparent 1px)", backgroundSize: "24px 24px" }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#E30019]/5 to-transparent blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-xl relative z-10 space-y-6">
        <div className="flex justify-center">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-50">
            <Loader2 className="w-10 h-10 text-[#E30019] animate-spin" />
            <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-[#E30019]/25 animate-[spin_8s_linear_infinite]" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Đang xác thực tài khoản</h3>
          <p className="text-gray-500 text-sm font-medium">
            Vui lòng đợi giây lát khi chúng tôi liên kết với {provider === "google" ? "Google" : "Facebook"}...
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-6 text-xs text-gray-400 font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-green-500" /> Bảo mật
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-blue-500" /> Xác thực nhanh
          </span>
        </div>
      </div>
    </div>
  );
}
