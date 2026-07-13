import { useRef, useEffect } from "react";

/**
 * 6-digit OTP input — tự động focus ô tiếp theo khi nhập,
 * backspace về ô trước, hỗ trợ paste 6 ký tự.
 *
 * Props:
 *   value    : string (6 ký tự, e.g. "1234__")
 *   onChange : (newValue: string) => void
 *   disabled : boolean
 *   error    : boolean  — viền đỏ khi sai
 */
export default function OtpInput({ value = "", onChange, disabled = false, error = false }) {
  const LENGTH = 6;
  const inputRefs = useRef([]);

  // Đảm bảo value luôn đủ LENGTH ký tự (pad bằng "")
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");

  // Focus ô đầu tiên khi mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const update = (newDigits) => {
    onChange(newDigits.join(""));
  };

  const handleChange = (idx, e) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1); // chỉ lấy 1 số cuối
    const next = [...digits];
    next[idx] = char;
    update(next);

    if (char && idx < LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[idx]) {
        // Xoá ký tự hiện tại
        const next = [...digits];
        next[idx] = "";
        update(next);
      } else if (idx > 0) {
        // Ô trống → lui về ô trước và xoá
        const next = [...digits];
        next[idx - 1] = "";
        update(next);
        inputRefs.current[idx - 1]?.focus();
      }
    }

    if (e.key === "ArrowLeft" && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowRight" && idx < LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, LENGTH);
    if (!pasted) return;

    const next = [...digits];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    update(next);

    // Focus ô sau ký tự paste cuối cùng
    const focusIdx = Math.min(pasted.length, LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const ringClass = error
    ? "border-[#E30019] ring-4 ring-[#E30019]/20 bg-red-50/30"
    : "border-gray-200 hover:border-gray-300 focus:border-[#E30019] focus:ring-4 focus:ring-[#E30019]/15 focus:scale-105 focus:shadow-sm";

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3.5">
      {digits.map((d, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`
            w-full aspect-square max-w-[50px] sm:max-w-[56px] rounded-2xl border-2 bg-gray-50/50
            text-center text-2xl font-black text-gray-900
            outline-none transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed
            shadow-inner
            ${ringClass}
            ${d && !error ? "bg-white border-[#E30019] text-[#E30019] shadow-sm" : ""}
          `}
          aria-label={`Chữ số OTP thứ ${idx + 1}`}
        />
      ))}
    </div>
  );
}
