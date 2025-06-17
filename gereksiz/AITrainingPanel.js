import React, { useState } from 'react';
import { useTransactionAI } from '../hooks/useTransactionAI';

export default function AITrainingPanel({ userId }) {
  const {
    trainModel,
    clearModel,
    isTraining,
    isInitialized,
    trainingProgress,
    modelInfo
  } = useTransactionAI(userId);

  const [trainingOptions, setTrainingOptions] = useState({
    datasetSize: 15000,
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2
  });

  const handleTrain = async () => {
    try {
      await trainModel(trainingOptions);
      alert('Model eğitimi tamamlandı!');
    } catch (error) {
      alert('Eğitim sırasında hata: ' + error.message);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Model silinsin mi? Bu işlem geri alınamaz.')) {
      await clearModel();
      alert('Model silindi.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/80 rounded-3xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🧠</span>
        <div className="text-2xl font-bold text-brand-purple">AI Model Yönetimi</div>
      </div>

      {/* Model Status */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-3 h-3 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          <span className="font-semibold">Model Durumu: {isInitialized ? 'Hazır' : 'Eğitilmemiş'}</span>
        </div>
        
        {modelInfo && (
          <div className="text-sm text-gray-600 space-y-1">
            <div>Toplam Parametre: {modelInfo.totalParams?.toLocaleString()}</div>
            <div>Kelime Dağarcığı: {modelInfo.vocabSize?.toLocaleString()}</div>
            <div>Vendor Sınıfı: {modelInfo.outputClasses?.vendors}</div>
            <div>Kategori Sınıfı: {modelInfo.outputClasses?.categories}</div>
          </div>
        )}
      </div>

      {/* Training Options */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Eğitim Ayarları</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Dataset Boyutu</label>
            <select
              value={trainingOptions.datasetSize}
              onChange={(e) => setTrainingOptions(prev => ({
                ...prev,
                datasetSize: parseInt(e.target.value)
              }))}
              className="w-full rounded-xl border border-gray-200 p-2"
              disabled={isTraining}
            >
              <option value={5000}>5,000 (Hızlı Test)</option>
              <option value={10000}>10,000 (Orta)</option>
              <option value={15000}>15,000 (Önerilen)</option>
              <option value={20000}>20,000 (Yüksek Kalite)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Epoch Sayısı</label>
            <select
              value={trainingOptions.epochs}
              onChange={(e) => setTrainingOptions(prev => ({
                ...prev,
                epochs: parseInt(e.target.value)
              }))}
              className="w-full rounded-xl border border-gray-200 p-2"
              disabled={isTraining}
            >
              <option value={20}>20 (Hızlı)</option>
              <option value={50}>50 (Önerilen)</option>
              <option value={100}>100 (Yüksek Kalite)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Batch Size</label>
            <select
              value={trainingOptions.batchSize}
              onChange={(e) => setTrainingOptions(prev => ({
                ...prev,
                batchSize: parseInt(e.target.value)
              }))}
              className="w-full rounded-xl border border-gray-200 p-2"
              disabled={isTraining}
            >
              <option value={16}>16 (Düşük RAM)</option>
              <option value={32}>32 (Önerilen)</option>
              <option value={64}>64 (Yüksek RAM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Training Progress */}
      {isTraining && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Eğitim İlerlemesi</span>
            <span className="text-sm">{trainingProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-brand-purple h-2 rounded-full transition-all duration-300"
              style={{ width: `${trainingProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Model eğitiliyor... Bu işlem birkaç dakika sürebilir.
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleTrain}
          disabled={isTraining}
          className={`w-full py-3 rounded-2xl font-semibold transition-all ${
            isTraining
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-brand-purple text-white hover:bg-purple-900 active:scale-95'
          }`}
        >
          {isTraining ? 'Eğitiliyor...' : isInitialized ? 'Yeniden Eğit' : 'Model Eğit'}
        </button>

        {isInitialized && (
          <button
            onClick={handleClear}
            disabled={isTraining}
            className="w-full py-3 rounded-2xl font-semibold border-2 border-red-500 text-red-500 hover:bg-red-50 transition-all"
          >
            Model'i Sil
          </button>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <div className="text-sm text-blue-800">
          <strong>💡 Bilgi:</strong> İlk eğitim 2-5 dakika sürebilir. 
          Model eğitildikten sonra otomatik olarak kaydedilir ve 
          sonraki kullanımlarda hızlıca yüklenir.
        </div>
      </div>
    </div>
  );
}
