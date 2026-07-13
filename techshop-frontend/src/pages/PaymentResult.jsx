import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader, Package, ArrowRight, RotateCcw } from "lucide-react";
import axiosClient from "../api/axios";
import CheckoutStepper from "../components/CheckoutStepper";
import useCartStore from "../store/cartStore";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const [status, setStatus] = useState("processing"); // processing | success | failed
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params = {};
        for (const [key, value] of searchParams.entries()) {
          params[key] = value;
        }

        const response = await axiosClient.get("/api/payments/vnpay/callback", { params });

        if (response.data.success) {
          setStatus("success");
          setMessage(response.data.message || "Thanh toán thành công!");
          const oid = response.data.orderId;
          setOrderId(oid);

          // Clear cart on successful payment
          try {
            useCartStore.getState().clearLocal();
            useCartStore.getState().clearCart().catch(() => {});
          } catch (e) {
            console.error("Lỗi xóa giỏ hàng:", e);
          }

          // Auto-redirect countdown
          let count = 5;
          const timer = setInterval(() => {
            count -= 1;
            setCountdown(count);
            if (count <= 0) {
              clearInterval(timer);
              if (oid && oid !== "0") {
                nav(`/orders/${oid}?placed=1`);
              } else {
                nav("/orders");
              }
            }
          }, 1000);
        } else {
          setStatus("failed");
          setMessage(response.data.message || "Thanh toán thất bại");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setStatus("failed");
        setMessage("Có lỗi xảy ra khi xác thực thanh toán");
      }
    };

    verifyPayment();
  }, [searchParams, nav]);

  const formatPayDate = (rawDate) => {
    if (!rawDate || rawDate.length < 14) return "";
    const year = rawDate.substring(0, 4);
    const month = rawDate.substring(4, 6);
    const day = rawDate.substring(6, 8);
    const hour24 = parseInt(rawDate.substring(8, 10), 10);
    const minute = rawDate.substring(10, 12);
    const second = rawDate.substring(12, 14);

    const isPM = hour24 >= 12;
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const ampm = isPM ? "CH" : "SA";

    const formattedHour = String(hour12).padStart(2, '0');
    return `${day}/${month}/${year} ${formattedHour}:${minute}:${second} ${ampm}`;
  };

  // Step: processing=2, success=3, failed=2
  const stepperStep = status === "success" ? 3 : 2;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <CheckoutStepper currentStep={stepperStep} />

      <div className="max-w-[960px] mx-auto px-4 py-10">
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Top color bar */}
          <div className={`h-2 w-full ${
            status === "success" ? "bg-green-500" :
            status === "failed" ? "bg-[#E30019]" :
            "bg-blue-500"
          }`} />

          <div className="p-8 text-center">
            {/* Processing */}
            {status === "processing" && (
              <>
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Loader className="h-10 w-10 text-blue-500 animate-spin" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Đang xác thực thanh toán...</h1>
                <p className="text-gray-500 text-sm">Vui lòng không đóng cửa sổ trình duyệt</p>

                <div className="mt-6 flex justify-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Success */}
            {status === "success" && (
              <>
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-1">Đặt hàng thành công!</h1>
                <p className="text-green-600 font-semibold text-sm mb-3">Thanh toán đã được xác nhận</p>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {message}. TechShop sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.
                </p>

                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-600 text-left space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    Đơn hàng đã được xác nhận
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    Email xác nhận đã được gửi
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-300 rounded-full" />
                    Đang chuẩn bị hàng
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {orderId && orderId !== "0" ? (
                    <Link
                      to={`/orders/${orderId}?placed=1`}
                      className="flex-1 py-3 bg-[#E30019] hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition"
                    >
                      <Package className="h-4 w-4" /> Xem đơn hàng
                    </Link>
                  ) : (
                    <Link
                      to="/orders"
                      className="flex-1 py-3 bg-[#E30019] hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition"
                    >
                      <Package className="h-4 w-4" /> Đơn hàng của tôi
                    </Link>
                  )}
                  <Link
                    to="/products"
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition"
                  >
                    Tiếp tục mua sắm <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <p className="text-xs text-gray-400 mt-4">
                  Tự động chuyển trang sau {countdown} giây...
                </p>
              </>
            )}

            {/* Failed */}
            {status === "failed" && (
              <>
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <XCircle className="h-10 w-10 text-[#E30019]" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-1">Thanh toán thất bại</h1>
                <p className="text-[#E30019] font-semibold text-sm mb-3">Giao dịch không thành công</p>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {message || "Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc chọn phương thức thanh toán khác."}
                </p>

                {/* Details of failed transaction */}
                {(searchParams.get("vnp_TxnRef") || searchParams.get("vnp_PayDate")) && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 text-sm text-gray-600 text-left space-y-2.5">
                    {searchParams.get("vnp_TxnRef") && (
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200/50">
                        <span className="text-gray-400">Mã tra cứu</span>
                        <span className="font-bold text-gray-800 tracking-wider">
                          {searchParams.get("vnp_TxnRef")}
                        </span>
                      </div>
                    )}
                    {searchParams.get("vnp_PayDate") && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Thời gian giao dịch</span>
                        <span className="font-semibold text-gray-700">
                          {formatPayDate(searchParams.get("vnp_PayDate"))}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/cart"
                    className="flex-1 py-3 bg-[#E30019] hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition"
                  >
                    <RotateCcw className="h-4 w-4" /> Thử lại
                  </Link>
                  <Link
                    to="/orders"
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition"
                  >
                    <Package className="h-4 w-4" /> Đơn hàng của tôi
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
