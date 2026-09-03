import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';
import { TreatmentPhoto, PhotoType, Client } from '@/types';
import { format } from 'date-fns';
import { Upload, Camera, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  defaultProcedure?: string;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  client,
  defaultProcedure = 'Procedimento Estético',
}) => {
  const { savePhoto } = useBusiness();
  const { success, error: toastError } = useToast();

  const [procedureName, setProcedureName] = useState(defaultProcedure);
  const [photoType, setPhotoType] = useState<PhotoType>('before');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File upload reader (Base64 for instant local preview or Supabase storage)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      toastError('Selecione ou faça upload de uma foto');
      return;
    }

    try {
      setIsSubmitting(true);
      const photo: TreatmentPhoto = {
        id: `pho_${Date.now()}`,
        client_id: client.id,
        procedure_name: procedureName,
        photo_type: photoType,
        image_url: imageUrl,
        date,
        notes: notes.trim() || undefined,
        created_at: new Date().toISOString(),
      };

      await savePhoto(photo);
      success('Foto salva na galeria da cliente!');
      setImageUrl('');
      setNotes('');
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Erro ao salvar foto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload de Foto do Procedimento"
      subtitle={`Cliente: ${client.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome do Procedimento"
          value={procedureName}
          onChange={e => setProcedureName(e.target.value)}
          placeholder="Ex: Extensão Volume Brasileiro"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Tipo da Foto"
            value={photoType}
            onChange={e => setPhotoType(e.target.value as PhotoType)}
          >
            <option value="before">Antes do Procedimento</option>
            <option value="after">Depois do Procedimento</option>
            <option value="during">Durante o Atendimento</option>
            <option value="reference">Foto de Referência</option>
          </Select>

          <Input
            label="Data da Foto"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>

        {/* Upload area */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Arquivo de Imagem
          </label>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 transition-colors">
            {imageUrl ? (
              <div className="space-y-2">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-xl object-contain shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                >
                  Trocar imagem
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block py-4">
                <Camera className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Clique para tirar foto ou escolher arquivo
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  PNG, JPG ou WEBP até 10MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <Input
          label="Observações da Foto (opcional)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Ex: Curvatura D, iluminação natural, vista frontal"
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" loading={isSubmitting}>
            Salvar Foto
          </Button>
        </div>
      </form>
    </Modal>
  );
};
