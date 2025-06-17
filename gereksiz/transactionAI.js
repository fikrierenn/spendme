import * as tf from '@tensorflow/tfjs';
import { supabase } from '../utils/supabaseClient';

export class TransactionAI {
  constructor() {
    this.model = null;
    this.tokenizer = null;
    this.labelEncoders = {};
    this.maxLength = 50;
    this.vocabSize = 10000;
    this.isInitialized = false;
  }

  // Tokenizer oluştur (Türkçe için optimized)
  createTokenizer(texts) {
    console.log('Creating tokenizer for Turkish text...');
    
    const allWords = [];
    
    texts.forEach(text => {
      const words = text.toLowerCase()
        .replace(/[^\wçğıöşü\s]/g, ' ') // Türkçe karakterler koruma
        .split(/\s+/)
        .filter(w => w.length > 1);
      
      allWords.push(...words);
    });

    // Frequency count
    const wordFreq = {};
    allWords.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Most frequent words (vocab size limit)
    const sortedWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, this.vocabSize - 2);

    this.tokenizer = {
      wordToIndex: {
        '<PAD>': 0,
        '<UNK>': 1,
        ...Object.fromEntries(
          sortedWords.map(([word], idx) => [word, idx + 2])
        )
      },
      indexToWord: {
        0: '<PAD>',
        1: '<UNK>',
        ...Object.fromEntries(
          sortedWords.map(([word], idx) => [idx + 2, word])
        )
      }
    };

