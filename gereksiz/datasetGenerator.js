// TensorFlow Training Dataset Generator - 15,000 samples
// Bu script 15 bin veri oluşturur ve JSON formatında döner

const vendors = {
  market: ['Migros', 'BİM', 'ŞOK Market', 'CarrefourSA', 'A101', 'Metro', 'Macro Center', 'Getir', 'Banabi', 'Halk Ekmek', 'Organik Market', 'Econ', 'Çiftlik'],
  restoran: ['McDonald\'s', 'Burger King', 'KFC', 'Starbucks', 'Domino\'s', 'Pizza Hut', 'Yemeksepeti', 'Seyhanlar Et', 'Çay Bahçesi', 'Lokanta', 'Mado', 'Kahve Dünyası', 'İnci Pastanesi', 'Pastane', 'Simitçi', 'Köfteci', 'Pideci'],
  ulasim: ['Shell', 'Petrol Ofisi', 'BP', 'Metro', 'İETT', 'Taksi', 'BiTaksi', 'Uber', 'Dolmuş', 'Minibüs', 'Vapur', 'TCDD', 'Havayolu', 'Otobüs'],
  fatura: ['BEDAŞ', 'İSKİ', 'İGDAŞ', 'Turkcell', 'Vodafone', 'Türk Telekom', 'Turkcell Superonline'],
  elektronik: ['Teknosa', 'MediaMarkt', 'Hepsiburada', 'Trendyol', 'Amazon', 'Samsung', 'Apple', 'Bosch', 'Philips', 'Arçelik'],
  giyim: ['Zara', 'H&M', 'LC Waikiki', 'Boyner', 'Vakko', 'Pierre Cardin', 'Nike', 'Adidas'],
  saglik: ['Eczane', 'Watsons', 'Veteriner', 'Dişçi', 'Doktor', 'Özel Hastane', 'Laboratuvar'],
  ev: ['İkea', 'Koçtaş', 'Bauhaus', 'Ahşapçı', 'Mobilyacı', 'Elektrikçi', 'Tesisatçı', 'Boyacı'],
  hizmet: ['Berber', 'Kuaför', 'Temizlik', 'Nakliye', 'Avukat', 'Fotoğrafçı']
};

const accounts = ['Garanti Bonus', 'Ziraat Bankası', 'Akbank', 'Yapı Kredi', 'İş Bankası', 'Nakit', 'Kredi Kartı', 'Banka'];

const categories = ['Market', 'Restoran', 'Ulaşım', 'Fatura', 'Elektronik', 'Giyim', 'Sağlık', 'Ev', 'Hizmet', 'Eğlence', 'Eğitim', 'Spor', 'Hediye', 'Gelir'];

const patterns = {
  expense: [
    '{vendor}\'dan {amount} TL {product} aldım {account} ile',
    '{vendor}\'den {amount} lira {product} satın aldım',
    '{vendor} {amount} TL ödedim {account}',
    '{vendor}\'ta {amount} lira harcadım',
    '{amount} TL {vendor}\'dan alışveriş {account}',
    '{vendor}\'den {amount} TL {product} {account} kartı ile',
    '{amount} lira {vendor} {product} aldım',
    '{vendor} {amount} TL hesap ödedim',
    '{product} {amount} TL {vendor}\'dan',
    '{vendor}\'ta {amount} lira {product} satın aldım {account}',
    '{amount} TL ödeme {vendor} {account} ile',
    '{vendor} alışveriş {amount} lira {product}',
    '{product} için {vendor}\'dan {amount} TL ödedim',
    '{vendor}\'de {amount} TL {product} aldım {account}',
    '{amount} lira {vendor} {product} {account} kartı',
    '{vendor} {product} {amount} TL ödeme',
    '{product} {vendor}\'dan {amount} lira {account}',
    '{vendor}\'ta {product} {amount} TL satın aldım',
    '{amount} TL {product} {vendor} {account} ile',
    '{vendor} {amount} lira {product} alışverişi'
  ],
  income: [
    'Bu ay {amount} TL maaş aldım',
    '{amount} lira maaş geldi',
    'Freelance {amount} TL kazandım',
    '{amount} TL bonus aldım',
    'Ek iş {amount} lira gelir',
    '{amount} TL danışmanlık ücreti',
    'Satış {amount} lira aldım',
    '{amount} TL kira geliri',
    'Proje {amount} lira ödeme aldım',
    '{amount} TL çevirmen ücreti',
    'Online satış {amount} lira',
    '{amount} TL komisyon aldım',
    'İş {amount} lira ödeme',
    '{amount} TL hizmet bedeli'
  ],
  transfer: [
    '{account1}\'ten {account2}\'ye {amount} TL transfer',
    '{amount} lira {account1}\'dan {account2}\'ya gönderim',
    '{account2}\'ye {amount} TL havale {account1}\'den',
    'Transfer {amount} lira {account1} > {account2}',
    '{amount} TL para transferi {account1}\'dan {account2}\'ye'
  ]
};

