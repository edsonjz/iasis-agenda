import React, { useState } from 'react';
import { TreatmentPhoto } from '@/types';
import { formatDateBR } from '@/lib/dateUtils';
import { Button } from '../common/Button';
import { Sparkles, SlidersHorizontal, Columns, Trash2 } from 'lucide-react';
import { useBusiness } from '@/contexts/BusinessContext';
import { useToast } from '@/contexts/ToastContext';

interface BeforeAfterComparatorProps {
  photos: TreatmentPhoto[];
}

export const BeforeAfterComparator: React.FC<BeforeAfterComparatorProps> = ({ photos }) => {
  const { deletePhoto } = useBusiness();
  const { success } = useToast();

  const beforePhotos = photos.filter(p => p.photo_type === 'before');
  const afterPhotos = photos.filter(p => p.photo_type === 'after');

  const [selectedBeforeId, setSelectedBeforeId] = useState<string>(beforePhotos[0]?.id || '');
  const [selectedAfterId, setSelectedAfterId] = useState<string>(afterPhotos[0]?.id || '');
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [mode, setMode] = useState<'split' | 'side_by_side'>('side_by_side');

  const currentBefore = beforePhotos.find(p => p.id === selectedBeforeId) || beforePhotos[0];
  const currentAfter = afterPhotos.find(p => p.id === selectedAfterId) || afterPhotos[0];

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir esta foto?')) {
      await deletePhoto(id);
      success('Foto excluída');
    }
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-slate-400">
        Nenhuma foto de procedimento registrada para esta cliente.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Comparer Controls */}
      {currentBefore && currentAfter && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Comparador Antes vs Depois
            </h4>
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('side_by_side')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                  mode === 'side_by_side' ? 'bg-rose-600 text-white' : 'text-slate-400'
                }`}
              >
                Lado a Lado
              </button>
              <button
                type="button"
                onClick={() => setMode('split')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                  mode === 'split' ? 'bg-rose-600 text-white' : 'text-slate-400'
                }`}
              >
                Slider / Cortina
              </button>
            </div>
          </div>

          {/* Mode 1: Side by side */}
          {mode === 'side_by_side' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Antes ({formatDateBR(currentBefore.date)})
                </span>
                <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-950 flex items-center justify-center border border-slate-800">
                  <img
                    src={currentBefore.image_url}
                    alt="Antes"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] font-bold text-white backdrop-blur-xs">
                    ANTES
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Depois ({formatDateBR(currentAfter.date)})
                </span>
                <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-950 flex items-center justify-center border border-slate-800">
                  <img
                    src={currentAfter.image_url}
                    alt="Depois"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 right-2 bg-rose-600 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs">
                    DEPOIS
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Interactive Split Slider */}
          {mode === 'split' && (
            <div className="space-y-2">
              <div className="relative rounded-2xl overflow-hidden h-72 max-w-md mx-auto select-none bg-slate-950 border border-slate-800">
                {/* After image (background) */}
                <img
                  src={currentAfter.image_url}
                  alt="Depois"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 bg-rose-600 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs z-10">
                  DEPOIS
                </span>

                {/* Before image (clipped) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={currentBefore.image_url}
                    alt="Antes"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ width: '100%', height: '100%' }}
                  />
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] font-bold text-white z-10">
                    ANTES
                  </span>
                </div>

                {/* Slider bar */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-2xl z-20 flex items-center justify-center"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="w-6 h-6 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg text-[10px] font-bold">
                    ↔
                  </div>
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                value={sliderPos}
                onChange={e => setSliderPos(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
          )}
        </div>
      )}

      {/* Photo Gallery Grid */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Galeria de Fotos do Procedimento ({photos.length})
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {photos.map(photo => (
            <div
              key={photo.id}
              className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
            >
              <img
                src={photo.image_url}
                alt={photo.procedure_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <span
                className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-bold text-white shadow-xs ${
                  photo.photo_type === 'after'
                    ? 'bg-rose-600'
                    : photo.photo_type === 'before'
                    ? 'bg-slate-900'
                    : 'bg-blue-600'
                }`}
              >
                {photo.photo_type === 'after'
                  ? 'DEPOIS'
                  : photo.photo_type === 'before'
                  ? 'ANTES'
                  : 'DURANTE'}
              </span>

              <button
                type="button"
                onClick={() => handleDelete(photo.id)}
                className="absolute top-1.5 right-1.5 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                title="Excluir foto"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-white text-[10px] truncate">
                {formatDateBR(photo.date)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
