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
  infoRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 20,
  },
  infoRowRtl: {
    flexDirection: 'row-reverse' as const,
  },
  infoBlock: {
    width: '48%',
  },
  infoBlockRtl: {
    alignItems: 'flex-end' as const,
  },
  label: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.gray,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 6,
  },
  value: {
    fontSize: 10,
    color: COLORS.dark,
    marginBottom: 3,
  },
  valueBold: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.dark,
    marginBottom: 3,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row' as const,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
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
    paddingVertical: 7,
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
  colTooth: { width: '10%', textAlign: 'center' as const },
  colSurface: { width: '12%' },
  colType: { width: '22%' },
  colDiagnosis: { width: '18%' },
  colStatus: { width: '13%', textAlign: 'center' as const },
  colCost: { width: '25%', textAlign: 'right' as const },
  totalsSection: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    marginBottom: 25,
  },
  totalsSectionRtl: {
    justifyContent: 'flex-start' as const,
  },
  totalsTable: {
    width: 200,
  },
  totalsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  totalsRowRtl: {
    flexDirection: 'row-reverse' as const,
  },
  totalsLabel: {
    fontSize: 10,
    color: COLORS.gray,
  },
  totalsValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.dark,
  },
  finalRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    marginTop: 4,
  },
  finalRowRtl: {
    flexDirection: 'row-reverse' as const,
  },
  finalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  finalValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  notesSection: {
    marginBottom: 30,
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 9,
    color: COLORS.gray,
    lineHeight: 1.5,
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  signatureSectionRtl: {
    flexDirection: 'row-reverse' as const,
  },
  signatureBlock: {
    width: '40%',
    alignItems: 'center' as const,
  },
  signatureLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark,
    marginBottom: 6,
    marginTop: 40,
  },
  signatureLabel: {
    fontSize: 9,
    color: COLORS.gray,
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
    fontSize: 9,
    color: COLORS.gray,
    fontFamily: 'Helvetica-Oblique',
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    fontSize: 8,
  },
});

function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'completed':
      return { bg: '#dcfce7', text: '#16a34a' };
    case 'in_progress':
      return { bg: '#dbeafe', text: '#1e40af' };
    case 'cancelled':
      return { bg: '#fee2e2', text: '#dc2626' };
    default:
      return { bg: '#f1f5f9', text: '#64748b' };
  }
}

export interface TreatmentPlanPDFProps {
  clinic: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  patient: {
    full_name: string;
    mobile?: string;
    file_number?: string;
  };
  treatments: Array<{
    tooth_number?: number;
    surface?: string;
    treatment_type: string;
    diagnosis?: string;
    status: string;
    cost: number;
    discount: number;
    tax: number;
    final_cost: number;
    notes?: string;
  }>;
  direction?: 'ltr' | 'rtl';
}

