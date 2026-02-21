'use strict';

const AI_WIN_SCORE = 1000000;
const AI_FORFEIT_SCORE = 900000;

const DEFAULT_PIECE_VALUES = {
  g: 10000,
  q: 900,
  r: 500,
  c: 450,
  h: 350,
  e: 250,
  a: 250,
  p: 100
};

const DEFAULT_MOBILITY_WEIGHT = 4;
const DEFAULT_CENTER_CONTROL_WEIGHT = 3;
const DEFAULT_CENTER_POSITION_WEIGHT = 2;
const DEFAULT_TERRITORY_WEIGHT = 1;
const DEFAULT_PAWN_CROSSED_BONUS = 30;

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

let board = [];
let boardWidth = 0;
let boardHeight = 0;
let boardMeta = null;
let pruneMargin = 0;

let pieceValues = DEFAULT_PIECE_VALUES;
let mobilityWeight = DEFAULT_MOBILITY_WEIGHT;
let centerControlWeight = DEFAULT_CENTER_CONTROL_WEIGHT;
let centerPositionWeight = DEFAULT_CENTER_POSITION_WEIGHT;
let territoryWeight = DEFAULT_TERRITORY_WEIGHT;
let pawnCrossedBonus = DEFAULT_PAWN_CROSSED_BONUS;

const cancelTokens = new Set();

self.onmessage = (event) => {
  const data = event.data;
  if (!data || !data.type) return;
  if (data.type === 'search') {
    cancelTokens.delete(data.token);
    board = data.board || [];
    boardWidth = data.boardWidth || 0;
    boardHeight = data.boardHeight || 0;
    boardMeta = data.boardMeta || null;
    pruneMargin = typeof data.pruneMargin === 'number' ? data.pruneMargin : 0;
    applyEvalConfig(data.evalConfig);
    const depth = typeof data.depth === 'number' ? data.depth : 0;
    const timeLimit = typeof data.timeLimit === 'number' ? data.timeLimit : 0;
    const state = {
      startTime: Date.now(),
      timeLimit,
      token: data.token,
      aborted: false
    };
    const move = findBestMove(depth, state);
    self.postMessage({
      type: 'result',
      token: data.token,
      move,
      aborted: state.aborted,
      elapsedMs: Date.now() - state.startTime
    });
  } else if (data.type === 'cancel') {
    cancelTokens.add(data.token);
  }
};

function applyEvalConfig(config) {
  const safe = config || {};
  pieceValues = safe.pieceValues || DEFAULT_PIECE_VALUES;
  mobilityWeight = typeof safe.mobilityWeight === 'number' ? safe.mobilityWeight : DEFAULT_MOBILITY_WEIGHT;
  centerControlWeight = typeof safe.centerControlWeight === 'number' ? safe.centerControlWeight : DEFAULT_CENTER_CONTROL_WEIGHT;
  centerPositionWeight = typeof safe.centerPositionWeight === 'number' ? safe.centerPositionWeight : DEFAULT_CENTER_POSITION_WEIGHT;
  territoryWeight = typeof safe.territoryWeight === 'number' ? safe.territoryWeight : DEFAULT_TERRITORY_WEIGHT;
  pawnCrossedBonus = typeof safe.pawnCrossedBonus === 'number' ? safe.pawnCrossedBonus : DEFAULT_PAWN_CROSSED_BONUS;
}

function isCancelled(token) {
  return cancelTokens.has(token);
}

function findBestMove(depth, state) {
  const moves = getAllMovesForColor('black');
  if (!moves.length) return null;
  orderMoves(moves);
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
  if (isCancelled(state.token)) {
    state.aborted = true;
    return evaluateBoard(true);
  }
  if (state.timeLimit > 0 && Date.now() - state.startTime > state.timeLimit) {
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
      if (alpha >= beta + pruneMargin) break;
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
    if (alpha >= beta + pruneMargin) break;
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
    score += mobilityWeight * (blackMoves.length - redMoves.length);
    score += centerControlWeight * (countCenterMoves(blackMoves, center) - countCenterMoves(redMoves, center));
  }

  return score;
}

function getPieceValue(type) {
  return pieceValues[type] || 0;
}

