import React, { useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip,
  BarChart, Bar, Legend
} from "recharts";

const COLORS = ["#5B2C6F", "#D7BDE2", "#A569BD", "#F7CA18", "#58D68D", "#F1948A"];

// Mock data
const categoryData = [
  { name: "Market", value: 1200 },
  { name: "Ulaşım", value: 400 },
  { name: "Restoran", value: 800 },
  { name: "Fatura", value: 600 },
  { name: "Diğer", value: 300 },
];
const monthlyTrend = [
  { ay: "Oca", harcama: 3200 },
  { ay: "Şub", harcama: 2800 },
  { ay: "Mar", harcama: 3500 },
  { ay: "Nis", harcama: 3000 },
  { ay: "May", harcama: 3700 },
];
const topCategories = [
  { kategori: "Market", tutar: 1200 },
  { kategori: "Restoran", tutar: 800 },
  { kategori: "Fatura", tutar: 600 },
  { kategori: "Ulaşım", tutar: 400 },
  { kategori: "Diğer", tutar: 300 },
];
const budgetVsActual = [
  { ay: "Haziran", Butce: 4000, Gerceklesen: 3700 },
  { ay: "Temmuz", Butce: 4000, Gerceklesen: 4200 },
];
// Mock transactions for search
const mockTransactions = [
  { id: 1, kategori: "Market", tutar: 320, tarih: "2024-06-12", aciklama: "Migros alışverişi" },
  { id: 2, kategori: "Ulaşım", tutar: 90, tarih: "2024-06-10", aciklama: "Metro" },
  { id: 3, kategori: "Restoran", tutar: 75, tarih: "2024-06-09", aciklama: "Akşam yemeği" },
  { id: 4, kategori: "Fatura", tutar: 200, tarih: "2024-06-08", aciklama: "Elektrik" },
  { id: 5, kategori: "Market", tutar: 150, tarih: "2024-06-07", aciklama: "Şok market" },
];

export default function Reports() {
  const [search, setSearch] = useState("");
  const filtered = search.trim().length > 0
    ? mockTransactions.filter(tx =>
        tx.kategori.toLowerCase().includes(search.toLowerCase()) ||
        tx.aciklama.toLowerCase().includes(search.toLowerCase()) ||
        tx.tarih.includes(search)
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-2 bg-gradient-to-br from-brand-lightPurple to-brand-lightGray">
      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Arama Barı */}
        <div className="w-full mb-2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Kategori, açıklama veya tarih ara…"
            className="w-full rounded-2xl border border-gray-200 bg-white/90 px-5 py-3 text-base shadow focus:outline-none focus:ring-2 focus:ring-brand-purple placeholder:text-gray-400"
          />
        </div>
        {/* Arama Sonuçları */}
        {search.trim().length > 0 && (
          <div className="w-full bg-white/80 rounded-2xl shadow p-4 mb-2">
            <div className="text-brand-purple font-bold mb-2 text-sm">Arama Sonuçları</div>
            {filtered.length === 0 ? (
              <div className="text-gray-400 text-sm">Sonuç bulunamadı.</div>
            ) : (
              <ul className="flex flex-col gap-2">
                {filtered.map(tx => (
                  <li key={tx.id} className="flex justify-between items-center text-sm text-gray-700">
                    <span className="font-semibold text-brand-purple">{tx.kategori}</span>
                    <span>{tx.aciklama}</span>
                    <span className="font-mono">{tx.tutar} TL</span>
                    <span className="text-xs text-gray-400">{tx.tarih}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {/* Kategoriye Göre Harcama */}
        <div className="bg-white/80 rounded-3xl shadow-lg p-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🧩</span>
            <span className="text-lg font-bold text-brand-purple">Kategoriye Göre Harcama</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={40}
                label={({ name, percent }) => `${name} %${(percent * 100).toFixed(0)}`}
              >
                {categoryData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <PieTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Aylık Harcama Trendi */}
        <div className="bg-white/80 rounded-3xl shadow-lg p-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📈</span>
            <span className="text-lg font-bold text-brand-purple">Aylık Harcama Trendi</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyTrend} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ay" />
              <YAxis />
              <LineTooltip />
              <Line type="monotone" dataKey="harcama" stroke="#5B2C6F" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* En Çok Harcanan Kategoriler */}
        <div className="bg-white/80 rounded-3xl shadow-lg p-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏆</span>
            <span className="text-lg font-bold text-brand-purple">En Çok Harcanan Kategoriler</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topCategories} layout="vertical" margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="kategori" type="category" width={80} />
              <Bar dataKey="tutar" fill="#5B2C6F" radius={[8, 8, 8, 8]} />
              <LineTooltip />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Bütçe vs. Gerçekleşen */}
        <div className="bg-white/80 rounded-3xl shadow-lg p-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">💰</span>
            <span className="text-lg font-bold text-brand-purple">Bütçe vs. Gerçekleşen</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={budgetVsActual} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ay" />
              <YAxis />
              <Legend />
              <Bar dataKey="Butce" fill="#5B2C6F" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Gerceklesen" fill="#F7CA18" radius={[8, 8, 0, 0]} />
              <LineTooltip />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 