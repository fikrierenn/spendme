import React, { useState } from 'react';
import { SupabaseDynamicParser } from '../utils/SupabaseDynamicParser';

export default function ParserTest() {
  const [userId, setUserId] = useState('');
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleParse = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const parser = new SupabaseDynamicParser();
      const res = await parser.parse(text, userId);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-brand-purple mb-2">Supabase Dynamic Parser Test</h2>
      <input
        className="border p-2 rounded"
        placeholder="User ID"
        value={userId}
        onChange={e => setUserId(e.target.value)}
      />
      <textarea
        className="border p-2 rounded min-h-[60px]"
        placeholder="Test metni girin (örn: Seyhanlar 335 tl Garanti Bonus)"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button
        className="bg-brand-purple text-white rounded py-2 font-semibold hover:bg-purple-900 transition"
        onClick={handleParse}
        disabled={loading || !userId || !text}
      >
        {loading ? 'Parsing...' : 'Parse Et'}
      </button>
      {error && <div className="text-red-600">Hata: {error}</div>}
      {result && (
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mt-2">{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
} 