import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';

function sx(...args: (Style | false | undefined | null)[]): Style[] {
  return args.filter(Boolean) as Style[];
}

const COLORS = {
  primary: '#1e40af',
  primaryLight: '#dbeafe',
  dark: '#1e293b',
  gray: '#64748b',
  lightGray: '#f1f5f9',
  border: '#cbd5e1',
  success: '#16a34a',
  danger: '#dc2626',
  white: '#ffffff',
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: COLORS.dark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  headerRtl: {
    flexDirection: 'row-reverse' as const,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  clinicInfo: {
    flex: 1,
    marginLeft: 15,
  },
  clinicInfoRtl: {
    marginLeft: 0,
    marginRight: 15,
    alignItems: 'flex-end' as const,
  },
  clinicName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  clinicDetail: {
    fontSize: 9,
    color: COLORS.gray,
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    textAlign: 'center' as const,
    marginBottom: 20,
    letterSpacing: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginBottom: 8,
    marginTop: 15,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryLight,
  },
  infoGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    marginBottom: 10,
  },
  infoGridRtl: {
    flexDirection: 'row-reverse' as const,
  },
  infoItem: {
    width: '50%',
    marginBottom: 6,
    flexDirection: 'row' as const,
  },
  infoItemRtl: {
    flexDirection: 'row-reverse' as const,
  },
  infoLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.gray,
    width: 100,
  },
  infoLabelRtl: {
    textAlign: 'right' as const,
  },
  infoValue: {
    fontSize: 9,
    color: COLORS.dark,
    flex: 1,
  },
  medicalFlags: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    marginBottom: 8,
  },
  medicalTag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
  },
  medicalTagText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row' as const,
    backgroundColor: COLORS.primary,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  tableHeaderRtl: {
    flexDirection: 'row-reverse' as const,
  },
  tableHeaderText: {
    color: COLORS.white,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase' as const,
  },
  tableRow: {
    flexDirection: 'row' as const,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableRowRtl: {
    flexDirection: 'row-reverse' as const,
  },
  tableRowAlt: {
    backgroundColor: COLORS.lightGray,
  },
  tableCell: {
    fontSize: 9,
    color: COLORS.dark,
  },
  summaryCards: {
    flexDirection: 'row' as const,
    marginBottom: 15,
  },
  summaryCardsRtl: {
    flexDirection: 'row-reverse' as const,
  },
  summaryBlock: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    marginHorizontal: 4,
    alignItems: 'center' as const,
  },
  summaryBlockLabel: {
    fontSize: 8,
    color: COLORS.gray,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
    fontFamily: 'Helvetica-Bold',
  },
  summaryBlockValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.dark,
  },
  financialRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  financialRowRtl: {
    flexDirection: 'row-reverse' as const,
  },
  financialHighlight: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginTop: 4,
  },
  financialHighlightRtl: {
    flexDirection: 'row-reverse' as const,
  },
  generatedDate: {
    fontSize: 8,
    color: COLORS.gray,
    textAlign: 'center' as const,
    marginTop: 20,
  },
  footer: {
    position: 'absolute' as const,
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center' as const,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 8,
    color: COLORS.gray,
  },
  visitColDate: { width: '20%' },
  visitColComplaint: { width: '25%' },
  visitColDiagnosis: { width: '25%' },
  visitColTreatment: { width: '30%' },
  treatColType: { width: '30%' },
  treatColTooth: { width: '12%', textAlign: 'center' as const },
  treatColStatus: { width: '18%', textAlign: 'center' as const },
  treatColCost: { width: '20%', textAlign: 'right' as const },
  treatColFinal: { width: '20%', textAlign: 'right' as const },
});

function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

