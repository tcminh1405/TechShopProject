import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MapPin, Phone, User, CreditCard, Truck, ChevronRight, ShieldCheck } from "lucide-react";
import useCartStore from "../store/cartStore";
import { useAuth } from "../store/AuthContext";
import orderApi from "../api/orderApi";
import { toast } from "react-toastify";
import CheckoutStepper from "../components/CheckoutStepper";

const PAYMENT_METHODS = [
  {
    value: "COD",
    label: "Thanh toán khi nhận hàng (COD)",
    icon: "💵",
    desc: "Trả tiền mặt khi nhận hàng tại địa chỉ giao",
  },
  {
    value: "VNPAY",
    label: "Thanh toán qua VNPay",
    icon: "💳",
    desc: "Thẻ ATM, Visa, MasterCard, QR Pay",
  },
  {
    value: "BANK_TRANSFER",
    label: "Chuyển khoản ngân hàng",
    icon: "🏦",
    desc: "Chuyển khoản trực tiếp vào tài khoản TechShop",
  },
];

export default function Checkout() {
  const { user } = useAuth();
  const { items, totalAmount, clearCart, clearLocal } = useCartStore();
  const nav = useNavigate();

  const [form, setForm] = useState({
    receiverName: user?.fullName || "",
    receiverPhone: user?.phone || "",
    shippingAddress: user?.address || "",
    note: "",
    paymentMethod: "COD",
  });
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    if (!orderPlaced && (!user || items.length === 0)) {
      nav("/cart");
    }
  }, [user, items.length, orderPlaced, nav]);

  if (!user || (items.length === 0 && !orderPlaced)) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shippingAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ giao hàng");
      return;
    }
    setLoading(true);
    setOrderPlaced(true);

    try {
      const orderData = {
        ...form,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          productImage: i.productImage,
          productBrand: i.productBrand,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      };

      const res = await orderApi.create(orderData);

      let order = res.data;
      if (typeof res.data === "string") {
        try { order = JSON.parse(res.data); } catch {}
      }

      const orderId = order?.id;
      const paymentUrl = order?.paymentUrl;

      toast.success("Đặt hàng thành công!");

      clearLocal();
      clearCart().catch(() => {});

      if (form.paymentMethod === "VNPAY" && paymentUrl) {
        window.location.href = paymentUrl;
      } else if (orderId) {
        nav(`/orders/${orderId}?placed=1`, { replace: true });
      } else {
        nav("/orders", { replace: true });
      }
    } catch (err) {
      console.error("Order creation failed:", err);
      toast.error(err.response?.data?.message || "Đặt hàng thất bại!");
      setOrderPlaced(false);
    } finally {
      setLoading(false);
    }
  };

  const selectedTotal = totalAmount;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Step bar */}
      <CheckoutStepper currentStep={1} />

      <div className="max-w-[960px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center text-xs text-gray-500 mb-5 gap-1">
          <Link to="/" className="hover:text-[#E30019]">Trang chủ</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/cart" className="hover:text-[#E30019]">Giỏ hàng</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#E30019] font-medium">Thông tin đặt hàng</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-5">
            {/* LEFT COLUMN */}
            <div className="flex-1 space-y-4">
              {/* Shipping info */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-[#E30019] px-5 py-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-white" />
                  <h2 className="font-bold text-white text-sm uppercase tracking-wide">
                    Thông tin giao hàng
                  </h2>
                </div>
                <div className="p-5 grid sm:grid-cols-2 gap-4">
                  {[
                    { name: "receiverName", label: "Họ và tên người nhận *", icon: User, placeholder: "Nguyễn Văn A" },
                    { name: "receiverPhone", label: "Số điện thoại *", icon: Phone, placeholder: "0901234567" },
                  ].map(({ name, label, icon: Icon, placeholder }) => (
                    <div key={name}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                        {label}
                      </label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name={name}
                          required
                          value={form[name]}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E30019]/30 focus:border-[#E30019] transition"
                          placeholder={placeholder}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Địa chỉ giao hàng *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea
                        name="shippingAddress"
                        required
                        value={form.shippingAddress}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E30019]/30 focus:border-[#E30019] resize-none transition"
                        rows={2}
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Ghi chú cho người giao hàng
                    </label>
                    <textarea
                      name="note"
                      value={form.note}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E30019]/30 focus:border-[#E30019] resize-none transition"
                      rows={2}
                      placeholder="Ví dụ: Giao ngoài giờ hành chính, gọi trước khi giao..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-[#E30019] px-5 py-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-white" />
                  <h2 className="font-bold text-white text-sm uppercase tracking-wide">
                    Phương thức thanh toán
                  </h2>
                </div>
                <div className="p-5 space-y-3">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.value}
                      className={`flex items-center gap-4 p-3.5 border-2 rounded-xl cursor-pointer transition-all ${
                        form.paymentMethod === m.value
                          ? "border-[#E30019] bg-red-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={m.value}
                        checked={form.paymentMethod === m.value}
                        onChange={handleChange}
                        className="accent-[#E30019] w-4 h-4 shrink-0"
                      />
                      <span className="text-2xl leading-none">{m.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">{m.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                      </div>
                      {form.paymentMethod === m.value && (
                        <span className="text-[#E30019]">
                          <ShieldCheck className="h-5 w-5" />
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN — Order summary */}
            <div className="w-full lg:w-[320px] shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-24">
                <div className="bg-gray-800 px-5 py-3">
                  <h2 className="font-bold text-white text-sm uppercase tracking-wide">
                    Đơn hàng của bạn
                  </h2>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-50 max-h-56 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 px-4 py-3">
                      <div className="w-11 h-11 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden shrink-0">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-contain p-0.5"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-relaxed">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">SL: x{item.quantity}</p>
                      </div>
                      <p className="text-xs font-bold text-gray-800 shrink-0 pt-1">
                        {Number(item.unitPrice * item.quantity).toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="border-t border-gray-100 px-4 py-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính ({items.length} sản phẩm)</span>
                    <span className="font-medium">{Number(selectedTotal).toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-600 font-semibold">Miễn phí</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Khuyến mãi</span>
                    <span className="text-green-600 font-semibold">—</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 px-4 py-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-gray-900 text-base">Tổng thanh toán</span>
                    <div className="text-right">
                      <span className="block text-xl font-black text-[#E30019] leading-none">
                        {Number(selectedTotal).toLocaleString("vi-VN")}₫
                      </span>
                      <span className="text-[10px] text-gray-400">(Đã bao gồm VAT)</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 font-bold text-white rounded-xl transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg
                      ${loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#E30019] hover:bg-red-700 shadow-red-500/25 active:scale-[0.98]"
                      }`}
                  >
                    {loading ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <Truck className="h-4 w-4" />
                        Đặt hàng ngay
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-gray-400 text-center mt-3">
                    Bằng cách đặt hàng, bạn đồng ý với{" "}
                    <span className="text-[#E30019] underline cursor-pointer">Điều khoản dịch vụ</span>{" "}
                    của TechShop.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
