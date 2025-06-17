import { useState, useRef, useCallback, useEffect } from 'react';
import { TransactionAI } from '../ai/transactionAI';
import { generateDataset } from '../ai/datasetGenerator';

export function useTransactionAI(userId) {
  const [isLoading, setIsLoading] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [modelInfo, setModelInfo] = useState(null);
  const aiRef = useRef(new TransactionAI());

  // Component mount olduğunda model yüklemeyi dene
  useEffect(() => {
    async function tryLoadModel() {
      const loaded = await aiRef.current.loadModel();
      if (loaded) {
        setIsInitialized(true);
        setModelInfo(aiRef.current.getModelInfo());
        console.log('Existing model loaded');
      } else {
        console.log('No existing model found');
      }
    }
    
    if (userId) {
      tryLoadModel();
    }
  }, [userId]);

  // Model eğitimi
  const trainModel = useCallback(async (options = {}) => {
    const {
      datasetSize = 15000,
      epochs = 50,
      batchSize = 32,
      validationSplit = 0.2,
      onDataGenerated = null,
      onTrainingStart = null,
      onEpochEnd = null
    } = options;

    setIsTraining(true);
    setTrainingProgress(0);

    try {
      console.log(`Generating ${datasetSize} training samples...`);
      
      // Dataset oluşturma progress
      const dataset = generateDataset(datasetSize);
      if (onDataGenerated) {
        onDataGenerated(datasetSize, datasetSize);
      }
      
      console.log('Starting model training...');
      if (onTrainingStart) {
        onTrainingStart();
      }
      
      await aiRef.current.trainModel(dataset, {
        epochs,
        batchSize,
        validationSplit,
        onEpochEnd: (epoch, logs) => {
          const progress = ((epoch + 1) / epochs) * 100;
          setTrainingProgress(Math.round(progress));
          
          // External callback
          if (onEpochEnd) {
            onEpochEnd(epoch, logs);
          }
        }
      });

      // Model'i kaydet
      await aiRef.current.saveModel();
      
      setIsInitialized(true);
      setModelInfo(aiRef.current.getModelInfo());
      console.log('Model training completed and saved!');
      
    } catch (error) {
      console.error('Training error:', error);
      throw error;
    } finally {
      setIsTraining(false);
      setTrainingProgress(0);
    }
  }, []);

  // Prediction
  const predict = useCallback(async (inputText) => {
    if (!inputText || inputText.length < 3) {
      return null;
    }

    if (!isInitialized) {
      console.warn('Model not initialized yet');
      return null;
    }

    setIsLoading(true);
    try {
      const result = await aiRef.current.predict(inputText);
      return result;
    } catch (error) {
      console.error('Prediction error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // User feedback
  const provideFeedback = useCallback(async (inputText, corrections) => {
    if (!userId) return;
    
    try {
      await aiRef.current.updateWithFeedback(inputText, corrections, userId);
      console.log('Feedback provided successfully');
    } catch (error) {
      console.error('Feedback error:', error);
    }
  }, [userId]);

  // Model bilgilerini güncelle
  const refreshModelInfo = useCallback(() => {
    if (isInitialized) {
      setModelInfo(aiRef.current.getModelInfo());
    }
  }, [isInitialized]);

  // Model'i sil
  const clearModel = useCallback(async () => {
    try {
      // LocalStorage'dan sil
      const modelName = 'transaction-ai-model';
      localStorage.removeItem(`${modelName}-tokenizer`);
      localStorage.removeItem(`${modelName}-encoders`);
      
      // Memory'den temizle
      aiRef.current = new TransactionAI();
      setIsInitialized(false);
      setModelInfo(null);
      
      console.log('Model cleared');
    } catch (error) {
      console.error('Error clearing model:', error);
    }
  }, []);

  return {
    // Core functions
    predict,
    trainModel,
    provideFeedback,
    
    // Model management
    clearModel,
    refreshModelInfo,
    
    // State
    isLoading,
    isTraining,
    isInitialized,
    trainingProgress,
    modelInfo
  };
}
