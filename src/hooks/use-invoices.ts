'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import type { Tables, InsertTables } from '@/types/database'

type Invoice = Tables<'invoices'>
type InvoiceInsert = InsertTables<'invoices'>
type InvoiceItem = Tables<'invoice_items'>
type InvoiceItemInsert = InsertTables<'invoice_items'>
type Payment = Tables<'payments'>
type PaymentInsert = InsertTables<'payments'>

type InvoiceWithDetails = Invoice & {
  invoice_items: InvoiceItem[]
  payments: Payment[]
}

export function useInvoices(patientId?: string) {
  const { clinic } = useAuth()
  const supabase = createClient()

  return useQuery<Invoice[], Error>({
    queryKey: ['invoices', clinic?.id, patientId],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (patientId) {
        query = query.eq('patient_id', patientId)
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as unknown as Invoice[]
    },
    enabled: !!clinic?.id,
  })
}

export function useInvoice(id: string) {
  const supabase = createClient()

  return useQuery<InvoiceWithDetails, Error>({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, invoice_items(*), payments(*)')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error) throw error
      return data as unknown as InvoiceWithDetails
    },
    enabled: !!id,
  })
}

interface CreateInvoiceInput {
  invoice: InvoiceInsert
  items: Omit<InvoiceItemInsert, 'invoice_id'>[]
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation<Invoice, Error, CreateInvoiceInput>({
    mutationFn: async ({ invoice, items }) => {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoice as never)
        .select()
        .single()

      if (invoiceError) throw invoiceError

      const created = invoiceData as unknown as Invoice

      if (items.length > 0) {
        const invoiceItems = items.map((item) => ({
          ...item,
          invoice_id: created.id,
        }))

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems as never[])

        if (itemsError) throw itemsError
      }

      return created
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export function usePayments(invoiceId: string) {
  const supabase = createClient()

  return useQuery<Payment[], Error>({
    queryKey: ['payments', invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', invoiceId)
        .is('deleted_at', null)
        .order('payment_date', { ascending: false })

      if (error) throw error
      return (data ?? []) as unknown as Payment[]
    },
    enabled: !!invoiceId,
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation<Payment, Error, PaymentInsert>({
    mutationFn: async (payment) => {
      const { data, error } = await supabase
        .from('payments')
        .insert(payment as never)
        .select()
        .single()

      if (error) throw error
      return data as unknown as Payment
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments', data.invoice_id] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice', data.invoice_id] })
    },
  })
}
