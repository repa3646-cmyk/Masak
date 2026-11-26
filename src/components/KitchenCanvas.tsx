import React, { useEffect, useRef } from 'react';
import { INGREDIENTS } from '../game/recipes';
import { CanvasParticle, KitchenSimSnapshot, WokVisualItem } from '../game/types';

interface KitchenCanvasProps {
  simRef: React.MutableRefObject<KitchenSimSnapshot>;
}

const MAX_PARTICLES = 140;

export const KitchenCanvas: React.FC<KitchenCanvasProps> = ({ simRef }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animId = 0;
    let lastTime = performance.now();

    // Local simulation state kept strictly out of React
    let elapsed = 0;
    let shake = 0;
    let hitstop = 0;
    let wokBounceY = 0;
    let wokBounceVel = 0;
    let wokTilt = 0;
    let wokTiltVel = 0;

    let lastStirId = 0;
    let lastChopId = 0;
    let lastDropId = 0;
    let lastServeId = 0;
    let lastBurnId = 0;
    let lastIngKey = '';

    let wokItems: WokVisualItem[] = [];
    const particles: CanvasParticle[] = Array.from({ length: MAX_PARTICLES }, () => ({
      active: false,
      kind: 'steam',
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 6,
      alpha: 0,
      life: 0,
      maxLife: 1,
      color: '#ffffff',
      rot: 0,
      vRot: 0,
    }));

    const spawnParticle = (
      kind: CanvasParticle['kind'],
      x: number,
      y: number,
      vx: number,
      vy: number,
      size: number,
      maxLife: number,
      color: string
    ) => {
      for (let i = 0; i < MAX_PARTICLES; i++) {
        const p = particles[i];
        if (!p.active) {
          p.active = true;
          p.kind = kind;
          p.x = x;
          p.y = y;
          p.vx = vx;
          p.vy = vy;
          p.size = size;
          p.alpha = 1;
          p.life = 0;
          p.maxLife = maxLife;
          p.color = color;
          p.rot = Math.random() * Math.PI * 2;
          p.vRot = (Math.random() - 0.5) * 8;
          return;
        }
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const syncWokItems = (snap: KitchenSimSnapshot) => {
      const key = snap.wokIngredients.join(',');
      if (key === lastIngKey) return;
      lastIngKey = key;

      if (snap.wokIngredients.length === 0) {
        wokItems = [];
        return;
      }

      // Preserve existing items and add new chunks for newly added ingredients
      const existingCounts = new Map<string, number>();
      wokItems.forEach((it) => {
        existingCounts.set(it.ingredient, (existingCounts.get(it.ingredient) || 0) + 1);
      });

      const nextItems: WokVisualItem[] = [];
      snap.wokIngredients.forEach((ing) => {
        const kept = wokItems.filter((it) => it.ingredient === ing);
        if (kept.length > 0) {
          nextItems.push(...kept);
        } else {
          // Spawn 4 tactile chunks per ingredient
          for (let i = 0; i < 4; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 44;
            nextItems.push({
              ingredient: ing,
              x: Math.cos(angle) * radius,
              y: -30 - Math.random() * 20,
              vx: (Math.random() - 0.5) * 60,
              vy: 40 + Math.random() * 40,
              rot: Math.random() * Math.PI * 2,
              vRot: (Math.random() - 0.5) * 5,
              scale: 0.85 + Math.random() * 0.35,
            });
          }
        }
      });
      wokItems = nextItems;
    };

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);

      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      const snap = simRef.current;

      const isTitle = snap.gameState === 'TITLE_MENU';
      const isPaused = snap.gameState === 'PAUSED' || snap.gameState === 'ROUND_SUMMARY' || snap.gameState === 'GAME_OVER';

      // Wok center positioning: on title screen, shift wok to the right half so left has 35-40% calm negative space
      const wokX = isTitle ? width * 0.68 : width * 0.5;
      const wokY = isTitle ? height * 0.56 : height * 0.52;
      const wokRadius = Math.min(width * 0.16, height * 0.22, 138);

      // Consume event triggers
      if (snap.stirPulseId !== lastStirId) {
        lastStirId = snap.stirPulseId;
        wokBounceVel = -165;
        wokTiltVel = (Math.random() > 0.5 ? 1 : -1) * 2.8;
        shake = Math.max(shake, 4.5);
        hitstop = 0.032;
        wokItems.forEach((item) => {
          item.vy = -190 - Math.random() * 110;
          item.vx = (Math.random() - 0.5) * 140;
          item.vRot = (Math.random() - 0.5) * 14;
        });
        for (let i = 0; i < 14; i++) {
          const ang = -Math.PI * 0.15 - Math.random() * Math.PI * 0.7;
          const spd = 80 + Math.random() * 140;
          spawnParticle(
            'spark',
            wokX + (Math.random() - 0.5) * wokRadius * 0.9,
            wokY - 8,
            Math.cos(ang) * spd,
            Math.sin(ang) * spd,
            2.5 + Math.random() * 2.5,
            0.35 + Math.random() * 0.25,
            Math.random() > 0.4 ? '#FBBF24' : '#EA580C'
          );
        }
      }

      if (snap.dropPulseId !== lastDropId) {
        lastDropId = snap.dropPulseId;
        wokBounceVel = 75;
        shake = Math.max(shake, 2.5);
        for (let i = 0; i < 10; i++) {
          spawnParticle(
            'steam',
            wokX + (Math.random() - 0.5) * wokRadius * 0.8,
            wokY - 6,
            (Math.random() - 0.5) * 45,
            -50 - Math.random() * 55,
            10 + Math.random() * 12,
            0.7 + Math.random() * 0.4,
            'rgba(250, 248, 245, 0.45)'
          );
        }
      }

      if (snap.chopPulseId !== lastChopId) {
        lastChopId = snap.chopPulseId;
        shake = Math.max(shake, 3.2);
        hitstop = 0.028;
        const boardX = width * 0.18;
        const boardY = height * 0.52;
        for (let i = 0; i < 9; i++) {
          const ang = -Math.PI * 0.1 - Math.random() * Math.PI * 0.8;
          const spd = 70 + Math.random() * 110;
          spawnParticle(
            'chop',
            boardX + (Math.random() - 0.5) * 24,
            boardY - 12,
            Math.cos(ang) * spd,
            Math.sin(ang) * spd,
            3 + Math.random() * 3,
            0.4 + Math.random() * 0.2,
            snap.chopPulseColor || '#4ADE80'
          );
        }
      }

      if (snap.servePulseId !== lastServeId) {
        lastServeId = snap.servePulseId;
        const plateX = width * 0.82;
        const plateY = height * 0.48;
        for (let i = 0; i < 18; i++) {
          const ang = (Math.PI * 2 * i) / 18 + Math.random() * 0.2;
          const spd = 70 + Math.random() * 130;
          spawnParticle(
            'star',
            plateX,
            plateY,
            Math.cos(ang) * spd,
            Math.sin(ang) * spd - 35,
            4 + Math.random() * 3,
            0.55 + Math.random() * 0.3,
            i % 2 === 0 ? '#FBBF24' : '#4ADE80'
          );
        }
      }

      if (snap.burnPulseId !== lastBurnId) {
        lastBurnId = snap.burnPulseId;
        shake = Math.max(shake, 7);
        hitstop = 0.05;
      }

      syncWokItems(snap);

      if (!isPaused) {
        if (hitstop > 0) {
          hitstop = Math.max(0, hitstop - dt);
        } else {
          elapsed += dt;
          shake *= Math.pow(0.02, dt);
          if (shake < 0.1) shake = 0;

          // Spring physics for wok bounce & tilt
          const springK = 220;
          const damp = 14;
          wokBounceVel += (-springK * wokBounceY - damp * wokBounceVel) * dt;
          wokBounceY += wokBounceVel * dt;

          wokTiltVel += (-180 * wokTilt - 12 * wokTiltVel) * dt;
          wokTilt += wokTiltVel * dt;

          // Physics for ingredients inside wok
          for (const item of wokItems) {
            item.vy += 520 * dt;
            item.x += item.vx * dt;
            item.y += item.vy * dt;
            item.rot += item.vRot * dt;

            const floorY = 6 + Math.sin(item.x * 0.04) * 6;
            if (item.y > floorY) {
              item.y = floorY;
              item.vy *= -0.25;
              item.vx *= 0.82;
              item.vRot *= 0.78;
            }
            const maxR = wokRadius * 0.62;
            if (item.x > maxR) {
              item.x = maxR;
              item.vx *= -0.5;
            } else if (item.x < -maxR) {
              item.x = -maxR;
              item.vx *= -0.5;
            }
          }

          // Ambient steam / ember / smoke particles
          if (!prefersReducedMotion) {
            if (isTitle || snap.wokIngredients.length > 0) {
              if (Math.random() < (isTitle ? 0.22 : 0.38)) {
                const isSmoke = snap.doneness === 'GOSONG' || snap.doneness === 'HAMPIR_GOSONG';
                spawnParticle(
                  isSmoke ? 'smoke' : 'steam',
                  wokX + (Math.random() - 0.5) * wokRadius * 1.1,
                  wokY - 12,
                  (Math.random() - 0.5) * 18,
                  -34 - Math.random() * 34,
                  isSmoke ? 14 + Math.random() * 14 : 9 + Math.random() * 11,
                  1.1 + Math.random() * 0.7,
                  isSmoke ? '#292524' : '#FAF8F5'
                );
              }
            }

            if (Math.random() < (isTitle ? 0.25 : 0.16)) {
              spawnParticle(
                'ember',
                wokX + (Math.random() - 0.5) * wokRadius * 1.1,
                wokY + wokRadius * 0.42,
                (Math.random() - 0.5) * 32,
                -45 - Math.random() * 50,
                1.8 + Math.random() * 2,
                0.6 + Math.random() * 0.6,
                Math.random() > 0.35 ? '#F97316' : '#FDE047'
              );
            }
          }

          // Update particles
          for (let i = 0; i < MAX_PARTICLES; i++) {
            const p = particles[i];
            if (!p.active) continue;
            p.life += dt;
            if (p.life >= p.maxLife) {
              p.active = false;
              continue;
            }
            const t = p.life / p.maxLife;
            if (p.kind === 'chop' || p.kind === 'spark' || p.kind === 'star') {
              p.vy += 320 * dt;
            } else if (p.kind === 'steam' || p.kind === 'smoke') {
              p.size += 10 * dt;
              p.vx += Math.sin(elapsed * 3 + i) * 12 * dt;
            }
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.rot += p.vRot * dt;
            p.alpha = p.kind === 'steam' ? (1 - t) * 0.24 : p.kind === 'smoke' ? (1 - t) * 0.55 : 1 - t;
          }
        }
      }

      // === RENDER ===
      ctx.clearRect(0, 0, width, height);

      const shakeX = prefersReducedMotion ? 0 : (Math.random() - 0.5) * shake * 2;
      const shakeY = prefersReducedMotion ? 0 : (Math.random() - 0.5) * shake * 2;
      const panX = isTitle && !prefersReducedMotion ? Math.sin(elapsed * 0.35) * 8 : 0;

      ctx.save();
      ctx.translate(shakeX + panX, shakeY);

      // 1. Warm Dark Kitchen Backdrop
      const bgGrad = ctx.createRadialGradient(
        wokX,
        wokY - 20,
        40,
        wokX,
        wokY,
        Math.max(width, height) * 0.78
      );
      bgGrad.addColorStop(0, '#29211B');
      bgGrad.addColorStop(0.55, '#1A1613');
      bgGrad.addColorStop(1, '#110E0C');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(-20, -20, width + 40, height + 40);

      // Subtle tile / wood counter lines
      const counterTopY = wokY - wokRadius * 0.55;
      ctx.fillStyle = '#1E1916';
      ctx.fillRect(-20, counterTopY, width + 40, height - counterTopY + 40);

      // Horizontal wood grain planks on counter
      ctx.strokeStyle = 'rgba(245, 240, 230, 0.04)';
      ctx.lineWidth = 1;
      for (let y = counterTopY; y < height; y += 38) {
        ctx.beginPath();
        ctx.moveTo(-20, y);
        ctx.lineTo(width + 20, y);
        ctx.stroke();
      }

      // Counter top edge highlight
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.18)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-20, counterTopY);
      ctx.lineTo(width + 20, counterTopY);
      ctx.stroke();

      // 2. Stove / Burner Base under Wok
      const burnerY = wokY + wokRadius * 0.32;
      ctx.fillStyle = '#171514';
      ctx.beginPath();
      ctx.ellipse(wokX, burnerY + 18, wokRadius * 0.92, wokRadius * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3F3A36';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Burner heat glow
      const heatPower =
        snap.doneness === 'GOSONG' || snap.doneness === 'HAMPIR_GOSONG'
          ? 1.15
          : snap.wokIngredients.length > 0
            ? 0.95
            : isTitle
              ? 0.7
              : 0.45;
      const glowRadius = wokRadius * (1.2 + Math.sin(elapsed * 7) * 0.05) * heatPower;
      const glowGrad = ctx.createRadialGradient(wokX, burnerY, 8, wokX, burnerY, glowRadius);
      glowGrad.addColorStop(
        0,
        snap.doneness === 'HAMPIR_GOSONG' || snap.doneness === 'GOSONG'
          ? 'rgba(220, 38, 38, 0.55)'
          : 'rgba(234, 88, 12, 0.45)'
      );
      glowGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(wokX, burnerY, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Animated Flame Ring around burner
      const flameCount = 12;
      for (let i = 0; i < flameCount; i++) {
        const a = (i / flameCount) * Math.PI * 2 + elapsed * 0.8;
        const fx = wokX + Math.cos(a) * wokRadius * 0.64;
        const fy = burnerY + Math.sin(a) * wokRadius * 0.22;
        const fh = (10 + Math.sin(elapsed * 14 + i * 1.7) * 4) * heatPower;

        ctx.fillStyle = i % 2 === 0 ? '#EA580C' : '#F59E0B';
        ctx.beginPath();
        ctx.moveTo(fx - 5, fy);
        ctx.quadraticCurveTo(fx, fy - fh * 1.5, fx + 5, fy);
        ctx.closePath();
        ctx.fill();
      }

      // 3. Cast-Iron Wok (Wajan)
      ctx.save();
      ctx.translate(wokX, wokY + wokBounceY);
      ctx.rotate(wokTilt * 0.08);

      // Wok shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(0, wokRadius * 0.28, wokRadius * 0.96, wokRadius * 0.36, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wok handles
      ctx.strokeStyle = '#78716C';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-wokRadius * 0.94, -4);
      ctx.lineTo(-wokRadius * 1.18, -14);
      ctx.moveTo(wokRadius * 0.94, -4);
      ctx.lineTo(wokRadius * 1.18, -14);
      ctx.stroke();

      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-wokRadius * 1.06, -9);
      ctx.lineTo(-wokRadius * 1.19, -15);
      ctx.moveTo(wokRadius * 1.06, -9);
      ctx.lineTo(wokRadius * 1.19, -15);
      ctx.stroke();

      // Wok outer body
      const wokGrad = ctx.createRadialGradient(-wokRadius * 0.2, -16, 10, 0, 0, wokRadius);
      wokGrad.addColorStop(0, '#3F3B38');
      wokGrad.addColorStop(0.65, '#262321');
      wokGrad.addColorStop(1, '#141211');
      ctx.fillStyle = wokGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, wokRadius, wokRadius * 0.56, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wok metallic rim
      ctx.strokeStyle = '#78716C';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Inner sizzling cooking surface
      ctx.fillStyle = '#181615';
      ctx.beginPath();
      ctx.ellipse(0, 2, wokRadius * 0.86, wokRadius * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Oil shimmer / caramelization tint based on doneness
      if (snap.wokIngredients.length > 0 || isTitle) {
        const cookRatio = isTitle ? 0.5 : Math.min(1, snap.cookProgress / 100);
        const oilAlpha = 0.2 + Math.sin(elapsed * 8) * 0.04;
        ctx.fillStyle =
          snap.doneness === 'GOSONG'
            ? 'rgba(20, 14, 12, 0.8)'
            : `rgba(217, 119, 6, ${oilAlpha + cookRatio * 0.22})`;
        ctx.beginPath();
        ctx.ellipse(0, 4, wokRadius * 0.62, wokRadius * 0.31, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw physical ingredient chunks inside wok
      if (isTitle) {
        // Ambient title dish items gently simmering
        const demoColors = ['#FAF8F5', '#FBBF24', '#4ADE80', '#EF4444', '#FCA5A5'];
        for (let i = 0; i < 10; i++) {
          const ang = (i / 10) * Math.PI * 2 + elapsed * 0.25;
          const rx = Math.cos(ang) * wokRadius * 0.36;
          const ry = Math.sin(ang) * wokRadius * 0.16 + Math.sin(elapsed * 4 + i) * 2;
          ctx.fillStyle = demoColors[i % demoColors.length];
          ctx.beginPath();
          ctx.arc(rx, ry, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        for (const item of wokItems) {
          const def = INGREDIENTS[item.ingredient];
          ctx.save();
          ctx.translate(item.x, item.y);
          ctx.rotate(item.rot);
          ctx.scale(item.scale, item.scale);

          if (snap.doneness === 'GOSONG') {
            ctx.fillStyle = '#292524';
          } else {
            ctx.fillStyle = def.color;
          }

          ctx.beginPath();
          if (item.ingredient === 'mie') {
            ctx.roundRect(-9, -3, 18, 6, 3);
          } else if (item.ingredient === 'sayur') {
            ctx.ellipse(0, 0, 9, 5, 0, 0, Math.PI * 2);
          } else if (item.ingredient === 'ayam') {
            ctx.roundRect(-7, -6, 14, 12, 4);
          } else {
            ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
          }
          ctx.fill();
          ctx.strokeStyle = snap.doneness === 'GOSONG' ? '#0C0A09' : def.accentColor;
          ctx.lineWidth = 1.4;
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.restore();

      // 4. Render Particles (steam, sparks, embers, chop bits, stars)
      for (let i = 0; i < MAX_PARTICLES; i++) {
        const p = particles[i];
        if (!p.active) continue;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        if (p.kind === 'steam' || p.kind === 'smoke') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === 'star') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          for (let j = 0; j < 4; j++) {
            const a = (j * Math.PI) / 2;
            ctx.lineTo(Math.cos(a) * p.size, Math.sin(a) * p.size);
            ctx.lineTo(Math.cos(a + Math.PI / 4) * (p.size * 0.4), Math.sin(a + Math.PI / 4) * (p.size * 0.4));
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [simRef]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none block"
      aria-hidden="true"
    />
  );
};
