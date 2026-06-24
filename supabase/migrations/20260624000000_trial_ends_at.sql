ALTER TABLE clinica
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

UPDATE clinica
  SET trial_ends_at = created_at + INTERVAL '3 days'
  WHERE trial_ends_at IS NULL;

ALTER TABLE clinica
  ALTER COLUMN trial_ends_at SET DEFAULT NOW() + INTERVAL '3 days';
