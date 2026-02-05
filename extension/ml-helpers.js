// AI/ML Helper Functions for Steady Assist
// Cursor trajectory prediction and tremor analysis

/**
 * Predicts which button the user is trying to click based on cursor trajectory
 */
export function predictIntendedTarget(cursorHistory, visibleButtons) {
  if (cursorHistory.length < 3 || visibleButtons.length === 0) {
    return null;
  }

  // Calculate cursor velocity and direction
  const velocity = calculateVelocity(cursorHistory);
  const direction = calculateDirection(cursorHistory);

  // Project cursor path forward
  const projectedPath = projectCursorPath(cursorHistory, direction, 150);

  // Find buttons that intersect with projected path
  const candidates = findButtonsInPath(projectedPath, visibleButtons);

  if (candidates.length === 0) return null;

  // Score each candidate based on multiple factors
  const scored = candidates.map(button => ({
    element: button,
    score: scoreTarget(button, cursorHistory, velocity, direction),
  }));

  // Return highest scoring target
  scored.sort((a, b) => b.score - a.score);
  return scored[0].element;
}

/**
 * Analyzes tremor patterns to understand severity and type
 */
export function analyzeTremorPattern(cursorHistory) {
  if (cursorHistory.length < 10) {
    return { severity: 'unknown', frequency: 0, amplitude: 0 };
  }

  // Calculate micro-movements (tremor indicators)
  const microMovements = detectMicroMovements(cursorHistory);

  // Calculate tremor frequency (oscillations per second)
  const frequency = calculateTremorFrequency(microMovements);

  // Calculate tremor amplitude (distance of oscillations)
  const amplitude = calculateTremorAmplitude(microMovements);

  // Determine severity
  let severity = 'none';
  if (amplitude > 5 && frequency > 3) severity = 'severe';
  else if (amplitude > 3 && frequency > 2) severity = 'moderate';
  else if (amplitude > 1 && frequency > 1) severity = 'mild';

  return { severity, frequency, amplitude, pattern: microMovements };
}

/**
 * Predicts if a click will miss the target
 */
export function willClickMiss(cursorPos, targetElement, tremorData) {
  const rect = targetElement.getBoundingClientRect();
  const center = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };

  // Calculate distance from cursor to button center
  const distance = Math.sqrt(
    Math.pow(cursorPos.x - center.x, 2) + Math.pow(cursorPos.y - center.y, 2)
  );

  // Adjust threshold based on tremor severity
  const threshold =
    tremorData.severity === 'severe'
      ? 30
      : tremorData.severity === 'moderate'
        ? 20
        : 10;

  return distance > threshold;
}

/**
 * Calculates optimal snap position for magnetic cursor
 */
export function calculateSnapPosition(
  cursorPos,
  targetElement,
  strength = 0.3
) {
  const rect = targetElement.getBoundingClientRect();
  const center = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };

  // Calculate vector from cursor to target
  const dx = center.x - cursorPos.x;
  const dy = center.y - cursorPos.y;

  // Apply strength multiplier (0.0 - 1.0)
  return {
    x: cursorPos.x + dx * strength,
    y: cursorPos.y + dy * strength,
  };
}

/**
 * Learns optimal assistance level for user
 */
export function calculateAdaptiveAssistance(userStats) {
  const { clickSuccessRate, averageHesitation, tremorSeverity } = userStats;

  // Start with base level
  let level = 3; // 1-5 scale

  // Adjust based on success rate
  if (clickSuccessRate < 0.5)
    level = 5; // Maximum assistance
  else if (clickSuccessRate < 0.7) level = 4;
  else if (clickSuccessRate < 0.85) level = 3;
  else if (clickSuccessRate < 0.95) level = 2;
  else level = 1; // Minimal assistance

  // Adjust for tremor severity
  if (tremorSeverity === 'severe') level = Math.max(level, 4);
  else if (tremorSeverity === 'moderate') level = Math.max(level, 3);

  // Adjust for hesitation
  if (averageHesitation > 3000)
    level = Math.max(level, 4); // 3+ seconds
  else if (averageHesitation > 2000) level = Math.max(level, 3);

  return level;
}

// ==================== Helper Functions ====================

function calculateVelocity(cursorHistory) {
  if (cursorHistory.length < 2) return 0;

  const recent = cursorHistory.slice(-5);
  const first = recent[0];
  const last = recent[recent.length - 1];

  const distance = Math.sqrt(
    Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2)
  );

  const time = (last.timestamp - first.timestamp) / 1000; // seconds
  return time > 0 ? distance / time : 0;
}

function calculateDirection(cursorHistory) {
  if (cursorHistory.length < 2) return { angle: 0, dx: 0, dy: 0 };

  const recent = cursorHistory.slice(-3);
  const first = recent[0];
  const last = recent[recent.length - 1];

  const dx = last.x - first.x;
  const dy = last.y - first.y;
  const angle = Math.atan2(dy, dx);

  return { angle, dx, dy };
}

function projectCursorPath(cursorHistory, direction, distance) {
  const last = cursorHistory[cursorHistory.length - 1];
  const points = [];

  // Create a path of points extending from current position
  for (let i = 0; i <= distance; i += 10) {
    points.push({
      x: last.x + Math.cos(direction.angle) * i,
      y: last.y + Math.sin(direction.angle) * i,
    });
  }

  return points;
}

function findButtonsInPath(path, buttons) {
  const candidates = [];

  buttons.forEach(button => {
    const rect = button.getBoundingClientRect();

    // Check if any point in path intersects button
    for (const point of path) {
      if (
        point.x >= rect.left &&
        point.x <= rect.right &&
        point.y >= rect.top &&
        point.y <= rect.bottom
      ) {
        candidates.push(button);
        break;
      }
    }
  });

  return candidates;
}

function scoreTarget(element, cursorHistory, velocity, direction) {
  let score = 0;
  const rect = element.getBoundingClientRect();
  const last = cursorHistory[cursorHistory.length - 1];

  // Distance score (closer is better)
  const center = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
  const distance = Math.sqrt(
    Math.pow(last.x - center.x, 2) + Math.pow(last.y - center.y, 2)
  );
  score += Math.max(0, 100 - distance);

  // Size score (larger buttons easier to hit)
  const area = rect.width * rect.height;
  score += Math.min(50, area / 100);

  // Alignment score (is cursor moving toward it?)
  const targetAngle = Math.atan2(center.y - last.y, center.x - last.x);
  const angleDiff = Math.abs(targetAngle - direction.angle);
  score += Math.max(0, 50 - angleDiff * 10);

  return score;
}

function detectMicroMovements(cursorHistory) {
  const movements = [];

  for (let i = 1; i < cursorHistory.length; i++) {
    const prev = cursorHistory[i - 1];
    const curr = cursorHistory[i];

    const distance = Math.sqrt(
      Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
    );

    const timeDelta = curr.timestamp - prev.timestamp;

    if (distance > 0 && distance < 10 && timeDelta < 100) {
      movements.push({ distance, timeDelta, timestamp: curr.timestamp });
    }
  }

  return movements;
}

function calculateTremorFrequency(microMovements) {
  if (microMovements.length < 2) return 0;

  // Count oscillations in last second
  const recent = microMovements.filter(m => Date.now() - m.timestamp < 1000);

  return recent.length;
}

function calculateTremorAmplitude(microMovements) {
  if (microMovements.length === 0) return 0;

  const distances = microMovements.map(m => m.distance);
  const avg = distances.reduce((a, b) => a + b, 0) / distances.length;

  return avg;
}
