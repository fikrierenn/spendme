// Supabase AI tables SQL setup

-- AI training data tablosu
CREATE TABLE IF NOT EXISTS spendme_ai_training_data (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  input_text text NOT NULL,
  expected_amount numeric,
  expected_vendor text,
  expected_category text,
  expected_account text,
  expected_type text CHECK (expected_type IN ('expense', 'income', 'transfer')),
  user_id uuid REFERENCES auth.users(id),
  is_validated boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- AI predictions tablosu (model çıktıları)
CREATE TABLE IF NOT EXISTS spendme_ai_predictions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  input_text text NOT NULL,
  predicted_amount numeric,
  predicted_vendor text,
  predicted_category text,
  predicted_account text,
  predicted_type text,
  confidence_scores jsonb, -- { vendor: 0.85, category: 0.92, ... }
  model_version text DEFAULT 'v1.0',
  user_id uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- AI feedback tablosu (kullanıcı düzeltmeleri)
CREATE TABLE IF NOT EXISTS spendme_ai_feedback (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id uuid REFERENCES spendme_ai_predictions(id),
  user_id uuid REFERENCES auth.users(id),
  input_text text NOT NULL,
  corrected_amount numeric,
  corrected_vendor text,
  corrected_category text,
  corrected_account text,
  corrected_type text,
  feedback_type text DEFAULT 'correction', -- 'correction', 'approval'
  created_at timestamp with time zone DEFAULT now()
);

-- AI model metadata tablosu
CREATE TABLE IF NOT EXISTS spendme_ai_models (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  model_name text NOT NULL,
  model_version text NOT NULL,
  training_data_count integer,
  accuracy_metrics jsonb, -- { vendor: 0.85, category: 0.92, ... }
  model_config jsonb, -- { epochs: 50, batchSize: 32, ... }
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_training_data_user_id ON spendme_ai_training_data(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_training_data_validated ON spendme_ai_training_data(is_validated);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_user_id ON spendme_ai_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_user_id ON spendme_ai_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_models_user_id ON spendme_ai_models(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_models_active ON spendme_ai_models(is_active);

-- RLS Policies
ALTER TABLE spendme_ai_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE spendme_ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spendme_ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE spendme_ai_models ENABLE ROW LEVEL SECURITY;

-- Training data policies
CREATE POLICY "Users can view their own training data" ON spendme_ai_training_data
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own training data" ON spendme_ai_training_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training data" ON spendme_ai_training_data
  FOR UPDATE USING (auth.uid() = user_id);

-- Predictions policies
CREATE POLICY "Users can view their own predictions" ON spendme_ai_predictions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own predictions" ON spendme_ai_predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Feedback policies
CREATE POLICY "Users can view their own feedback" ON spendme_ai_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback" ON spendme_ai_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Models policies
CREATE POLICY "Users can view their own models" ON spendme_ai_models
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own models" ON spendme_ai_models
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own models" ON spendme_ai_models
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_ai_training_data_updated_at 
  BEFORE UPDATE ON spendme_ai_training_data 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_models_updated_at 
  BEFORE UPDATE ON spendme_ai_models 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data insertion function
CREATE OR REPLACE FUNCTION insert_sample_training_data()
RETURNS void AS $$
BEGIN
  -- Insert some global training data (user_id = NULL)
  INSERT INTO spendme_ai_training_data (
    input_text, expected_amount, expected_vendor, expected_category, 
    expected_account, expected_type, user_id, is_validated
  ) VALUES 
  ('Migros''tan 245 TL market alışverişi yaptım', 245, 'Migros', 'Market', 'Kredi Kartı', 'expense', NULL, true),
  ('BİM''den 89 lira süt ekmek aldım', 89, 'BİM', 'Market', 'Nakit', 'expense', NULL, true),
  ('Bu ay 8500 TL maaş aldım', 8500, 'Maaş', 'Gelir', NULL, 'income', NULL, true),
  ('Shell''den 350 lira benzin aldım', 350, 'Shell', 'Ulaşım', 'Kredi Kartı', 'expense', NULL, true),
  ('Elektrik faturası 289 TL ödedim', 289, 'BEDAŞ', 'Fatura', 'Banka', 'expense', NULL, true)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Execute sample data insertion
SELECT insert_sample_training_data();
