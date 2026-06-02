-- Add implant_planned and denture_planned conditions for missing teeth treatment planning
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'implant_planned'
      AND enumtypid = 'tooth_condition'::regtype
  ) THEN
    ALTER TYPE tooth_condition ADD VALUE 'implant_planned';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'denture_planned'
      AND enumtypid = 'tooth_condition'::regtype
  ) THEN
    ALTER TYPE tooth_condition ADD VALUE 'denture_planned';
  END IF;
END$$;