function getPawnBonus(piece, y) {
  if (piece.type !== 'p') return 0;
  if (!boardMeta) return 0;
  if (piece.color === 'black' && y >= boardMeta.riverSplit) return pawnCrossedBonus;
  if (piece.color === 'red' && y <= boardMeta.riverRow) return pawnCrossedBonus;
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
  return centrality * centerPositionWeight;
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
  return count * territoryWeight;
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

function getAllMovesForColor(color) {
  const moves = [];
  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      const piece = board[y][x];
      if (!piece || piece.type === 'b' || piece.color !== color) continue;
      const targets = calcMoves(x, y, piece);
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        moves.push({
          fromX: x,
          fromY: y,
          toX: target.x,
          toY: target.y
        });
      }
    }
  }
  return moves;
}

function hasAnyLegalMove(color) {
  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      const piece = board[y][x];
      if (!piece || piece.type === 'b' || piece.color !== color) continue;
      const moves = calcMoves(x, y, piece);
      if (moves.length) return true;
    }
  }
  return false;
}

function checkWinner() {
  const redCount = countGenerals('red');
  const blackCount = countGenerals('black');
  if (redCount === 0) return 'black';
  if (blackCount === 0) return 'red';
  return null;
}

function countGenerals(color) {
  let count = 0;
  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      const piece = board[y][x];
      if (piece && piece.type === 'g' && piece.color === color) {
        count++;
      }
    }
  }
  return count;
}

function isInPalace(color, x, y) {
  if (!boardMeta || !boardMeta.palace) return false;
  const palace = color === 'black' ? boardMeta.palace.black : boardMeta.palace.red;
  if (!palace) return false;
  return x >= palace.left && x <= palace.right && y >= palace.top && y <= palace.bottom;
}

