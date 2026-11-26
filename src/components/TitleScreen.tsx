import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { RECIPE_LIST } from '../game/recipes';
import { DifficultyMode } from '../game/types';
import { DapurWajanLogo } from './FoodSvg';
import { PWAInstallButton } from './PWAControls';

interface TitleScreenProps {
  difficulty: DifficultyMode;
  onChangeDifficulty: (mode: DifficultyMode) => void;
  onStart: () => void;
  muted: boolean;
  onToggleMute: () => void;
  bestRevenue: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  difficulty,
  onChangeDifficulty,
  onStart,
  muted,
  onToggleMute,
  bestRevenue,
}) => {
  return (
    <div className="fixed inset-0 z-10 flex flex-col justify-between p-5 md:p-12 overflow-y-auto md:overflow-hidden pointer-events-none">
      {/* Top right sound & PWA install controls */}
      <div className="flex items-center justify-end gap-2.5 pointer-events-auto">
        <PWAInstallButton />
        <button
          type="button"
          onClick={onToggleMute}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900/90 border border-stone-700/70 text-stone-200 hover:bg-stone-800 hover:text-white transition-colors text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-orange-500"
          aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{muted ? 'Suara Mati' : 'Suara Aktif'}</span>
        </button>
      </div>

      {/* Main Left-Aligned Hero Lockup with calm negative space */}
      <div className="max-w-xl my-auto pointer-events-auto">
        <DapurWajanLogo className="w-72 md:w-96 h-auto mb-5" />

        <p className="text-stone-300 text-base md:text-lg leading-relaxed mb-7 max-w-md">
          Kelola warung Nusantara di tengah jam makan sibuk. Potong bahan segar di talenan,
          aduk wajan di atas api menyala, dan sajikan hangat sebelum pelanggan kecewa.
        </p>

        {/* Difficulty Segmented Control */}
        <div className="mb-6">
          <div className="text-xs font-medium text-stone-400 mb-2">
            Pilih Tempo Dapur
          </div>
          <div
            className="inline-flex items-center gap-1 p-1 rounded-lg bg-stone-900/90 border border-stone-800"
            role="radiogroup"
            aria-label="Tempo Dapur"
          >
            <button
              type="button"
              onClick={() => onChangeDifficulty('SANTAI')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-orange-500 ${
                difficulty === 'SANTAI'
                  ? 'bg-stone-100 text-stone-950'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Shift Santai
            </button>
            <button
              type="button"
              onClick={() => onChangeDifficulty('JAM_SIBUK')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-orange-500 ${
                difficulty === 'JAM_SIBUK'
                  ? 'bg-orange-600 text-white'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Jam Sibuk (1.5x)
            </button>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-wrap items-center gap-4 mb-7">
          <button
            type="button"
            onClick={onStart}
            className="px-7 py-3.5 rounded-lg bg-orange-600 hover:bg-orange-500 active:translate-y-px text-white font-semibold text-base transition-all shadow-lg shadow-orange-950/50 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-orange-400"
          >
            Mulai Masak
          </button>

          {bestRevenue > 0 && (
            <div className="text-sm text-stone-300 font-mono-num">
              Rekor Omzet: <span className="text-amber-400 font-semibold">Rp {bestRevenue.toLocaleString('id-ID')}</span>
            </div>
          )}
        </div>

        {/* Unboxed Menu Preview Strip */}
        <div className="text-xs text-stone-400 leading-relaxed mb-3">
          <span className="text-stone-300 font-medium">Menu Warung: </span>
          {RECIPE_LIST.map((r, idx) => (
            <React.Fragment key={r.id}>
              <span>{r.name}</span>
              {idx < RECIPE_LIST.length - 1 && (
                <span className="mx-2 text-stone-600" aria-hidden="true">
                  ·
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Single flat control-hint line */}
      <div className="text-xs md:text-sm text-stone-400 font-mono-num">
        1–7 Pilih Bahan · Q Potong · Spasi Aduk Wajan · E Angkat ke Piring · Enter Sajikan · Esc Jeda
      </div>
    </div>
  );
};