export interface PatientReportPDFProps {
  clinic: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  patient: {
    full_name: string;
    file_number?: string;
    date_of_birth?: string;
    gender?: string;
    mobile?: string;
    email?: string;
    address?: string;
    drug_allergies?: string;
    current_medications?: string;
    is_smoker?: boolean;
    has_heart_disease?: boolean;
    has_diabetes?: boolean;
    medical_notes?: string;
  };
  visits: Array<{
    visit_date: string;
    chief_complaint?: string;
    diagnosis?: string;
    treatment_performed?: string;
  }>;
  treatments: Array<{
    treatment_type: string;
    tooth_number?: number;
    status: string;
    cost: number;
    final_cost: number;
  }>;
  financials: {
    total_invoiced: number;
    total_paid: number;
    total_remaining: number;
  };
  direction?: 'ltr' | 'rtl';
}

export function PatientReportPDF({
  clinic,
  patient,
  visits,
  treatments,
  financials,
  direction = 'ltr',
}: PatientReportPDFProps) {
  const isRtl = direction === 'rtl';

  const medicalFlags: Array<{ label: string; active: boolean }> = [
    { label: 'Smoker', active: patient.is_smoker ?? false },
    { label: 'Heart Disease', active: patient.has_heart_disease ?? false },
    { label: 'Diabetes', active: patient.has_diabetes ?? false },
  ];

  const completedCount = treatments.filter(
    (t) => t.status === 'completed'
  ).length;
  const pendingCount = treatments.filter(
    (t) => t.status === 'planned' || t.status === 'in_progress'
  ).length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Clinic Header */}
        <View style={sx(styles.header, isRtl && styles.headerRtl)}>
          <View style={styles.logoPlaceholder}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'Helvetica-Bold',
                color: COLORS.primary,
              }}
            >
              {clinic.name.charAt(0)}
            </Text>
          </View>
          <View
            style={sx(styles.clinicInfo, isRtl && styles.clinicInfoRtl)}
          >
            <Text style={styles.clinicName}>{clinic.name}</Text>
            {clinic.address && (
              <Text style={styles.clinicDetail}>{clinic.address}</Text>
            )}
            {clinic.phone && (
              <Text style={styles.clinicDetail}>{clinic.phone}</Text>
            )}
            {clinic.email && (
              <Text style={styles.clinicDetail}>{clinic.email}</Text>
            )}
          </View>
        </View>

        <Text style={styles.title}>PATIENT REPORT</Text>

        {/* Personal Information */}
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={sx(styles.infoGrid, isRtl && styles.infoGridRtl)}>
          <View style={sx(styles.infoItem, isRtl && styles.infoItemRtl)}>
            <Text style={sx(styles.infoLabel, isRtl && styles.infoLabelRtl)}>
              Full Name:
            </Text>
            <Text style={styles.infoValue}>{patient.full_name}</Text>
          </View>
          {patient.file_number && (
            <View style={sx(styles.infoItem, isRtl && styles.infoItemRtl)}>
              <Text
                style={sx(styles.infoLabel, isRtl && styles.infoLabelRtl)}
              >
                File Number:
              </Text>
              <Text style={styles.infoValue}>{patient.file_number}</Text>
            </View>
          )}
          {patient.date_of_birth && (
            <View style={sx(styles.infoItem, isRtl && styles.infoItemRtl)}>
              <Text
                style={sx(styles.infoLabel, isRtl && styles.infoLabelRtl)}
              >
                Date of Birth:
              </Text>
              <Text style={styles.infoValue}>{patient.date_of_birth}</Text>
            </View>
          )}
          {patient.gender && (
            <View style={sx(styles.infoItem, isRtl && styles.infoItemRtl)}>
              <Text
                style={sx(styles.infoLabel, isRtl && styles.infoLabelRtl)}
              >
                Gender:
              </Text>
              <Text style={styles.infoValue}>{patient.gender}</Text>
            </View>
          )}
          {patient.mobile && (
            <View style={sx(styles.infoItem, isRtl && styles.infoItemRtl)}>
              <Text
                style={sx(styles.infoLabel, isRtl && styles.infoLabelRtl)}
              >
                Mobile:
              </Text>
              <Text style={styles.infoValue}>{patient.mobile}</Text>
            </View>
          )}
          {patient.email && (
            <View style={sx(styles.infoItem, isRtl && styles.infoItemRtl)}>
              <Text
                style={sx(styles.infoLabel, isRtl && styles.infoLabelRtl)}
              >
                Email:
              </Text>
              <Text style={styles.infoValue}>{patient.email}</Text>
            </View>
          )}
          {patient.address && (
            <View style={sx(styles.infoItem, isRtl && styles.infoItemRtl)}>
              <Text
                style={sx(styles.infoLabel, isRtl && styles.infoLabelRtl)}
              >
                Address:
              </Text>
              <Text style={styles.infoValue}>{patient.address}</Text>
            </View>
          )}
        </View>

        {/* Medical History */}
        <Text style={styles.sectionTitle}>Medical History</Text>
        <View style={styles.medicalFlags}>
          {medicalFlags.map((flag) => (
            <View
              key={flag.label}
              style={[
                styles.medicalTag,
                {
                  backgroundColor: flag.active
                    ? '#fee2e2'
                    : '#dcfce7',
                },
              ]}
            >
              <Text
                style={[
                  styles.medicalTagText,
                  {
                    color: flag.active ? COLORS.danger : COLORS.success,
                  },
                ]}
              >
                {flag.label}
              </Text>
            </View>
          ))}
        </View>
        {patient.drug_allergies && (
          <View style={sx(styles.infoItem, isRtl && styles.infoItemRtl)}>
            <Text
              style={sx(styles.infoLabel, isRtl && styles.infoLabelRtl)}
            >
              Drug Allergies:
            </Text>
            <Text style={styles.infoValue}>{patient.drug_allergies}</Text>
          </View>
        )}
        {patient.current_medications && (
          <View style={sx(styles.infoItem, isRtl && styles.infoItemRtl)}>
            <Text
              style={sx(styles.infoLabel, isRtl && styles.infoLabelRtl)}
            >
              Medications:
            </Text>
            <Text style={styles.infoValue}>
              {patient.current_medications}
            </Text>
          </View>
        )}
        {patient.medical_notes && (
          <View style={sx(styles.infoItem, isRtl && styles.infoItemRtl)}>
            <Text
              style={sx(styles.infoLabel, isRtl && styles.infoLabelRtl)}
            >
              Notes:
            </Text>
            <Text style={styles.infoValue}>{patient.medical_notes}</Text>
          </View>
        )}

        {/* Visit History */}
        {visits.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Visit History ({visits.length})
            </Text>
            <View style={styles.table}>
              <View
                style={sx(
                  styles.tableHeader,
                  isRtl && styles.tableHeaderRtl,
                )}
              >
                <Text
                  style={[styles.tableHeaderText, styles.visitColDate]}
                >
                  Date
                </Text>
                <Text
                  style={[
                    styles.tableHeaderText,
                    styles.visitColComplaint,
                  ]}
                >
                  Chief Complaint
                </Text>
                <Text
                  style={[
                    styles.tableHeaderText,
                    styles.visitColDiagnosis,
                  ]}
                >
                  Diagnosis
                </Text>
                <Text
                  style={[
                    styles.tableHeaderText,
                    styles.visitColTreatment,
                  ]}
                >
                  Treatment
                </Text>
              </View>
              {visits.map((visit, index) => (
                <View
                  key={index}
                  style={sx(
                    styles.tableRow,
                    isRtl && styles.tableRowRtl,
                    index % 2 === 1 && styles.tableRowAlt,
                  )}
                >
                  <Text
                    style={[styles.tableCell, styles.visitColDate]}
                  >
                    {visit.visit_date}
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.visitColComplaint]}
                  >
                    {visit.chief_complaint ?? '-'}
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.visitColDiagnosis]}
                  >
                    {visit.diagnosis ?? '-'}
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.visitColTreatment]}
                  >
                    {visit.treatment_performed ?? '-'}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Treatment Summary */}
        {treatments.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Treatment Summary</Text>
            <View
              style={sx(styles.summaryCards, isRtl && styles.summaryCardsRtl)}
            >
              <View style={styles.summaryBlock}>
                <Text style={styles.summaryBlockLabel}>Total</Text>
                <Text style={styles.summaryBlockValue}>
                  {treatments.length}
                </Text>
              </View>
              <View style={styles.summaryBlock}>
                <Text style={styles.summaryBlockLabel}>Completed</Text>
                <Text
                  style={[
                    styles.summaryBlockValue,
                    { color: COLORS.success },
                  ]}
                >
                  {completedCount}
                </Text>
              </View>
              <View style={styles.summaryBlock}>
                <Text style={styles.summaryBlockLabel}>Pending</Text>
                <Text
                  style={[
                    styles.summaryBlockValue,
                    { color: COLORS.primary },
                  ]}
                >
                  {pendingCount}
                </Text>
              </View>
            </View>
            <View style={styles.table}>
              <View
                style={sx(
                  styles.tableHeader,
                  isRtl && styles.tableHeaderRtl,
                )}
              >
                <Text
                  style={[styles.tableHeaderText, styles.treatColType]}
                >
                  Treatment
                </Text>
                <Text
                  style={[styles.tableHeaderText, styles.treatColTooth]}
                >
                  Tooth #
                </Text>
                <Text
                  style={[styles.tableHeaderText, styles.treatColStatus]}
                >
                  Status
                </Text>
                <Text
                  style={[styles.tableHeaderText, styles.treatColCost]}
                >
                  Cost
                </Text>
                <Text
                  style={[styles.tableHeaderText, styles.treatColFinal]}
                >
                  Final
                </Text>
              </View>
              {treatments.map((treatment, index) => (
                <View
                  key={index}
                  style={sx(
                    styles.tableRow,
                    isRtl && styles.tableRowRtl,
                    index % 2 === 1 && styles.tableRowAlt,
                  )}
                >
                  <Text
                    style={[styles.tableCell, styles.treatColType]}
                  >
                    {treatment.treatment_type}
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.treatColTooth]}
                  >
                    {treatment.tooth_number ?? '-'}
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.treatColStatus]}
                  >
                    {treatment.status.replace('_', ' ')}
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.treatColCost]}
                  >
                    {formatCurrency(treatment.cost)}
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.treatColFinal]}
                  >
                    {formatCurrency(treatment.final_cost)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Financial Summary */}
        <Text style={styles.sectionTitle}>Financial Summary</Text>
        <View style={{ width: 250 }}>
          <View
            style={sx(styles.financialRow, isRtl && styles.financialRowRtl)}
          >
            <Text style={{ fontSize: 10, color: COLORS.gray }}>
              Total Invoiced
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontFamily: 'Helvetica-Bold',
                color: COLORS.dark,
              }}
            >
              {formatCurrency(financials.total_invoiced)}
            </Text>
          </View>
          <View
            style={sx(styles.financialRow, isRtl && styles.financialRowRtl)}
          >
            <Text style={{ fontSize: 10, color: COLORS.gray }}>
              Total Paid
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontFamily: 'Helvetica-Bold',
                color: COLORS.success,
              }}
            >
              {formatCurrency(financials.total_paid)}
            </Text>
          </View>
          <View
            style={sx(
              styles.financialHighlight,
              isRtl && styles.financialHighlightRtl,
            )}
          >
            <Text
              style={{
                fontSize: 10,
                fontFamily: 'Helvetica-Bold',
                color: COLORS.primary,
              }}
            >
              Outstanding Balance
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontFamily: 'Helvetica-Bold',
                color:
                  financials.total_remaining > 0
                    ? COLORS.danger
                    : COLORS.success,
              }}
            >
              {formatCurrency(financials.total_remaining)}
            </Text>
          </View>
        </View>

        {/* Generated Date */}
        <Text style={styles.generatedDate}>
          Report generated on {new Date().toLocaleDateString()} at{' '}
          {new Date().toLocaleTimeString()}
        </Text>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            This report is confidential and intended for medical use only.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
