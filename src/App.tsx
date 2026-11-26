import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GameOverModal,
  PauseModal,
  RecipeBookModal,
  RoundSummaryModal,
} from './components/GameModals';
import { KitchenCanvas } from './components/KitchenCanvas';
import { KitchenStations } from './components/KitchenStations';
import { OrderRail } from './components/OrderRail';
import { OfflineIndicator } from './components/PWAControls';
import { TitleScreen } from './components/TitleScreen';
import { kitchenAudio } from './game/audio';
import {
  CUSTOMER_NAMES,
  formatRupiah,
  getWokDoneness,
  INGREDIENT_LIST,
  INGREDIENTS,
  matchExactRecipe,
  RECIPE_LIST,
  RECIPES,
} from './game/recipes';
import {
  BoardState,
  DifficultyMode,
  FeedbackBanner,
  GameState,
  IngredientId,
  KitchenSimSnapshot,
  OrderTicket,
  PlateState,
  RecipeId,
  ShiftStats,
  WokState,
} from './game/types';

const SHIFT_DURATION = 90;
const BEST_REVENUE_STORAGE_KEY = 'dapur_wajan_best_revenue';

function loadBestRevenue(): number {
  try {
    const raw = window.localStorage.getItem(BEST_REVENUE_STORAGE_KEY);
    return raw ? Math.max(0, Number(raw) || 0) : 0;
  } catch {
    return 0;
  }
}

function saveBestRevenue(val: number) {
  try {
    window.localStorage.setItem(BEST_REVENUE_STORAGE_KEY, String(val));
  } catch {
    // Ignore storage unavailability
  }
}

function createInitialStats(day: number, difficulty: DifficultyMode): ShiftStats {
  const baseTarget = difficulty === 'JAM_SIBUK' ? 120000 : 90000;
  return {
    day,
    revenue: 0,
    targetRevenue: baseTarget + (day - 1) * 45000,
    dishesServed: 0,
    perfectDishes: 0,
    combo: 0,
    maxCombo: 0,
    reputation: 3,
    maxReputation: 3,
    shiftTimeRemaining: SHIFT_DURATION,
    shiftDuration: SHIFT_DURATION,
    failReason: null,
  };
}

function createEmptyBoard(): BoardState {
  return {
    ingredient: null,
    chopsDone: 0,
    chopsRequired: 3,
    ready: false,
  };
}

function createEmptyWok(): WokState {
  return {
    ingredients: [],
    cookProgress: 0,
    stirCount: 0,
    matchedRecipeId: null,
  };
}

function createEmptyPlate(): PlateState {
  return {
    recipeId: null,
    quality: null,
  };
}

function pickRandomRecipeId(day: number): RecipeId {
  const pool =
    day === 1
      ? RECIPE_LIST.filter((r) => r.difficultyTier <= 2)
      : RECIPE_LIST;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return picked.id;
}

