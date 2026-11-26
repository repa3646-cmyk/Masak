import React from 'react';
import { X } from 'lucide-react';
import { formatRupiah, INGREDIENTS, RECIPE_LIST } from '../game/recipes';
import { ShiftStats } from '../game/types';
import { DishIcon, IngredientIcon } from './FoodSvg';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onQuitToTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onQuitToTitle,
}) => (
  <div
    className="fixed inset-0 z-30 flex items-center justify-center bg-black/75 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="pause-title"
  >
    <div className="w-full max-w-sm rounded-xl bg-stone-900 border border-stone-700 p-6 shadow-2xl">
      <h2 id="pause-title" className="font-display text-2xl font-bold text-stone-100 mb-2">
        Dapur Dijeda
      </h2>
      <p className="text-sm text-stone-400 mb-6">
        Api kompor dimatikan sementara. Siap lanjut melayani pelanggan?
      </p>
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onResume}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm cursor-pointer transition-colors"
        >
          Lanjutkan Masak
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-sm cursor-pointer transition-colors"
        >
          Ulangi Hari Ini
        </button>
        <button
          type="button"
          onClick={onQuitToTitle}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-transparent border border-stone-700 hover:bg-stone-800 text-stone-300 font-medium text-sm cursor-pointer transition-colors"
        >
          Kembali ke Menu Utama
        </button>
      </div>
    </div>
  </div>
);

interface RecipeBookModalProps {
  onClose: () => void;
}

export const RecipeBookModal: React.FC<RecipeBookModalProps> = ({ onClose }) => (
  <div
    className="fixed inset-0 z-30 flex items-center justify-center bg-black/75 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="recipe-book-title"
  >
    <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl bg-stone-900 border border-stone-700 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
        <div>
          <h2 id="recipe-book-title" className="font-display text-xl font-bold text-stone-100">
            Buku Resep Warung Nusantara
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Bahan bertanda Potong harus dicincang di Talenan sebelum masuk wajan.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer transition-colors"
          aria-label="Tutup buku resep"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 overflow-y-auto flex flex-col gap-3">
        {RECIPE_LIST.map((recipe) => (
          <div
            key={recipe.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-stone-950/75 border border-stone-800"
          >
            <div className="flex items-center gap-3">
              <DishIcon id={recipe.id} className="w-12 h-12 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-stone-100 text-sm">
                    {recipe.name}
                  </h3>
                  <span className="text-xs font-mono-num text-amber-400">
                    {formatRupiah(recipe.basePrice)}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  {recipe.tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {recipe.ingredients.map((ingId) => {
                const ing = INGREDIENTS[ingId];
                return (
                  <div
                    key={ingId}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-stone-900 border border-stone-800 text-xs text-stone-200"
                  >
                    <IngredientIcon id={ingId} className="w-4 h-4" />
                    <span>{ing.shortName}</span>
                    {ing.needsChop && (
                      <span className="text-[10px] text-orange-400">
                        · Potong
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

interface RoundSummaryModalProps {
  stats: ShiftStats;
  onNextDay: () => void;
  onQuitToTitle: () => void;
}

export const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({
  stats,
  onNextDay,
  onQuitToTitle,
}) => (
  <div
    className="fixed inset-0 z-30 flex items-center justify-center bg-black/75 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="round-summary-title"
  >
    <div className="w-full max-w-md rounded-xl bg-stone-900 border border-stone-700 p-6 shadow-2xl">
      <div className="text-xs font-medium text-emerald-400 mb-1">
        Target Terpenuhi
      </div>
      <h2 id="round-summary-title" className="font-display text-2xl font-bold text-stone-100 mb-4">
        Shift Hari {stats.day} Selesai
      </h2>

      <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
        <div className="p-3 rounded-lg bg-stone-950/70 border border-stone-800">
          <div className="text-xs text-stone-400">Total Omzet</div>
          <div className="font-mono-num font-bold text-lg text-amber-400 mt-0.5">
            {formatRupiah(stats.revenue)}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-stone-950/70 border border-stone-800">
          <div className="text-xs text-stone-400">Piring Disajikan</div>
          <div className="font-mono-num font-bold text-lg text-stone-100 mt-0.5">
            {stats.dishesServed}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-stone-950/70 border border-stone-800">
          <div className="text-xs text-stone-400">Matang Sempurna</div>
          <div className="font-mono-num font-bold text-lg text-emerald-400 mt-0.5">
            {stats.perfectDishes}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-stone-950/70 border border-stone-800">
          <div className="text-xs text-stone-400">Kombo Tertinggi</div>
          <div className="font-mono-num font-bold text-lg text-orange-400 mt-0.5">
            x{stats.maxCombo}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onNextDay}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm cursor-pointer transition-colors"
        >
          Lanjut ke Hari {stats.day + 1}
        </button>
        <button
          type="button"
          onClick={onQuitToTitle}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-sm cursor-pointer transition-colors"
        >
          Menu Utama
        </button>
      </div>
    </div>
  </div>
);

interface GameOverModalProps {
  stats: ShiftStats;
  onPlayAgain: () => void;
  onQuitToTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onPlayAgain,
  onQuitToTitle,
}) => (
  <div
    className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="gameover-title"
  >
    <div className="w-full max-w-md rounded-xl bg-stone-900 border border-stone-700 p-6 shadow-2xl">
      <div className="text-xs font-medium text-red-400 mb-1">
        {stats.failReason === 'REPUTASI_HABIS'
          ? 'Reputasi Warung Habis'
          : 'Target Omzet Belum Tercapai'}
      </div>
      <h2 id="gameover-title" className="font-display text-2xl font-bold text-stone-100 mb-2">
        Warung Tutup di Hari {stats.day}
      </h2>
      <p className="text-sm text-stone-400 mb-5">
        {stats.failReason === 'REPUTASI_HABIS'
          ? 'Terlalu banyak pelanggan menunggu terlalu lama. Atur urutan bahan dan jangan biarkan pesanan hangus.'
          : `Omzet hari ini ${formatRupiah(stats.revenue)} dari target ${formatRupiah(stats.targetRevenue)}.`}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
        <div className="p-3 rounded-lg bg-stone-950/70 border border-stone-800">
          <div className="text-xs text-stone-400">Omzet Akhir</div>
          <div className="font-mono-num font-bold text-lg text-amber-400 mt-0.5">
            {formatRupiah(stats.revenue)}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-stone-950/70 border border-stone-800">
          <div className="text-xs text-stone-400">Piring Disajikan</div>
          <div className="font-mono-num font-bold text-lg text-stone-100 mt-0.5">
            {stats.dishesServed}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-stone-950/70 border border-stone-800">
          <div className="text-xs text-stone-400">Matang Sempurna</div>
          <div className="font-mono-num font-bold text-lg text-emerald-400 mt-0.5">
            {stats.perfectDishes}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-stone-950/70 border border-stone-800">
          <div className="text-xs text-stone-400">Kombo Tertinggi</div>
          <div className="font-mono-num font-bold text-lg text-orange-400 mt-0.5">
            x{stats.maxCombo}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onPlayAgain}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm cursor-pointer transition-colors"
        >
          Main Lagi
        </button>
        <button
          type="button"
          onClick={onQuitToTitle}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-sm cursor-pointer transition-colors"
        >
          Menu Utama
        </button>
      </div>
    </div>
  </div>
);