const products = {
  market: ['market alışverişi', 'haftalık alışveriş', 'süt ekmek', 'sebze meyve', 'et ürünleri', 'temizlik malzemesi', 'gıda', 'organik ürün', 'donmuş gıda', 'şarküteri'],
  restoran: ['yemek', 'kahvaltı', 'öğle yemeği', 'akşam yemeği', 'fast food', 'hamburger menü', 'pizza', 'kahve', 'pasta', 'dondurma'],
  ulasim: ['yakıt', 'benzin', 'motorin', 'bilet', 'otobüs bileti', 'uçak bileti', 'taksi', 'park ücreti', 'köprü geçiş'],
  fatura: ['elektrik faturası', 'su faturası', 'doğalgaz faturası', 'telefon faturası', 'internet faturası'],
  elektronik: ['telefon', 'laptop', 'kulaklık', 'tablet', 'televizyon', 'ses sistemi', 'kamera'],
  giyim: ['tişört', 'pantolon', 'ayakkabı', 'ceket', 'elbise', 'gömlek', 'spor ayakkabı'],
  saglik: ['ilaç', 'vitamin', 'muayene', 'tahlil', 'tedavi'],
  ev: ['mobilya', 'masa', 'sandalye', 'dolap', 'yatak', 'halı', 'perde']
};

// Random helpers
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomAmount(min = 10, max = 5000) {
  const amount = Math.floor(Math.random() * (max - min + 1)) + min;
  // %30 ihtimalle ondalıklı yap
  return Math.random() > 0.7 ? parseFloat((amount + Math.random()).toFixed(2)) : amount;
}

function getRandomVendorByCategory(category) {
  const categoryMap = {
    'Market': 'market',
    'Restoran': 'restoran',
    'Ulaşım': 'ulasim',
    'Fatura': 'fatura',
    'Elektronik': 'elektronik',
    'Giyim': 'giyim',
    'Sağlık': 'saglik',
    'Ev': 'ev',
    'Hizmet': 'hizmet'
  };
  
  const vendorKey = categoryMap[category];
  return vendorKey ? getRandomElement(vendors[vendorKey]) : getRandomElement(vendors.market);
}

function getRandomProduct(category) {
  const categoryMap = {
    'Market': 'market',
    'Restoran': 'restoran',
    'Ulaşım': 'ulasim',
    'Fatura': 'fatura',
    'Elektronik': 'elektronik',
    'Giyim': 'giyim',
    'Sağlık': 'saglik',
    'Ev': 'ev'
  };
  
  const productKey = categoryMap[category];
  return productKey ? getRandomElement(products[productKey]) : 'ürün';
}

// Dataset generator
export function generateDataset(targetSize = 15000) {
  const dataset = [];
  let id = 1;
  
  // Type distribution: %70 expense, %20 income, %10 transfer
  const expenseCount = Math.floor(targetSize * 0.7);
  const incomeCount = Math.floor(targetSize * 0.2);
  const transferCount = targetSize - expenseCount - incomeCount;
  
  console.log(`Generating ${targetSize} samples: ${expenseCount} expenses, ${incomeCount} incomes, ${transferCount} transfers`);
  
  // Generate expenses
  for (let i = 0; i < expenseCount; i++) {
    const category = getRandomElement(categories.filter(c => c !== 'Gelir'));
    const vendor = getRandomVendorByCategory(category);
    const account = getRandomElement(accounts);
    const amount = getRandomAmount(5, 3000);
    const product = getRandomProduct(category);
    
    const pattern = getRandomElement(patterns.expense);
    const input = pattern
      .replace('{vendor}', vendor)
      .replace('{amount}', amount)
      .replace('{account}', account)
      .replace('{product}', product);
    
    dataset.push({
      id: id++,
      input,
      output: {
        amount,
        vendor,
        category,
        account,
        type: 'expense'
      }
    });
  }
  
  // Generate income
  for (let i = 0; i < incomeCount; i++) {
    const amount = getRandomAmount(1000, 15000);
    const pattern = getRandomElement(patterns.income);
    const input = pattern.replace('{amount}', amount);
    
    dataset.push({
      id: id++,
      input,
      output: {
        amount,
        vendor: 'Maaş',
        category: 'Gelir',
        account: null,
        type: 'income'
      }
    });
  }
  
  // Generate transfers
  for (let i = 0; i < transferCount; i++) {
    const amount = getRandomAmount(100, 5000);
    const account1 = getRandomElement(accounts);
    let account2 = getRandomElement(accounts);
    while (account2 === account1) {
      account2 = getRandomElement(accounts);
    }
    
    const pattern = getRandomElement(patterns.transfer);
    const input = pattern
      .replace('{amount}', amount)
      .replace('{account1}', account1)
      .replace('{account2}', account2);
    
    dataset.push({
      id: id++,
      input,
      output: {
        amount,
        vendor: null,
        category: 'Transfer',
        account: account1,
        type: 'transfer'
      }
    });
  }
  
  // Shuffle dataset
  for (let i = dataset.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [dataset[i], dataset[j]] = [dataset[j], dataset[i]];
  }
  
  // Update IDs
  dataset.forEach((item, index) => {
    item.id = index + 1;
  });
  
  return dataset;
}

// Save dataset to file
export async function saveDatasetToFile(dataset, filename = 'training_data.json') {
  const dataStr = JSON.stringify(dataset, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
