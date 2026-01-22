const AI_DEPTHS = {
  easy: 2,
  medium: 3,
  hard: 4,
  extreme: 5,
  ultimate: 6
};

const AI_TIME_LIMITS = {
  easy: 5000,
  medium: 10000,
  hard: 30000,
  extreme: 60000,
  ultimate: 0
};

const AI_WIN_SCORE = 1000000;
const AI_FORFEIT_SCORE = 900000;
const AI_THINK_DELAY_MIN = 200;
const AI_THINK_DELAY_MAX = 500;
const AI_PRUNE_MARGIN = 40;
let aiWorker = null;
let aiWorkerPending = null;

const PIECE_VALUES = {
  g: 10000,
  q: 900,
  r: 500,
  c: 450,
  h: 350,
  e: 250,
  a: 250,
  p: 100
};

const MOBILITY_WEIGHT = 4;
const CENTER_CONTROL_WEIGHT = 3;
const CENTER_POSITION_WEIGHT = 2;
const TERRITORY_WEIGHT = 1;
const PAWN_CROSSED_BONUS = 30;

const TERRITORY_DIRS = [
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
  { dx: 1, dy: 1 },
  { dx: 1, dy: -1 },
  { dx: -1, dy: 1 },
  { dx: -1, dy: -1 }
];

function isAiEnabled() {
  return aiLevel !== 'none';
}

function getAiDepth() {
  return AI_DEPTHS[aiLevel] || 0;
}

function getAiTimeLimit() {
  return AI_TIME_LIMITS[aiLevel] || 0;
}

function getWorkerBoardMeta() {
  if (!boardMeta || !boardMeta.palace) return null;
  return {
    riverRow: boardMeta.riverRow,
    riverSplit: boardMeta.riverSplit,
    palace: {
      black: { ...boardMeta.palace.black },
      red: { ...boardMeta.palace.red }
    }
  };
}

function ensureAiWorker() {
  if (aiWorker) return aiWorker;
  if (typeof Worker === 'undefined') return null;
  try {
    aiWorker = new Worker('assets/js/ai-worker.js');
  } catch (error) {
    aiWorker = null;
    return null;
  }
  aiWorker.onmessage = (event) => {
    const data = event.data;
    if (!data || data.type !== 'result') return;
    aiWorkerPending = null;
    handleAiSearchResult(data.token, data.move);
  };
  aiWorker.onerror = (event) => {
    const pending = aiWorkerPending;
    aiWorkerPending = null;
    if (aiWorker) {
      aiWorker.terminate();
      aiWorker = null;
    }
    if (!pending || pending.token !== aiToken || !aiThinking) return;
    const move = findBestMove(pending.depth, pending.timeLimit, pending.token);
    handleAiSearchResult(pending.token, move);
  };
  return aiWorker;
}

function startAiTimer() {
  aiThinkStart = Date.now();
  if (aiTickId) {
    clearInterval(aiTickId);
  }
  aiTickId = setInterval(() => {
    if (!aiThinking) {
      stopAiTimer();
      return;
    }
    updateStatus();
  }, 1000);
}

function stopAiTimer() {
  if (aiTickId) {
    clearInterval(aiTickId);
    aiTickId = null;
  }
  aiThinkStart = 0;
}

function cancelAiMove(silent = false) {
  if (aiTimeoutId) {
    clearTimeout(aiTimeoutId);
    aiTimeoutId = null;
  }
  if (aiWorker) {
    aiWorker.terminate();
    aiWorker = null;
  }
  aiWorkerPending = null;
  aiToken += 1;
  aiThinking = false;
  stopAiTimer();
  if (!silent) {
    updateStatus();
  }
}

function maybeTriggerAiMove() {
  if (!isAiEnabled() || gameOver || currentPlayer !== 'black') return;
  if (aiThinking) return;
  if (!hasAnyLegalMove('black')) {
    handleForfeit('black');
    return;
  }
  aiThinking = true;
  updateStatus();
  updateUndoButton();
  startAiTimer();
  const token = ++aiToken;
  const delay = AI_THINK_DELAY_MIN + Math.floor(Math.random() * (AI_THINK_DELAY_MAX - AI_THINK_DELAY_MIN + 1));
  aiTimeoutId = setTimeout(() => runAiMove(token), delay);
}

