import React from "react";

const navItems = [
  { label: "Ana Sayfa", icon: "🏠" },
  { label: "Ekle", icon: "➕" },
  { label: "Raporlar", icon: "📊" },
  { label: "Ayarlar", icon: "⚙️" },
];

export default function BottomNav({ active = 0, setActive }) {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg z-50 flex justify-around items-center h-16 max-w-md mx-auto">
      {navItems.map((item, i) => (
        <button
          key={item.label}
          onClick={() => setActive && setActive(i)}
          className={`flex flex-col items-center justify-center text-xs font-medium transition text-gray-500 hover:text-brand-purple focus:outline-none ${active === i ? "text-brand-purple font-bold" : ""}`}
        >
          <span className="text-2xl mb-1">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
} 