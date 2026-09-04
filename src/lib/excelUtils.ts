import * as XLSX from 'xlsx';
import { Client } from '@/types';
import { formatPhone } from '@/lib/utils';

export interface ParsedClientRow {
  name: string;
  whatsapp: string;
  phone?: string;
  nickname?: string;
  email?: string;
  cpf?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  state?: string;
  how_did_you_find_us?: string;
  tags?: string[];
  notes?: string;
  isValid: boolean;
  error?: string;
}

export interface ParseResult {
  validRows: ParsedClientRow[];
  invalidRows: ParsedClientRow[];
  totalRows: number;
}

/**
 * Normaliza número de telefone para apenas dígitos e adiciona formato amigável
 */
export function normalizePhone(rawPhone: any): { cleanDigits: string; formatted: string } {
  if (!rawPhone) return { cleanDigits: '', formatted: '' };
  
  let str = String(rawPhone).trim();
  // Remove .0 se vier de número flutuante do Excel
  if (str.endsWith('.0')) str = str.slice(0, -2);
  
  // Apenas dígitos
  const digits = str.replace(/\D/g, '');
  
  if (!digits) return { cleanDigits: '', formatted: '' };
  
  return {
    cleanDigits: digits,
    formatted: formatPhone(digits),
  };
}

/**
 * Mapeia e normaliza os cabeçalhos do arquivo Excel
 */
function findValue(row: Record<string, any>, possibleKeys: string[]): any {
  for (const key of Object.keys(row)) {
    const normalizedKey = key
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

    for (const target of possibleKeys) {
      const normalizedTarget = target
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');

      if (normalizedKey === normalizedTarget || normalizedKey.includes(normalizedTarget)) {
        return row[key];
      }
    }
  }
  return undefined;
}

/**
 * Lê e analisa um arquivo Excel (.xlsx, .xls) ou CSV
 */
