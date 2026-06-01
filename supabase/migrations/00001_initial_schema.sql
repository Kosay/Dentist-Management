-- Dental Clinic Management SaaS - Initial Schema
-- Multi-tenant, RLS-enabled, audit-logged, soft-delete

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'dentist', 'nurse', 'receptionist');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE treatment_status AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE invoice_status AS ENUM ('draft', 'partially_paid', 'paid', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'bank_transfer', 'insurance');
CREATE TYPE image_category AS ENUM ('before_treatment', 'after_treatment', 'clinical_photo', 'xray');
CREATE TYPE subscription_status AS ENUM ('active', 'frozen', 'expired', 'cancelled');
CREATE TYPE tooth_condition AS ENUM ('healthy', 'planned', 'in_progress', 'completed', 'diseased', 'missing');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE timeline_event_type AS ENUM (
  'patient_created', 'appointment_created', 'appointment_updated',
  'visit_completed', 'treatment_added', 'treatment_updated',
  'invoice_created', 'payment_received', 'image_uploaded',
  'odontogram_updated', 'consent_signed'
);

-- ============================================================
-- CLINICS (Tenants)
-- ============================================================
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ar TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  address_ar TEXT,
  logo_url TEXT,
  license_number TEXT,
  subscription_status subscription_status NOT NULL DEFAULT 'active',
  subscription_expires_at TIMESTAMPTZ,
  max_users INTEGER NOT NULL DEFAULT 5,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  full_name_ar TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'dentist',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_profiles_clinic ON profiles(clinic_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_role ON profiles(role) WHERE deleted_at IS NULL;

-- ============================================================
-- PATIENTS
-- ============================================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),

  -- Personal
  full_name TEXT NOT NULL,
  full_name_ar TEXT,
  gender gender_type,
  date_of_birth DATE,
  height_cm NUMERIC(5,1),
  weight_kg NUMERIC(5,1),
  occupation TEXT,
  address TEXT,
  mobile TEXT,
  email TEXT,

  -- Companion
  companion_name TEXT,
  companion_mobile TEXT,

  -- Medical
  drug_allergies TEXT,
  current_medications TEXT,
  is_smoker BOOLEAN DEFAULT false,
  alcohol_consumption BOOLEAN DEFAULT false,
  has_heart_disease BOOLEAN DEFAULT false,
  has_diabetes BOOLEAN DEFAULT false,
  blood_pressure_notes TEXT,
  medical_notes TEXT,

  -- File number
  file_number TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_patients_clinic ON patients(clinic_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_name ON patients(clinic_id, full_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_file_number ON patients(clinic_id, file_number) WHERE deleted_at IS NULL;

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  dentist_id UUID NOT NULL REFERENCES profiles(id),
  created_by UUID NOT NULL REFERENCES profiles(id),

  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_appointments_clinic_date ON appointments(clinic_id, appointment_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_patient ON appointments(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_appointments_dentist ON appointments(dentist_id, appointment_date) WHERE deleted_at IS NULL;

-- ============================================================
-- PATIENT VISITS
-- ============================================================
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  dentist_id UUID NOT NULL REFERENCES profiles(id),
  appointment_id UUID REFERENCES appointments(id),

  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  chief_complaint TEXT,
  diagnosis TEXT,
  treatment_performed TEXT,
  prescription TEXT,
  next_visit_date DATE,
  clinical_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_visits_patient ON visits(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_visits_clinic_date ON visits(clinic_id, visit_date) WHERE deleted_at IS NULL;

-- ============================================================
-- DENTAL CHART (ODONTOGRAM)
-- ============================================================
CREATE TABLE dental_charts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(patient_id, is_primary)
);

CREATE TABLE tooth_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chart_id UUID NOT NULL REFERENCES dental_charts(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  tooth_number INTEGER NOT NULL,
  tooth_name TEXT,
  quadrant INTEGER NOT NULL CHECK (quadrant BETWEEN 1 AND 4),
  position INTEGER NOT NULL,
  condition tooth_condition NOT NULL DEFAULT 'healthy',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(chart_id, tooth_number)
);

CREATE TABLE surface_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tooth_record_id UUID NOT NULL REFERENCES tooth_records(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  surface TEXT NOT NULL CHECK (surface IN ('mesial','distal','buccal','lingual','occlusal','incisal')),
  condition tooth_condition NOT NULL DEFAULT 'healthy',
  treatment_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tooth_record_id, surface)
);

CREATE INDEX idx_tooth_records_chart ON tooth_records(chart_id);
CREATE INDEX idx_surface_records_tooth ON surface_records(tooth_record_id);

-- ============================================================
-- TREATMENT PLANS
-- ============================================================
CREATE TABLE treatment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  dentist_id UUID NOT NULL REFERENCES profiles(id),

  tooth_number INTEGER,
  surface TEXT,
  diagnosis TEXT,
  treatment_type TEXT NOT NULL,
  description TEXT,
  cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  final_cost NUMERIC(10,2) GENERATED ALWAYS AS (cost - discount + tax) STORED,
  status treatment_status NOT NULL DEFAULT 'planned',
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_treatment_plans_patient ON treatment_plans(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_treatment_plans_clinic ON treatment_plans(clinic_id) WHERE deleted_at IS NULL;

-- Add FK from surface_records to treatment_plans
ALTER TABLE surface_records
  ADD CONSTRAINT fk_surface_treatment
  FOREIGN KEY (treatment_id) REFERENCES treatment_plans(id) ON DELETE SET NULL;

-- ============================================================
-- INVOICES
-- ============================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),

  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  remaining_amount NUMERIC(10,2) GENERATED ALWAYS AS (total - paid_amount) STORED,
  status invoice_status NOT NULL DEFAULT 'draft',
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_invoice_number ON invoices(clinic_id, invoice_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_patient ON invoices(patient_id) WHERE deleted_at IS NULL;

-- ============================================================
-- INVOICE ITEMS
-- ============================================================
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  treatment_plan_id UUID REFERENCES treatment_plans(id),
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  received_by UUID NOT NULL REFERENCES profiles(id),

  amount NUMERIC(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method payment_method NOT NULL DEFAULT 'cash',
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id) WHERE deleted_at IS NULL;

-- ============================================================
-- PATIENT IMAGES (X-Rays, Clinical Photos)
-- ============================================================
CREATE TABLE patient_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES visits(id),
  tooth_number INTEGER,
  treatment_plan_id UUID REFERENCES treatment_plans(id),
  uploaded_by UUID NOT NULL REFERENCES profiles(id),

  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  category image_category NOT NULL,
  description TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_patient_images_patient ON patient_images(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_patient_images_tooth ON patient_images(patient_id, tooth_number) WHERE deleted_at IS NULL;

-- ============================================================
-- CONSENT FORMS
-- ============================================================
CREATE TABLE consent_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  treatment_plan_id UUID REFERENCES treatment_plans(id),

  document_url TEXT,
  signature_url TEXT,
  signed_at TIMESTAMPTZ,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================================
-- PATIENT TIMELINE
-- ============================================================
CREATE TABLE patient_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),

  event_type timeline_event_type NOT NULL,
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  description_ar TEXT,
  metadata JSONB DEFAULT '{}',
  reference_id UUID,
  reference_table TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timeline_patient ON patient_timeline(patient_id, created_at DESC);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_clinic ON audit_logs(clinic_id, created_at DESC);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name, record_id);

-- ============================================================
-- TREATMENT CATALOG (per clinic)
-- ============================================================
CREATE TABLE treatment_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ar TEXT,
  category TEXT,
  default_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_treatment_catalog_clinic ON treatment_catalog(clinic_id) WHERE deleted_at IS NULL;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Get current user's clinic_id
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Auto-generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number(p_clinic_id UUID)
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_num
  FROM invoices
  WHERE clinic_id = p_clinic_id;

  RETURN 'INV-' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-generate patient file number
CREATE OR REPLACE FUNCTION generate_file_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  IF NEW.file_number IS NULL THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(file_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO next_num
    FROM patients
    WHERE clinic_id = NEW.clinic_id;

    NEW.file_number := 'P-' || LPAD(next_num::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_file_number
  BEFORE INSERT ON patients
  FOR EACH ROW
  EXECUTE FUNCTION generate_file_number();

-- Update paid_amount on payments change
CREATE OR REPLACE FUNCTION update_invoice_paid_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices
  SET paid_amount = (
    SELECT COALESCE(SUM(amount), 0) FROM payments
    WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
    AND deleted_at IS NULL
  ),
  status = CASE
    WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments
          WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
          AND deleted_at IS NULL) >= total THEN 'paid'
    WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments
          WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
          AND deleted_at IS NULL) > 0 THEN 'partially_paid'
    ELSE status
  END,
  updated_at = NOW()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_invoice_paid
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_paid_amount();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clinics_updated BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_patients_updated BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_visits_updated BEFORE UPDATE ON visits FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_treatment_plans_updated BEFORE UPDATE ON treatment_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tooth_records_updated BEFORE UPDATE ON tooth_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_surface_records_updated BEFORE UPDATE ON surface_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_treatment_catalog_updated BEFORE UPDATE ON treatment_catalog FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tooth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE surface_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_catalog ENABLE ROW LEVEL SECURITY;

-- Clinics: super_admin sees all, others see own clinic
CREATE POLICY clinics_super_admin ON clinics FOR ALL TO authenticated
  USING (is_super_admin());
CREATE POLICY clinics_member ON clinics FOR SELECT TO authenticated
  USING (id = get_user_clinic_id());

-- Profiles: super_admin sees all, clinic members see own clinic
CREATE POLICY profiles_super_admin ON profiles FOR ALL TO authenticated
  USING (is_super_admin());
CREATE POLICY profiles_own_clinic ON profiles FOR SELECT TO authenticated
  USING (clinic_id = get_user_clinic_id());
CREATE POLICY profiles_own ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- Patients: clinic isolation
CREATE POLICY patients_clinic ON patients FOR ALL TO authenticated
  USING (clinic_id = get_user_clinic_id() AND deleted_at IS NULL);
CREATE POLICY patients_super_admin ON patients FOR SELECT TO authenticated
  USING (is_super_admin());

-- Appointments: clinic isolation
CREATE POLICY appointments_clinic ON appointments FOR ALL TO authenticated
  USING (clinic_id = get_user_clinic_id() AND deleted_at IS NULL);

-- Visits: clinic isolation
CREATE POLICY visits_clinic ON visits FOR ALL TO authenticated
  USING (clinic_id = get_user_clinic_id() AND deleted_at IS NULL);

-- Dental charts: clinic isolation
CREATE POLICY dental_charts_clinic ON dental_charts FOR ALL TO authenticated
  USING (clinic_id = get_user_clinic_id());

-- Tooth records: clinic isolation
CREATE POLICY tooth_records_clinic ON tooth_records FOR ALL TO authenticated
  USING (clinic_id = get_user_clinic_id());

-- Surface records: clinic isolation
CREATE POLICY surface_records_clinic ON surface_records FOR ALL TO authenticated
  USING (clinic_id = get_user_clinic_id());

-- Treatment plans: dentist full, nurse read-only
CREATE POLICY treatment_plans_dentist ON treatment_plans FOR ALL TO authenticated
  USING (clinic_id = get_user_clinic_id() AND deleted_at IS NULL
    AND get_user_role() IN ('dentist', 'super_admin'));
CREATE POLICY treatment_plans_read ON treatment_plans FOR SELECT TO authenticated
  USING (clinic_id = get_user_clinic_id() AND deleted_at IS NULL);

-- Invoices: dentist full, nurse no access
CREATE POLICY invoices_dentist ON invoices FOR ALL TO authenticated
  USING (clinic_id = get_user_clinic_id() AND deleted_at IS NULL
    AND get_user_role() IN ('dentist', 'super_admin'));
CREATE POLICY invoices_read ON invoices FOR SELECT TO authenticated
  USING (clinic_id = get_user_clinic_id() AND deleted_at IS NULL
    AND get_user_role() = 'dentist');

-- Invoice items
CREATE POLICY invoice_items_clinic ON invoice_items FOR ALL TO authenticated
  USING (clinic_id = get_user_clinic_id());

-- Payments: dentist only
CREATE POLICY payments_dentist ON payments FOR ALL TO authenticated
  USING (clinic_id = get_user_clinic_id() AND deleted_at IS NULL
    AND get_user_role() IN ('dentist', 'super_admin'));

-- Patient images: clinic isolation
CREATE POLICY patient_images_clinic ON patient_images FOR ALL TO authenticated
  USING (clinic_id = get_user_clinic_id() AND deleted_at IS NULL);

-- Consent forms: clinic isolation
CREATE POLICY consent_forms_clinic ON consent_forms FOR ALL TO authenticated
  USING (clinic_id = get_user_clinic_id() AND deleted_at IS NULL);

-- Timeline: clinic isolation
CREATE POLICY timeline_clinic ON patient_timeline FOR ALL TO authenticated
  USING (clinic_id = get_user_clinic_id());

-- Audit logs: super_admin or own clinic
CREATE POLICY audit_logs_policy ON audit_logs FOR SELECT TO authenticated
  USING (clinic_id = get_user_clinic_id() OR is_super_admin());
CREATE POLICY audit_logs_insert ON audit_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- Treatment catalog: clinic isolation
CREATE POLICY treatment_catalog_clinic ON treatment_catalog FOR ALL TO authenticated
  USING (clinic_id = get_user_clinic_id() AND deleted_at IS NULL);

-- ============================================================
-- STORAGE BUCKETS (run via Supabase dashboard or API)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('patient-files', 'patient-files', false);
