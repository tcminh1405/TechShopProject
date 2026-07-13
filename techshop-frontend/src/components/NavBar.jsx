import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import useCartStore from "../store/cartStore";
import { useState, useEffect } from "react";
import {
  Menu, ShoppingCart, User, X, Search, Zap,
  LogOut, Package, Settings, ChevronDown, MapPin, Tag, Flame,
  Newspaper, Wrench, RefreshCw, Bell, UserCheck, Shield
} from "lucide-react";
import { toast } from "react-toastify";
import NotificationBell from "./NotificationBell";
import CategorySidebar from "./CategorySidebar";
import CategorySidebarMobile from "./CategorySidebarMobile";
import SearchBar from "./SearchBar";

export default function NavBar() {
  const [openCategory, setOpenCategory] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { totalItems, fetchCart, clearLocal } = useCartStore();

  useEffect(() => {
    if (user && user.token) {
      if (localStorage.getItem("token")) {
        fetchCart();
      }
    } else {
      clearLocal();
    }
  }, [user]);

  useEffect(() => {
    setOpenCategory(false);
    setOpenMobileMenu(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    clearLocal();
    navigate("/");
    toast.info("Đã đăng xuất!", { theme: "colored", autoClose: 2000 });
  };

  const displayName = user?.fullName || "Khách";
  const displayEmail = user?.email || "";

  return (
    <>
      {/* Top bar - uses actual GearVN promo image */}
      <div className="hidden bg-[#0A86FF] lg:block text-center overflow-hidden" style={{ maxHeight: 32 }}>
        <img
          src="/gearvn-pc-gvn-t11-topbar.png"
          alt="TechShop khuyến mãi"
          className="w-full h-8 object-contain object-center"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement.textContent =
              "CHÀO MỪNG BẠN ĐẾN VỚI TECHSHOP - HỆ THỐNG MÁY TÍNH & THIẾT BỊ CÔNG NGHỆ CAO CẤP ✨";
            e.currentTarget.parentElement.className =
              "hidden bg-[#0A86FF] lg:block text-center py-1 text-xs text-white font-semibold";
          }}
        />
      </div>

      {/* Mobile CategorySidebar Drawer */}
      <CategorySidebarMobile
        open={openMobileMenu}
        onClose={() => setOpenMobileMenu(false)}
      />

      {/* Red main header */}
      <div className="bg-[#E30019] sticky top-0 z-[190] shadow-md">
        {/* === MOBILE layout: 2 rows === */}
        <div className="lg:hidden">
          {/* Row 1: hamburger | logo | cart + user */}
          <div className="flex items-center gap-2 px-3 pt-2 pb-1.5">
            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setOpenMobileMenu(true)}
              className="flex items-center justify-center h-9 w-9 rounded-[6px] bg-[#B80014] hover:bg-[#A60012] transition shrink-0"
              aria-label="Mở menu danh mục"
            >
              <Menu className="h-5 w-5 text-white" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex shrink-0 items-center">
              <img
                src="/images/logo-navbar.png"
                alt="TechShop"
                className="h-9 w-auto object-contain"
              />
            </Link>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-md bg-[#B80014] hover:bg-[#A60012] transition">
              <ShoppingCart className="h-5 w-5 text-white" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FFE600] px-1 text-[9px] font-bold text-black ring-1 ring-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <Link to="/profile" className="p-2 rounded-md bg-[#B80014] hover:bg-[#A60012] transition">
                <User className="h-5 w-5 text-white" />
              </Link>
            ) : (
              <Link to="/login" className="p-2 rounded-md bg-[#B80014] hover:bg-[#A60012] transition">
                <User className="h-5 w-5 text-white" />
              </Link>
            )}
          </div>

          {/* Row 2: Search bar full width */}
          <div className="px-3 pb-2.5">
            <SearchBar />
          </div>
        </div>

        {/* === DESKTOP layout: single row === */}
        <div className="hidden lg:flex max-w-[1200px] mx-auto h-20 items-center gap-3 px-4">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center">
            <img
              src="/images/logo-navbar.png"
              alt="TechShop"
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Catalog Button — desktop only */}
          <div className="relative hidden lg:block shrink-0 z-[150]">
            <button
              type="button"
              onClick={() => setOpenCategory(!openCategory)}
              className="flex h-10 shrink-0 items-center gap-1.5 rounded-[6px] bg-[#B80014] px-2.5 font-bold text-white transition-colors hover:bg-[#A60012] lg:h-11 lg:w-28"
            >
              <Menu className="h-5 w-5" />
              <span className="hidden text-[13px] leading-none lg:block">Danh mục</span>
            </button>

            {openCategory && (
              <>
                <div
                  className="fixed inset-0 top-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
                  onClick={() => setOpenCategory(false)}
                />
                <div className="absolute -left-2 top-full mt-3 z-50 transition-all duration-150">
                  <div className="relative shadow-2xl rounded-md bg-white">
                    <CategorySidebar onNavigate={() => setOpenCategory(false)} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* SearchBar — desktop only */}
          <div className="min-w-0 flex-1">
            <SearchBar />
          </div>

          {/* Action Links right */}
          <div className="hidden lg:flex items-center gap-4 text-white text-[13px] font-semibold shrink-0">
            {/* Showroom */}
            <Link to="/showroom" className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] hover:bg-white/10 transition">
              <MapPin className="h-5 w-5 text-white" />
              <div className="leading-tight">
                <div>Hệ thống</div>
                <div>Showroom</div>
              </div>
            </Link>

            {/* Trade In */}
            <Link to="/trade-in-pricing" className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] hover:bg-white/10 transition">
              <RefreshCw className="h-5 w-5 text-white" />
              <div className="leading-tight">
                <div>Thu cũ</div>
                <div>Đổi mới</div>
              </div>
            </Link>

            {/* Notifications */}
            <div className="flex items-center justify-center p-2 rounded-[6px] hover:bg-white/10 transition">
              <NotificationBell />
            </div>

            {/* Cart */}
            <Link to="/cart" className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] hover:bg-white/10 transition">
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-white" />
                {totalItems > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FFE600] px-1 text-[9px] font-black leading-none text-black ring-1 ring-white">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </div>
              <div className="leading-tight">
                <div>Giỏ</div>
                <div>hàng</div>
              </div>
            </Link>

            {/* User Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] hover:bg-white/10 transition text-left"
              >
                <User className="h-5 w-5 text-white" />
                <div className="leading-tight">
                  <div className="max-w-[70px] truncate">{displayName.split(" ").pop()}</div>
                  <div className="flex items-center gap-0.5 text-[10px] text-gray-200">
                    Tài khoản <ChevronDown className="h-3 w-3" />
                  </div>
                </div>
              </button>

              {/* Invisible bridge to keep hover active between button and menu */}
              <div className="absolute right-0 top-full h-3 w-full" />

              <div className="absolute right-0 top-[calc(100%+0.5rem)] w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 text-gray-800 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 pointer-events-none group-hover:pointer-events-auto">
                <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 border-b border-gray-100">
                  <p className="text-xs text-gray-500">Xin chào</p>
                  <p className="font-bold text-gray-900 truncate">{displayName}</p>
                  {user ? (
                    <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded uppercase">{user.role}</span>
                  ) : (
                    <p className="text-xs text-gray-400">Vui lòng đăng nhập tài khoản để xem ưu đãi và thanh toán dễ dàng hơn.</p>
                  )}
                </div>

                {user ? (
                  <>
                    <div className="py-1">
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition">
                        <User className="h-4 w-4" /> Hồ sơ cá nhân
                      </Link>
                      <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition">
                        <Package className="h-4 w-4" /> Đơn hàng của tôi
                      </Link>
                      {(user.role === "ADMIN" || user.role === "STAFF") && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition font-medium">
                          <Settings className="h-4 w-4 text-red-600" /> Quản lý hệ thống
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-gray-100">
                      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition">
                        <LogOut className="h-4 w-4" /> Đăng xuất
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 grid grid-cols-2 gap-2">
                    <Link to="/login" className="flex h-9 items-center justify-center rounded bg-red-600 text-xs font-bold text-white transition hover:bg-red-700">
                      ĐĂNG NHẬP
                    </Link>
                    <Link to="/register" className="flex h-9 items-center justify-center rounded border border-gray-300 text-xs font-bold text-gray-700 transition hover:bg-gray-50">
                      ĐĂNG KÝ
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>{/* end desktop Action Links right */}
        </div>{/* end desktop flex row */}
      </div>{/* end bg-[#E30019] */}

      {/* Sub menu bottom header (Desktop) */}
      <div className="relative z-0 hidden border-b border-gray-200 bg-white lg:block shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 flex h-11 items-center justify-center gap-4 text-xs font-semibold text-gray-700">
          <NavLink to="/laptop-gaming-hot-deals" className={({ isActive }) => `flex items-center gap-2 hover:text-[#D70018] transition h-full ${isActive ? "text-[#D70018]" : ""}`}>
            <Flame className="h-4 w-4" />
            <span>Hot deal</span>
          </NavLink>

          <span className="text-gray-300 font-normal">|</span>

          <NavLink to="/trade-in-pricing" className={({ isActive }) => `flex items-center gap-2 hover:text-[#D70018] transition h-full ${isActive ? "text-[#D70018]" : ""}`}>
            <RefreshCw className="h-4 w-4" />
            <span>Thu cũ</span>
          </NavLink>

          <span className="text-gray-300 font-normal">|</span>

          <NavLink to="/news" className={({ isActive }) => `flex items-center gap-2 hover:text-[#D70018] transition h-full ${isActive ? "text-[#D70018]" : ""}`}>
            <Newspaper className="h-4 w-4" />
            <span>Tin tức</span>
          </NavLink>

          <span className="text-gray-300 font-normal">|</span>

          <NavLink to="/on-site-technical-support" className={({ isActive }) => `flex items-center gap-2 hover:text-[#D70018] transition h-full ${isActive ? "text-[#D70018]" : ""}`}>
            <Wrench className="h-4 w-4" />
            <span>Dịch vụ kỹ thuật tại nhà</span>
          </NavLink>

          <span className="text-gray-300 font-normal">|</span>

          <NavLink to="/trade-in-pricing" className={({ isActive }) => `flex items-center gap-2 hover:text-[#D70018] transition h-full ${isActive ? "text-[#D70018]" : ""}`}>
            <RefreshCw className="h-4 w-4" />
            <span>Thu cũ đổi mới</span>
          </NavLink>

          <span className="text-gray-300 font-normal">|</span>

          <NavLink to="/warranty-lookup" className={({ isActive }) => `flex items-center gap-2 hover:text-[#D70018] transition h-full ${isActive ? "text-[#D70018]" : ""}`}>
            <Shield className="h-4 w-4" />
            <span>Tra cứu bảo hành</span>
          </NavLink>

          <span className="text-gray-300 font-normal">|</span>

          <div className="flex items-center h-full text-[12px] font-bold text-red-600">
            <span>Hotline: <span className="text-[#0A86FF]">1800.6975</span> (Miễn phí)</span>
          </div>
        </div>
      </div>
    </>
  );
}
