import { Link } from "react-router-dom";
import { ShoppingCart, Star, Cpu, HardDrive, Monitor, RefreshCw, Layers, Database, Grid } from "lucide-react";
import { toast } from "react-toastify";
import useCartStore from "../store/cartStore";
import { useAuth } from "../store/AuthContext";
import { useNavigate } from "react-router-dom";

function getSpecsForCard(product) {
  let specsObj = {};
  if (product.specifications) {
    try {
      specsObj = typeof product.specifications === "string" 
        ? JSON.parse(product.specifications) 
        : product.specifications;
    } catch (e) {
      specsObj = {};
    }
  }

  const getVal = (keys) => {
    for (const key of Object.keys(specsObj)) {
      if (keys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
        return specsObj[key];
      }
    }
    return "";
  };

  const categoryName = product.category?.name?.toLowerCase() || "";
  const categoryId = String(product.category?.id || "").toLowerCase();
  const nameLower = product.name?.toLowerCase() || "";

  const isLaptop = categoryName.includes("laptop") || categoryId === "1" || categoryId === "2" || nameLower.includes("laptop");
  const isPC = categoryName.includes("pc") || categoryId === "3" || nameLower.startsWith("pc ") || nameLower.includes("pc gvn");

  if (!isLaptop && !isPC) return null;

  // CPU
  let cpu = getVal(["cpu", "vi xử lý", "bộ vi xử lý"]);
  if (cpu) {
    cpu = cpu.replace(/intel\s+core\s+/i, "")
             .replace(/amd\s+ryzen\s+/i, "")
             .replace(/intel\s+/i, "")
             .replace(/amd\s+/i, "")
             .replace(/processor/i, "")
             .trim();
  }

  // RAM
  let ram = getVal(["ram", "bộ nhớ trong"]);
  if (ram) {
    const match = ram.match(/^(\d+\s*GB)/i);
    if (match) ram = match[1];
  }

  // SSD
  let ssd = getVal(["ssd", "ổ cứng", "dung lượng ổ cứng"]);
  if (ssd) {
    const match = ssd.match(/^(\d+\s*(GB|TB))/i);
    if (match) ssd = match[1];
  }

  // VGA / GPU
  let vga = getVal(["vga", "card đồ họa", "card màn hình", "gpu"]);
  if (vga) {
    vga = vga.replace(/nvidia\s+/i, "")
             .replace(/amd\s+/i, "")
             .replace(/geforce\s+/i, "")
             .replace(/graphics\s+/i, "")
             .replace(/\s+GB/i, "G")
             .replace(/\s+gb/i, "G")
             .trim();
  }

  if (isLaptop) {
    let screenFull = getVal(["màn hình", "kích thước màn hình"]);
    let screen = "";
    let hz = "";

    if (screenFull) {
      const sizeMatch = screenFull.match(/(\d+(\.\d+)?)\s*(inch|")/i);
      if (sizeMatch) {
        screen = sizeMatch[1] + '"';
      }
      
      const resMatch = screenFull.match(/(FHD\+?|QHD\+?|2\.8K|2\.5K|4K|OLED|IPS)/i);
      if (resMatch) {
        screen += " " + resMatch[1];
      }

      const hzMatch = screenFull.match(/(\d+)\s*Hz/i);
      if (hzMatch) {
        hz = hzMatch[1] + "Hz";
      }
    }

    if (!hz) {
      const hzVal = getVal(["tần số quét", "hz"]);
      if (hzVal) {
        const match = hzVal.match(/(\d+)\s*Hz/i);
        hz = match ? match[0] : hzVal;
      }
    }

    return {
      type: "laptop",
      cpu: cpu || "i5-13420H",
      vga: vga || "5050 8GB",
      ram: ram || "16GB",
      ssd: ssd || "512GB",
      screen: screen.trim() || "15\" FHD",
      hz: hz || "180Hz"
    };
  } else {
    // PC GVN
    let main = getVal(["main", "bo mạch chủ", "mainboard"]);
    if (main) {
      main = main.replace(/\s*DDR\d/i, "");
    }
    return {
      type: "pc",
      cpu: cpu || "i3-12100F",
      vga: vga || "RX 6500XT",
      main: main || "H610",
      ram: ram || "8GB",
      ssd: ssd || "256GB"
    };
  }
}

export default function ProductCard({ product }) {
  const { addToCart } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const price = product.salePrice || product.price;
  const originalPrice = product.salePrice ? product.price : null;
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info("Vui lòng đăng nhập để thêm vào giỏ hàng");
      navigate("/login");
      return;
    }
    try {
      await addToCart({
        productId: product.id,
        productName: product.name,
        productImage: product.imageUrl,
        productBrand: product.brand,
        unitPrice: price,
        quantity: 1,
      });
      toast.success("Đã thêm vào giỏ hàng!", { autoClose: 1500 });
    } catch {
      toast.error("Không thể thêm vào giỏ hàng");
    }
  };

  const specs = getSpecsForCard(product);

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded-lg border border-gray-200 hover:border-red-500 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
    >
      {/* Image Block */}
      <div className="relative w-full aspect-square bg-gray-50 flex items-center justify-center p-3 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.onerror = null;
              const seed = product.id || Math.floor(Math.random() * 100);
              e.currentTarget.src = `https://picsum.photos/seed/product${seed}/400/400`;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50">
            <ShoppingCart className="h-10 w-10" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3.5 flex flex-col gap-1.5 flex-1 border-t border-gray-50">
        {product.brand && (
          <span className="text-[10px] text-[#E30019] font-extrabold uppercase tracking-widest leading-none">
            {product.brand}
          </span>
        )}
        
        <h3 className="text-[13px] font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-red-600 transition-colors h-10 overflow-hidden">
          {product.name}
        </h3>

        {/* Specifications Box */}
        {specs && specs.type === "laptop" && (
          <div className="bg-gray-50 border border-gray-200/60 rounded-lg p-1.5 my-1 text-[10px] text-gray-500 font-semibold grid grid-cols-2 gap-x-1.5 gap-y-1">
            <div className="flex items-center gap-1 min-w-0">
              <Cpu className="h-3 w-3 text-gray-400 shrink-0" />
              <span className="truncate">{specs.cpu}</span>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <Layers className="h-3 w-3 text-gray-400 shrink-0" />
              <span className="truncate">{specs.vga}</span>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <Database className="h-3 w-3 text-gray-400 shrink-0" />
              <span className="truncate">{specs.ram}</span>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <HardDrive className="h-3 w-3 text-gray-400 shrink-0" />
              <span className="truncate">{specs.ssd}</span>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <Monitor className="h-3 w-3 text-gray-400 shrink-0" />
              <span className="truncate">{specs.screen}</span>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <RefreshCw className="h-3 w-3 text-gray-400 shrink-0" />
              <span className="truncate">{specs.hz}</span>
            </div>
          </div>
        )}

        {specs && specs.type === "pc" && (
          <div className="bg-gray-50 border border-gray-200/60 rounded-lg p-1.5 my-1 text-[10px] text-gray-500 font-semibold space-y-1">
            <div className="grid grid-cols-2 gap-x-1.5 gap-y-1">
              <div className="flex items-center gap-1 min-w-0">
                <Cpu className="h-3 w-3 text-gray-400 shrink-0" />
                <span className="truncate">{specs.cpu}</span>
              </div>
              <div className="flex items-center gap-1 min-w-0">
                <Layers className="h-3 w-3 text-gray-400 shrink-0" />
                <span className="truncate">{specs.vga}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
              <div className="flex items-center gap-1 min-w-0">
                <Grid className="h-3 w-3 text-gray-400 shrink-0" />
                <span className="truncate">{specs.main}</span>
              </div>
              <div className="flex items-center gap-1 min-w-0">
                <Database className="h-3 w-3 text-gray-400 shrink-0" />
                <span className="truncate">{specs.ram}</span>
              </div>
              <div className="flex items-center gap-1 min-w-0">
                <HardDrive className="h-3 w-3 text-gray-400 shrink-0" />
                <span className="truncate">{specs.ssd}</span>
              </div>
            </div>
          </div>
        )}

        {/* Spec tags (Show subcategory if exists, only if not Laptop/PC) */}
        {!specs && product.subcategory && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
              {product.subcategory}
            </span>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 text-[11px] mt-1">
          <span className="text-orange-500 font-bold">0.0</span>
          <Star className="h-3 w-3 text-orange-500 fill-orange-500" />
          <span className="text-gray-400">(0 đánh giá)</span>
        </div>

        {/* Prices */}
        <div className="mt-auto pt-2 flex flex-col gap-0.5">
          {originalPrice && (
            <span className="text-[11px] text-gray-400 line-through leading-none">
              {Number(originalPrice).toLocaleString("vi-VN")}₫
            </span>
          )}
          <div className="flex items-center gap-2 leading-none">
            <span className="text-[15px] font-extrabold text-[#E30019]">
              {Number(price).toLocaleString("vi-VN")}₫
            </span>
            {discount > 0 && (
              <span className="border border-red-500 text-[#E30019] text-[10px] font-bold px-1 py-0.5 rounded leading-none">
                -{discount}%
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="mt-3 w-full py-2 bg-gray-100 group-hover:bg-[#E30019] text-gray-700 group-hover:text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-1.5"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          THÊM VÀO GIỎ
        </button>
      </div>
    </Link>
  );
}
