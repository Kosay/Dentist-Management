import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
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
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  headerRtl: {
    flexDirection: 'row-reverse' as const,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain' as const,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
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
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  clinicDetail: {
    fontSize: 9,
    color: COLORS.gray,
    marginBottom: 2,
  },
  titleSection: {
    alignItems: 'center' as const,
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    letterSpacing: 3,
  },
  metaRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 20,
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
  metaLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.gray,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 6,
  },
  metaValue: {
    fontSize: 10,
    color: COLORS.dark,
    marginBottom: 3,
  },
  metaValueBold: {
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
    paddingVertical: 8,
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
  colNum: { width: '5%' },
  colDesc: { width: '30%' },
  colQty: { width: '10%', textAlign: 'center' as const },
  colPrice: { width: '15%', textAlign: 'right' as const },
  colDiscount: { width: '12%', textAlign: 'right' as const },
  colTax: { width: '12%', textAlign: 'right' as const },
  colTotal: { width: '16%', textAlign: 'right' as const },
  totalsSection: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    marginBottom: 20,
  },
  totalsSectionRtl: {
    justifyContent: 'flex-start' as const,
  },
  totalsTable: {
    width: 220,
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
  grandTotalRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    marginTop: 4,
  },
  grandTotalRowRtl: {
    flexDirection: 'row-reverse' as const,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  grandTotalValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  balanceRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  balanceRowRtl: {
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
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginBottom: 8,
    marginTop: 10,
  },
  paymentHeader: {
    flexDirection: 'row' as const,
    backgroundColor: COLORS.lightGray,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  paymentHeaderRtl: {
    flexDirection: 'row-reverse' as const,
  },
  paymentRow: {
    flexDirection: 'row' as const,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  paymentRowRtl: {
    flexDirection: 'row-reverse' as const,
  },
  payColAmount: { width: '25%' },
  payColDate: { width: '25%' },
  payColMethod: { width: '25%' },
  payColNotes: { width: '25%' },
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
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    alignSelf: 'flex-start' as const,
  },
});

function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

export interface InvoicePDFProps {
  clinic: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
  };
  patient: {
    full_name: string;
    mobile?: string;
    email?: string;
  };
  invoice: {
    invoice_number: string;
    invoice_date: string;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paid_amount: number;
    remaining_amount: number;
    status: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    discount: number;
    tax: number;
    total: number;
  }>;
  payments: Array<{
    amount: number;
    payment_date: string;
    payment_method: string;
    notes?: string;
  }>;
  direction?: 'ltr' | 'rtl';
}

function getStatusColor(status: string) {
  switch (status) {
    case 'paid':
      return { bg: '#dcfce7', text: COLORS.success };
    case 'partially_paid':
      return { bg: '#fef9c3', text: '#a16207' };
    case 'cancelled':
      return { bg: '#fee2e2', text: COLORS.danger };
    default:
      return { bg: COLORS.lightGray, text: COLORS.gray };
  }
}

