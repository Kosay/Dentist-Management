-- Auth signup trigger: create clinic + profile on registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_clinic_id UUID;
  clinic_name_value TEXT;
  full_name_value TEXT;
  user_role_value public.user_role;
BEGIN
  clinic_name_value := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'clinic_name'), ''), 'My Dental Clinic');
  full_name_value := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), split_part(NEW.email, '@', 1));
  user_role_value := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'dentist');

  IF user_role_value = 'super_admin' THEN
    INSERT INTO public.clinics (name, email, subscription_status, max_users)
    VALUES (clinic_name_value, NEW.email, 'active', 50)
    RETURNING id INTO new_clinic_id;
  ELSE
    INSERT INTO public.clinics (name, email, subscription_status, max_users)
    VALUES (clinic_name_value, NEW.email, 'active', 5)
    RETURNING id INTO new_clinic_id;
  END IF;

  INSERT INTO public.profiles (id, clinic_id, full_name, email, role, is_active)
  VALUES (NEW.id, new_clinic_id, full_name_value, NEW.email, user_role_value, true);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for patient files
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-files', 'patient-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY patient_files_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'patient-files' AND (storage.foldername(name))[1] = get_user_clinic_id()::text);

CREATE POLICY patient_files_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'patient-files' AND (storage.foldername(name))[1] = get_user_clinic_id()::text);

CREATE POLICY patient_files_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'patient-files' AND (storage.foldername(name))[1] = get_user_clinic_id()::text)
  WITH CHECK (bucket_id = 'patient-files' AND (storage.foldername(name))[1] = get_user_clinic_id()::text);

CREATE POLICY patient_files_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'patient-files' AND (storage.foldername(name))[1] = get_user_clinic_id()::text);
