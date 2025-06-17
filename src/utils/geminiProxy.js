import dayjs from "dayjs";
// TEST ORTAMI İÇİN: API anahtarı .env dosyasından alınır, sadece test amaçlıdır!
export async function geminiParseTransaction(inputText, categoryList, accountList) {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  const today = dayjs().format("YYYY-MM-DD");
  const categoriesStr = categoryList && categoryList.length > 0 ? categoryList.map(c => c.name).join(", ") : "";
  const accountsStr = accountList && accountList.length > 0 ? accountList.map(a => a.name).join(", ") : "";
  const prompt = `Aşağıdaki metinden harcama bilgilerini JSON olarak çıkar:\n- Tutarı (sayı olarak, TL cinsinden)\n- Mağaza veya yer adını (vendor)\n- Tarihi (eğer cümlede tarih yoksa bugünün tarihi: ${today})\n- Açıklama (description): kısa ve anlamlı bir açıklama üret\n- Kategori: Sadece aşağıdaki kategorilerden EN UYGUN olanı seç ve aynen döndür:\n[${categoriesStr}]\n- Hesap/Kart: Sadece aşağıdaki hesap/kartlardan EN UYGUN olanı seç ve aynen döndür:\n[${accountsStr}]\n\nSadece şu formatta dön:\n{\n  "tutar": ...,\n  "vendor": "...",\n  "kategori": "...",\n  "tarih": "YYYY-MM-DD",\n  "description": "...",\n  "hesap": "..."\n}\n\nMetin: ${inputText}`;

  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;
  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  console.log("[Gemini API] İstek endpoint:", endpoint);
  console.log("[Gemini API] İstek body:", JSON.stringify(body));

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  let responseText = await res.text();
  console.log("[Gemini API] Dönen status:", res.status);
  console.log("[Gemini API] Dönen yanıt:", responseText);

  if (!res.ok) throw new Error("Gemini API hatası: " + res.status + " - " + responseText);
  const data = JSON.parse(responseText);

  // Yanıttan JSON'u ayıkla
  let jsonString = "";
  try {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Gemini yanıtı:", text);
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      jsonString = match[0];
      return JSON.parse(jsonString);
    }
    throw new Error("AI yanıtı beklenen formatta değil: " + text);
  } catch (e) {
    console.error("Gemini yanıtı (hata anında):", data);
    throw new Error("AI yanıtı parse edilemedi: " + e.message + " | Yanıt: " + (jsonString || "YOK"));
  }
} 