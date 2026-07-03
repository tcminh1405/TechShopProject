import { useRef } from "react";
import ProductCard from "./ProductCard";

export function ProductList({ products, category }) {
  const scrollRef = useRef(null);

  const filtered = products
    .filter(
      (p) => {
        // Map category correctly matching DB category ID or slug
        const prodCat = String(p.categoryId || p.category || "").toLowerCase();
        const targetCat = String(category || "").toLowerCase();
        
        // Match either by direct equality or if slug contains
        return prodCat === targetCat || 
               (targetCat === "laptop" && (prodCat === "1" || prodCat === "laptop")) ||
               (targetCat === "laptop-gaming" && (prodCat === "2" || prodCat === "laptop-gaming")) ||
               (targetCat === "pc" && (prodCat === "3" || prodCat === "pc-gvn" || prodCat === "pc")) ||
               (targetCat === "monitor" && (prodCat === "4" || prodCat === "man-hinh" || prodCat === "monitor")) ||
               (targetCat === "keyboard" && (prodCat === "5" || prodCat === "ban-phim" || prodCat === "keyboard")) ||
               (targetCat === "mouse" && (prodCat === "6" || prodCat === "chuot-lot-chuot" || prodCat === "mouse")) ||
               (targetCat === "headphone" && (prodCat === "7" || prodCat === "tai-nghe" || prodCat === "headphone")) ||
               (targetCat === "chair" && (prodCat === "8" || prodCat === "ghe-ban" || prodCat === "chair")) ||
               (targetCat === "console" && (prodCat === "9" || prodCat === "handheld-console" || prodCat === "console")) ||
               (targetCat === "accessory" && (prodCat === "10" || prodCat === "phu-kien" || prodCat === "accessory"));
      }
    )
    .slice(0, 10);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  if (filtered.length === 0) return null;

  return (
    <div className="relative mt-1 lg:mt-3">
      {/* Scroll Left Button */}
      <button
        onClick={scrollLeft}
        className="hidden lg:block absolute -left-4 top-1/2 z-10 -translate-y-1/2 bg-white shadow-lg p-2.5 rounded-full border border-gray-100 hover:bg-gray-50 transition"
      >
        ◀
      </button>

      {/* Scroll Right Button */}
      <button
        onClick={scrollRight}
        className="hidden lg:block absolute -right-4 top-1/2 z-10 -translate-y-1/2 bg-white shadow-lg p-2.5 rounded-full border border-gray-100 hover:bg-gray-50 transition"
      >
        ▶
      </button>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scroll-smooth snap-x scrollbar-hide py-3 px-1"
      >
        {filtered.map((p) => (
          <div
            key={p.id}
            className="min-w-[210px] max-w-[210px] snap-start"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 py-2">
      {products.map((p) => (
        <div key={p.id} className="transition-all duration-300">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