export async function parseClientsExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        // Pega a primeira aba
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Converte para JSON
        const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const validRows: ParsedClientRow[] = [];
        const invalidRows: ParsedClientRow[] = [];

        rawRows.forEach((row, index) => {
          // Extrai Nome (Obrigatório)
          const rawName = findValue(row, ['nome', 'name', 'cliente', 'nome completo', 'razao social']);
          const name = rawName ? String(rawName).trim() : '';

          // Extrai Telefone / WhatsApp (Obrigatório)
          const rawPhone = findValue(row, ['telefone', 'whatsapp', 'celular', 'fone', 'tel', 'phone', 'contato']);
          const { cleanDigits, formatted } = normalizePhone(rawPhone);

          // Campos Opcionais
          const rawNickname = findValue(row, ['apelido', 'nickname', 'como prefere ser chamada', 'tratamento']);
          const nickname = rawNickname ? String(rawNickname).trim() : undefined;

          const rawEmail = findValue(row, ['email', 'e-mail', 'mail', 'correio eletronico']);
          const email = rawEmail ? String(rawEmail).trim().toLowerCase() : undefined;

          const rawCpf = findValue(row, ['cpf', 'documento', 'doc']);
          const cpf = rawCpf ? String(rawCpf).trim() : undefined;

          const rawBirth = findValue(row, ['nascimento', 'data de nascimento', 'aniversario', 'data nascimento', 'birthdate']);
          let birth_date: string | undefined = undefined;
          if (rawBirth) {
            if (rawBirth instanceof Date) {
              birth_date = rawBirth.toISOString().split('T')[0];
            } else {
              const strDate = String(rawBirth).trim();
              if (strDate.includes('/')) {
                const parts = strDate.split('/');
                if (parts.length === 3) {
                  const day = parts[0].padStart(2, '0');
                  const month = parts[1].padStart(2, '0');
                  let year = parts[2];
                  if (year.length === 2) year = '20' + year;
                  birth_date = `${year}-${month}-${day}`;
                }
              } else if (strDate.includes('-')) {
                birth_date = strDate;
              }
            }
          }

          const rawAddress = findValue(row, ['endereco', 'logradouro', 'rua', 'address']);
          const address = rawAddress ? String(rawAddress).trim() : undefined;

          const rawCity = findValue(row, ['cidade', 'city', 'municipio']);
          const city = rawCity ? String(rawCity).trim() : undefined;

          const rawState = findValue(row, ['estado', 'uf', 'state']);
          const state = rawState ? String(rawState).trim().toUpperCase() : undefined;

          const rawHowArrived = findValue(row, ['como conheceu', 'como chegou', 'origem', 'indicacao', 'como nos conheceu']);
          const how_did_you_find_us = rawHowArrived ? String(rawHowArrived).trim() : undefined;

          const rawTags = findValue(row, ['tags', 'etiquetas', 'categoria', 'categorias', 'marcador']);
          let tags: string[] | undefined = undefined;
          if (rawTags) {
            tags = String(rawTags)
              .split(/[,;]/)
              .map(t => t.trim())
              .filter(Boolean);
          }

          const rawNotes = findValue(row, ['observacoes', 'observacao', 'notas', 'notes', 'historico']);
          const notes = rawNotes ? String(rawNotes).trim() : undefined;

          // Validação de Obrigatoriedade: apenas Nome e Telefone/WhatsApp
          if (!name && !cleanDigits) {
            // Linha vazia, ignora
            return;
          }

          if (!name) {
            invalidRows.push({
              name: '',
              whatsapp: formatted || cleanDigits,
              phone: formatted || cleanDigits,
              isValid: false,
              error: `Linha ${index + 2}: Nome é obrigatório`,
            });
            return;
          }

          if (!cleanDigits || cleanDigits.length < 8) {
            invalidRows.push({
              name,
              whatsapp: String(rawPhone || ''),
              phone: String(rawPhone || ''),
              isValid: false,
              error: `Linha ${index + 2}: Telefone/WhatsApp inválido ou ausente`,
            });
            return;
          }

          validRows.push({
            name,
            whatsapp: cleanDigits,
            phone: formatted,
            nickname,
            email,
            cpf,
            birth_date,
            address,
            city,
            state,
            how_did_you_find_us,
            tags,
            notes,
            isValid: true,
          });
        });

        resolve({
          validRows,
          invalidRows,
          totalRows: validRows.length + invalidRows.length,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler o arquivo selecionado.'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Exporta a lista de clientes para uma planilha Excel (.xlsx)
 */
export function exportClientsToExcel(clients: Client[], fileName: string = 'clientes_iasis_agenda.xlsx') {
  const exportData = clients.map(c => ({
    'Nome': c.name,
    'WhatsApp': c.whatsapp ? formatPhone(c.whatsapp) : '',
    'Telefone': c.phone ? formatPhone(c.phone) : (c.whatsapp ? formatPhone(c.whatsapp) : ''),
    'Apelido': c.nickname || '',
    'E-mail': c.email || '',
    'CPF': c.cpf || '',
    'Data de Nascimento': c.birth_date || '',
    'Endereço': c.address || '',
    'Cidade': c.city || '',
    'Estado': c.state || '',
    'Como Conheceu': c.how_did_you_find_us || '',
    'Tags': (c.tags || []).join(', '),
    'Observações': c.notes || '',
    'Total Agendamentos': c.total_appointments || 0,
    'Total Gasto (R$)': Number(c.total_spent || 0).toFixed(2),
    'Data da Última Visita': c.last_appointment_date || '',
    'Data do Cadastro': c.created_at ? c.created_at.split('T')[0] : '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Ajusta largura automática das colunas
  const columnWidths = [
    { wch: 25 }, // Nome
    { wch: 18 }, // WhatsApp
    { wch: 18 }, // Telefone
    { wch: 15 }, // Apelido
    { wch: 28 }, // E-mail
    { wch: 16 }, // CPF
    { wch: 18 }, // Data Nasc
    { wch: 30 }, // Endereço
    { wch: 18 }, // Cidade
    { wch: 8 },  // UF
    { wch: 18 }, // Como Conheceu
    { wch: 20 }, // Tags
    { wch: 30 }, // Observações
    { wch: 18 }, // Total Agendamentos
    { wch: 16 }, // Total Gasto
    { wch: 18 }, // Última Visita
    { wch: 16 }, // Data Cadastro
  ];
  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');

  XLSX.writeFile(workbook, fileName);
}

/**
 * Gera e baixa uma planilha modelo de exemplo para importação
 */
export function downloadClientExcelTemplate() {
  const templateData = [
    {
      'Nome (Obrigatório)': 'Mariana Alcantara',
      'Telefone / WhatsApp (Obrigatório)': '(51) 99876-5432',
      'Apelido (Opcional)': 'Mari',
      'E-mail (Opcional)': 'mariana@exemplo.com.br',
      'CPF (Opcional)': '123.456.789-01',
      'Data de Nascimento (Opcional)': '14/05/1994',
      'Endereço (Opcional)': 'Rua Padre Chagas, 320',
      'Cidade (Opcional)': 'Porto Alegre',
      'Estado (Opcional)': 'RS',
      'Como Conheceu (Opcional)': 'Instagram',
      'Tags (Opcional)': 'VIP, Cílios',
      'Observações (Opcional)': 'Prefere cílios com efeito fox eyes.',
    },
    {
      'Nome (Obrigatório)': 'Fernanda Souza Costa',
      'Telefone / WhatsApp (Obrigatório)': '51987654321',
      'Apelido (Opcional)': 'Nanda',
      'E-mail (Opcional)': 'fernanda.costa@exemplo.com',
      'CPF (Opcional)': '234.567.890-12',
      'Data de Nascimento (Opcional)': '1988-11-23',
      'Endereço (Opcional)': 'Av. Goethe, 540',
      'Cidade (Opcional)': 'Porto Alegre',
      'Estado (Opcional)': 'RS',
      'Como Conheceu (Opcional)': 'Indicação',
      'Tags (Opcional)': 'Frequente, Micropigmentação',
      'Observações (Opcional)': 'Pele sensível na região das sobrancelhas.',
    },
    {
      'Nome (Obrigatório)': 'Carolina Oliveira',
      'Telefone / WhatsApp (Obrigatório)': '51991234567',
      'Apelido (Opcional)': '',
      'E-mail (Opcional)': '',
      'CPF (Opcional)': '',
      'Data de Nascimento (Opcional)': '',
      'Endereço (Opcional)': '',
      'Cidade (Opcional)': 'Porto Alegre',
      'Estado (Opcional)': 'RS',
      'Como Conheceu (Opcional)': 'Google',
      'Tags (Opcional)': 'Nova cliente',
      'Observações (Opcional)': '',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);

  worksheet['!cols'] = [
    { wch: 28 },
    { wch: 32 },
    { wch: 18 },
    { wch: 28 },
    { wch: 16 },
    { wch: 25 },
    { wch: 25 },
    { wch: 18 },
    { wch: 15 },
    { wch: 22 },
    { wch: 25 },
    { wch: 35 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelo de Importação');

  XLSX.writeFile(workbook, 'modelo_importacao_clientes_iasis.xlsx');
}