function calcMoves(x, y, piece) {
  const moves = [];
  const type = piece.type;
  const color = piece.color;
  const riverRow = boardMeta ? boardMeta.riverRow : Math.floor(boardHeight / 2) - 1;
  const riverSplit = boardMeta ? boardMeta.riverSplit : riverRow + 1;

  function canMoveTo(tx, ty) {
    if (tx < 0 || tx >= boardWidth || ty < 0 || ty >= boardHeight) return false;
    const target = board[ty][tx];
    if (!target) return true;
    if (target.type === 'b') return false;
    return target.color !== color;
  }

  function violatesFlyingGeneral(tx, ty, pieceObj) {
    const temp = board.map(row => row.map(cell => cell ? { ...cell } : null));
    temp[y][x] = null;
    temp[ty][tx] = { type: pieceObj.type, color: pieceObj.color };
    const redGenerals = [];
    const blackGenerals = [];
    for (let ry = 0; ry < boardHeight; ry++) {
      for (let rx = 0; rx < boardWidth; rx++) {
        const c = temp[ry][rx];
        if (c && c.type === 'g') {
          if (c.color === 'red') redGenerals.push({ x: rx, y: ry });
          else blackGenerals.push({ x: rx, y: ry });
        }
      }
    }
    if (!redGenerals.length || !blackGenerals.length) return false;
    for (let i = 0; i < redGenerals.length; i++) {
      const redG = redGenerals[i];
      for (let j = 0; j < blackGenerals.length; j++) {
        const blackG = blackGenerals[j];
        if (redG.x !== blackG.x) continue;
        const start = Math.min(redG.y, blackG.y) + 1;
        const end = Math.max(redG.y, blackG.y);
        let blocked = false;
        for (let cy = start; cy < end; cy++) {
          if (temp[cy][redG.x]) {
            blocked = true;
            break;
          }
        }
        if (!blocked) return true;
      }
    }
    return false;
  }

  if (type === 'r') {
    const directions = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];
    for (let i = 0; i < directions.length; i++) {
      const dir = directions[i];
      let tx = x + dir.dx;
      let ty = y + dir.dy;
      while (tx >= 0 && tx < boardWidth && ty >= 0 && ty < boardHeight) {
        const target = board[ty][tx];
        if (!target) {
          if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
        } else {
          if (target.type !== 'b' && target.color !== color) {
            if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
          }
          break;
        }
        tx += dir.dx;
        ty += dir.dy;
      }
    }
  } else if (type === 'h') {
    const horseMoves = [
      { dx: 2, dy: 1, blockX: 1, blockY: 0 },
      { dx: 2, dy: -1, blockX: 1, blockY: 0 },
      { dx: -2, dy: 1, blockX: -1, blockY: 0 },
      { dx: -2, dy: -1, blockX: -1, blockY: 0 },
      { dx: 1, dy: 2, blockX: 0, blockY: 1 },
      { dx: -1, dy: 2, blockX: 0, blockY: 1 },
      { dx: 1, dy: -2, blockX: 0, blockY: -1 },
      { dx: -1, dy: -2, blockX: 0, blockY: -1 }
    ];
    for (let i = 0; i < horseMoves.length; i++) {
      const m = horseMoves[i];
      const legX = x + m.blockX;
      const legY = y + m.blockY;
      if (legX < 0 || legX >= boardWidth || legY < 0 || legY >= boardHeight) continue;
      if (board[legY][legX]) continue;
      const tx = x + m.dx;
      const ty = y + m.dy;
      if (canMoveTo(tx, ty)) {
        if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
      }
    }
  } else if (type === 'e') {
    const eleMoves = [
      { dx: 2, dy: 2 },
      { dx: 2, dy: -2 },
      { dx: -2, dy: 2 },
      { dx: -2, dy: -2 }
    ];
    for (let i = 0; i < eleMoves.length; i++) {
      const m = eleMoves[i];
      const eyeX = x + m.dx / 2;
      const eyeY = y + m.dy / 2;
      const tx = x + m.dx;
      const ty = y + m.dy;
      if (tx < 0 || tx >= boardWidth || ty < 0 || ty >= boardHeight) continue;
      if (board[eyeY][eyeX]) continue;
      if (color === 'black' && ty > riverRow) continue;
      if (color === 'red' && ty < riverSplit) continue;
      if (canMoveTo(tx, ty)) {
        if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
      }
    }
  } else if (type === 'a') {
    const advMoves = [
      { dx: 1, dy: 1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
      { dx: -1, dy: -1 }
    ];
    for (let i = 0; i < advMoves.length; i++) {
      const m = advMoves[i];
      const tx = x + m.dx;
      const ty = y + m.dy;
      if (isInPalace(color, tx, ty)) {
        if (canMoveTo(tx, ty)) {
          if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
        }
      }
    }
  } else if (type === 'g') {
    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];
    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i];
      const tx = x + dir.dx;
      const ty = y + dir.dy;
      if (isInPalace(color, tx, ty)) {
        if (canMoveTo(tx, ty)) {
          if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
        }
      }
    }
  } else if (type === 'c') {
    const directions = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];
    for (let i = 0; i < directions.length; i++) {
      const dir = directions[i];
      let tx = x + dir.dx;
      let ty = y + dir.dy;
      let jumped = false;
      while (tx >= 0 && tx < boardWidth && ty >= 0 && ty < boardHeight) {
        const target = board[ty][tx];
        if (!jumped) {
          if (!target) {
            if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
          } else {
            jumped = true;
          }
        } else {
          if (target) {
            if (target.type !== 'b' && target.color !== color) {
              if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
            }
            break;
          }
        }
        tx += dir.dx;
        ty += dir.dy;
      }
    }
  } else if (type === 'p') {
    const dy = color === 'red' ? -1 : 1;
    const forwardX = x;
    const forwardY = y + dy;
    if (canMoveTo(forwardX, forwardY)) {
      if (!violatesFlyingGeneral(forwardX, forwardY, piece)) moves.push({ x: forwardX, y: forwardY });
    }
    if ((color === 'red' && y <= riverRow) || (color === 'black' && y >= riverSplit)) {
      const sideMoves = [
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 }
      ];
      for (let i = 0; i < sideMoves.length; i++) {
        const m = sideMoves[i];
        const tx = x + m.dx;
        const ty = y;
        if (canMoveTo(tx, ty)) {
          if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
        }
      }
    }
  } else if (type === 'q') {
    const directions = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
      { dx: -1, dy: -1 }
    ];
    for (let i = 0; i < directions.length; i++) {
      const dir = directions[i];
      let tx = x + dir.dx;
      let ty = y + dir.dy;
      while (tx >= 0 && tx < boardWidth && ty >= 0 && ty < boardHeight) {
        const target = board[ty][tx];
        if (!target) {
          if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
        } else {
          if (target.type !== 'b' && target.color !== color) {
            if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
          }
          break;
        }
        tx += dir.dx;
        ty += dir.dy;
      }
    }
  }

  return moves;
}
