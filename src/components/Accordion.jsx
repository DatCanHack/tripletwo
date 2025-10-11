import { useState } from "react";

export function Accordion({
  items = [],
  allowMultiple = false,
  className = "",
}) {
  const [open, setOpen] = useState(() => new Set());

  const toggle = (i) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else {
        if (!allowMultiple) next.clear();
        next.add(i);
      }
      return next;
    });
  };

  return (
    <div
      className={`divide-y divide-[#1c2227] border border-[#1c2227] rounded-2xl overflow-hidden ${className}`}
    >
      {items.map((it, i) => {
        const isOpen = open.has(i);
        return (
          <div key={i}>
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-white/5"
            >
              <span className="font-medium">{it.q}</span>
              <span
                className={`transition-transform ${isOpen ? "rotate-45" : ""}`}
              >
                +
              </span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 text-sm text-gray-300">{it.a}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