function runAiMove(token) {
  aiTimeoutId = null;
  if (token !== aiToken || !isAiEnabled() || gameOver || currentPlayer !== 'black') {
    aiThinking = false;
    stopAiTimer();
    updateStatus();
    updateUndoButton();
    return;
  }
  startAiSearch(token);
}

function startAiSearch(token) {
  const depth = getAiDepth();
  const timeLimit = getAiTimeLimit();
  const worker = ensureAiWorker();
  if (!worker) {
    const move = findBestMove(depth, timeLimit, token);
    handleAiSearchResult(token, move);
    return;
  }
  aiWorkerPending = { token, depth, timeLimit };
  worker.postMessage({
    type: 'search',
    token,
    board,
    boardWidth,
    boardHeight,
    boardMeta: getWorkerBoardMeta(),
    depth,
    timeLimit,
    pruneMargin: AI_PRUNE_MARGIN,
    evalConfig: {
      pieceValues: PIECE_VALUES,
      mobilityWeight: MOBILITY_WEIGHT,
      centerControlWeight: CENTER_CONTROL_WEIGHT,
      centerPositionWeight: CENTER_POSITION_WEIGHT,
      territoryWeight: TERRITORY_WEIGHT,
      pawnCrossedBonus: PAWN_CROSSED_BONUS
    }
  });
}

function handleAiSearchResult(token, move) {
  if (token !== aiToken) return;
  if (!isAiEnabled() || gameOver || currentPlayer !== 'black') {
    aiThinking = false;
    stopAiTimer();
    updateStatus();
    updateUndoButton();
    return;
  }

  aiThinking = false;
  stopAiTimer();

  if (!move) {
    handleForfeit('black');
    return;
  }

  applyMoveToBoard(move);
  selected = null;
  possibleMoves = [];

  const winner = checkWinner();
  if (winner) {
    endGame(winner);
    return;
  }

  currentPlayer = 'red';
  if (!hasAnyLegalMove(currentPlayer)) {
    handleForfeit(currentPlayer);
    return;
  }

  updateStatus();
  recordMoveHistory();
  updateUndoButton();
  renderBoard();
}

function applyMoveToBoard(move) {
  const movingPiece = board[move.fromY][move.fromX];
  if (!movingPiece) return;
  board[move.toY][move.toX] = { ...movingPiece };
  board[move.fromY][move.fromX] = null;
  lastMove = {
    fromX: move.fromX,
    fromY: move.fromY,
    toX: move.toX,
    toY: move.toY
  };
}

function findBestMove(depth, timeLimit, token) {
  const moves = getAllMovesForColor('black');
  if (!moves.length) return null;
  orderMoves(moves);
  const state = {
    startTime: Date.now(),
    timeLimit,
    token,
    aborted: false
  };
  let bestMove = moves[0];
  let bestScore = -Infinity;
  let alpha = -Infinity;
  let beta = Infinity;
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const captured = applySearchMove(move);
    const score = alphaBeta(depth - 1, alpha, beta, 'red', state);
    undoSearchMove(move, captured);
    if (state.aborted) break;
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
    alpha = Math.max(alpha, bestScore);
    if (alpha >= beta) break;
  }
  return bestMove;
}

function applySearchMove(move) {
  const movingPiece = board[move.fromY][move.fromX];
  const captured = board[move.toY][move.toX];
  board[move.toY][move.toX] = movingPiece;
  board[move.fromY][move.fromX] = null;
  return captured;
}

function undoSearchMove(move, captured) {
  board[move.fromY][move.fromX] = board[move.toY][move.toX];
  board[move.toY][move.toX] = captured;
}

function alphaBeta(depth, alpha, beta, color, state) {
  if (state.token !== aiToken) {
    state.aborted = true;
    return evaluateBoard(true);
  }
  if (state.timeLimit && Date.now() - state.startTime > state.timeLimit) {
    state.aborted = true;
    return evaluateBoard(true);
  }

  const winner = checkWinner();
  if (winner) {
    return winner === 'black' ? AI_WIN_SCORE + depth : -AI_WIN_SCORE - depth;
  }

  if (depth <= 0) {
    return evaluateBoard();
  }

  const moves = getAllMovesForColor(color);
  if (!moves.length) {
    return color === 'black'
      ? -AI_FORFEIT_SCORE - depth
      : AI_FORFEIT_SCORE + depth;
  }

  orderMoves(moves);

  if (color === 'black') {
    let best = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      const captured = applySearchMove(move);
      const score = alphaBeta(depth - 1, alpha, beta, 'red', state);
      undoSearchMove(move, captured);
      if (state.aborted) break;
      if (score > best) best = score;
      if (best > alpha) alpha = best;
      if (alpha >= beta + AI_PRUNE_MARGIN) break;
    }
    return best;
  }

  let best = Infinity;
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const captured = applySearchMove(move);
    const score = alphaBeta(depth - 1, alpha, beta, 'black', state);
    undoSearchMove(move, captured);
    if (state.aborted) break;
    if (score < best) best = score;
    if (best < beta) beta = best;
    if (alpha >= beta + AI_PRUNE_MARGIN) break;
  }
  return best;
}

