const CARD_WIDTH = 360;
const CARD_HEIGHT = 220;

function drawCardBackground(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  gradient.addColorStop(0, '#0b1120');
  gradient.addColorStop(1, '#111827');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
}

function drawParticleField(ctx, color, speed, time, qualityTier) {
  const particleCount = qualityTier === 'low' ? 10 : qualityTier === 'medium' ? 15 : 20;
  for (let i = 0; i < particleCount; i += 1) {
    const angle = (i / 20) * Math.PI * 2 + time * 0.002 * speed;
    const radius = 20 + (i % 5) * 15;
    const x = CARD_WIDTH * 0.5 + Math.cos(angle) * radius * 2;
    const y = CARD_HEIGHT * 0.5 + Math.sin(angle * 1.25) * radius;
    ctx.beginPath();
    ctx.fillStyle = `${color}66`;
    ctx.arc(x, y, 1.8 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTokamak(ctx, color, speed, time) {
  const centerX = CARD_WIDTH * 0.5;
  const centerY = CARD_HEIGHT * 0.54;
  const ringPulse = 26 + Math.sin(time * 0.003 * speed) * 5;
  ctx.strokeStyle = `${color}bb`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, 95, 38, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, ringPulse * 2, ringPulse, 0, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.strokeStyle = `${color}${i === 0 ? 'ff' : '99'}`;
    ctx.lineWidth = 2 - i * 0.4;
    const drift = i * 0.6 + time * 0.004 * speed;
    ctx.moveTo(centerX - 80, centerY + Math.sin(drift) * 8);
    ctx.bezierCurveTo(
      centerX - 20,
      centerY - 30 + Math.cos(drift) * 15,
      centerX + 20,
      centerY + 25 + Math.sin(drift) * 10,
      centerX + 80,
      centerY - Math.cos(drift) * 6,
    );
    ctx.stroke();
  }
}

function drawHeart(ctx, color, speed, time) {
  const beat = 1 + Math.sin(time * 0.004 * speed) * 0.08;
  const centerX = CARD_WIDTH * 0.5;
  const centerY = CARD_HEIGHT * 0.55;
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(beat, beat);
  ctx.translate(-centerX, -centerY);

  ctx.fillStyle = `${color}44`;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY + 35);
  ctx.bezierCurveTo(centerX + 50, centerY + 2, centerX + 52, centerY - 45, centerX, centerY - 20);
  ctx.bezierCurveTo(centerX - 52, centerY - 45, centerX - 50, centerY + 2, centerX, centerY + 35);
  ctx.fill();

  ctx.strokeStyle = `${color}cc`;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = '#fb7185cc';
  ctx.lineWidth = 1.8;
  const pulseY = centerY + Math.sin(time * 0.015 * speed) * 12;
  ctx.beginPath();
  ctx.moveTo(50, pulseY);
  ctx.lineTo(95, pulseY);
  ctx.lineTo(112, pulseY - 14);
  ctx.lineTo(132, pulseY + 18);
  ctx.lineTo(157, pulseY - 8);
  ctx.lineTo(190, pulseY);
  ctx.lineTo(310, pulseY);
  ctx.stroke();
}

function drawLensing(ctx, color, speed, time) {
  const centerX = CARD_WIDTH * 0.5;
  const centerY = CARD_HEIGHT * 0.52;
  const spin = time * 0.0028 * speed;
  ctx.fillStyle = '#05070f';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `${color}aa`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, 75, 24 + Math.sin(spin) * 3, spin, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 4; i += 1) {
    const offset = spin + i * 0.7;
    ctx.beginPath();
    ctx.strokeStyle = `${color}66`;
    ctx.lineWidth = 1.2;
    ctx.moveTo(0, centerY + Math.sin(offset) * 28);
    ctx.bezierCurveTo(
      centerX - 120,
      centerY + Math.cos(offset) * 18,
      centerX + 80,
      centerY - Math.sin(offset) * 20,
      CARD_WIDTH,
      centerY - Math.cos(offset) * 24,
    );
    ctx.stroke();
  }
}

