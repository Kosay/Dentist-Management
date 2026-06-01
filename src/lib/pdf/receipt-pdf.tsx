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
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    textAlign: 'center' as const,
    marginBottom: 25,
    letterSpacing: 3,
  },
  metaRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 25,
  },
  metaRowRtl: {
    flexDirection: 'row-reverse' as const,
  },
  metaBlock: {
    width: '48%',
  },
  metaBlockRtl: {
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
  paymentDetailsCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
    padding: 20,
    marginBottom: 20,
  },
  paymentDetailsTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailRowRtl: {
    flexDirection: 'row-reverse' as const,
  },
  detailRowNoBorder: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 10,
    color: COLORS.gray,
  },
  detailValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.dark,
  },
  amountHighlight: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center' as const,
  },
  amountLabel: {
    fontSize: 10,
    color: COLORS.primaryLight,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  amountValue: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  invoiceRefCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 15,
    marginBottom: 20,
  },
  invoiceRefTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  balanceSection: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    borderWidth: 2,
    marginBottom: 25,
  },
  balanceSectionRtl: {
    flexDirection: 'row-reverse' as const,
  },
  balanceLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  balanceValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  thanksSection: {
    alignItems: 'center' as const,
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  thanksText: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginBottom: 6,
  },
  thanksSubtext: {
    fontSize: 9,
    color: COLORS.gray,
    fontFamily: 'Helvetica-Oblique',
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
});

function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

export interface ReceiptPDFProps {
  clinic: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  patient: {
    full_name: string;
    mobile?: string;
  };
  payment: {
    receipt_number: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    notes?: string;
  };
  invoice: {
    invoice_number: string;
    total: number;
    paid_amount: number;
    remaining_amount: number;
  };
  direction?: 'ltr' | 'rtl';
}

export function ReceiptPDF({
  clinic,
  patient,
  payment,
  invoice,
  direction = 'ltr',
}: ReceiptPDFProps) {
  const isRtl = direction === 'rtl';

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

        <Text style={styles.title}>PAYMENT RECEIPT</Text>

        {/* Receipt & Patient Info */}
        <View style={sx(styles.metaRow, isRtl && styles.metaRowRtl)}>
          <View style={sx(styles.metaBlock, isRtl && styles.metaBlockRtl)}>
            <Text style={styles.label}>Receipt Details</Text>
            <Text style={styles.valueBold}>
              #{payment.receipt_number}
            </Text>
            <Text style={styles.value}>
              Date: {payment.payment_date}
            </Text>
          </View>
          <View style={sx(styles.metaBlock, isRtl && styles.metaBlockRtl)}>
            <Text style={styles.label}>Received From</Text>
            <Text style={styles.valueBold}>{patient.full_name}</Text>
            {patient.mobile && (
              <Text style={styles.value}>{patient.mobile}</Text>
            )}
          </View>
        </View>

        {/* Amount Highlight */}
        <View style={styles.amountHighlight}>
          <Text style={styles.amountLabel}>Amount Received</Text>
          <Text style={styles.amountValue}>
            {formatCurrency(payment.amount)}
          </Text>
        </View>

        {/* Payment Details */}
        <View style={styles.paymentDetailsCard}>
          <Text style={styles.paymentDetailsTitle}>Payment Details</Text>
          <View
            style={sx(styles.detailRow, isRtl && styles.detailRowRtl)}
          >
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>
              {payment.payment_method.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <View
            style={sx(styles.detailRow, isRtl && styles.detailRowRtl)}
          >
            <Text style={styles.detailLabel}>Payment Date</Text>
            <Text style={styles.detailValue}>
              {payment.payment_date}
            </Text>
          </View>
          <View
            style={sx(styles.detailRow, isRtl && styles.detailRowRtl)}
          >
            <Text style={styles.detailLabel}>Amount</Text>
            <Text
              style={[styles.detailValue, { color: COLORS.success }]}
            >
              {formatCurrency(payment.amount)}
            </Text>
          </View>
          {payment.notes && (
            <View
              style={sx(
                styles.detailRow,
                styles.detailRowNoBorder,
                isRtl && styles.detailRowRtl,
              )}
            >
              <Text style={styles.detailLabel}>Notes</Text>
              <Text style={styles.detailValue}>{payment.notes}</Text>
            </View>
          )}
        </View>

        {/* Invoice Reference */}
        <View style={styles.invoiceRefCard}>
          <Text style={styles.invoiceRefTitle}>Invoice Reference</Text>
          <View
            style={sx(styles.detailRow, isRtl && styles.detailRowRtl)}
          >
            <Text style={styles.detailLabel}>Invoice Number</Text>
            <Text style={styles.detailValue}>
              #{invoice.invoice_number}
            </Text>
          </View>
          <View
            style={sx(styles.detailRow, isRtl && styles.detailRowRtl)}
          >
            <Text style={styles.detailLabel}>Invoice Total</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(invoice.total)}
            </Text>
          </View>
          <View
            style={sx(
              styles.detailRow,
              styles.detailRowNoBorder,
              isRtl && styles.detailRowRtl,
            )}
          >
            <Text style={styles.detailLabel}>Total Paid</Text>
            <Text
              style={[styles.detailValue, { color: COLORS.success }]}
            >
              {formatCurrency(invoice.paid_amount)}
            </Text>
          </View>
        </View>

        {/* Remaining Balance */}
        <View
          style={sx(
            styles.balanceSection,
            {
              borderColor:
                invoice.remaining_amount > 0
                  ? COLORS.danger
                  : COLORS.success,
            },
            isRtl && styles.balanceSectionRtl,
          )}
        >
          <Text
            style={[
              styles.balanceLabel,
              {
                color:
                  invoice.remaining_amount > 0
                    ? COLORS.danger
                    : COLORS.success,
              },
            ]}
          >
            Remaining Balance After Payment
          </Text>
          <Text
            style={[
              styles.balanceValue,
              {
                color:
                  invoice.remaining_amount > 0
                    ? COLORS.danger
                    : COLORS.success,
              },
            ]}
          >
            {formatCurrency(invoice.remaining_amount)}
          </Text>
        </View>

        {/* Thanks */}
        <View style={styles.thanksSection}>
          <Text style={styles.thanksText}>Received with Thanks</Text>
          <Text style={styles.thanksSubtext}>
            We appreciate your payment and wish you continued health.
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            This receipt confirms the payment recorded above. Please
            retain for your records.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
