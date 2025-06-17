import React, { useState } from 'react';
import { useTransactionAI } from '../hooks/useTransactionAI';
import { generateDataset } from '../ai/datasetGenerator';

export default function AITestPage() {
  const {
    trainModel,
    predict,
    provideFeedback,
    clearModel,
    isLoading,
    isTraining,
    isInitialized,
    trainingProgress,
    modelInfo
  } = useTransactionAI('test-user-id');

  const [testInput, setTestInput] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [trainingOptions, setTrainingOptions] = useState({
    datasetSize: 100, // Çok hızlı test için
    epochs: 5,
    batchSize: 8
  });
  const [logs, setLogs] = useState([]);
  const [trainingStats, setTrainingStats] = useState({
    currentEpoch: 0,
    totalEpochs: 0,
    currentLoss: 0,
    bestLoss: 999,
    samplesProcessed: 0,
    totalSamples: 0,
    isGeneratingData: false,
    isTrainingModel: false,
    timeElapsed: 0,
    estimatedTimeRemaining: 0
  });
  const [startTime, setStartTime] = useState(null);

  // Log ekleme helper
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  // Model eğitimi
  const handleTrain = async () => {
    // Hemen başlangıç logunu ekle
    addLog('🎬 Eğitim başlatıldı! İşlem devam ediyor...', 'info');
    
    const startTime = Date.now();
    setStartTime(startTime);
    
    // Stats'ı reset et
    setTrainingStats({
      currentEpoch: 0,
      totalEpochs: trainingOptions.epochs,
      currentLoss: 0,
      bestLoss: 999,
      samplesProcessed: 0,
      totalSamples: trainingOptions.datasetSize,
      isGeneratingData: true,
      isTrainingModel: false,
      timeElapsed: 0,
      estimatedTimeRemaining: 0
    });
    
    addLog('🚀 Model eğitimi başlatılıyor...', 'info');
    addLog(`📊 ${trainingOptions.datasetSize} veri, ${trainingOptions.epochs} epoch, batch: ${trainingOptions.batchSize}`, 'info');
    
    try {
      await trainModel({
        ...trainingOptions,
        onDataGenerated: (samplesGenerated, totalSamples) => {
          setTrainingStats(prev => ({
            ...prev,
            samplesProcessed: samplesGenerated,
            totalSamples: totalSamples
          }));
          addLog(`📝 Dataset: ${samplesGenerated}/${totalSamples} örnekler oluşturuluyor...`, 'info');
        },
        onTrainingStart: () => {
          setTrainingStats(prev => ({
            ...prev,
            isGeneratingData: false,
            isTrainingModel: true
          }));
          addLog('🧠 Model eğitimi başladı...', 'info');
        },
        onEpochEnd: (epoch, logs) => {
          const elapsed = (Date.now() - startTime) / 1000;
          const epochsCompleted = epoch + 1;
          const epochsRemaining = trainingOptions.epochs - epochsCompleted;
          const avgTimePerEpoch = elapsed / epochsCompleted;
          const estimatedRemaining = avgTimePerEpoch * epochsRemaining;
          
          const currentLoss = logs.loss || 0;
          
          setTrainingStats(prev => ({
            ...prev,
            currentEpoch: epochsCompleted,
            currentLoss: currentLoss,
            bestLoss: Math.min(prev.bestLoss, currentLoss),
            timeElapsed: elapsed,
            estimatedTimeRemaining: estimatedRemaining
          }));
          
          addLog(`📈 Epoch ${epochsCompleted}/${trainingOptions.epochs}: loss=${currentLoss.toFixed(4)}, val_loss=${logs.val_loss?.toFixed(4)}, süre=${elapsed.toFixed(0)}s`, 'success');
        }
      });
      
      const totalTime = (Date.now() - startTime) / 1000;
      setTrainingStats(prev => ({
        ...prev,
        isTrainingModel: false,
        timeElapsed: totalTime
      }));
      
      addLog(`✅ Model eğitimi tamamlandı! Toplam süre: ${totalTime.toFixed(0)} saniye`, 'success');
    } catch (error) {
      setTrainingStats(prev => ({
        ...prev,
        isGeneratingData: false,
        isTrainingModel: false
      }));
      addLog(`❌ Eğitim hatası: ${error.message}`, 'error');
    }
  };

  // Test prediction
  const handlePredict = async () => {
    if (!testInput.trim()) {
      addLog('⚠️ Test metni boş olamaz', 'error');
      return;
    }
    
    if (!isInitialized) {
      addLog('⚠️ Model henüz eğitilmemiş', 'error');
      return;
    }
    
    addLog(`🔮 Tahmin: "${testInput}"`, 'info');
    
    try {
      const result = await predict(testInput);
      setPrediction(result);
      
      if (result) {
        addLog(`✅ Sonuç: ${result.amount} TL, ${result.vendor}, ${result.category}, ${result.account}`, 'success');
        addLog(`📊 Güven: V:${(result.confidence.vendor*100).toFixed(0)}% K:${(result.confidence.category*100).toFixed(0)}% H:${(result.confidence.account*100).toFixed(0)}%`, 'info');
      } else {
        addLog('❌ Tahmin başarısız - Model sonuç döndürmedi', 'error');
      }
    } catch (error) {
      addLog(`❌ Tahmin hatası: ${error.message}`, 'error');
      setPrediction(null);
    }
  };

  // Dataset önizleme
  const showDatasetSample = () => {
    if (isTraining) return; // Eğitim sırasında çalışmasın
    
    addLog('📊 Dataset Örneği Oluşturuluyor...', 'info');
    try {
      const sample = generateDataset(10);
      addLog('📊 Dataset Örneği:', 'info');
      sample.slice(0, 5).forEach((item, idx) => {
        addLog(`${idx + 1}. "${item.input}" → ${item.output.amount} TL, ${item.output.vendor}`, 'info');
      });
      addLog('✅ Örnek dataset oluşturuldu', 'success');
    } catch (error) {
      addLog(`❌ Dataset örneği hatası: ${error.message}`, 'error');
    }
  };

  // Model temizle
  const handleClear = async () => {
    if (isTraining) {
      addLog('⚠️ Eğitim devam ederken model silinemez', 'error');
      return;
    }
    
    if (window.confirm('Model silinsin mi?')) {
      addLog('🗑️ Model siliniyor...', 'info');
      await clearModel();
      addLog('✅ Model silindi', 'success');
      setPrediction(null);
    }
  };

  // Test örnekleri
  const testExamples = [
    'Migros\'tan 245 TL market alışverişi yaptım Garanti Bonus ile',
    'Seyhanlar 335 tl Garanti Bonus',
    'BİM\'den 89 lira süt ekmek aldım nakit',
    'Bu ay 8500 TL maaş aldım',
    'Shell\'den 350 lira benzin aldım Akbank kartı ile',
    'McDonald\'s\'tan 67 TL yemek sipariş ettim',
    'Ziraat\'ten Garanti\'ye 1500 TL transfer yaptım'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-lightPurple to-brand-lightGray p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand-purple mb-2">🧠 AI Model Test Sayfası</h1>
          <p className="text-gray-600">TensorFlow transaction parsing model'ini eğit ve test et</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Sol Panel - Model Yönetimi */}
          <div className="space-y-6">
            
            {/* Model Durumu */}
            <div className="bg-white/80 rounded-3xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-brand-purple mb-4 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-red-500'}`}></span>
                Model Durumu
              </h2>
              
              <div className="space-y-2 text-sm">
                <div>Durum: <span className={`font-semibold ${isInitialized ? 'text-green-600' : 'text-red-600'}`}>
                  {isInitialized ? 'Hazır ✅' : 'Eğitilmemiş ❌'}
                </span></div>
                
                {/* Training Status */}
                {isTraining && (
                  <div className="p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                    <div className="text-yellow-800 font-medium">🔄 Eğitim Devam Ediyor</div>
                    {trainingStats.isGeneratingData && (
                      <div className="text-yellow-600 text-xs">Veri oluşturuluyor...</div>
                    )}
                    {trainingStats.isTrainingModel && (
                      <div className="text-yellow-600 text-xs">
                        Epoch {trainingStats.currentEpoch}/{trainingStats.totalEpochs}
                      </div>
                    )}
                  </div>
                )}
                
                {modelInfo && (
                  <>
                    <div>Parametre: {modelInfo.totalParams?.toLocaleString()}</div>
                    <div>Vocab: {modelInfo.vocabSize?.toLocaleString()}</div>
                    <div>Vendor: {modelInfo.outputClasses?.vendors}</div>
                    <div>Kategori: {modelInfo.outputClasses?.categories}</div>
                  </>
                )}
              </div>
            </div>

            {/* Eğitim Ayarları */}
            <div className="bg-white/80 rounded-3xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-brand-purple mb-4">⚙️ Eğitim Ayarları</h2>
              
              <div className="space-y-4">
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
                    <option value={50}>50 (Süper Hızlı - 10 saniye)</option>
                    <option value={100}>100 (Çok Hızlı - 20 saniye)</option>
                    <option value={500}>500 (Hızlı - 1 dakika)</option>
                    <option value={1000}>1,000 (Test)</option>
                    <option value={5000}>5,000 (Normal)</option>
                    <option value={10000}>10,000 (Kaliteli)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Epoch</label>
                  <select
                    value={trainingOptions.epochs}
                    onChange={(e) => setTrainingOptions(prev => ({
                      ...prev,
                      epochs: parseInt(e.target.value)
                    }))}
                    className="w-full rounded-xl border border-gray-200 p-2"
                    disabled={isTraining}
                  >
                    <option value={3}>3 (Süper Hızlı)</option>
                    <option value={5}>5 (Çok Hızlı)</option>
                    <option value={10}>10 (Hızlı)</option>
                    <option value={20}>20 (Normal)</option>
                    <option value={50}>50 (Kaliteli)</option>
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
                    <option value={4}>4 (Çok Düşük RAM)</option>
                    <option value={8}>8 (Düşük RAM)</option>
                    <option value={16}>16 (Normal)</option>
                    <option value={32}>32 (Yüksek RAM)</option>
                  </select>
                </div>
              </div>

              {/* Detailed Progress */}
              {isTraining && (
                <div className="mt-4 space-y-3">
                  {/* Veri Oluşturma */}
                  {trainingStats.isGeneratingData && (
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <div className="flex justify-between text-sm mb-1">
                        <span>📝 Dataset Oluşturuluyor</span>
                        <span>{((trainingStats.samplesProcessed / trainingStats.totalSamples) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${(trainingStats.samplesProcessed / trainingStats.totalSamples) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {trainingStats.samplesProcessed.toLocaleString()} / {trainingStats.totalSamples.toLocaleString()} örnek
                      </div>
                    </div>
                  )}
                  
                  {/* Model Eğitimi */}
                  {trainingStats.isTrainingModel && (
                    <div className="p-3 bg-purple-50 rounded-xl space-y-2">
                      {/* Epoch Progress */}
                      <div className="flex justify-between text-sm mb-1">
                        <span>🧠 Model Eğitimi</span>
                        <span>{trainingProgress}%</span>
                      </div>
                      <div className="w-full bg-purple-200 rounded-full h-3">
                        <div 
                          className="bg-brand-purple h-3 rounded-full transition-all flex items-center justify-center"
                          style={{ width: `${trainingProgress}%` }}
                        >
                          <span className="text-xs text-white font-bold">
                            {trainingStats.currentEpoch}/{trainingStats.totalEpochs}
                          </span>
                        </div>
                      </div>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/70 p-2 rounded">
                          <div className="text-gray-600">Mevcut Loss</div>
                          <div className="font-bold text-purple-600">{trainingStats.currentLoss.toFixed(4)}</div>
                        </div>
                        <div className="bg-white/70 p-2 rounded">
                          <div className="text-gray-600">En İyi Loss</div>
                          <div className="font-bold text-green-600">{trainingStats.bestLoss === 999 ? '-' : trainingStats.bestLoss.toFixed(4)}</div>
                        </div>
                        <div className="bg-white/70 p-2 rounded">
                          <div className="text-gray-600">Geçen Süre</div>
                          <div className="font-bold">{Math.floor(trainingStats.timeElapsed / 60)}:{(trainingStats.timeElapsed % 60).toFixed(0).padStart(2, '0')}</div>
                        </div>
                        <div className="bg-white/70 p-2 rounded">
                          <div className="text-gray-600">Kalan Süre</div>
                          <div className="font-bold">{Math.floor(trainingStats.estimatedTimeRemaining / 60)}:{(trainingStats.estimatedTimeRemaining % 60).toFixed(0).padStart(2, '0')}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Genel Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Toplam İlerleme</span>
                      <span>{trainingProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-brand-purple h-2 rounded-full transition-all"
                        style={{ width: `${trainingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleTrain}
                  disabled={isTraining}
                  className={`flex-1 py-2 rounded-xl font-semibold transition ${
                    isTraining
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-brand-purple text-white hover:bg-purple-900'
                  }`}
                >
                  {isTraining ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Eğitiliyor...
                    </span>
                  ) : (
                    '🚀 Eğit'
                  )}
                </button>

                <button
                  onClick={showDatasetSample}
                  disabled={isTraining}
                  className={`px-4 py-2 rounded-xl border transition ${
                    isTraining 
                      ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                      : 'border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white'
                  }`}
                >
                  📊 Örnek
                </button>

                <button
                  onClick={handleClear}
                  disabled={isTraining}
                  className={`px-4 py-2 rounded-xl border transition ${
                    isTraining 
                      ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                      : 'border-red-500 text-red-500 hover:bg-red-50'
                  }`}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>

          {/* Sağ Panel - Test */}
          <div className="space-y-6">
            
            {/* Test Input */}
            <div className="bg-white/80 rounded-3xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-brand-purple mb-4">🔮 Model Test</h2>
              
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Örnek: Seyhanlar 335 tl Garanti Bonus"
                className="w-full h-20 rounded-xl border border-gray-200 p-3 resize-none"
                disabled={!isInitialized || isLoading}
              />

              <button
                onClick={handlePredict}
                disabled={!isInitialized || isLoading || !testInput.trim()}
                className={`w-full mt-3 py-2 rounded-xl font-semibold transition ${
                  (!isInitialized || isLoading || !testInput.trim())
                    ? 'bg-gray-300 text-gray-500'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isLoading ? 'Tahmin ediliyor...' : '🔮 Tahmin Et'}
              </button>

              {/* Test Examples */}
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Hızlı Test Örnekleri:</div>
                <div className="space-y-1">
                  {testExamples.slice(0, 4).map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTestInput(example)}
                      className="block w-full text-left text-xs p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Prediction Result */}
            {prediction && (
              <div className="bg-white/80 rounded-3xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-brand-purple mb-4">📋 Tahmin Sonucu</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Tutar:</span>
                    <span className="text-green-600 font-bold">{prediction.amount} TL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Vendor:</span>
                    <span>{prediction.vendor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Kategori:</span>
                    <span>{prediction.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Hesap:</span>
                    <span>{prediction.account}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tip:</span>
                    <span>{prediction.type}</span>
                  </div>
                  
                  {/* Confidence Scores */}
                  <div className="border-t pt-3 mt-3">
                    <div className="text-sm font-medium mb-2">Güven Skorları:</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Vendor:</span>
                        <span>{(prediction.confidence.vendor * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kategori:</span>
                        <span>{(prediction.confidence.category * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hesap:</span>
                        <span>{(prediction.confidence.account * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logs Panel */}
        <div className="mt-6 bg-white/80 rounded-3xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-brand-purple flex items-center gap-2">
              📝 Loglar
              {logs.length > 0 && (
                <span className="text-sm bg-brand-purple text-white px-2 py-1 rounded-full">
                  {logs.length}
                </span>
              )}
            </h2>
            <button
              onClick={() => setLogs([])}
              disabled={logs.length === 0}
              className={`text-sm transition ${
                logs.length === 0 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Temizle
            </button>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                <div className="text-4xl mb-2">📋</div>
                <div>Henüz log yok...</div>
                <div className="text-xs mt-1">Eğitime başlayınca loglar burada görünecek</div>
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, idx) => (
                  <div key={idx} className={`flex items-start gap-2 ${
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'success' ? 'text-green-400' :
                    'text-gray-300'
                  }`}>
                    <span className="text-gray-500 text-xs mt-0.5 min-w-[60px]">[{log.timestamp}]</span>
                    <span className="flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Auto scroll to bottom */}
            <div ref={el => {
              if (el && logs.length > 0) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