function drawGeneric(ctx, color, speed, time) {
  const wave = Math.sin(time * 0.004 * speed) * 16;
  ctx.strokeStyle = `${color}cc`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= CARD_WIDTH; x += 8) {
    const y = CARD_HEIGHT * 0.5 + Math.sin(x * 0.03 + time * 0.006 * speed) * 20 + wave * 0.2;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawForcesMotion(ctx, color, telemetry, options) {
  const mode = options?.mode || 'one-force';
  const mass = options?.mass ?? 2;
  const force = options?.force ?? 12;
  const secondaryForce = options?.secondaryForce ?? 0;
  const friction = options?.friction ?? 0.1;
  const position = telemetry?.position ?? 0;
  const velocity = telemetry?.velocity ?? 0;
  const acceleration = telemetry?.acceleration ?? 0;

  ctx.fillStyle = '#eef4ff';
  ctx.fillRect(20, 18, CARD_WIDTH - 40, CARD_HEIGHT - 42);

  const axisY = CARD_HEIGHT - 36;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(28, axisY);
  ctx.lineTo(CARD_WIDTH - 28, axisY);
  ctx.stroke();

  for (let i = 0; i <= 16; i += 1) {
    const x = 28 + i * 19;
    ctx.beginPath();
    ctx.moveTo(x, axisY);
    ctx.lineTo(x, axisY - (i % 2 === 0 ? 7 : 4));
    ctx.stroke();
  }

  const minX = 48;
  const maxX = CARD_WIDTH - 94;
  const cartX = minX + ((Math.max(-8, Math.min(8, position)) + 8) / 16) * (maxX - minX);
  const cartY = axisY - 40;

  const cartGradient = ctx.createLinearGradient(cartX, cartY, cartX + 56, cartY + 36);
  cartGradient.addColorStop(0, '#60a5fa');
  cartGradient.addColorStop(1, '#1d4ed8');
  ctx.fillStyle = cartGradient;
  ctx.fillRect(cartX, cartY, 56, 32);
  ctx.strokeStyle = '#1e3a8a';
  ctx.strokeRect(cartX, cartY, 56, 32);

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(cartX + 14, cartY + 36, 5, 0, Math.PI * 2);
  ctx.arc(cartX + 42, cartY + 36, 5, 0, Math.PI * 2);
  ctx.fill();

  const scale = 3.4;
  const rightForce = force;
  const leftForce = mode === 'multi-force' ? secondaryForce : 0;
  const frictionForce = mode === 'friction' ? friction * mass * 9.8 * (velocity === 0 ? 1 : Math.sign(velocity)) : 0;

  // Right force vector
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(cartX + 56, cartY + 12);
  ctx.lineTo(cartX + 56 + rightForce * scale, cartY + 12);
  ctx.stroke();

  // Left force vector
  if (leftForce > 0) {
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(cartX, cartY + 18);
    ctx.lineTo(cartX - leftForce * scale, cartY + 18);
    ctx.stroke();
  }

  // Friction vector
  if (mode === 'friction') {
    const dir = velocity >= 0 ? -1 : 1;
    ctx.strokeStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(cartX + 28, cartY + 2);
    ctx.lineTo(cartX + 28 + frictionForce * scale * dir, cartY + 2);
    ctx.stroke();
  }

  ctx.fillStyle = '#0f172a';
  ctx.font = '11px Inter, sans-serif';
  ctx.fillText(`m=${mass.toFixed(1)}kg`, cartX + 2, cartY - 8);
  ctx.fillText(`a=${acceleration.toFixed(2)} m/s²`, 26, 34);
  ctx.fillText(`v=${velocity.toFixed(2)} m/s`, 140, 34);
  ctx.fillText(`x=${position.toFixed(2)} m`, 245, 34);
}

export function renderSimulationFrame({
  ctx,
  simulationId,
  color,
  isHovered,
  isActive,
  qualityTier = 'high',
  speedMultiplier = 1,
  intensity = 1,
  telemetry,
  options,
  time,
}) {
  drawCardBackground(ctx);

  const baseSpeed = isActive ? 1.6 : isHovered ? 1.3 : 1;
  const speed = baseSpeed * speedMultiplier;
  ctx.globalAlpha = Math.min(1, Math.max(0.45, intensity));
  drawParticleField(ctx, color, speed, time, qualityTier);

  if (simulationId === 'fusion') {
    drawTokamak(ctx, color, speed, time);
    return;
  }
  if (simulationId === 'heart') {
    drawHeart(ctx, color, speed, time);
    return;
  }
  if (simulationId === 'lensing') {
    drawLensing(ctx, color, speed, time);
    return;
  }
  if (simulationId === 'forces-motion') {
    drawForcesMotion(ctx, color, telemetry, options);
    return;
  }

  drawGeneric(ctx, color, speed, time);
  ctx.globalAlpha = 1;
}
