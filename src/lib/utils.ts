import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um valor numérico para Moeda Brasileira (BRL)
 * Exemplo: 150 -> "R$ 150,00"
 */
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formata número de telefone / WhatsApp brasileiro
 * Formatos: (11) 98765-4321 ou (11) 3456-7890
 */
export function formatPhone(phone: string | undefined | null): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  } else if (cleaned.length > 11) {
    // Caso com 55 (DDI)
    const withoutDdi = cleaned.startsWith('55') ? cleaned.slice(2) : cleaned;
    if (withoutDdi.length === 11) {
      return withoutDdi.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    }
  }
  return phone;
}

/**
 * Remove caracteres não numéricos de telefone
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Formata CPF: 000.000.000-00
 */
export function formatCPF(cpf: string | undefined | null): string {
  if (!cpf) return '';
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  return cpf;
}

/**
 * Gera link para WhatsApp Web / App
 */
export function getWhatsAppUrl(phone: string, text?: string): string {
  const cleaned = cleanPhone(phone);
  const withDdi = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
  const encodedText = text ? encodeURIComponent(text) : '';
  return `https://wa.me/${withDdi}${encodedText ? `?text=${encodedText}` : ''}`;
}
