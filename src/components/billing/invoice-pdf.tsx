'use client'

/* eslint-disable @next/next/no-img-element */
import { format } from 'date-fns'
import type { Tables, PaymentMethod } from '@/types/database'
import type { Clinic } from '@/providers/auth-provider'

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Card',
  bank_transfer: 'Bank Transfer',
  insurance: 'Insurance',
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

interface InvoicePdfProps {
  invoice: Tables<'invoices'> & { invoice_items: Tables<'invoice_items'>[] }
  items: Tables<'invoice_items'>[]
  payments: Tables<'payments'>[]
  patient: Tables<'patients'> | null
  clinic: Clinic | null
}

export function InvoicePdf({
  invoice,
  items,
  payments,
  patient,
  clinic,
}: InvoicePdfProps) {
  return (
    <div className="mx-auto max-w-3xl bg-white text-black print:m-0 print:max-w-none print:shadow-none">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * { visibility: hidden; }
              .invoice-print, .invoice-print * { visibility: visible; }
              .invoice-print { position: absolute; left: 0; top: 0; width: 100%; }
              @page { margin: 20mm; }
            }
          `,
        }}
      />

      <div className="invoice-print space-y-8 p-8 print:p-0">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            {clinic?.logo_url && (
              <img
                src={clinic.logo_url}
                alt={clinic.name}
                className="mb-2 h-12 w-auto"
              />
            )}
            <h1 className="text-xl font-bold">{clinic?.name ?? 'Clinic'}</h1>
            {clinic?.address && (
              <p className="text-sm text-gray-600">{clinic.address}</p>
            )}
            {clinic?.phone && (
              <p className="text-sm text-gray-600">{clinic.phone}</p>
            )}
            {clinic?.email && (
              <p className="text-sm text-gray-600">{clinic.email}</p>
            )}
            {clinic?.license_number && (
              <p className="text-sm text-gray-600">
                License: {clinic.license_number}
              </p>
            )}
          </div>

          <div className="text-right">
            <h2 className="text-3xl font-bold tracking-tight text-gray-800">
              INVOICE
            </h2>
            <div className="mt-2 space-y-0.5 text-sm">
              <p>
                <span className="text-gray-500">Invoice #:</span>{' '}
                <span className="font-semibold">{invoice.invoice_number}</span>
              </p>
              <p>
                <span className="text-gray-500">Date:</span>{' '}
                {format(new Date(invoice.invoice_date), 'MMMM dd, yyyy')}
              </p>
              <p>
                <span className="text-gray-500">Status:</span>{' '}
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    invoice.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-700'
                      : invoice.status === 'partially_paid'
                        ? 'bg-yellow-100 text-yellow-700'
                        : invoice.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {invoice.status.replace('_', ' ').toUpperCase()}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        {/* Bill To */}
        {patient && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Bill To
            </p>
            <div className="mt-1 space-y-0.5 text-sm">
              <p className="font-semibold text-gray-800">{patient.full_name}</p>
              {patient.email && (
                <p className="text-gray-600">{patient.email}</p>
              )}
              {patient.mobile && (
                <p className="text-gray-600">{patient.mobile}</p>
              )}
              {patient.address && (
                <p className="text-gray-600">{patient.address}</p>
              )}
            </div>
          </div>
        )}

        {/* Items Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="pb-2 text-left font-semibold text-gray-500">#</th>
              <th className="pb-2 text-left font-semibold text-gray-500">
                Description
              </th>
              <th className="pb-2 text-right font-semibold text-gray-500">
                Qty
              </th>
              <th className="pb-2 text-right font-semibold text-gray-500">
                Unit Price
              </th>
              <th className="pb-2 text-right font-semibold text-gray-500">
                Discount
              </th>
              <th className="pb-2 text-right font-semibold text-gray-500">
                Tax
              </th>
              <th className="pb-2 text-right font-semibold text-gray-500">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-2.5 text-gray-400">{idx + 1}</td>
                <td className="py-2.5 font-medium">{item.description}</td>
                <td className="py-2.5 text-right tabular-nums">
                  {item.quantity}
                </td>
                <td className="py-2.5 text-right tabular-nums">
                  {formatCurrency(item.unit_price)}
                </td>
                <td className="py-2.5 text-right tabular-nums">
                  {item.discount > 0
                    ? `-${formatCurrency(item.discount)}`
                    : '—'}
                </td>
                <td className="py-2.5 text-right tabular-nums">
                  {item.tax > 0 ? formatCurrency(item.tax) : '—'}
                </td>
                <td className="py-2.5 text-right font-semibold tabular-nums">
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-72 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="tabular-nums">
                {formatCurrency(invoice.subtotal)}
              </span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="tabular-nums text-red-600">
                  -{formatCurrency(invoice.discount)}
                </span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="tabular-nums">
                  +{formatCurrency(invoice.tax)}
                </span>
              </div>
            )}
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between text-base font-bold">
              <span>Grand Total</span>
              <span className="tabular-nums">
                {formatCurrency(invoice.total)}
              </span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Paid</span>
              <span className="tabular-nums text-emerald-600">
                {formatCurrency(invoice.paid_amount)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Balance Due</span>
              <span
                className={`tabular-nums ${
                  invoice.remaining_amount > 0
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {formatCurrency(invoice.remaining_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        {payments.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Payment History
            </p>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-1.5 text-left font-semibold text-gray-500">
                    Date
                  </th>
                  <th className="pb-1.5 text-left font-semibold text-gray-500">
                    Method
                  </th>
                  <th className="pb-1.5 text-right font-semibold text-gray-500">
                    Amount
                  </th>
                  <th className="pb-1.5 text-left font-semibold text-gray-500">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-50">
                    <td className="py-1.5">
                      {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-1.5">
                      {PAYMENT_METHOD_LABELS[payment.payment_method]}
                    </td>
                    <td className="py-1.5 text-right font-semibold tabular-nums">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-1.5 text-gray-500">
                      {payment.notes ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Notes
            </p>
            <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
              {invoice.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="h-px bg-gray-200" />
        <div className="text-center text-xs text-gray-400">
          <p>
            {clinic?.name ?? 'Clinic'}
            {clinic?.phone ? ` • ${clinic.phone}` : ''}
            {clinic?.email ? ` • ${clinic.email}` : ''}
          </p>
          <p className="mt-0.5">Thank you for choosing our dental clinic.</p>
        </div>
      </div>
    </div>
  )
}
