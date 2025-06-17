# TODO – SpendMe

> **Not:** Proje yığını: React + Tailwind CSS + PWA

## Yol Haritası
- [ ] Ana sayfa (dashboard) mock'u: React + Tailwind ile
- [ ] AI karakter seçim ekranı (ciddi, samimi, cıvık)
- [ ] Haftalık mail özeti
- [ ] Zaman bazlı harcama alışkanlığı analizi
- [ ] Offline modda çalışan parser
- [ ] Espri beğenme / puanlama sistemi
- [ ] Supabase tablo şeması oluştur
- [ ] Mobil PWA testleri
- [ ] Sesli giriş entegrasyonu
- [ ] Karanlık mod teması
- [ ] UI/UX son dokunuşlar
- [ ] Gemini API proxy endpoint ve useGemini hook entegrasyonu
- [ ] .env ile güvenli anahtar yönetimi

## Teknik Borçlar
- [ ] Unit test altyapısı
- [ ] Kodun TypeScript'e taşınması (varsa)
- [ ] Linter/prettier entegrasyonu

# SpendMe Yapılacaklar Listesi

## 1. Ana Sayfa İyileştirmeleri 🏠

### 1.1 Son İşlemler Bölümü
- [ ] Son işlemlerde transfer detayları düzeltilecek
  - Kaynak hesap ve hedef hesap bilgileri gösterilecek
  - Transfer yönü için ok (→) işareti eklenecek
  - Transfer açıklaması özel format ile gösterilecek

- [ ] İşlem tiplerine göre renklendirme
  - Gelir işlemleri: Yeşil renk (#10B981)
  - Gider işlemleri: Kırmızı renk (#EF4444)
  - Transfer işlemleri: Mavi renk (#3B82F6)

- [ ] Hesap bakiyelerinin güncellenmesi
  - Her işlem sonrası otomatik güncelleme
  - WebSocket ile real-time güncelleme desteği
  - Bakiye değişiminde animasyon efekti

## 2. Transfer İşlemleri 💸

### 2.1 Transfer Formu İyileştirmeleri
- [ ] Kaynak hesap seçimi
  - Sadece pozitif bakiyeli hesapların listelenmesi
  - Her hesabın mevcut bakiyesinin gösterilmesi
  - Hesap tipine göre gruplama (Cüzdan, Banka, Kredi Kartı)

- [ ] Hedef hesap seçimi
  - Kaynak hesap dışındaki hesapların listelenmesi
  - Hesap tipine göre gruplama
  - Sık kullanılan hesapların üstte gösterilmesi

- [ ] Transfer tutarı validasyonu
  - Kaynak hesap bakiyesi kontrolü
  - Minimum transfer tutarı kontrolü (1 TL)
  - Tutar girişinde otomatik formatlama

### 2.2 Transfer İşlem Geçmişi
- [ ] Transfer listesi görünümü
  - Tarih bazlı gruplama
  - Detaylı transfer bilgileri
  - İptal/Düzenleme seçenekleri

## 3. Kategori Yönetimi 📑

### 3.1 Kategori Listesi
- [ ] Mevcut kategorilerin düzenlenmesi
  - Varsayılan kategorilerin belirlenmesi
  - Kategori ikonlarının güncellenmesi
  - Kategori renklerinin belirlenmesi

- [ ] İşlem tiplerine göre kategori filtreleme
  - Gelir kategorileri
  - Gider kategorileri
  - Transfer kategorileri (opsiyonel)

### 3.2 Yeni Kategori Ekleme
- [ ] Kategori ekleme formu
  - İsim alanı
  - İkon seçici
  - Renk seçici
  - Kategori tipi seçimi

## 4. Hesap Yönetimi 🏦

### 4.1 Hesap İşlemleri
- [ ] Hesap ekleme formu
  - Hesap adı
  - Hesap tipi (Cüzdan, Banka, Kredi Kartı)
  - Başlangıç bakiyesi
  - Hesap para birimi

- [ ] Hesap düzenleme
  - Hesap bilgilerini güncelleme
  - Bakiye düzeltme
  - Hesap durumu (Aktif/Pasif)

- [ ] Hesap silme
  - Silme onayı
  - İlişkili işlemlerin kontrolü
  - Arşivleme seçeneği

### 4.2 Hesap Bakiye Yönetimi
- [ ] Otomatik bakiye güncelleme
  - Her işlem sonrası güncelleme
  - Toplu bakiye hesaplama
  - Bakiye geçmişi

## 5. UI/UX İyileştirmeleri 🎨

### 5.1 Kullanıcı Arayüzü
- [ ] Loading durumları
  - Sayfa yüklenirken skeleton ekranlar
  - İşlem yapılırken loading göstergeleri
  - Progress bar entegrasyonu

- [ ] Bildirimler
  - Başarılı işlem bildirimleri
  - Hata bildirimleri
  - İşlem onay bildirimleri

### 5.2 Responsive Tasarım
- [ ] Mobil uyumluluk
  - Tüm ekranların mobil görünümü
  - Touch destekli etkileşimler
  - Mobil navigasyon

## 6. Veritabanı İyileştirmeleri 💾

### 6.1 Tablo Optimizasyonları
- [ ] Transaction tablosu
  - İndexler ekleme
  - Foreign key ilişkileri
  - Partition stratejisi

- [ ] Hesap bakiyesi tablosu
  - Bakiye geçmişi
  - Audit log
  - Performans optimizasyonu

### 6.2 Veri Güvenliği
- [ ] Yetkilendirme
  - Kullanıcı bazlı erişim
  - İşlem limitleri
  - IP kısıtlamaları

## Öncelik Sırası

1. Ana Sayfa İyileştirmeleri (1.1)
2. Transfer İşlemleri (2.1)
3. Hesap Yönetimi (4.1)
4. Kategori Yönetimi (3.1)
5. UI/UX İyileştirmeleri (5.1)
6. Veritabanı İyileştirmeleri (6.1)

Her bir madde tamamlandıkça bu listeden işaretlenecek ve gerekirse yeni maddeler eklenecektir. 