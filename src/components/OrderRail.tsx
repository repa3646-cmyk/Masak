import React from 'react';
import { BookOpen, Heart, Pause, Volume2, VolumeX } from 'lucide-react';
import { formatRupiah, INGREDIENTS, RECIPES } from '../game/recipes';
import { OrderTicket, RecipeId, ShiftStats } from '../game/types';
import { DishIcon, IngredientIcon } from './FoodSvg';
import { PWAInstallButton } from './PWAControls';

interface OrderRailProps {
  stats: ShiftStats;
  orders: OrderTicket[];
  platedRecipeId: RecipeId | null;
  muted: boolean;
  onToggleMute: () => void;
  onToggleRecipeBook: () => void;
  onPause: () => void;
}

function formatClock(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

export const OrderRail: React.FC<OrderRailProps> = ({
  stats,
  orders,
  platedRecipeId,
  muted,
  onToggleMute,
  onToggleRecipeBook,
  onPause,
}) => {
  const targetReached = stats.revenue >= stats.targetRevenue;

  return (
    <header className="w-full px-3 pt-3 md:px-6 md:pt-4 pointer-events-none z-10">
      {/* Top Perimeter Stats & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800/80 pointer-events-auto">
        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-lg text-stone-100 whitespace-nowrap">
              Hari {stats.day}
            </span>
            <span className="text-stone-600" aria-hidden="true">·</span>
            <span
              className={`font-mono-num font-semibold ${
                stats.shiftTimeRemaining <= 15 ? 'text-red-400' : 'text-stone-200'
              }`}
            >
              {formatClock(stats.shiftTimeRemaining)}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 font-mono-num">
            <span className="text-xs text-stone-400">Omzet</span>
            <span
              className={`font-semibold ${
                targetReached ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {formatRupiah(stats.revenue)}
            </span>
            <span className="text-stone-500 text-xs">
              / {formatRupiah(stats.targetRevenue)}
            </span>
          </div>

          <div className="hidden sm:flex items-baseline gap-1.5 font-mono-num">
            <span className="text-xs text-stone-400">Kombo</span>
            <span
              className={`font-semibold ${
                stats.combo >= 3 ? 'text-orange-400' : 'text-stone-200'
              }`}
            >
              x{stats.combo}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono-num">
            <Heart
              className={`w-4 h-4 ${
                stats.reputation <= 1
                  ? 'text-red-500 fill-red-500'
                  : 'text-orange-500 fill-orange-500'
              }`}
              aria-hidden="true"
            />
            <span className="text-xs text-stone-400">Reputasi</span>
            <span className="font-semibold text-stone-100">
              {stats.reputation}/{stats.maxReputation}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton compact />
          <button
            type="button"
            onClick={onToggleRecipeBook}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700/80 hover:bg-stone-800 text-stone-200 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Buku Resep</span>
          </button>
          <button
            type="button"
            onClick={onToggleMute}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-stone-900 border border-stone-700/80 hover:bg-stone-800 text-stone-200 cursor-pointer transition-colors"
            aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'}
            title={muted ? 'Nyalakan suara' : 'Matikan suara'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onPause}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700/80 hover:bg-stone-800 text-stone-200 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Jeda</span>
          </button>
        </div>
      </div>

      {/* Customer Order Tickets Row */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-5xl mx-auto">
        {orders.length === 0 ? (
          <div className="col-span-full text-center py-3 text-xs text-stone-400">
            Menunggu pelanggan berikutnya datang ke warung...
          </div>
        ) : (
          orders.map((order) => {
            const recipe = RECIPES[order.recipeId];
            const ratio = Math.max(0, Math.min(1, order.patience / order.maxPatience));
            const isUrgent = ratio <= 0.28;
            const isMatch = platedRecipeId === order.recipeId;

            return (
              <div
                key={order.id}
                className={`pointer-events-auto rounded-lg px-3 py-2.5 border transition-colors ${
                  isMatch
                    ? 'bg-emerald-950/90 border-emerald-500/80'
                    : isUrgent
                      ? 'bg-red-950/85 border-red-600/70'
                      : 'bg-stone-900/92 border-stone-700/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <DishIcon id={order.recipeId} className="w-10 h-10 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-stone-100 truncate">
                        {recipe.name}
                      </span>
                      <span className="font-mono-num text-xs font-semibold text-amber-400 shrink-0">
                        {formatRupiah(order.reward)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs text-stone-400 mt-0.5">
                      <span className="truncate">{order.customerName}</span>
                      <span
                        className={`font-mono-num shrink-0 ${
                          isUrgent ? 'text-red-300 font-semibold' : 'text-stone-400'
                        }`}
                      >
                        {Math.ceil(order.patience)}d
                      </span>
                    </div>
                  </div>
                </div>

                {/* Required ingredients strip */}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {recipe.ingredients.map((ingId) => (
                      <div
                        key={ingId}
                        className="inline-flex items-center gap-1 text-[11px] text-stone-300"
                        title={INGREDIENTS[ingId].name}
                      >
                        <IngredientIcon id={ingId} className="w-4 h-4" />
                        <span className="hidden md:inline">{INGREDIENTS[ingId].shortName}</span>
                      </div>
                    ))}
                  </div>
                  {isMatch && (
                    <span className="text-[11px] font-semibold text-emerald-300 whitespace-nowrap">
                      Siap Disajikan
                    </span>
                  )}
                </div>

                {/* Patience Bar */}
                <div className="mt-2 h-1.5 w-full rounded-full bg-stone-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-150 ${
                      isUrgent
                        ? 'bg-red-500'
                        : ratio <= 0.55
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${ratio * 100}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </header>
  );
};
