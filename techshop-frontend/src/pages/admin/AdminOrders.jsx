import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import orderApi from "../../api/orderApi";
import { toast } from "react-toastify";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const STATUS_COLOR = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};
const STATUS_LABEL = {
  PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao", DELIVERED: "Đã giao", CANCELLED: "Đã hủy",
};

const TABS = [
  { id: "ALL", label: "TẤT CẢ", statuses: null },
  { id: "PENDING", label: "MỚI", statuses: ["PENDING"] },
  { id: "PROCESSING", label: "ĐANG XỬ LÝ", statuses: ["CONFIRMED", "PROCESSING"] },
  { id: "SHIPPED", label: "ĐANG VẬN CHUYỂN", statuses: ["SHIPPED"] },
  { id: "DELIVERED", label: "HOÀN THÀNH", statuses: ["DELIVERED"] },
  { id: "CANCELLED", label: "HUỶ", statuses: ["CANCELLED"] },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState("ALL");

  const load = () => {
    setLoading(true);
    const tab = TABS.find((t) => t.id === activeTab);
    const params = {
      page,
      size: 15,
      sort: "createdAt,desc"
    };
    if (tab && tab.statuses) {
      params.status = tab.statuses.join(",");
    }

    orderApi.getAll(params)
      .then((r) => { 
        setOrders(r.data?.content || []); 
        setTotalPages(r.data?.totalPages || 0); 
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    load(); 
  }, [page, activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPage(0);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await orderApi.updateStatus(id, status);
      toast.success("Đã cập nhật trạng thái");
      load();
    } catch { toast.error("Cập nhật thất bại"); }
  };

  const handleMarkAsPaid = async (id) => {
    if (!confirm("Xác nhận đơn hàng này đã được chuyển khoản thành công?")) return;
    try {
      await orderApi.markAsPaid(id);
      toast.success("Đã xác nhận thanh toán thành công");
      load();
    } catch {
      toast.error("Không thể xác nhận thanh toán");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 overflow-x-auto scrollbar-none pb-px">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-3 px-1 font-semibold text-sm border-b-2 transition whitespace-nowrap -mb-px ${
                isActive
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Mã đơn", "Khách hàng", "Địa chỉ", "Tổng tiền", "Thanh toán", "Trạng thái", "Ngày đặt"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array(8).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>
              )) : orders.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">Chưa có đơn hàng</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4 font-medium text-gray-800 whitespace-nowrap">#{o.orderCode}</td>
                  <td className="px-5 py-4 text-gray-600">
                    <p>{o.receiverName}</p>
                    <p className="text-xs text-gray-400">{o.receiverPhone}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-500 max-w-xs truncate">{o.shippingAddress}</td>
                  <td className="px-5 py-4 font-semibold text-orange-500 whitespace-nowrap">{Number(o.totalAmount).toLocaleString("vi-VN")}₫</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${o.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {o.paymentStatus === "PAID" ? "Đã TT" : "Chưa TT"}
                    </span>
                    <p className="text-[11px] text-gray-400 mt-1 font-medium">
                      {o.paymentMethod === "COD" ? "COD (Tiền mặt)" :
                        o.paymentMethod === "VNPAY" ? "VNPay" :
                          o.paymentMethod === "BANK_TRANSFER" ? "Chuyển khoản" : o.paymentMethod}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="relative">
                      <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400 ${STATUS_COLOR[o.status] || "bg-gray-100 text-gray-700"}`}>
                        {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition ${i === page ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