function evaluateBoard(fast = false) {
  let score = 0;
  const center = getCenterInfo();
  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      const piece = board[y][x];
      if (!piece || piece.type === 'b') continue;
      const sign = piece.color === 'black' ? 1 : -1;
      score += sign * getPieceValue(piece.type);
      score += sign * getPawnBonus(piece, y);
      score += sign * getCenterPositionBonus(x, y, center);
      score += sign * getTerritoryBonus(x, y);
    }
  }

  if (!fast) {
    const blackMoves = getAllMovesForColor('black');
    const redMoves = getAllMovesForColor('red');
    score += MOBILITY_WEIGHT * (blackMoves.length - redMoves.length);
    score += CENTER_CONTROL_WEIGHT * (countCenterMoves(blackMoves, center) - countCenterMoves(redMoves, center));
  }

  return score;
}

function getPieceValue(type) {
  return PIECE_VALUES[type] || 0;
}

function getPawnBonus(piece, y) {
  if (piece.type !== 'p') return 0;
  if (!boardMeta) return 0;
  if (piece.color === 'black' && y >= boardMeta.riverSplit) return PAWN_CROSSED_BONUS;
  if (piece.color === 'red' && y <= boardMeta.riverRow) return PAWN_CROSSED_BONUS;
  return 0;
}

function getCenterInfo() {
  const centerX = (boardWidth - 1) / 2;
  const centerY = (boardHeight - 1) / 2;
  const rangeX = Math.max(1, Math.floor(boardWidth / 4));
  const rangeY = Math.max(1, Math.floor(boardHeight / 4));
  const maxDist = centerX + centerY || 1;
  return { centerX, centerY, rangeX, rangeY, maxDist };
}

function isCenterSquare(x, y, center) {
  return Math.abs(x - center.centerX) <= center.rangeX
    && Math.abs(y - center.centerY) <= center.rangeY;
}

function getCenterPositionBonus(x, y, center) {
  const dist = Math.abs(x - center.centerX) + Math.abs(y - center.centerY);
  const centrality = 1 - dist / center.maxDist;
  return centrality * CENTER_POSITION_WEIGHT;
}

function getTerritoryBonus(x, y) {
  let count = 0;
  for (let i = 0; i < TERRITORY_DIRS.length; i++) {
    const dir = TERRITORY_DIRS[i];
    const tx = x + dir.dx;
    const ty = y + dir.dy;
    if (tx < 0 || tx >= boardWidth || ty < 0 || ty >= boardHeight) continue;
    const cell = board[ty][tx];
    if (cell && cell.type === 'b') continue;
    if (!cell) count += 1;
  }
  return count * TERRITORY_WEIGHT;
}

function countCenterMoves(moves, center) {
  let count = 0;
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    if (isCenterSquare(move.toX, move.toY, center)) count += 1;
  }
  return count;
}

function orderMoves(moves) {
  const center = getCenterInfo();
  moves.sort((a, b) => scoreMoveHeuristic(b, center) - scoreMoveHeuristic(a, center));
}

function scoreMoveHeuristic(move, center) {
  const moving = board[move.fromY][move.fromX];
  const target = board[move.toY][move.toX];
  let score = 0;
  if (target && target.type !== 'b' && moving) {
    score += getPieceValue(target.type) * 10 - getPieceValue(moving.type);
  }
  if (isCenterSquare(move.toX, move.toY, center)) score += 6;
  if (moving) {
    const advance = moving.color === 'black'
      ? move.toY - move.fromY
      : move.fromY - move.toY;
    score += advance;
  }
  return score;
}
