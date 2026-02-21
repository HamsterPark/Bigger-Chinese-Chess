'use strict';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseSize(value, fallback) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return typeof fallback === 'number' ? fallback : 1;
  return Math.max(1, parsed);
}

function parseIntOr(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function createEmptyBoard(width, height) {
  const nextBoard = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      row.push(null);
    }
    nextBoard.push(row);
  }
  return nextBoard;
}

function normalizePalace(palace, width, height) {
  const left = clamp(parseIntOr(palace.left, 0), 0, Math.max(0, width - 1));
  const top = clamp(parseIntOr(palace.top, 0), 0, Math.max(0, height - 1));
  const maxWidth = Math.max(1, width - left);
  const maxHeight = Math.max(1, height - top);
  const palaceWidth = clamp(parseIntOr(palace.width, 1), 1, maxWidth);
  const palaceHeight = clamp(parseIntOr(palace.height, 1), 1, maxHeight);
  return {
    left,
    top,
    width: palaceWidth,
    height: palaceHeight,
    right: left + palaceWidth - 1,
    bottom: top + palaceHeight - 1
  };
}

function buildBoardMeta(width, height, riverRow, blackPalace, redPalace, scaleX, scaleY) {
  const safeRiverRow = clamp(parseIntOr(riverRow, Math.floor(height / 2) - 1), 0, Math.max(0, height - 2));
  const safeBlackPalace = normalizePalace(blackPalace, width, height);
  const safeRedPalace = normalizePalace(redPalace, width, height);
  return {
    scaleX: scaleX || ((x) => x),
    scaleY: scaleY || ((y) => y),
    riverRow: safeRiverRow,
    riverSplit: safeRiverRow + 1,
    palace: {
      black: safeBlackPalace,
      red: safeRedPalace
    }
  };
}

function palaceAt(meta, x, y) {
  const black = meta.palace.black;
  const red = meta.palace.red;
  if (x >= black.left && x <= black.right && y >= black.top && y <= black.bottom) return 'black';
  if (x >= red.left && x <= red.right && y >= red.top && y <= red.bottom) return 'red';
  return null;
}

function isInPalaceForMeta(meta, color, x, y) {
  const palace = color === 'black' ? meta.palace.black : meta.palace.red;
  return x >= palace.left && x <= palace.right && y >= palace.top && y <= palace.bottom;
}

function modeHasPawns() {
  return pieceMode === 'pawns' || pieceMode === 'both';
}

function modeHasGenerals() {
  return pieceMode === 'generals' || pieceMode === 'both';
}

function spreadPositions(count, size) {
  if (size <= 0) return [];
  const safeCount = clamp(count, 1, size);
  if (safeCount === 1) {
    return [Math.floor((size - 1) / 2)];
  }
  const positions = [];
  for (let i = 0; i < safeCount; i++) {
    positions.push(Math.round(i * (size - 1) / (safeCount - 1)));
  }
  return positions;
}

function includeRequiredColumns(columns, requiredColumns) {
  const result = columns.slice();
  const requiredSet = new Set(requiredColumns);
  requiredColumns.forEach(col => {
    if (result.includes(col)) return;
    let bestIndex = -1;
    let bestDistance = Infinity;
    for (let i = 0; i < result.length; i++) {
      const candidate = result[i];
      if (requiredSet.has(candidate)) continue;
      const distance = Math.abs(candidate - col);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }
    if (bestIndex >= 0) {
      result[bestIndex] = col;
    } else {
      result.push(col);
    }
  });
  return Array.from(new Set(result)).sort((a, b) => a - b);
}

function getPalaceColumns(palace, count) {
  let left = palace.left + 1;
  let right = palace.right - 1;
  if (right < left) {
    left = palace.left;
    right = palace.right;
  }
  const width = Math.max(1, right - left + 1);
  const safeCount = Math.min(count, width);
  return spreadPositions(safeCount, width).map(pos => pos + left);
}

function calcGeometry() {
  const scaleX = (x) => Math.round(x * (boardWidth - 1) / (BASE_WIDTH - 1));
  const scaleY = (y) => Math.round(y * (boardHeight - 1) / (BASE_HEIGHT - 1));
  const riverRow = Math.floor(boardHeight / 2) - 1;
  const palaceWidth = clamp(
    Math.ceil(boardWidth * BASE_PALACE_WIDTH / BASE_WIDTH),
    BASE_PALACE_WIDTH,
    boardWidth
  );
  const palaceHeight = clamp(
    Math.ceil(boardHeight * BASE_PALACE_HEIGHT / BASE_HEIGHT),
    BASE_PALACE_HEIGHT,
    Math.floor(boardHeight / 2)
  );
  const palaceLeft = Math.floor((boardWidth - palaceWidth) / 2);
  const blackPalace = { left: palaceLeft, top: 0, width: palaceWidth, height: palaceHeight };
  const redPalace = { left: palaceLeft, top: boardHeight - palaceHeight, width: palaceWidth, height: palaceHeight };
  return buildBoardMeta(boardWidth, boardHeight, riverRow, blackPalace, redPalace, scaleX, scaleY);
}

function isInPalace(color, x, y) {
  return isInPalaceForMeta(boardMeta, color, x, y);
}

function placePiece(x, y, type, color) {
  if (x < 0 || x >= boardWidth || y < 0 || y >= boardHeight) return;
  if (board[y][x]) return;
  board[y][x] = { type, color: color ?? null };
}
function getGeneralColumns() {
  const columns = new Set();
  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      const piece = board[y][x];
      if (piece && piece.type === 'g') {
        columns.add(x);
      }
    }
  }
  return Array.from(columns).sort((a, b) => a - b);
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

function checkWinner() {
  const redCount = countGenerals('red');
  const blackCount = countGenerals('black');
  if (redCount === 0) return 'black';
  if (blackCount === 0) return 'red';
  return null;
}
