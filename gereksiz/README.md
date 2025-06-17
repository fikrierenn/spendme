# SpendMe AI Modülü

Bu klasör SpendMe uygulamasının yapay zeka özelliklerini içerir.

## 📁 Dosyalar

### `datasetGenerator.js`
- 15,000 adet Türkçe training verisi oluşturur
- Çeşitli harcama kategorileri ve kalıpları
- Gerçekçi vendor, tutar ve hesap kombinasyonları
- Kullanım: `generateDataset(15000)`

### `transactionAI.js`
- Ana TensorFlow model sınıfı
- Multi-output LSTM model (amount, vendor, category, account, type)
- Türkçe tokenization ve preprocessing
- Model eğitimi, prediction ve kaydetme fonksiyonları

### `useTransactionAI.js` (hooks/)
- React hook wrapper
- Model eğitimi, prediction ve feedback yönetimi
- Loading states ve progress tracking
- LocalStorage'da model persist etme

### `AITrainingPanel.js`
- AI model yönetim UI komponenti
- Model eğitimi, durum görüntüleme
- Eğitim parametrelerini ayarlama
- Progress bar ve kontroller

### `supabase-ai-setup.sql`
- Supabase AI tabloları
- Training data, predictions, feedback tabloları
- RLS policies ve indexes
- Sample data insertion

## 🚀 Kurulum

### 1. Dependencies
```bash
npm install @tensorflow/tfjs
```

### 2. Supabase Setup
```sql
-- supabase-ai-setup.sql dosyasını çalıştırın
```

### 3. Model Eğitimi
```javascript
import { useTransactionAI } from './hooks/useTransactionAI';

const { trainModel, isTraining, trainingProgress } = useTransactionAI(userId);

// 15K veri ile eğitim
await trainModel({
  datasetSize: 15000,
  epochs: 50,
  batchSize: 32
});
```

### 4. Prediction
```javascript
const result = await predict("Seyhanlar 335 tl Garanti Bonus");

// Result:
// {
//   amount: 335,
//   vendor: "Seyhanlar",
//   category: "Market", 
//   account: "Garanti Bonus",
//   type: "expense",
//   confidence: { vendor: 0.92, category: 0.88, ... }
// }
```

## 🎯 Model Mimarisi

```
Input Text → Tokenization → Embedding (128d) 
→ LSTM (256) → LSTM (128) → Dense (512) → Multi-Output:
  ├── Amount (1 unit, linear)
  ├── Vendor (softmax)
  ├── Category (softmax) 
  ├── Account (softmax)
  └── Type (softmax)
```

## 📊 Eğitim Verisi

- **Toplam:** 15,000 örnek
- **Dağılım:** %70 gider, %20 gelir, %10 transfer
- **Kategoriler:** 9 ana kategori, 100+ vendor
- **Pattern'ler:** 39 farklı cümle kalıbı
- **Tutarlar:** 5-15,000 TL arası

## 🎛️ Kullanım

### AddTransaction'da
```javascript
import { useTransactionAI } from '../hooks/useTransactionAI';

const { predict, provideFeedback, isLoading } = useTransactionAI(userId);

useEffect(() => {
  if (input.length > 5) {
    const timer = setTimeout(async () => {
      const result = await predict(input);
      if (result) {
        setAmount(result.amount);
        setVendor(result.vendor);
        // ...
      }
    }, 1000);
    return () => clearTimeout(timer);
  }
}, [input]);
```

### Training Panel'da
```javascript
import AITrainingPanel from '../ai/AITrainingPanel';

<AITrainingPanel userId={userId} />
```

## 🔄 Learning Loop

1. User input → AI prediction
2. User correction → Feedback tablosuna kaydet
3. Periodic retraining → Improved accuracy
4. Model versioning → Track improvements

## 📈 Performance

- **İlk eğitim:** ~2-5 dakika
- **Prediction:** ~100-200ms
- **Accuracy beklenti:** %85-90+
- **Memory usage:** ~50-100MB
- **Storage:** ~10-20MB (localStorage)

## 🔧 Troubleshooting

**Model eğitilmiyor:**
- Browser RAM'i yeterli mi? (min 4GB)
- TensorFlow.js doğru yüklenmiş mi?
- Console'da hata var mı?

**Prediction accuracy düşük:**
- Daha fazla eğitim verisi ekleyin
- Epoch sayısını artırın
- User feedback ile fine-tune yapın

**Performance sorunları:**
- Batch size düşürün
- Model complexity azaltın
- Browser cache temizleyin
