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

/**
 * Valida se uma string é um UUID válido aceito pelo PostgreSQL / Supabase
 */
export function isValidUUID(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false;
  const clean = id.trim();
  // Aceita qualquer formato 8-4-4-4-12 hexadecimal compatível com PostgreSQL
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);
}

/**
 * Converte determinística e estavelmente qualquer texto / ID legado para um UUID válido.
 * Garante que a mesma entidade SEMPRE tenha o mesmo UUID nas edições.
 */
export function deterministicUUID(input: string): string {
  if (!input) return generateUUID();
  const trimmed = input.trim();
  if (isValidUUID(trimmed)) return trimmed.toLowerCase();

  // Se já tiver formato aproximado de UUID com 36 caracteres e hífens, sanitiza caracteres não hex
  if (/^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/i.test(trimmed)) {
    const hex = trimmed.toLowerCase().replace(/[^0-9a-f-]/g, (c) => {
      return ((c.charCodeAt(0) - 97) % 16).toString(16);
    });
    if (isValidUUID(hex)) return hex;
  }

  // Hash FNV-1a simples de 32-bit para criar UUID estável
  let h1 = 0x811c9dc5;
  let h2 = 0x12345678;
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch;
    h2 = Math.imul(h2, 0x000001b3);
  }
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 16).toString(16).padStart(4, '0');
  const part3 = '4' + (h2 & 0x0fff).toString(16).padStart(3, '0');
  const part4 = 'a' + ((h1 >>> 8) & 0x0fff).toString(16).padStart(3, '0');
  const part5 = ((h1 & 0xff).toString(16) + (h2 >>> 0).toString(16)).padEnd(12, '0').slice(0, 12);

  return `${part1}-${part2}-${part3}-${part4}-${part5}`.toLowerCase();
}

/**
 * Gera um UUID v4 compatível com PostgreSQL / Supabase
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}


