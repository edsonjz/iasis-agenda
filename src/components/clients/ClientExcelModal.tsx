import React, { useState, useRef } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Client } from '@/types';
import {
  parseClientsExcelFile,
  exportClientsToExcel,
  downloadClientExcelTemplate,
  ParsedClientRow,
  ParseResult,
} from '@/lib/excelUtils';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  Users,
  Info,
  Check,
  X
} from 'lucide-react';

interface ClientExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onImportBatch: (newClients: Partial<Client>[], updateDuplicates: boolean) => Promise<{ created: number; updated: number }>;
}

export const ClientExcelModal: React.FC<ClientExcelModalProps> = ({
  isOpen,
  onClose,
  clients,
  onImportBatch,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [updateDuplicates, setUpdateDuplicates] = useState(true);
  const [importFeedback, setImportFeedback] = useState<{ success: boolean; message: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsParsing(true);
    setImportFeedback(null);

    try {
      const result = await parseClientsExcelFile(selectedFile);
      setParseResult(result);
    } catch (err: any) {
      alert(err.message || 'Erro ao processar o arquivo Excel.');
      setFile(null);
      setParseResult(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!parseResult || parseResult.validRows.length === 0) return;

    setIsImporting(true);
    setImportFeedback(null);

    try {
      const clientsToImport = parseResult.validRows.map(r => ({
        name: r.name,
        whatsapp: r.whatsapp,
        phone: r.phone || r.whatsapp,
        nickname: r.nickname,
        email: r.email,
        cpf: r.cpf,
        birth_date: r.birth_date,
        address: r.address,
        city: r.city,
        state: r.state,
        how_did_you_find_us: r.how_did_you_find_us,
        tags: r.tags || [],
        notes: r.notes,
        active: true,
      }));

      const res = await onImportBatch(clientsToImport, updateDuplicates);
      setImportFeedback({
        success: true,
        message: `Sucesso! ${res.created} novo(s) cliente(s) cadastrado(s) e ${res.updated} cliente(s) atualizado(s).`,
      });
      setFile(null);
      setParseResult(null);
    } catch (err: any) {
      setImportFeedback({
        success: false,
        message: err.message || 'Erro ao importar clientes para o banco de dados.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setParseResult(null);
    setImportFeedback(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetState();
        onClose();
      }}
      title="Importar e Exportar Clientes (Excel / CSV)"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              setActiveTab('import');
              setImportFeedback(null);
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Importar do Excel (.xlsx / .csv)
          </button>
          <button
            onClick={() => {
              setActiveTab('export');
              setImportFeedback(null);
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            Exportar para Excel (.xlsx)
          </button>
        </div>

        {/* TAB 1: IMPORT */}
        {activeTab === 'import' && (
          <div className="space-y-6">
            {/* Explanatory Info Card */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <p className="font-semibold text-sm text-amber-950 dark:text-amber-100">
                    Regra simples para importação:
                  </p>
                  <p>
                    Apenas as colunas <strong className="underline">Nome</strong> e <strong className="underline">Telefone / WhatsApp</strong> são obrigatórias.
                  </p>
                  <p className="text-amber-800 dark:text-amber-300">
                    Todas as outras (E-mail, CPF, Data de Nascimento, Endereço, Tags, Observações) são opcionais.
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={downloadClientExcelTemplate}
                icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                className="whitespace-nowrap border-amber-300 dark:border-amber-700 hover:bg-amber-100/50 text-amber-950 dark:text-amber-100"
              >
                Baixar Planilha Modelo
              </Button>
            </div>

            {/* Feedback Message */}
            {importFeedback && (
              <div
                className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
                  importFeedback.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                }`}
              >
                {importFeedback.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{importFeedback.message}</span>
              </div>
            )}

            {/* Dropzone */}
            {!parseResult && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-900/50 hover:bg-rose-50/20 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                />

                <div className="w-16 h-16 mx-auto mb-4 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>

                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Arraste e solte sua planilha aqui
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ou clique para selecionar um arquivo do seu computador (.xlsx, .xls ou .csv)
                </p>

                {isParsing && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-rose-600 font-medium">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processando planilha...
                  </div>
                )}
              </div>
            )}

            {/* Preview Results */}
            {parseResult && (
              <div className="space-y-4">
                {/* Stats Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-100 dark:bg-slate-850 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-6 h-6 text-rose-600" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {file?.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {parseResult.totalRows} linha(s) encontrada(s) na planilha
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="px-3 py-1">
                      <Check className="w-3.5 h-3.5 mr-1" /> {parseResult.validRows.length} Válidos
                    </Badge>
                    {parseResult.invalidRows.length > 0 && (
                      <Badge variant="danger" className="px-3 py-1">
                        <X className="w-3.5 h-3.5 mr-1" /> {parseResult.invalidRows.length} com Erro
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={resetState}>
                      Trocar Arquivo
                    </Button>
                  </div>
                </div>

                {/* Duplicates Option */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="updateDuplicates"
                    checked={updateDuplicates}
                    onChange={(e) => setUpdateDuplicates(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="updateDuplicates" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer font-medium">
                    Se o cliente já existir (mesmo WhatsApp), atualizar os dados com as novas informações da planilha.
                  </label>
                </div>

                {/* Preview Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0 font-bold">
                      <tr>
                        <th className="p-3">Status</th>
                        <th className="p-3">Nome</th>
                        <th className="p-3">WhatsApp / Telefone</th>
                        <th className="p-3">E-mail / CPF</th>
                        <th className="p-3">Cidade / UF</th>
                        <th className="p-3">Tags</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {parseResult.validRows.slice(0, 50).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Válido
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{row.name}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300 font-mono">{row.phone || row.whatsapp}</td>
                          <td className="p-3 text-slate-500">{row.email || row.cpf || '-'}</td>
                          <td className="p-3 text-slate-500">{row.city ? `${row.city}${row.state ? ' - ' + row.state : ''}` : '-'}</td>
                          <td className="p-3">
                            {row.tags && row.tags.length > 0 ? (
                              <div className="flex gap-1 flex-wrap">
                                {row.tags.map((t, i) => (
                                  <span key={i} className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}

                      {parseResult.invalidRows.map((row, idx) => (
                        <tr key={`inv-${idx}`} className="bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300">
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 bg-rose-100 dark:bg-rose-900/40 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3 h-3" /> Erro
                            </span>
                          </td>
                          <td className="p-3 font-semibold">{row.name || '(Nome Ausente)'}</td>
                          <td className="p-3 font-mono">{row.whatsapp || '(Sem Telefone)'}</td>
                          <td colSpan={3} className="p-3 text-rose-600 dark:text-rose-400 font-medium">
                            {row.error}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Confirm Import Button */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">
                    Mostrando prévia de {parseResult.validRows.length} cliente(s) pronto(s) para inclusão.
                  </span>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={resetState}>
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleImport}
                      disabled={parseResult.validRows.length === 0 || isImporting}
                      icon={isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    >
                      {isImporting
                        ? 'Gravando no Banco de Dados...'
                        : `Importar ${parseResult.validRows.length} Cliente(s)`}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXPORT */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-2xl flex items-center justify-center">
                <FileSpreadsheet className="w-8 h-8" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Exportar Base de Clientes para Excel
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Faça o download de todos os {clients.length} clientes cadastrados com dados completos de contato, histórico financeiro, total de agendamentos e observações.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  onClick={() => exportClientsToExcel(clients, `clientes_iasis_agenda_${new Date().toISOString().split('T')[0]}.xlsx`)}
                  icon={<Download className="w-4 h-4" />}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                >
                  Baixar Planilha Excel (.xlsx)
                </Button>
              </div>
            </div>

            <div className="p-4 bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Colunas inclusas na exportação:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 dark:text-slate-400">
                <div>• Nome Completo</div>
                <div>• WhatsApp e Telefone</div>
                <div>• E-mail e CPF</div>
                <div>• Data de Nascimento</div>
                <div>• Endereço e Cidade</div>
                <div>• Tags e Etiquetas</div>
                <div>• Total de Visitas</div>
                <div>• Total Gasto no Estúdio</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
