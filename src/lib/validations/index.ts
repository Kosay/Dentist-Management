import { z } from "zod";

function optionalTrimmedString() {
  return z
    .string()
    .optional()
    .transform((value) => {
      if (!value || value.trim() === "") return undefined;
      return value.trim();
    });
}

function optionalEmailString() {
  return z
    .string()
    .optional()
    .transform((value) => {
      if (!value || value.trim() === "") return undefined;
      return value.trim();
    })
    .pipe(
      z.union([
        z.undefined(),
        z.email({ error: "Invalid email address" }),
      ])
    );
}

function optionalPositiveNumber() {
  return z
    .union([z.number(), z.nan()])
    .optional()
    .transform((value) =>
      value === undefined || Number.isNaN(value) ? undefined : value
    )
    .pipe(z.union([z.undefined(), z.number().positive()]));
}

// ---------------------------------------------------------------------------
// Patient
// ---------------------------------------------------------------------------

export const patientSchema = z.object({
  full_name: z.string().min(2, { error: "Full name must be at least 2 characters" }),
  full_name_ar: optionalTrimmedString(),
  gender: z.enum(["male", "female", "other"]).optional(),
  date_of_birth: optionalTrimmedString(),
  height_cm: optionalPositiveNumber(),
  weight_kg: optionalPositiveNumber(),
  occupation: optionalTrimmedString(),
  address: optionalTrimmedString(),
  mobile: optionalTrimmedString(),
  email: optionalEmailString(),
  companion_name: optionalTrimmedString(),
  companion_mobile: optionalTrimmedString(),
  drug_allergies: optionalTrimmedString(),
  current_medications: optionalTrimmedString(),
  is_smoker: z.boolean().default(false),
  alcohol_consumption: z.boolean().default(false),
  has_heart_disease: z.boolean().default(false),
  has_diabetes: z.boolean().default(false),
  blood_pressure_notes: optionalTrimmedString(),
  medical_notes: optionalTrimmedString(),
});

export type Patient = z.infer<typeof patientSchema>;

// ---------------------------------------------------------------------------
// Appointment
// ---------------------------------------------------------------------------

export const appointmentStatusEnum = z.enum([
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
]);

export const appointmentSchema = z.object({
  patient_id: z.uuid(),
  dentist_id: z.uuid(),
  appointment_date: z.string().min(1, { error: "Appointment date is required" }),
  start_time: z.string().min(1, { error: "Start time is required" }),
  end_time: z.string().optional(),
  status: appointmentStatusEnum,
  notes: z.string().optional(),
});

export type Appointment = z.infer<typeof appointmentSchema>;

// ---------------------------------------------------------------------------
// Visit
// ---------------------------------------------------------------------------

export const visitSchema = z.object({
  patient_id: z.uuid(),
  dentist_id: z.uuid(),
  appointment_id: z.uuid().optional(),
  visit_date: z.string().min(1, { error: "Visit date is required" }),
  chief_complaint: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment_performed: z.string().optional(),
  prescription: z.string().optional(),
  next_visit_date: z.string().optional(),
  clinical_notes: z.string().optional(),
});

export type Visit = z.infer<typeof visitSchema>;

// ---------------------------------------------------------------------------
// Treatment Plan
// ---------------------------------------------------------------------------

export const toothSurfaceEnum = z.enum([
  "mesial",
  "distal",
  "buccal",
  "lingual",
  "occlusal",
  "incisal",
]);

export const treatmentPlanStatusEnum = z.enum([
  "planned",
  "in_progress",
  "completed",
  "cancelled",
]);

export const treatmentPlanSchema = z.object({
  patient_id: z.uuid(),
  dentist_id: z.uuid(),
  tooth_number: z.number().int().min(11).max(85).optional(),
  surface: toothSurfaceEnum.optional(),
  diagnosis: z.string().optional(),
  treatment_type: z.string().min(1, { error: "Treatment type is required" }),
  description: z.string().optional(),
  cost: z.number().min(0, { error: "Cost cannot be negative" }),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  status: treatmentPlanStatusEnum,
  notes: z.string().optional(),
});

export type TreatmentPlan = z.infer<typeof treatmentPlanSchema>;

// ---------------------------------------------------------------------------
// Invoice
// ---------------------------------------------------------------------------

export const invoiceItemSchema = z.object({
  description: z.string().min(1, { error: "Item description is required" }),
  quantity: z.number().int().positive({ error: "Quantity must be a positive integer" }),
  unit_price: z.number().min(0, { error: "Unit price cannot be negative" }),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
});

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

export const invoiceSchema = z.object({
  patient_id: z.uuid(),
  invoice_date: z.string().min(1, { error: "Invoice date is required" }),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, { error: "At least one item is required" }),
});

export type Invoice = z.infer<typeof invoiceSchema>;

// ---------------------------------------------------------------------------
// Payment
// ---------------------------------------------------------------------------

export const paymentMethodEnum = z.enum([
  "cash",
  "card",
  "bank_transfer",
  "insurance",
]);

export const paymentSchema = z.object({
  invoice_id: z.uuid(),
  patient_id: z.uuid(),
  amount: z.number().positive({ error: "Amount must be positive" }),
  payment_date: z.string().min(1, { error: "Payment date is required" }),
  payment_method: paymentMethodEnum,
  notes: z.string().optional(),
});

export type Payment = z.infer<typeof paymentSchema>;

// ---------------------------------------------------------------------------
// Auth – Login
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.email({ error: "Please enter a valid email address" }),
  password: z.string().min(6, { error: "Password must be at least 6 characters" }),
});

export type Login = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Auth – Register
// ---------------------------------------------------------------------------

export const registerSchema = z.object({
  email: z.email({ error: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { error: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { error: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { error: "Password must contain at least one number" }),
  full_name: z.string().min(2, { error: "Full name must be at least 2 characters" }),
  clinic_name: z.string().min(2, { error: "Clinic name must be at least 2 characters" }),
});

export type Register = z.infer<typeof registerSchema>;

// ---------------------------------------------------------------------------
// Clinic
// ---------------------------------------------------------------------------

export const clinicSchema = z.object({
  name: z.string().min(2, { error: "Clinic name must be at least 2 characters" }),
  name_ar: optionalTrimmedString(),
  email: optionalEmailString(),
  phone: optionalTrimmedString(),
  address: optionalTrimmedString(),
  address_ar: optionalTrimmedString(),
  license_number: optionalTrimmedString(),
});

export type Clinic = z.infer<typeof clinicSchema>;

// ---------------------------------------------------------------------------
// Profile Update
// ---------------------------------------------------------------------------

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2, { error: "Full name must be at least 2 characters" }),
  full_name_ar: z.string().optional(),
  phone: z.string().optional(),
});

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