export function TreatmentPlanPDF({
  clinic,
  patient,
  treatments,
  direction = 'ltr',
}: TreatmentPlanPDFProps) {
  const isRtl = direction === 'rtl';

  const totalCost = treatments.reduce((sum, t) => sum + t.cost, 0);
  const totalDiscount = treatments.reduce((sum, t) => sum + t.discount, 0);
  const totalTax = treatments.reduce((sum, t) => sum + t.tax, 0);
  const finalTotal = treatments.reduce((sum, t) => sum + t.final_cost, 0);

  const allNotes = treatments
    .filter((t) => t.notes)
    .map((t, i) => `${i + 1}. ${t.notes}`)
    .join('\n');

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

        <Text style={styles.title}>TREATMENT PLAN</Text>

        {/* Patient Info */}
        <View style={sx(styles.infoRow, isRtl && styles.infoRowRtl)}>
          <View style={sx(styles.infoBlock, isRtl && styles.infoBlockRtl)}>
            <Text style={styles.label}>Patient Information</Text>
            <Text style={styles.valueBold}>{patient.full_name}</Text>
            {patient.mobile && (
              <Text style={styles.value}>{patient.mobile}</Text>
            )}
            {patient.file_number && (
              <Text style={styles.value}>
                File #: {patient.file_number}
              </Text>
            )}
          </View>
          <View style={sx(styles.infoBlock, isRtl && styles.infoBlockRtl)}>
            <Text style={styles.label}>Plan Date</Text>
            <Text style={styles.value}>
              {new Date().toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Treatments Table */}
        <View style={styles.table}>
          <View
            style={sx(styles.tableHeader, isRtl && styles.tableHeaderRtl)}
          >
            <Text style={[styles.tableHeaderText, styles.colTooth]}>
              Tooth #
            </Text>
            <Text style={[styles.tableHeaderText, styles.colSurface]}>
              Surface
            </Text>
            <Text style={[styles.tableHeaderText, styles.colType]}>
              Treatment
            </Text>
            <Text style={[styles.tableHeaderText, styles.colDiagnosis]}>
              Diagnosis
            </Text>
            <Text style={[styles.tableHeaderText, styles.colStatus]}>
              Status
            </Text>
            <Text style={[styles.tableHeaderText, styles.colCost]}>
              Cost
            </Text>
          </View>
          {treatments.map((treatment, index) => {
            const statusStyle = getStatusStyle(treatment.status);
            return (
              <View
                key={index}
                style={sx(
                  styles.tableRow,
                  isRtl && styles.tableRowRtl,
                  index % 2 === 1 && styles.tableRowAlt,
                )}
              >
                <Text style={[styles.tableCell, styles.colTooth]}>
                  {treatment.tooth_number ?? '-'}
                </Text>
                <Text style={[styles.tableCell, styles.colSurface]}>
                  {treatment.surface ?? '-'}
                </Text>
                <Text style={[styles.tableCell, styles.colType]}>
                  {treatment.treatment_type}
                </Text>
                <Text style={[styles.tableCell, styles.colDiagnosis]}>
                  {treatment.diagnosis ?? '-'}
                </Text>
                <View style={[styles.colStatus, { alignItems: 'center' as const }]}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusStyle.bg },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 7,
                        fontFamily: 'Helvetica-Bold',
                        color: statusStyle.text,
                      }}
                    >
                      {treatment.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.tableCell, styles.colCost]}>
                  {formatCurrency(treatment.final_cost)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View
          style={sx(styles.totalsSection, isRtl && styles.totalsSectionRtl)}
        >
          <View style={styles.totalsTable}>
            <View
              style={sx(styles.totalsRow, isRtl && styles.totalsRowRtl)}
            >
              <Text style={styles.totalsLabel}>Total Cost</Text>
              <Text style={styles.totalsValue}>
                {formatCurrency(totalCost)}
              </Text>
            </View>
            {totalDiscount > 0 && (
              <View
                style={sx(styles.totalsRow, isRtl && styles.totalsRowRtl)}
              >
                <Text style={styles.totalsLabel}>Discount</Text>
                <Text
                  style={[styles.totalsValue, { color: '#dc2626' }]}
                >
                  -{formatCurrency(totalDiscount)}
                </Text>
              </View>
            )}
            {totalTax > 0 && (
              <View
                style={sx(styles.totalsRow, isRtl && styles.totalsRowRtl)}
              >
                <Text style={styles.totalsLabel}>Tax</Text>
                <Text style={styles.totalsValue}>
                  {formatCurrency(totalTax)}
                </Text>
              </View>
            )}
            <View
              style={sx(styles.finalRow, isRtl && styles.finalRowRtl)}
            >
              <Text style={styles.finalLabel}>Final Total</Text>
              <Text style={styles.finalValue}>
                {formatCurrency(finalTotal)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {allNotes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{allNotes}</Text>
          </View>
        )}

        {/* Consent Signature */}
        <View
          style={sx(
            styles.signatureSection,
            isRtl && styles.signatureSectionRtl,
          )}
        >
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Patient Signature</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>
              Dentist Signature & Date
            </Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            This treatment plan is an estimate and may be adjusted based on
            clinical findings during treatment.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
