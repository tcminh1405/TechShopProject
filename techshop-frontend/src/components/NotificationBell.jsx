import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import useNotificationStore from '../store/notificationStore';
import orderApi from '../api/orderApi';

export default function NotificationBell({ dark = true }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showAllModal, setShowAllModal] = useState(false);
    const { user } = useAuth();
    const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
    const nav = useNavigate();

    useEffect(() => {
        if (user) {
            fetchNotifications(user.id);
            // Tự động kiểm tra thông báo mới mỗi 30 giây
            const interval = setInterval(() => fetchNotifications(user.id), 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    if (!user) return null;

    const handleNotificationClick = async (n) => {
        if (!n.isRead) markAsRead(n.id);
        setShowNotifications(false);
        setShowAllModal(false);

        // Trích xuất mã đơn hàng từ nội dung thông báo (ví dụ: #TS202607071957466)
        const match = n.message.match(/#([A-Za-z0-9]+)/);
        if (match) {
            const orderCode = match[1];
            try {
                let res;
                if (user.role === 'ADMIN' || user.role === 'STAFF') {
                    res = await orderApi.getAll({ size: 100 });
                } else {
                    res = await orderApi.getMyOrders({ size: 100 });
                }
                const orderList = res.data?.content || [];
                const foundOrder = orderList.find(o => o.orderCode === orderCode);
                if (foundOrder) {
                    nav(`/orders/${foundOrder.id}`);
                    return;
                }
            } catch (err) {
                console.error("Failed to find order by code:", err);
            }
        }
        
        // Backup nếu không tìm thấy ID cụ thể
        if (n.message.toLowerCase().includes("đơn hàng")) {
            nav(user.role === 'ADMIN' || user.role === 'STAFF' ? '/admin/orders' : '/orders');
        }
    };

    return (
        <div 
            className="relative"
            onMouseEnter={() => setShowNotifications(true)}
            onMouseLeave={() => setShowNotifications(false)}
        >
            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 transition ${dark ? 'text-white hover:text-red-200' : 'text-gray-700 hover:text-red-600'}`}
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#FFE600] text-black text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {showNotifications && (
                <div className="absolute right-0 top-full pt-2 w-80 z-[60]">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50">
                            <span className="font-bold text-sm text-gray-800">Thông báo</span>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={() => markAllAsRead(user.id)}
                                    className="text-xs text-red-600 hover:underline font-semibold"
                                >
                                    Đánh dấu đã đọc
                                </button>
                            )}
                        </div>
                        <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                            {notifications.length > 0 ? (
                                notifications.slice(0, 5).map((n) => {
                                    const isOrderNotif = n.message.match(/#([A-Za-z0-9]+)/) || n.message.toLowerCase().includes("đơn hàng");
                                    return (
                                        <div 
                                            key={n.id} 
                                            onClick={() => handleNotificationClick(n)}
                                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition ${!n.isRead ? 'bg-red-50/20' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-1 gap-2">
                                                <span className={`text-xs font-bold ${!n.isRead ? 'text-red-600' : 'text-gray-900'}`}>{n.title}</span>
                                                {!n.isRead && <div className="w-2 h-2 shrink-0 bg-red-600 rounded-full mt-1"></div>}
                                            </div>
                                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{n.message}</p>
                                            <div className="flex justify-between items-center mt-1.5">
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(n.createdAt).toLocaleString('vi-VN')}
                                                </span>
                                                {isOrderNotif && (
                                                    <span className="text-[10px] font-bold text-red-600 hover:underline">
                                                        Xem ngay &rarr;
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-8 text-center text-gray-400">
                                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Chưa có thông báo nào</p>
                                </div>
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <div className="px-4 py-2.5 border-t text-center bg-gray-50">
                                <button 
                                    onClick={() => {
                                        setShowNotifications(false);
                                        setShowAllModal(true);
                                    }}
                                    className="text-xs text-red-600 hover:text-red-700 font-bold hover:underline"
                                >
                                    Xem tất cả thông báo
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showAllModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-xl flex flex-col max-h-[80vh] overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <span className="font-bold text-base text-gray-800">Tất cả thông báo</span>
                            <div className="flex items-center gap-4">
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={() => markAllAsRead(user.id)}
                                        className="text-xs text-red-600 hover:underline font-semibold"
                                    >
                                        Đánh dấu tất cả đã đọc
                                    </button>
                                )}
                                <button 
                                    onClick={() => setShowAllModal(false)}
                                    className="p-1.5 rounded-full hover:bg-gray-200 transition text-gray-500"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                            {notifications.length > 0 ? (
                                notifications.map((n) => {
                                    const isOrderNotif = n.message.match(/#([A-Za-z0-9]+)/) || n.message.toLowerCase().includes("đơn hàng");
                                    return (
                                        <div 
                                            key={n.id} 
                                            onClick={() => handleNotificationClick(n)}
                                            className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition flex items-start gap-4 ${!n.isRead ? 'bg-red-50/20' : ''}`}
                                        >
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1 gap-2">
                                                    <span className={`text-sm font-bold ${!n.isRead ? 'text-red-600' : 'text-gray-900'}`}>{n.title}</span>
                                                    {!n.isRead && <span className="w-2 h-2 shrink-0 bg-red-600 rounded-full mt-1.5" />}
                                                </div>
                                                <p className="text-xs text-gray-600 leading-relaxed mb-1">{n.message}</p>
                                                <div className="flex justify-between items-center mt-1.5">
                                                    <span className="text-[10px] text-gray-400">
                                                        {new Date(n.createdAt).toLocaleString('vi-VN')}
                                                    </span>
                                                    {isOrderNotif && (
                                                        <span className="text-[10px] font-bold text-red-600 hover:underline">
                                                            Xem ngay &rarr;
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-16 text-center text-gray-400">
                                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">Chưa có thông báo nào</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