export function InvoicePDF({
  clinic,
  patient,
  invoice,
  items,
  payments,
  direction = 'ltr',
}: InvoicePDFProps) {
  const isRtl = direction === 'rtl';
  const statusColor = getStatusColor(invoice.status);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Clinic Header */}
        <View style={sx(styles.header, isRtl && styles.headerRtl)}>
          {clinic.logo_url ? (
            <Image src={clinic.logo_url} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'Helvetica-Bold',
                  color: COLORS.primary,
                }}
              >
                {clinic.name.charAt(0)}
              </Text>
            </View>
          )}
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

        {/* Invoice Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>INVOICE</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusColor.bg,
                alignSelf: 'center' as const,
                marginTop: 6,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 9,
                fontFamily: 'Helvetica-Bold',
                color: statusColor.text,
              }}
            >
              {invoice.status.toUpperCase().replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Invoice Meta & Bill To */}
        <View style={sx(styles.metaRow, isRtl && styles.metaRowRtl)}>
          <View style={sx(styles.metaBlock, isRtl && styles.metaBlockRtl)}>
            <Text style={styles.metaLabel}>Invoice Details</Text>
            <Text style={styles.metaValueBold}>
              #{invoice.invoice_number}
            </Text>
            <Text style={styles.metaValue}>
              Date: {invoice.invoice_date}
            </Text>
          </View>
          <View style={sx(styles.metaBlock, isRtl && styles.metaBlockRtl)}>
            <Text style={styles.metaLabel}>Bill To</Text>
            <Text style={styles.metaValueBold}>{patient.full_name}</Text>
            {patient.mobile && (
              <Text style={styles.metaValue}>{patient.mobile}</Text>
            )}
            {patient.email && (
              <Text style={styles.metaValue}>{patient.email}</Text>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View
            style={sx(styles.tableHeader, isRtl && styles.tableHeaderRtl)}
          >
            <Text style={[styles.tableHeaderText, styles.colNum]}>#</Text>
            <Text style={[styles.tableHeaderText, styles.colDesc]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>
              Qty
            </Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>
              Unit Price
            </Text>
            <Text style={[styles.tableHeaderText, styles.colDiscount]}>
              Discount
            </Text>
            <Text style={[styles.tableHeaderText, styles.colTax]}>
              Tax
            </Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>
              Total
            </Text>
          </View>
          {items.map((item, index) => (
            <View
              key={index}
              style={sx(
                styles.tableRow,
                isRtl && styles.tableRowRtl,
                index % 2 === 1 && styles.tableRowAlt,
              )}
            >
              <Text style={[styles.tableCell, styles.colNum]}>
                {index + 1}
              </Text>
              <Text style={[styles.tableCell, styles.colDesc]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCell, styles.colQty]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.colPrice]}>
                {formatCurrency(item.unit_price)}
              </Text>
              <Text style={[styles.tableCell, styles.colDiscount]}>
                {formatCurrency(item.discount)}
              </Text>
              <Text style={[styles.tableCell, styles.colTax]}>
                {formatCurrency(item.tax)}
              </Text>
              <Text style={[styles.tableCell, styles.colTotal]}>
                {formatCurrency(item.total)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View
          style={sx(styles.totalsSection, isRtl && styles.totalsSectionRtl)}
        >
          <View style={styles.totalsTable}>
            <View
              style={sx(styles.totalsRow, isRtl && styles.totalsRowRtl)}
            >
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>
                {formatCurrency(invoice.subtotal)}
              </Text>
            </View>
            {invoice.discount > 0 && (
              <View
                style={sx(styles.totalsRow, isRtl && styles.totalsRowRtl)}
              >
                <Text style={styles.totalsLabel}>Discount</Text>
                <Text
                  style={[styles.totalsValue, { color: COLORS.danger }]}
                >
                  -{formatCurrency(invoice.discount)}
                </Text>
              </View>
            )}
            {invoice.tax > 0 && (
              <View
                style={sx(styles.totalsRow, isRtl && styles.totalsRowRtl)}
              >
                <Text style={styles.totalsLabel}>Tax</Text>
                <Text style={styles.totalsValue}>
                  {formatCurrency(invoice.tax)}
                </Text>
              </View>
            )}
            <View
              style={sx(
                styles.grandTotalRow,
                isRtl && styles.grandTotalRowRtl,
              )}
            >
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(invoice.total)}
              </Text>
            </View>
            {invoice.paid_amount > 0 && (
              <View
                style={sx(styles.totalsRow, isRtl && styles.totalsRowRtl)}
              >
                <Text style={styles.totalsLabel}>Paid</Text>
                <Text
                  style={[styles.totalsValue, { color: COLORS.success }]}
                >
                  -{formatCurrency(invoice.paid_amount)}
                </Text>
              </View>
            )}
            <View
              style={sx(
                styles.balanceRow,
                {
                  borderColor:
                    invoice.remaining_amount > 0
                      ? COLORS.danger
                      : COLORS.success,
                },
                isRtl && styles.balanceRowRtl,
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
                Remaining Balance
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
          </View>
        </View>

        {/* Payment History */}
        {payments.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Payment History</Text>
            <View
              style={sx(
                styles.paymentHeader,
                isRtl && styles.paymentHeaderRtl,
              )}
            >
              <Text
                style={[
                  styles.tableHeaderText,
                  styles.payColAmount,
                  { color: COLORS.dark },
                ]}
              >
                Amount
              </Text>
              <Text
                style={[
                  styles.tableHeaderText,
                  styles.payColDate,
                  { color: COLORS.dark },
                ]}
              >
                Date
              </Text>
              <Text
                style={[
                  styles.tableHeaderText,
                  styles.payColMethod,
                  { color: COLORS.dark },
                ]}
              >
                Method
              </Text>
              <Text
                style={[
                  styles.tableHeaderText,
                  styles.payColNotes,
                  { color: COLORS.dark },
                ]}
              >
                Notes
              </Text>
            </View>
            {payments.map((payment, index) => (
              <View
                key={index}
                style={sx(
                  styles.paymentRow,
                  isRtl && styles.paymentRowRtl,
                )}
              >
                <Text style={[styles.tableCell, styles.payColAmount]}>
                  {formatCurrency(payment.amount)}
                </Text>
                <Text style={[styles.tableCell, styles.payColDate]}>
                  {payment.payment_date}
                </Text>
                <Text style={[styles.tableCell, styles.payColMethod]}>
                  {payment.payment_method.replace('_', ' ')}
                </Text>
                <Text style={[styles.tableCell, styles.payColNotes]}>
                  {payment.notes ?? '-'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Thank you for your trust. We wish you continued health and
            wellness.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
