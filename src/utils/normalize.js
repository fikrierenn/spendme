// Türkçe metni normalize eden yardımcı fonksiyon
export function normalize(text) {
  if (!text) return '';
  // Küçük harfe çevir
  let result = text.toLocaleLowerCase('tr-TR');
  // Türkçe karakterleri sadeleştir
  result = result
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');
  // Noktalama ve özel karakterleri sil
  result = result.replace(/[^a-z0-9\s]/gi, '');
  // Fazla boşlukları temizle
  result = result.replace(/\s+/g, ' ').trim();
  // Basit ek temizliği (örn: -dan, -den, -ta, -te, -a, -e, -ya, -ye, -da, -de, -tan, -ten)
  result = result.replace(/\b([a-z0-9]+?)(dan|den|tan|ten|ta|te|da|de|a|e|ya|ye)\b/g, '$1');
  return result;
} 