-- =========================================================
-- IASIS AGENDA - MIGRATION 00002: ROW LEVEL SECURITY (RLS)
-- =========================================================

-- Enable RLS on all tables
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Is Authenticated User Admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
    AND active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can view active profiles" ON profiles
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (is_admin());

-- Business Settings Policies
CREATE POLICY "Authenticated users can read business settings" ON business_settings
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins can update business settings" ON business_settings
  FOR ALL TO authenticated USING (is_admin());

-- Professionals Policies
CREATE POLICY "Authenticated users can view active professionals" ON professionals
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins can manage professionals" ON professionals
  FOR ALL TO authenticated USING (is_admin());

-- Professional Schedules Policies
CREATE POLICY "Authenticated users can view professional schedules" ON professional_schedules
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins can manage professional schedules" ON professional_schedules
  FOR ALL TO authenticated USING (is_admin());

-- Schedule Blocks Policies
CREATE POLICY "Authenticated users can view schedule blocks" ON schedule_blocks
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Authenticated users can create/update schedule blocks" ON schedule_blocks
  FOR ALL TO authenticated USING (TRUE);

-- Service Categories & Services Policies
CREATE POLICY "Authenticated users can view services" ON services
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins can manage services" ON services
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "Authenticated users can view categories" ON service_categories
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins can manage categories" ON service_categories
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "Authenticated users can view professional services" ON professional_services
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins can manage professional services" ON professional_services
  FOR ALL TO authenticated USING (is_admin());

-- Clients Policies
CREATE POLICY "Authenticated staff can manage clients" ON clients
  FOR ALL TO authenticated USING (TRUE);

-- Appointments Policies
CREATE POLICY "Authenticated staff can manage appointments" ON appointments
  FOR ALL TO authenticated USING (TRUE);

CREATE POLICY "Authenticated staff can view appointment history" ON appointment_status_history
  FOR ALL TO authenticated USING (TRUE);

-- Notification Templates Policies
CREATE POLICY "Authenticated staff can view templates" ON notification_templates
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins can manage notification templates" ON notification_templates
  FOR ALL TO authenticated USING (is_admin());

-- Financial Policies
CREATE POLICY "Authenticated staff can view financial categories" ON financial_categories
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins can manage financial categories" ON financial_categories
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "Authenticated staff can manage financial transactions" ON financial_transactions
  FOR ALL TO authenticated USING (TRUE);

CREATE POLICY "Authenticated staff can manage cash registers" ON cash_registers
  FOR ALL TO authenticated USING (TRUE);

-- Audit Logs Policies
CREATE POLICY "Authenticated staff can insert audit logs" ON audit_logs
  FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT TO authenticated USING (is_admin());
