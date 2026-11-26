export type GameState =
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'ROUND_SUMMARY'
  | 'GAME_OVER';

export type DifficultyMode = 'SANTAI' | 'JAM_SIBUK';

export type IngredientId =
  | 'nasi'
  | 'mie'
  | 'telur'
  | 'ayam'
  | 'sayur'
  | 'kecap'
  | 'sambal';

export type RecipeId =
  | 'telur_dadar_sambal'
  | 'nasi_goreng_kampung'
  | 'mie_goreng_jawa'
  | 'ayam_goreng_lengkuas'
  | 'nasi_goreng_spesial';

export interface IngredientDef {
  id: IngredientId;
  name: string;
  shortName: string;
  needsChop: boolean;
  chopsRequired: number;
  hotkey: string;
  color: string;
  accentColor: string;
}

export interface RecipeDef {
  id: RecipeId;
  name: string;
  ingredients: IngredientId[];
  basePrice: number;
  cookSpeed: number; // % per second base
  difficultyTier: 1 | 2 | 3;
  tagline: string;
}

export interface OrderTicket {
  id: string;
  recipeId: RecipeId;
  customerName: string;
  patience: number;
  maxPatience: number;
  reward: number;
  arrivedAt: number;
}

export interface BoardState {
  ingredient: IngredientId | null;
  chopsDone: number;
  chopsRequired: number;
  ready: boolean;
}

export type WokDoneness = 'KOSONG' | 'MENTAH' | 'MATANG_PAS' | 'HAMPIR_GOSONG' | 'GOSONG';

export interface WokState {
  ingredients: IngredientId[];
  cookProgress: number; // 0 - 100
  stirCount: number;
  matchedRecipeId: RecipeId | null;
}

export type DishQuality = 'SEMPURNA' | 'STANDAR';

export interface PlateState {
  recipeId: RecipeId | null;
  quality: DishQuality | null;
}

export interface ShiftStats {
  day: number;
  revenue: number;
  targetRevenue: number;
  dishesServed: number;
  perfectDishes: number;
  combo: number;
  maxCombo: number;
  reputation: number;
  maxReputation: number;
  shiftTimeRemaining: number;
  shiftDuration: number;
  failReason: 'REPUTASI_HABIS' | 'TARGET_TIDAK_TERCAPAI' | null;
}

export interface FeedbackBanner {
  id: number;
  text: string;
  tone: 'success' | 'warn' | 'error' | 'info';
}

export interface WokVisualItem {
  ingredient: IngredientId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  scale: number;
}

export interface CanvasParticle {
  active: boolean;
  kind: 'steam' | 'spark' | 'ember' | 'chop' | 'smoke' | 'star';
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
  rot: number;
  vRot: number;
}

export interface KitchenSimSnapshot {
  gameState: GameState;
  wokIngredients: IngredientId[];
  cookProgress: number;
  doneness: WokDoneness;
  boardIngredient: IngredientId | null;
  boardReady: boolean;
  plateRecipe: RecipeId | null;
  combo: number;
  // Event triggers bumped by React actions and consumed by canvas loop
  stirPulseId: number;
  chopPulseId: number;
  chopPulseColor: string;
  dropPulseId: number;
  servePulseId: number;
  burnPulseId: number;
}
