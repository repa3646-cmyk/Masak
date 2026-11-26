import React from 'react';
import { Flame, Trash2, Utensils } from 'lucide-react';
import {
  findCandidateRecipes,
  getWokDoneness,
  INGREDIENT_LIST,
  INGREDIENTS,
  RECIPES,
} from '../game/recipes';
import {
  BoardState,
  FeedbackBanner,
  IngredientId,
  OrderTicket,
  PlateState,
  WokState,
} from '../game/types';
import { DishIcon, IngredientIcon } from './FoodSvg';

interface KitchenStationsProps {
  board: BoardState;
  wok: WokState;
  plate: PlateState;
  orders: OrderTicket[];
  feedback: FeedbackBanner | null;
  onSelectIngredient: (id: IngredientId) => void;
  onChopBoard: () => void;
  onMoveBoardToWok: () => void;
  onClearBoard: () => void;
  onStirWok: () => void;
  onPlateFromWok: () => void;
  onTrashWok: () => void;
  onServePlate: () => void;
  onTrashPlate: () => void;
}

export const KitchenStations: React.FC<KitchenStationsProps> = ({
  board,
  wok,
  plate,
  orders,
  feedback,
  onSelectIngredient,
  onChopBoard,
  onMoveBoardToWok,
  onClearBoard,
  onStirWok,
  onPlateFromWok,
  onTrashWok,
  onServePlate,
  onTrashPlate,
}) => {
  const doneness = getWokDoneness(wok.ingredients.length, wok.cookProgress);
  const candidates = findCandidateRecipes(wok.ingredients);
  const exactRecipe = wok.matchedRecipeId ? RECIPES[wok.matchedRecipeId] : null;
  const canPlate =
    Boolean(exactRecipe) &&
    (doneness === 'MATANG_PAS' || doneness === 'HAMPIR_GOSONG') &&
    plate.recipeId === null;

  const matchingOrder = plate.recipeId
    ? orders.find((o) => o.recipeId === plate.recipeId)
    : undefined;

  // Determine helpful inline recipe hint above Wok
  let wokHintText = 'Pilih bahan di rak bawah untuk mulai memasak';
  let wokHintTone = 'text-stone-300';
  if (wok.ingredients.length > 0) {
    if (doneness === 'GOSONG') {
      wokHintText = 'Masakan gosong — buang isi wajan untuk mulai lagi';
      wokHintTone = 'text-red-300';
    } else if (exactRecipe) {
      wokHintText =
        doneness === 'MATANG_PAS'
          ? `${exactRecipe.name} matang sempurna — angkat ke piring`
          : doneness === 'HAMPIR_GOSONG'
            ? `${exactRecipe.name} hampir gosong — segera angkat`
            : `Memasak ${exactRecipe.name} — aduk agar merata`;
      wokHintTone =
        doneness === 'MATANG_PAS'
          ? 'text-emerald-300'
          : doneness === 'HAMPIR_GOSONG'
            ? 'text-amber-300'
            : 'text-stone-200';
    } else if (candidates.length > 0) {
      const first = candidates[0];
      const missing = first.ingredients
        .filter((ing) => !wok.ingredients.includes(ing))
        .map((ing) => INGREDIENTS[ing].shortName);
      wokHintText = `Menuju ${first.name} · Tambah: ${missing.join(' + ')}`;
      wokHintTone = 'text-amber-200';
    } else {
      wokHintText = 'Campuran tidak sesuai resep — tekan Buang untuk ulang';
      wokHintTone = 'text-red-300';
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between px-3 pb-3 md:px-6 md:pb-5 pointer-events-none z-10 min-h-0">
      {/* Upper Center Hint + Feedback Toast (never occludes wok) */}
      <div className="flex flex-col items-center gap-1.5 pt-1">
        <div
          className={`px-3.5 py-1.5 rounded-lg bg-stone-950/88 border border-stone-800 text-xs md:text-sm font-medium text-center max-w-xl ${wokHintTone}`}
        >
          {wokHintText}
        </div>
        {feedback && (
          <div
            key={feedback.id}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-opacity ${
              feedback.tone === 'success'
                ? 'bg-emerald-950/95 border border-emerald-600/70 text-emerald-200'
                : feedback.tone === 'warn'
                  ? 'bg-amber-950/95 border border-amber-600/70 text-amber-200'
                  : feedback.tone === 'error'
                    ? 'bg-red-950/95 border border-red-600/70 text-red-200'
                    : 'bg-stone-900/95 border border-stone-700 text-stone-200'
            }`}
          >
            {feedback.text}
          </div>
        )}
      </div>

      {/* Middle 3-Zone Workspace: Left Board · Center Open Wok Window · Right Plate */}
      <div className="grid grid-cols-1 md:grid-cols-12 items-end md:items-center gap-3 my-auto">
        {/* LEFT STATION: TALENAN (Chopping Board) */}
        <section
          aria-label="Talenan Potong"
          className="md:col-span-3 pointer-events-auto rounded-xl bg-[#2A1D13]/95 border border-amber-900/60 p-3.5 shadow-lg"
        >
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <h2 className="text-sm font-semibold text-amber-100">
              Talenan
            </h2>
            <span className="text-xs font-mono-num text-amber-300/80">
              Tombol Q
            </span>
          </div>

          {board.ingredient ? (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={board.ready ? onMoveBoardToWok : onChopBoard}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-[#3A2719] hover:bg-[#48301F] active:scale-[0.98] transition-all border border-amber-800/50 cursor-pointer text-left min-h-[56px]"
              >
                <IngredientIcon id={board.ingredient} className="w-10 h-10 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-stone-100 truncate">
                    {INGREDIENTS[board.ingredient].name}
                  </div>
                  <div className="text-xs font-mono-num text-amber-300 mt-0.5">
                    {board.ready
                      ? 'Sudah tercincang · Siap masuk wajan'
                      : `Potongan ${board.chopsDone}/${board.chopsRequired}`}
                  </div>
                </div>
              </button>

              {/* Chop Pips */}
              <div className="grid grid-cols-3 gap-1.5">
                {Array.from({ length: board.chopsRequired }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-sm transition-colors ${
                      idx < board.chopsDone ? 'bg-emerald-500' : 'bg-stone-800'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {board.ready ? (
                  <button
                    type="button"
                    onClick={onMoveBoardToWok}
                    className="flex-1 min-h-[44px] px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
                  >
                    Masuk Wajan (Q)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onChopBoard}
                    className="flex-1 min-h-[44px] px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white text-xs font-semibold cursor-pointer transition-all whitespace-nowrap"
                  >
                    Potong Bahan (Q)
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClearBoard}
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer transition-colors"
                  aria-label="Kosongkan talenan"
                  title="Kosongkan talenan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-5 text-center text-xs text-stone-400 border border-dashed border-amber-900/50 rounded-lg">
              Bahan seperti Ayam dan Sayur otomatis dipotong di sini.
            </div>
          )}
        </section>

        {/* CENTER STATION: OPEN WOK VIEWPORT + BOTTOM WOK CONTROLS */}
        <section
          aria-label="Wajan Kompor"
          className="md:col-span-6 flex flex-col items-center justify-end min-h-[210px] md:min-h-[280px]"
        >
          {/* Invisible interactive click target right over the live Canvas Wok */}
          <button
            type="button"
            onClick={onStirWok}
            disabled={wok.ingredients.length === 0 || doneness === 'GOSONG'}
            aria-label="Aduk wajan"
            className="pointer-events-auto w-56 h-36 md:w-72 md:h-44 rounded-full bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-orange-500 disabled:cursor-default"
          />

          {/* Compact Wok Telemetry & Controls Bar sitting right below the wok */}
          <div className="pointer-events-auto w-full max-w-md rounded-xl bg-stone-950/92 border border-stone-800 p-3 shadow-xl">
            {/* Active Ingredients in Wok */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 min-h-[24px] flex-wrap">
                {wok.ingredients.length === 0 ? (
                  <span className="text-xs text-stone-400">Wajan kosong</span>
                ) : (
                  wok.ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="inline-flex items-center gap-1 text-xs text-stone-200 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800"
                    >
                      <IngredientIcon id={ing} className="w-4 h-4" />
                      <span>{INGREDIENTS[ing].shortName}</span>
                    </span>
                  ))
                )}
              </div>
              <span
                className={`text-xs font-mono-num font-semibold shrink-0 ${
                  doneness === 'MATANG_PAS'
                    ? 'text-emerald-400'
                    : doneness === 'HAMPIR_GOSONG'
                      ? 'text-amber-400'
                      : doneness === 'GOSONG'
                        ? 'text-red-400'
                        : 'text-stone-300'
                }`}
              >
                {doneness === 'KOSONG' && 'Siap'}
                {doneness === 'MENTAH' && `Memasak ${Math.floor(wok.cookProgress)}%`}
                {doneness === 'MATANG_PAS' && `Matang Pas ${Math.floor(wok.cookProgress)}%`}
                {doneness === 'HAMPIR_GOSONG' && `Awas Gosong ${Math.floor(wok.cookProgress)}%`}
                {doneness === 'GOSONG' && 'Gosong! 100%'}
              </span>
            </div>

            {/* Doneness Meter with Target Zone Indicator */}
            <div className="relative h-3 w-full rounded-md bg-stone-800 overflow-hidden mb-3">
              {/* Target green zone marker (65% to 92%) */}
              <div
                className="absolute top-0 bottom-0 bg-emerald-500/25 border-x border-emerald-400/60"
                style={{ left: '65%', width: '27%' }}
              />
              <div
                className={`h-full transition-all duration-100 ${
                  doneness === 'GOSONG'
                    ? 'bg-red-700'
                    : doneness === 'HAMPIR_GOSONG'
                      ? 'bg-amber-500'
                      : doneness === 'MATANG_PAS'
                        ? 'bg-emerald-500'
                        : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min(100, wok.cookProgress)}%` }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onStirWok}
                disabled={wok.ingredients.length === 0 || doneness === 'GOSONG'}
                className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:bg-stone-800 disabled:text-stone-500 text-white text-xs font-semibold cursor-pointer disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                <Flame className="w-4 h-4" />
                <span>Aduk Wajan (Spasi)</span>
              </button>

              <button
                type="button"
                onClick={onPlateFromWok}
                disabled={!canPlate}
                className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-500 text-white text-xs font-semibold cursor-pointer disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                <Utensils className="w-4 h-4" />
                <span>Angkat (E)</span>
              </button>

              <button
                type="button"
                onClick={onTrashWok}
                disabled={wok.ingredients.length === 0}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg bg-stone-800 hover:bg-red-900/80 disabled:opacity-40 text-stone-200 cursor-pointer disabled:cursor-not-allowed transition-colors"
                aria-label="Buang isi wajan (X)"
                title="Buang isi wajan (X)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT STATION: PIRING SAJI (Plating & Serving) */}
        <section
          aria-label="Piring Saji"
          className="md:col-span-3 pointer-events-auto rounded-xl bg-stone-900/94 border border-stone-700/80 p-3.5 shadow-lg"
        >
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <h2 className="text-sm font-semibold text-stone-100">
              Piring Saji
            </h2>
            <span className="text-xs font-mono-num text-stone-400">
              Enter
            </span>
          </div>

          {plate.recipeId ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-stone-950/70 border border-stone-800">
                <DishIcon id={plate.recipeId} className="w-12 h-12 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-stone-100 truncate">
                    {RECIPES[plate.recipeId].name}
                  </div>
                  <div
                    className={`text-xs font-medium mt-0.5 ${
                      plate.quality === 'SEMPURNA' ? 'text-emerald-400' : 'text-amber-300'
                    }`}
                  >
                    {plate.quality === 'SEMPURNA'
                      ? 'Matang Sempurna (+50% Bonus)'
                      : 'Matang Standar'}
                  </div>
                </div>
              </div>

              <div className="text-xs text-stone-300">
                {matchingOrder
                  ? `Cocok untuk pesanan ${matchingOrder.customerName}`
                  : 'Belum ada pesanan untuk hidangan ini'}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onServePlate}
                  disabled={!matchingOrder}
                  className="flex-1 min-h-[44px] px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-500 text-white text-xs font-semibold cursor-pointer disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  Sajikan! (Enter)
                </button>
                <button
                  type="button"
                  onClick={onTrashPlate}
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg bg-stone-800 hover:bg-red-900/80 text-stone-300 cursor-pointer transition-colors"
                  aria-label="Buang hidangan di piring"
                  title="Buang hidangan di piring"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-5 text-center text-xs text-stone-400 border border-dashed border-stone-700 rounded-lg">
              Angkat masakan dari wajan ke piring untuk disajikan.
            </div>
          )}
        </section>
      </div>

      {/* BOTTOM STATION: RAK BAHAN (7 Pantry Ingredients) */}
      <nav
        aria-label="Rak Bahan Masakan"
        className="pointer-events-auto w-full max-w-5xl mx-auto rounded-xl bg-stone-950/94 border border-stone-800 p-2 shadow-xl"
      >
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 md:gap-2">
          {INGREDIENT_LIST.map((ing) => (
            <button
              key={ing.id}
              type="button"
              onClick={() => onSelectIngredient(ing.id)}
              className="group relative flex flex-col items-center justify-center gap-1 py-2 px-1.5 min-h-[60px] rounded-lg bg-stone-900 hover:bg-stone-800 active:scale-[0.97] border border-stone-800 hover:border-orange-600/60 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-orange-500"
            >
              <span className="absolute top-1 left-1.5 text-[10px] font-mono-num text-stone-500 group-hover:text-stone-300">
                {ing.hotkey}
              </span>
              <IngredientIcon id={ing.id} className="w-7 h-7 md:w-8 md:h-8" />
              <span className="text-xs font-semibold text-stone-100 whitespace-nowrap">
                {ing.shortName}
              </span>
              <span className="text-[10px] text-stone-400 whitespace-nowrap">
                {ing.needsChop ? 'Potong' : 'Wajan'}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};
