import { ShoppingCart, ClipboardList, CreditCard, CheckCircle } from "lucide-react";

const STEPS = [
  { label: "Giỏ hàng", icon: ShoppingCart },
  { label: "Thông tin đặt hàng", icon: ClipboardList },
  { label: "Thanh toán", icon: CreditCard },
  { label: "Hoàn tất", icon: CheckCircle },
];

/**
 * Stepper thanh bước đặt hàng kiểu GearVN
 * @param {number} currentStep - 0=Giỏ hàng, 1=Thông tin, 2=Thanh toán, 3=Hoàn tất
 */
export default function CheckoutStepper({ currentStep = 0 }) {
  return (
    <div className="w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-[960px] mx-auto px-4 py-0">
        <div className="flex items-stretch">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === currentStep;
            const isDone = i < currentStep;

            return (
              <div
                key={i}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold relative
                  transition-colors select-none
                  ${isActive
                    ? "text-[#E30019] border-b-[3px] border-[#E30019]"
                    : isDone
                    ? "text-green-600 border-b-[3px] border-green-500"
                    : "text-gray-400 border-b-[3px] border-transparent"
                  }`}
              >
                {/* Divider line between steps */}
                {i > 0 && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-5 bg-gray-200" />
                )}

                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                    ${isActive
                      ? "bg-[#E30019] text-white"
                      : isDone
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                    }`}
                >
                  {isDone ? "✓" : i + 1}
                </span>

                <span className="hidden sm:inline">{step.label}</span>
                {/* Mobile: icon only */}
                <Icon className="sm:hidden h-4 w-4" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