function createOrder(day: number, difficulty: DifficultyMode): OrderTicket {
  const recipeId = pickRandomRecipeId(day);
  const recipe = RECIPES[recipeId];
  const basePatience = difficulty === 'JAM_SIBUK' ? 40 : 54;
  const dayPenalty = Math.min(12, (day - 1) * 2.5);
  const tierExtra = recipe.difficultyTier === 3 ? 6 : 0;
  const maxPatience = Math.max(26, basePatience - dayPenalty + tierExtra);
  const priceMult = difficulty === 'JAM_SIBUK' ? 1.5 : 1;

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    recipeId,
    customerName: CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)],
    patience: maxPatience,
    maxPatience,
    reward: Math.round((recipe.basePrice * priceMult) / 1000) * 1000,
    arrivedAt: Date.now(),
  };
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [difficulty, setDifficulty] = useState<DifficultyMode>('SANTAI');
  const [muted, setMuted] = useState<boolean>(false);
  const [showRecipeBook, setShowRecipeBook] = useState<boolean>(false);
  const [bestRevenue, setBestRevenue] = useState<number>(() => loadBestRevenue());

  const [stats, setStats] = useState<ShiftStats>(() =>
    createInitialStats(1, 'SANTAI')
  );
  const [orders, setOrders] = useState<OrderTicket[]>([]);
  const [board, setBoard] = useState<BoardState>(() => createEmptyBoard());
  const [wok, setWok] = useState<WokState>(() => createEmptyWok());
  const [plate, setPlate] = useState<PlateState>(() => createEmptyPlate());
  const [feedback, setFeedback] = useState<FeedbackBanner | null>(null);

  const feedbackTimerRef = useRef<number | null>(null);
  const spawnCooldownRef = useRef<number>(4);
  const burnedTriggeredRef = useRef<boolean>(false);
  const wokRef = useRef<WokState>(wok);
  const ordersRef = useRef<OrderTicket[]>(orders);
  const statsRef = useRef<ShiftStats>(stats);

  const updateWok = useCallback((updater: WokState | ((prev: WokState) => WokState)) => {
    const next =
      typeof updater === 'function' ? updater(wokRef.current) : updater;
    wokRef.current = next;
    if (next.cookProgress < 100) {
      burnedTriggeredRef.current = false;
    }
    setWok(next);
  }, []);

  const updateOrders = useCallback(
    (updater: OrderTicket[] | ((prev: OrderTicket[]) => OrderTicket[])) => {
      const next =
        typeof updater === 'function' ? updater(ordersRef.current) : updater;
      ordersRef.current = next;
      setOrders(next);
    },
    []
  );

  const updateStats = useCallback(
    (updater: ShiftStats | ((prev: ShiftStats) => ShiftStats)) => {
      const next =
        typeof updater === 'function' ? updater(statsRef.current) : updater;
      statsRef.current = next;
      setStats(next);
    },
    []
  );

  // Shared simulation snapshot read at 60fps by KitchenCanvas without triggering React re-renders
  const simRef = useRef<KitchenSimSnapshot>({
    gameState: 'TITLE_MENU',
    wokIngredients: [],
    cookProgress: 0,
    doneness: 'KOSONG',
    boardIngredient: null,
    boardReady: false,
    plateRecipe: null,
    combo: 0,
    stirPulseId: 0,
    chopPulseId: 0,
    chopPulseColor: '#4ADE80',
    dropPulseId: 0,
    servePulseId: 0,
    burnPulseId: 0,
  });

  // Keep simRef synced with latest state
  useEffect(() => {
    simRef.current.gameState = showRecipeBook && gameState === 'PLAYING' ? 'PAUSED' : gameState;
    simRef.current.wokIngredients = wok.ingredients;
    simRef.current.cookProgress = wok.cookProgress;
    simRef.current.doneness = getWokDoneness(wok.ingredients.length, wok.cookProgress);
    simRef.current.boardIngredient = board.ingredient;
    simRef.current.boardReady = board.ready;
    simRef.current.plateRecipe = plate.recipeId;
    simRef.current.combo = stats.combo;
  }, [gameState, showRecipeBook, wok, board, plate, stats.combo]);

  const pushFeedback = useCallback(
    (text: string, tone: FeedbackBanner['tone'] = 'info') => {
      setFeedback({ id: Date.now() + Math.random(), text, tone });
      if (feedbackTimerRef.current) {
        window.clearTimeout(feedbackTimerRef.current);
      }
      feedbackTimerRef.current = window.setTimeout(() => {
        setFeedback(null);
      }, 2400);
    },
    []
  );

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      kitchenAudio.setMuted(next);
      if (!next) kitchenAudio.playButton();
      return next;
    });
  }, []);

  const startShift = useCallback(
    (day: number, mode: DifficultyMode) => {
      kitchenAudio.playButton();
      updateStats(createInitialStats(day, mode));
      setBoard(createEmptyBoard());
      updateWok(createEmptyWok());
      setPlate(createEmptyPlate());
      updateOrders([createOrder(day, mode), createOrder(day, mode)]);
      spawnCooldownRef.current = mode === 'JAM_SIBUK' ? 6 : 9;
      setShowRecipeBook(false);
      setFeedback(null);
      setGameState('PLAYING');
    },
    [updateOrders, updateStats, updateWok]
  );

  const handleStartFromTitle = useCallback(() => {
    startShift(1, difficulty);
  }, [difficulty, startShift]);

  const handleRestartShift = useCallback(() => {
    startShift(stats.day, difficulty);
  }, [difficulty, startShift, stats.day]);

  const handleNextDay = useCallback(() => {
    startShift(stats.day + 1, difficulty);
  }, [difficulty, startShift, stats.day]);

  const handlePlayAgain = useCallback(() => {
    startShift(1, difficulty);
  }, [difficulty, startShift]);

  const handleQuitToTitle = useCallback(() => {
    kitchenAudio.playButton();
    setShowRecipeBook(false);
    updateOrders([]);
    setBoard(createEmptyBoard());
    updateWok(createEmptyWok());
    setPlate(createEmptyPlate());
    setGameState('TITLE_MENU');
  }, [updateOrders, updateWok]);

  const addIngredientToWok = useCallback(
    (id: IngredientId): boolean => {
      const doneness = getWokDoneness(wok.ingredients.length, wok.cookProgress);
      if (doneness === 'GOSONG') {
        pushFeedback('Wajan gosong! Buang isi wajan terlebih dahulu.', 'error');
        return false;
      }
      if (wok.ingredients.includes(id)) {
        pushFeedback(`${INGREDIENTS[id].shortName} sudah ada di wajan.`, 'warn');
        return false;
      }
      if (wok.ingredients.length >= 4) {
        pushFeedback('Wajan sudah penuh (maksimal 4 bahan).', 'warn');
        return false;
      }

      const nextIngredients = [...wok.ingredients, id];
      const matched = matchExactRecipe(nextIngredients);
      const nextProgress =
        wok.ingredients.length === 0
          ? 0
          : Math.max(12, wok.cookProgress - 14);

      updateWok({
        ingredients: nextIngredients,
        cookProgress: nextProgress,
        stirCount: wok.stirCount,
        matchedRecipeId: matched,
      });

      simRef.current.dropPulseId += 1;
      kitchenAudio.playDropInWok();
      return true;
    },
    [pushFeedback, updateWok, wok]
  );

  const handleChopBoard = useCallback(() => {
    if (!board.ingredient) return;
    if (board.ready) {
      const added = addIngredientToWok(board.ingredient);
      if (added) {
        setBoard(createEmptyBoard());
      }
      return;
    }

    const nextChops = board.chopsDone + 1;
    const ingDef = INGREDIENTS[board.ingredient];
    simRef.current.chopPulseColor = ingDef.color;
    simRef.current.chopPulseId += 1;
    kitchenAudio.playChop(nextChops / board.chopsRequired);

    if (nextChops >= board.chopsRequired) {
      // Auto-transfer into Wok if available & not duplicate
      const doneness = getWokDoneness(wok.ingredients.length, wok.cookProgress);
      const canAutoSlide =
        doneness !== 'GOSONG' &&
        wok.ingredients.length < 4 &&
        !wok.ingredients.includes(board.ingredient);

      if (canAutoSlide) {
        addIngredientToWok(board.ingredient);
        setBoard(createEmptyBoard());
        pushFeedback(`${ingDef.shortName} selesai dipotong dan masuk wajan!`, 'info');
      } else {
        setBoard({
          ...board,
          chopsDone: nextChops,
          ready: true,
        });
      }
    } else {
      setBoard({
        ...board,
        chopsDone: nextChops,
      });
    }
  }, [addIngredientToWok, board, pushFeedback, wok]);

  const handleSelectIngredient = useCallback(
    (id: IngredientId) => {
      if (gameState !== 'PLAYING' || showRecipeBook) return;
      const def = INGREDIENTS[id];

      if (def.needsChop) {
        if (board.ingredient === id && !board.ready) {
          handleChopBoard();
          return;
        }
        if (board.ingredient !== null) {
          pushFeedback(
            `Talenan masih berisi ${INGREDIENTS[board.ingredient].shortName}.`,
            'warn'
          );
          return;
        }
        kitchenAudio.playButton();
        setBoard({
          ingredient: id,
          chopsDone: 0,
          chopsRequired: def.chopsRequired,
          ready: false,
        });
      } else {
        addIngredientToWok(id);
      }
    },
    [addIngredientToWok, board, gameState, handleChopBoard, pushFeedback, showRecipeBook]
  );

  const handleMoveBoardToWok = useCallback(() => {
    if (!board.ingredient || !board.ready) return;
    if (addIngredientToWok(board.ingredient)) {
      setBoard(createEmptyBoard());
    }
  }, [addIngredientToWok, board]);

  const handleClearBoard = useCallback(() => {
    if (!board.ingredient) return;
    kitchenAudio.playTrash();
    setBoard(createEmptyBoard());
  }, [board.ingredient]);

  const handleStirWok = useCallback(() => {
    if (gameState !== 'PLAYING' || showRecipeBook) return;
    const doneness = getWokDoneness(wok.ingredients.length, wok.cookProgress);
    if (wok.ingredients.length === 0 || doneness === 'GOSONG') return;

    updateWok((prev) => {
      let nextProgress = prev.cookProgress;
      if (prev.cookProgress < 88) {
        nextProgress = Math.min(88, prev.cookProgress + 7);
      } else if (prev.cookProgress >= 89 && prev.cookProgress < 99) {
        // Stirring cools scorching wok slightly to keep dish in safe zone
        nextProgress = Math.max(84, prev.cookProgress - 4);
      }
      return {
        ...prev,
        cookProgress: nextProgress,
        stirCount: prev.stirCount + 1,
      };
    });

    simRef.current.stirPulseId += 1;
    kitchenAudio.playStir();
  }, [gameState, showRecipeBook, updateWok, wok.ingredients.length]);

  const handlePlateFromWok = useCallback(() => {
    if (gameState !== 'PLAYING' || showRecipeBook) return;
    const doneness = getWokDoneness(wok.ingredients.length, wok.cookProgress);
    if (!wok.matchedRecipeId) {
      pushFeedback('Bahan di wajan belum membentuk resep yang cocok.', 'warn');
      return;
    }
    if (doneness === 'MENTAH') {
      pushFeedback('Masih mentah — tunggu hingga zona hijau (65%+).', 'warn');
      return;
    }
    if (doneness === 'GOSONG') {
      pushFeedback('Masakan sudah gosong — buang isi wajan.', 'error');
      return;
    }
    if (plate.recipeId !== null) {
      pushFeedback('Piring saji masih terisi — sajikan atau buang dulu.', 'warn');
      return;
    }

    const quality = doneness === 'MATANG_PAS' ? 'SEMPURNA' : 'STANDAR';
    setPlate({
      recipeId: wok.matchedRecipeId,
      quality,
    });
    updateWok(createEmptyWok());
    kitchenAudio.playPlate();
  }, [gameState, plate.recipeId, pushFeedback, showRecipeBook, updateWok, wok]);

  const handleTrashWok = useCallback(() => {
    if (wok.ingredients.length === 0) return;
    kitchenAudio.playTrash();
    updateWok(createEmptyWok());
    updateStats((prev) => ({ ...prev, combo: 0 }));
    pushFeedback('Isi wajan dibuang.', 'info');
  }, [pushFeedback, updateStats, updateWok, wok.ingredients.length]);

  const handleTrashPlate = useCallback(() => {
    if (!plate.recipeId) return;
    kitchenAudio.playTrash();
    setPlate(createEmptyPlate());
    updateStats((prev) => ({ ...prev, combo: 0 }));
    pushFeedback('Hidangan di piring dibuang.', 'info');
  }, [plate.recipeId, pushFeedback, updateStats]);

  const handleServePlate = useCallback(() => {
    if (gameState !== 'PLAYING' || showRecipeBook || !plate.recipeId) return;

    // Prioritize matching order with lowest remaining patience
    const matching = orders
      .filter((o) => o.recipeId === plate.recipeId)
      .sort((a, b) => a.patience - b.patience);

    if (matching.length === 0) {
      pushFeedback('Belum ada pelanggan yang memesan hidangan ini.', 'warn');
      return;
    }

    const targetOrder = matching[0];
    const isPerfect = plate.quality === 'SEMPURNA';
    const nextCombo = stats.combo + 1;
    const qualityMult = isPerfect ? 1.5 : 1;
    const comboBonus = Math.min(nextCombo - 1, 5) * 3000;
    const earned = Math.round((targetOrder.reward * qualityMult) / 1000) * 1000 + comboBonus;

    updateOrders((prev) => prev.filter((o) => o.id !== targetOrder.id));
    setPlate(createEmptyPlate());

    updateStats((prev) => {
      const nextRevenue = prev.revenue + earned;
      if (nextRevenue > bestRevenue) {
        setBestRevenue(nextRevenue);
        saveBestRevenue(nextRevenue);
      }
      return {
        ...prev,
        revenue: nextRevenue,
        dishesServed: prev.dishesServed + 1,
        perfectDishes: prev.perfectDishes + (isPerfect ? 1 : 0),
        combo: nextCombo,
        maxCombo: Math.max(prev.maxCombo, nextCombo),
      };
    });

    simRef.current.servePulseId += 1;
    kitchenAudio.playServeSuccess(nextCombo);
    pushFeedback(
      `+${formatRupiah(earned)} · ${targetOrder.customerName} puas${isPerfect ? ' (Matang Sempurna!)' : ''}`,
      'success'
    );
  }, [bestRevenue, gameState, orders, plate, pushFeedback, showRecipeBook, stats.combo, updateOrders, updateStats]);

  // Real-time 60fps simulation timer for cooking progress, order patience, & shift clock
  useEffect(() => {
    if (gameState !== 'PLAYING' || showRecipeBook) return;

    let animId = 0;
    let lastTime = performance.now();
    let uiSyncAccum = 0;

    const tick = (now: number) => {
      animId = requestAnimationFrame(tick);
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);
      uiSyncAccum += dt;

      if (uiSyncAccum < 0.08) return;
      const stepDt = uiSyncAccum;
      uiSyncAccum = 0;

      // 1. Update Wok cooking progress
      const curWok = wokRef.current;
      if (curWok.ingredients.length > 0 && curWok.cookProgress < 100) {
        const recipeSpeed = curWok.matchedRecipeId
          ? RECIPES[curWok.matchedRecipeId].cookSpeed
          : 8.5;
        const diffSpeedMult = difficulty === 'JAM_SIBUK' ? 1.15 : 1;
        const zoneFactor =
          curWok.cookProgress >= 65 && curWok.cookProgress < 93 ? 0.65 : 1;
        const nextProgress = Math.min(
          100,
          curWok.cookProgress + recipeSpeed * diffSpeedMult * zoneFactor * stepDt
        );

        if (nextProgress >= 100 && !burnedTriggeredRef.current) {
          burnedTriggeredRef.current = true;
          simRef.current.burnPulseId += 1;
          kitchenAudio.playBurned();
        }
        const nextWok = { ...curWok, cookProgress: nextProgress };
        wokRef.current = nextWok;
        setWok(nextWok);
      }

      // 2. Update Orders patience & spawn new orders deterministically
      const curStats = statsRef.current;
      const curOrders = ordersRef.current;
      let expiredCount = 0;
      const surviving: OrderTicket[] = [];
      for (const o of curOrders) {
        const nextPatience = o.patience - stepDt;
        if (nextPatience <= 0) {
          expiredCount += 1;
        } else {
          surviving.push({ ...o, patience: nextPatience });
        }
      }

      spawnCooldownRef.current -= stepDt;
      const maxOrders = 3;
      if (
        surviving.length < maxOrders &&
        (surviving.length === 0 || spawnCooldownRef.current <= 0)
      ) {
        surviving.push(createOrder(curStats.day, difficulty));
        const baseInterval = difficulty === 'JAM_SIBUK' ? 8 : 11;
        spawnCooldownRef.current = Math.max(
          4.5,
          baseInterval - (curStats.day - 1) * 0.8
        );
      }

      ordersRef.current = surviving;
      setOrders(surviving);

      if (expiredCount > 0) {
        kitchenAudio.playOrderExpire();
        pushFeedback('Pelanggan kecewa menunggu! Reputasi berkurang.', 'error');
      }

      // 3. Update Shift Clock & Reputation / End States
      const nextRep = Math.max(0, curStats.reputation - expiredCount);
      const nextCombo = expiredCount > 0 ? 0 : curStats.combo;
      const nextTime = Math.max(0, curStats.shiftTimeRemaining - stepDt);

      let nextFailReason = curStats.failReason;
      if (nextRep <= 0) {
        nextFailReason = 'REPUTASI_HABIS';
        setGameState('GAME_OVER');
      } else if (nextTime <= 0) {
        if (curStats.revenue >= curStats.targetRevenue) {
          kitchenAudio.playShiftComplete();
          setGameState('ROUND_SUMMARY');
        } else {
          kitchenAudio.playOrderExpire();
          nextFailReason = 'TARGET_TIDAK_TERCAPAI';
          setGameState('GAME_OVER');
        }
      }

      const nextStats: ShiftStats = {
        ...curStats,
        reputation: nextRep,
        combo: nextCombo,
        shiftTimeRemaining: nextTime,
        failReason: nextFailReason,
      };
      statsRef.current = nextStats;
      setStats(nextStats);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [difficulty, gameState, pushFeedback, showRecipeBook]);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (gameState === 'TITLE_MENU') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartFromTitle();
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (showRecipeBook) {
          setShowRecipeBook(false);
        } else if (gameState === 'PLAYING') {
          kitchenAudio.playButton();
          setGameState('PAUSED');
        } else if (gameState === 'PAUSED') {
          kitchenAudio.playButton();
          setGameState('PLAYING');
        }
        return;
      }

      if (gameState !== 'PLAYING' || showRecipeBook) return;

      const idx = INGREDIENT_LIST.findIndex((ing) => ing.hotkey === e.key);
      if (idx !== -1) {
        e.preventDefault();
        handleSelectIngredient(INGREDIENT_LIST[idx].id);
        return;
      }

      const k = e.key.toLowerCase();
      if (k === 'q') {
        e.preventDefault();
        handleChopBoard();
      } else if (e.code === 'Space') {
        e.preventDefault();
        handleStirWok();
      } else if (k === 'e') {
        e.preventDefault();
        handlePlateFromWok();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleServePlate();
      } else if (k === 'x') {
        e.preventDefault();
        if (wok.ingredients.length > 0) {
          handleTrashWok();
        } else if (plate.recipeId) {
          handleTrashPlate();
        }
      } else if (k === 'r') {
        e.preventDefault();
        setShowRecipeBook(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    gameState,
    handleChopBoard,
    handlePlateFromWok,
    handleSelectIngredient,
    handleServePlate,
    handleStartFromTitle,
    handleStirWok,
    handleTrashPlate,
    handleTrashWok,
    plate.recipeId,
    showRecipeBook,
    wok.ingredients.length,
  ]);

  return (
    <main className="relative w-full min-h-dvh md:h-dvh overflow-x-hidden overflow-y-auto md:overflow-hidden flex flex-col bg-stone-950">
      {/* Isolated 60fps Canvas World */}
      <KitchenCanvas simRef={simRef} />

      {/* Title Screen */}
      {gameState === 'TITLE_MENU' && (
        <TitleScreen
          difficulty={difficulty}
          onChangeDifficulty={(mode) => {
            kitchenAudio.playButton();
            setDifficulty(mode);
          }}
          onStart={handleStartFromTitle}
          muted={muted}
          onToggleMute={handleToggleMute}
          bestRevenue={bestRevenue}
        />
      )}

      {/* Active Play HUD & Kitchen Stations */}
      {gameState !== 'TITLE_MENU' && (
        <>
          <OrderRail
            stats={stats}
            orders={orders}
            platedRecipeId={plate.recipeId}
            muted={muted}
            onToggleMute={handleToggleMute}
            onToggleRecipeBook={() => {
              kitchenAudio.playButton();
              setShowRecipeBook((prev) => !prev);
            }}
            onPause={() => {
              kitchenAudio.playButton();
              setGameState((prev) => (prev === 'PLAYING' ? 'PAUSED' : 'PLAYING'));
            }}
          />

          <KitchenStations
            board={board}
            wok={wok}
            plate={plate}
            orders={orders}
            feedback={feedback}
            onSelectIngredient={handleSelectIngredient}
            onChopBoard={handleChopBoard}
            onMoveBoardToWok={handleMoveBoardToWok}
            onClearBoard={handleClearBoard}
            onStirWok={handleStirWok}
            onPlateFromWok={handlePlateFromWok}
            onTrashWok={handleTrashWok}
            onServePlate={handleServePlate}
            onTrashPlate={handleTrashPlate}
          />
        </>
      )}

      {/* Modals */}
      {gameState === 'PAUSED' && !showRecipeBook && (
        <PauseModal
          onResume={() => {
            kitchenAudio.playButton();
            setGameState('PLAYING');
          }}
          onRestart={handleRestartShift}
          onQuitToTitle={handleQuitToTitle}
        />
      )}

      {showRecipeBook && (
        <RecipeBookModal
          onClose={() => {
            kitchenAudio.playButton();
            setShowRecipeBook(false);
          }}
        />
      )}

      {gameState === 'ROUND_SUMMARY' && (
        <RoundSummaryModal
          stats={stats}
          onNextDay={handleNextDay}
          onQuitToTitle={handleQuitToTitle}
        />
      )}

      {gameState === 'GAME_OVER' && (
        <GameOverModal
          stats={stats}
          onPlayAgain={handlePlayAgain}
          onQuitToTitle={handleQuitToTitle}
        />
      )}

      <OfflineIndicator />
    </main>
  );
}
