import { IngredientDef, IngredientId, RecipeDef, RecipeId, WokDoneness } from './types';

export const INGREDIENTS: Record<IngredientId, IngredientDef> = {
  nasi: {
    id: 'nasi',
    name: 'Nasi Putih',
    shortName: 'Nasi',
    needsChop: false,
    chopsRequired: 0,
    hotkey: '1',
    color: '#FAF8F5',
    accentColor: '#E7E0D3',
  },
  mie: {
    id: 'mie',
    name: 'Mie Kuning',
    shortName: 'Mie',
    needsChop: false,
    chopsRequired: 0,
    hotkey: '2',
    color: '#FBBF24',
    accentColor: '#D97706',
  },
  telur: {
    id: 'telur',
    name: 'Telur Ayam',
    shortName: 'Telur',
    needsChop: false,
    chopsRequired: 0,
    hotkey: '3',
    color: '#FDE68A',
    accentColor: '#F59E0B',
  },
  ayam: {
    id: 'ayam',
    name: 'Daging Ayam',
    shortName: 'Ayam',
    needsChop: true,
    chopsRequired: 3,
    hotkey: '4',
    color: '#FCA5A5',
    accentColor: '#EA580C',
  },
  sayur: {
    id: 'sayur',
    name: 'Sawi & Kol',
    shortName: 'Sayur',
    needsChop: true,
    chopsRequired: 3,
    hotkey: '5',
    color: '#4ADE80',
    accentColor: '#16A34A',
  },
  kecap: {
    id: 'kecap',
    name: 'Kecap Manis',
    shortName: 'Kecap',
    needsChop: false,
    chopsRequired: 0,
    hotkey: '6',
    color: '#451A03',
    accentColor: '#92400E',
  },
  sambal: {
    id: 'sambal',
    name: 'Sambal Terasi',
    shortName: 'Sambal',
    needsChop: false,
    chopsRequired: 0,
    hotkey: '7',
    color: '#EF4444',
    accentColor: '#991B1B',
  },
};

export const INGREDIENT_LIST: IngredientDef[] = [
  INGREDIENTS.nasi,
  INGREDIENTS.mie,
  INGREDIENTS.telur,
  INGREDIENTS.ayam,
  INGREDIENTS.sayur,
  INGREDIENTS.kecap,
  INGREDIENTS.sambal,
];

export const RECIPES: Record<RecipeId, RecipeDef> = {
  telur_dadar_sambal: {
    id: 'telur_dadar_sambal',
    name: 'Telur Dadar Sambal',
    ingredients: ['telur', 'sambal'],
    basePrice: 22000,
    cookSpeed: 10.5,
    difficultyTier: 1,
    tagline: 'Renungan hangat warung malam, gurih pedas cepat saji.',
  },
  nasi_goreng_kampung: {
    id: 'nasi_goreng_kampung',
    name: 'Nasi Goreng Kampung',
    ingredients: ['nasi', 'telur', 'sambal'],
    basePrice: 30000,
    cookSpeed: 9.2,
    difficultyTier: 2,
    tagline: 'Aroma wajan berasap dengan telur orak-arik dan sambal.',
  },
  mie_goreng_jawa: {
    id: 'mie_goreng_jawa',
    name: 'Mie Goreng Jawa',
    ingredients: ['mie', 'sayur', 'kecap'],
    basePrice: 32000,
    cookSpeed: 9.0,
    difficultyTier: 2,
    tagline: 'Mie kuning kenyal, sawi segar, dan manis legit kecap.',
  },
  ayam_goreng_lengkuas: {
    id: 'ayam_goreng_lengkuas',
    name: 'Ayam Penyet Sambal',
    ingredients: ['ayam', 'sambal', 'kecap'],
    basePrice: 36000,
    cookSpeed: 8.4,
    difficultyTier: 2,
    tagline: 'Potongan ayam goreng gurih berpadu sambal terasi dan kecap.',
  },
  nasi_goreng_spesial: {
    id: 'nasi_goreng_spesial',
    name: 'Nasi Goreng Spesial',
    ingredients: ['nasi', 'ayam', 'telur', 'kecap'],
    basePrice: 45000,
    cookSpeed: 8.0,
    difficultyTier: 3,
    tagline: 'Menu andalan warung lengkap dengan suwiran ayam dan kecap.',
  },
};

export const RECIPE_LIST: RecipeDef[] = [
  RECIPES.telur_dadar_sambal,
  RECIPES.nasi_goreng_kampung,
  RECIPES.mie_goreng_jawa,
  RECIPES.ayam_goreng_lengkuas,
  RECIPES.nasi_goreng_spesial,
];

export const CUSTOMER_NAMES = [
  'Pak Budi',
  'Mbak Sari',
  'Mas Raka',
  'Ibu Dewi',
  'Bang Dimas',
  'Neng Rina',
  'Pak Hendra',
  'Mbak Nia',
];

export function matchExactRecipe(ingredients: IngredientId[]): RecipeId | null {
  if (ingredients.length === 0) return null;
  const set = new Set(ingredients);
  for (const recipe of RECIPE_LIST) {
    if (
      recipe.ingredients.length === set.size &&
      recipe.ingredients.every((ing) => set.has(ing))
    ) {
      return recipe.id;
    }
  }
  return null;
}

export function findCandidateRecipes(ingredients: IngredientId[]): RecipeDef[] {
  if (ingredients.length === 0) return [];
  const set = new Set(ingredients);
  return RECIPE_LIST.filter((recipe) =>
    Array.from(set).every((ing) => recipe.ingredients.includes(ing))
  );
}

export function getWokDoneness(
  ingredientCount: number,
  cookProgress: number
): WokDoneness {
  if (ingredientCount === 0) return 'KOSONG';
  if (cookProgress >= 100) return 'GOSONG';
  if (cookProgress >= 93) return 'HAMPIR_GOSONG';
  if (cookProgress >= 65) return 'MATANG_PAS';
  return 'MENTAH';
}

export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}