    console.log(`Tokenizer created with vocab size: ${Object.keys(this.tokenizer.wordToIndex).length}`);
    return this.tokenizer;
  }

  // Text'i sequence'e çevir
  textToSequence(text) {
    if (!this.tokenizer) {
      throw new Error('Tokenizer not initialized');
    }

    const words = text.toLowerCase()
      .replace(/[^\wçğıöşü\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1);

    const sequence = words.map(word => 
      this.tokenizer.wordToIndex[word] || this.tokenizer.wordToIndex['<UNK>']
    );

    // Padding veya truncate
    if (sequence.length > this.maxLength) {
      return sequence.slice(0, this.maxLength);
    } else {
      return [...sequence, ...Array(this.maxLength - sequence.length).fill(0)];
    }
  }

  // Label encoders oluştur
  createLabelEncoders(data) {
    console.log('Creating label encoders...');
    
    const vendors = [...new Set(data.map(d => d.output.vendor).filter(v => v))];
    const categories = [...new Set(data.map(d => d.output.category).filter(c => c))];
    const accounts = [...new Set(data.map(d => d.output.account).filter(a => a))];
    const types = [...new Set(data.map(d => d.output.type).filter(t => t))];

    this.labelEncoders = {
      vendor: {
        labelToIndex: Object.fromEntries(vendors.map((label, idx) => [label, idx])),
        indexToLabel: Object.fromEntries(vendors.map((label, idx) => [idx, label])),
        size: vendors.length
      },
      category: {
        labelToIndex: Object.fromEntries(categories.map((label, idx) => [label, idx])),
        indexToLabel: Object.fromEntries(categories.map((label, idx) => [idx, label])),
        size: categories.length
      },
      account: {
        labelToIndex: Object.fromEntries(accounts.map((label, idx) => [label, idx])),
        indexToLabel: Object.fromEntries(accounts.map((label, idx) => [idx, label])),
        size: accounts.length
      },
      type: {
        labelToIndex: Object.fromEntries(types.map((label, idx) => [label, idx])),
        indexToLabel: Object.fromEntries(types.map((label, idx) => [idx, label])),
        size: types.length
      }
    };

    console.log('Label encoders created:', {
      vendors: vendors.length,
      categories: categories.length,
      accounts: accounts.length,
      types: types.length
    });
  }

  // Model mimarisini oluştur
  createModel() {
    console.log('Creating TensorFlow model...');

    const inputLayer = tf.input({ shape: [this.maxLength] });
    
    // Embedding layer
    let x = tf.layers.embedding({
      inputDim: this.vocabSize,
      outputDim: 128,
      maskZero: true
    }).apply(inputLayer);
    
    // LSTM layers
    x = tf.layers.lstm({
      units: 256,
      returnSequences: true,
      dropout: 0.3,
      recurrentDropout: 0.3
    }).apply(x);
    
    x = tf.layers.lstm({
      units: 128,
      dropout: 0.3,
      recurrentDropout: 0.3
    }).apply(x);
    
    // Dense layer
    x = tf.layers.dense({
      units: 512,
      activation: 'relu'
    }).apply(x);
    
    x = tf.layers.dropout({ rate: 0.5 }).apply(x);
    
    // Output heads
    const amountOutput = tf.layers.dense({
      units: 1,
      activation: 'linear',
      name: 'amount'
    }).apply(x);

    const vendorOutput = tf.layers.dense({
      units: this.labelEncoders.vendor.size,
      activation: 'softmax',
      name: 'vendor'
    }).apply(x);

    const categoryOutput = tf.layers.dense({
      units: this.labelEncoders.category.size,
      activation: 'softmax',
      name: 'category'
    }).apply(x);

    const accountOutput = tf.layers.dense({
      units: this.labelEncoders.account.size,
      activation: 'softmax',
      name: 'account'
    }).apply(x);

    const typeOutput = tf.layers.dense({
      units: this.labelEncoders.type.size,
      activation: 'softmax',
      name: 'type'
    }).apply(x);

    // Multi-output model
    this.model = tf.model({
      inputs: inputLayer,
      outputs: [amountOutput, vendorOutput, categoryOutput, accountOutput, typeOutput]
    });

    // Compile model
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: {
        amount: 'meanSquaredError',
        vendor: 'categoricalCrossentropy',
        category: 'categoricalCrossentropy',
        account: 'categoricalCrossentropy',
        type: 'categoricalCrossentropy'
      },
      metrics: {
        amount: 'mae',
        vendor: 'accuracy',
        category: 'accuracy',
        account: 'accuracy',
        type: 'accuracy'
      }
    });

    console.log('Model created and compiled');
    return this.model;
  }

  // Training data hazırla
  prepareTrainingData(dataset) {
    console.log('Preparing training data...');

    // Create tokenizer and label encoders
    const texts = dataset.map(d => d.input);
    this.createTokenizer(texts);
    this.createLabelEncoders(dataset);

    // Convert texts to sequences
    const sequences = texts.map(text => this.textToSequence(text));
    const X = tf.tensor2d(sequences);

    // Prepare labels
    const amounts = dataset.map(d => d.output.amount || 0);
    
    const vendors = dataset.map(d => {
      const vendor = d.output.vendor;
      const oneHot = Array(this.labelEncoders.vendor.size).fill(0);
      if (vendor && this.labelEncoders.vendor.labelToIndex[vendor] !== undefined) {
        oneHot[this.labelEncoders.vendor.labelToIndex[vendor]] = 1;
      }
      return oneHot;
    });

    const categories = dataset.map(d => {
      const category = d.output.category;
      const oneHot = Array(this.labelEncoders.category.size).fill(0);
      if (category && this.labelEncoders.category.labelToIndex[category] !== undefined) {
        oneHot[this.labelEncoders.category.labelToIndex[category]] = 1;
      }
      return oneHot;
    });

    const accounts = dataset.map(d => {
      const account = d.output.account;
      const oneHot = Array(this.labelEncoders.account.size).fill(0);
      if (account && this.labelEncoders.account.labelToIndex[account] !== undefined) {
        oneHot[this.labelEncoders.account.labelToIndex[account]] = 1;
      }
      return oneHot;
    });

    const types = dataset.map(d => {
      const type = d.output.type;
      const oneHot = Array(this.labelEncoders.type.size).fill(0);
      if (type && this.labelEncoders.type.labelToIndex[type] !== undefined) {
        oneHot[this.labelEncoders.type.labelToIndex[type]] = 1;
      }
      return oneHot;
    });

    const Y = {
      amount: tf.tensor1d(amounts),
      vendor: tf.tensor2d(vendors),
      category: tf.tensor2d(categories),
      account: tf.tensor2d(accounts),
      type: tf.tensor2d(types)
    };

    console.log('Training data prepared:', {
      samples: dataset.length,
      inputShape: X.shape,
      amountTargets: amounts.length
    });

    return { X, Y };
  }

  // Model'i eğit
  async trainModel(dataset, options = {}) {
    const {
      epochs = 50,
      batchSize = 32,
      validationSplit = 0.2,
      onEpochEnd = null
    } = options;

    console.log(`Starting training with ${dataset.length} samples...`);

    // Prepare data
    const { X, Y } = this.prepareTrainingData(dataset);

    // Create model if not exists
    if (!this.model) {
      this.createModel();
    }

    // Training callbacks
    const callbacks = {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, val_loss = ${logs.val_loss?.toFixed(4)}`);
        if (onEpochEnd) onEpochEnd(epoch, logs);
      }
    };

    // Train model
    const history = await this.model.fit(X, Y, {
      epochs,
      batchSize,
      validationSplit,
      shuffle: true,
      callbacks
    });

    this.isInitialized = true;
    console.log('Training completed!');

    return history;
  }

  // Prediction yap
  async predict(inputText) {
    if (!this.model || !this.tokenizer || !this.isInitialized) {
      throw new Error('Model not trained yet. Call trainModel() first.');
    }

    const sequence = this.textToSequence(inputText);
    const inputTensor = tf.tensor2d([sequence]);

    const predictions = this.model.predict(inputTensor);
    const [amountPred, vendorPred, categoryPred, accountPred, typePred] = predictions;

    // Get predictions as arrays
    const amountData = await amountPred.data();
    const vendorData = await vendorPred.data();
    const categoryData = await categoryPred.data();
    const accountData = await accountPred.data();
    const typeData = await typePred.data();

    // Decode predictions
    const amount = amountData[0];
    
    const vendorIndex = vendorData.indexOf(Math.max(...vendorData));
    const vendor = this.labelEncoders.vendor.indexToLabel[vendorIndex];
    
    const categoryIndex = categoryData.indexOf(Math.max(...categoryData));
    const category = this.labelEncoders.category.indexToLabel[categoryIndex];
    
    const accountIndex = accountData.indexOf(Math.max(...accountData));
    const account = this.labelEncoders.account.indexToLabel[accountIndex];
    
    const typeIndex = typeData.indexOf(Math.max(...typeData));
    const type = this.labelEncoders.type.indexToLabel[typeIndex];

    // Clean up tensors
    inputTensor.dispose();
    amountPred.dispose();
    vendorPred.dispose();
    categoryPred.dispose();
    accountPred.dispose();
    typePred.dispose();

    return {
      amount: Math.round(amount * 100) / 100, // Round to 2 decimals
      vendor,
      category,
      account,
      type,
      confidence: {
        vendor: Math.max(...vendorData),
        category: Math.max(...categoryData),
        account: Math.max(...accountData),
        type: Math.max(...typeData)
      }
    };
  }

  // Model'i kaydet
  async saveModel(name = 'transaction-ai-model') {
    await this.model.save(`indexeddb://${name}`);
  }

  // Model'i yükle
  async loadModel(name = 'transaction-ai-model') {
    try {
      this.model = await tf.loadLayersModel(`indexeddb://${name}`);
      
      // Tokenizer ve encoders'ı da localStorage'dan yükle
      const tokenizerData = localStorage.getItem(`${name}-tokenizer`);
      const encodersData = localStorage.getItem(`${name}-encoders`);

      if (tokenizerData) {
        this.tokenizer = JSON.parse(tokenizerData);
      }

      if (encodersData) {
        this.labelEncoders = JSON.parse(encodersData);
      }

      console.log('Model and tokenizer loaded');
    } catch (error) {
      console.error('Error loading model:', error);
    }
  }
}