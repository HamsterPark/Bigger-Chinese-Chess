/**
 * 象棋扩展版小游戏逻辑
 *
 * 棋盘采用网格布局，支持自定义扩展尺寸，初始布局与宫界、河界随尺寸调整。
 * 棋子和规则与标准象棋一致，包含：车、马、相、士、将（帅）、炮、兵（卒）。
 */

const BASE_WIDTH = 9;
const BASE_HEIGHT = 10;
const CELL_SIZE = 60;
const BASE_PAWN_COUNT = 5;
const BASE_PALACE_WIDTH = 3;
const BASE_PALACE_HEIGHT = 3;
const STORAGE_KEY = 'betterXiangqiBoards';

let boardWidth = BASE_WIDTH;
let boardHeight = BASE_HEIGHT;
let board = [];
let currentPlayer = 'red';
let selected = null;
let possibleMoves = [];
let pieceMode = 'standard';
let aiLevel = 'none';
let gameOver = false;
let boardMeta = null;
let activeCustomBoard = null;

let editorBoard = [];
let editorMeta = null;
let editorWidth = BASE_WIDTH;
let editorHeight = BASE_HEIGHT;
let editorRiverLine = Math.floor(BASE_HEIGHT / 2) - 1;
let editorPalaceBlack = { left: 3, top: 0, width: 3, height: 3 };
let editorPalaceRed = { left: 3, top: 7, width: 3, height: 3 };
let editorInitialized = false;
let editorDragPayload = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseSize(value, min) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return min;
  return Math.max(min, parsed);
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

function updateStatus(winner) {
  const statusEl = document.getElementById('status');
  if (!statusEl) return;
  if (winner) {
    statusEl.textContent = `${winner === 'red' ? '红方' : '黑方'}胜`;
    return;
  }
  statusEl.textContent = `当前：${currentPlayer === 'red' ? '红方' : '黑方'}`;
}

function showMenu() {
  const menuScreen = document.getElementById('menuScreen');
  const gameScreen = document.getElementById('gameScreen');
  const editorScreen = document.getElementById('editorScreen');
  if (menuScreen) menuScreen.classList.remove('hidden');
  if (gameScreen) gameScreen.classList.add('hidden');
  if (editorScreen) editorScreen.classList.add('hidden');
  closeLoadDialog();
}

function showGame() {
  const menuScreen = document.getElementById('menuScreen');
  const gameScreen = document.getElementById('gameScreen');
  const editorScreen = document.getElementById('editorScreen');
  if (menuScreen) menuScreen.classList.add('hidden');
  if (gameScreen) gameScreen.classList.remove('hidden');
  if (editorScreen) editorScreen.classList.add('hidden');
}

function showEditor() {
  const menuScreen = document.getElementById('menuScreen');
  const gameScreen = document.getElementById('gameScreen');
  const editorScreen = document.getElementById('editorScreen');
  if (menuScreen) menuScreen.classList.add('hidden');
  if (gameScreen) gameScreen.classList.add('hidden');
  if (editorScreen) editorScreen.classList.remove('hidden');
}

function showResultDialog(winner) {
  const overlay = document.getElementById('resultOverlay');
  const text = document.getElementById('resultText');
  if (!overlay || !text) return;
  text.textContent = `${winner === 'red' ? '红方' : '黑方'}胜`;
  overlay.classList.remove('hidden');
}

function closeResultDialog() {
  const overlay = document.getElementById('resultOverlay');
  if (overlay) overlay.classList.add('hidden');
}

function getSelectedValue(name, fallback) {
  const selectedValue = document.querySelector(`input[name="${name}"]:checked`);
  return selectedValue ? selectedValue.value : fallback;
}

function resolveBoardSize(mode) {
  if (mode === 'wide') return { width: BASE_WIDTH * 2, height: BASE_HEIGHT };
  if (mode === 'tall') return { width: BASE_WIDTH, height: BASE_HEIGHT * 2 };
  if (mode === 'big') return { width: BASE_WIDTH * 2, height: BASE_HEIGHT * 2 };
  return { width: BASE_WIDTH, height: BASE_HEIGHT };
}

function normalizePieceMode(mode) {
  if (mode === 'pawns' || mode === 'generals' || mode === 'both') return mode;
  return 'standard';
}

function updateCustomSizeVisibility() {
  const customSize = document.getElementById('customBoardSize');
  if (!customSize) return;
  const boardMode = getSelectedValue('boardMode', 'normal');
  if (boardMode === 'custom') {
    customSize.classList.remove('hidden');
  } else {
    customSize.classList.add('hidden');
  }
}

function startGame() {
  activeCustomBoard = null;
  const boardMode = getSelectedValue('boardMode', 'normal');
  const expandMode = getSelectedValue('expandMode', 'standard');
  aiLevel = getSelectedValue('aiLevel', 'none');
  if (boardMode === 'custom') {
    const widthInput = document.getElementById('customBoardWidth');
    const heightInput = document.getElementById('customBoardHeight');
    boardWidth = parseSize(widthInput ? widthInput.value : BASE_WIDTH, BASE_WIDTH);
    boardHeight = parseSize(heightInput ? heightInput.value : BASE_HEIGHT, BASE_HEIGHT);
    if (widthInput) widthInput.value = boardWidth;
    if (heightInput) heightInput.value = boardHeight;
  } else {
    const size = resolveBoardSize(boardMode);
    boardWidth = size.width;
    boardHeight = size.height;
  }
  pieceMode = normalizePieceMode(expandMode);
  initBoard();
  renderBoard();
  closeResultDialog();
  showGame();
}

function startGameWithConfig(config) {
  activeCustomBoard = config;
  pieceMode = 'standard';
  initBoard();
  renderBoard();
  closeResultDialog();
  showGame();
}

function initBoard() {
  if (activeCustomBoard) {
    initBoardFromConfig(activeCustomBoard);
    return;
  }
  boardMeta = calcGeometry();
  board = createEmptyBoard(boardWidth, boardHeight);
  const { scaleX, scaleY } = boardMeta;
  const placements = [
    { x: 0, y: 0, type: 'r', color: 'black' },
    { x: 1, y: 0, type: 'h', color: 'black' },
    { x: 2, y: 0, type: 'e', color: 'black' },
    { x: 6, y: 0, type: 'e', color: 'black' },
    { x: 7, y: 0, type: 'h', color: 'black' },
    { x: 8, y: 0, type: 'r', color: 'black' },
    { x: 1, y: 2, type: 'c', color: 'black' },
    { x: 7, y: 2, type: 'c', color: 'black' },
    { x: 1, y: 7, type: 'c', color: 'red' },
    { x: 7, y: 7, type: 'c', color: 'red' },
    { x: 0, y: 9, type: 'r', color: 'red' },
    { x: 1, y: 9, type: 'h', color: 'red' },
    { x: 2, y: 9, type: 'e', color: 'red' },
    { x: 6, y: 9, type: 'e', color: 'red' },
    { x: 7, y: 9, type: 'h', color: 'red' },
    { x: 8, y: 9, type: 'r', color: 'red' }
  ];
  placements.forEach(item => {
    const nx = scaleX(item.x);
    const ny = scaleY(item.y);
    placePiece(nx, ny, item.type, item.color);
  });
  placeAdvisors();
  placeGenerals();
  placePawns();
  currentPlayer = 'red';
  selected = null;
  possibleMoves = [];
  gameOver = false;
  updateStatus();
}

function initBoardFromConfig(config) {
  const width = parseSize(config.width, BASE_WIDTH);
  const height = parseSize(config.height, BASE_HEIGHT);
  const fallbackLeft = Math.floor((width - BASE_PALACE_WIDTH) / 2);
  const riverRow = parseIntOr(config.riverRow, Math.floor(height / 2) - 1);
  const blackPalace = config.palace && config.palace.black
    ? config.palace.black
    : { left: fallbackLeft, top: 0, width: BASE_PALACE_WIDTH, height: BASE_PALACE_HEIGHT };
  const redPalace = config.palace && config.palace.red
    ? config.palace.red
    : { left: fallbackLeft, top: height - BASE_PALACE_HEIGHT, width: BASE_PALACE_WIDTH, height: BASE_PALACE_HEIGHT };
  boardWidth = width;
  boardHeight = height;
  boardMeta = buildBoardMeta(width, height, riverRow, blackPalace, redPalace);
  board = createEmptyBoard(width, height);
  if (Array.isArray(config.pieces)) {
    config.pieces.forEach(piece => {
      if (!piece || typeof piece.x !== 'number' || typeof piece.y !== 'number' || !piece.type) return;
      placePiece(piece.x, piece.y, piece.type, piece.color ?? null);
    });
  }
  currentPlayer = 'red';
  selected = null;
  possibleMoves = [];
  gameOver = false;
  updateStatus();
}

function placeAdvisors() {
  const blackPalace = boardMeta.palace.black;
  const redPalace = boardMeta.palace.red;
  placePiece(blackPalace.left, blackPalace.top, 'a', 'black');
  placePiece(blackPalace.right, blackPalace.top, 'a', 'black');
  placePiece(redPalace.left, redPalace.bottom, 'a', 'red');
  placePiece(redPalace.right, redPalace.bottom, 'a', 'red');
}

function placeGenerals() {
  const blackPalace = boardMeta.palace.black;
  const redPalace = boardMeta.palace.red;
  let count = 1;
  if (modeHasGenerals()) {
    const baseWidth = Math.min(blackPalace.width, redPalace.width);
    count = Math.max(1, Math.round(baseWidth / BASE_PALACE_WIDTH));
  }
  const blackColumns = getPalaceColumns(blackPalace, count);
  const redColumns = getPalaceColumns(redPalace, count);
  const finalCount = Math.min(blackColumns.length, redColumns.length);
  for (let i = 0; i < finalCount; i++) {
    placePiece(blackColumns[i], blackPalace.top, 'g', 'black');
    placePiece(redColumns[i], redPalace.bottom, 'g', 'red');
  }
}

function placePawns() {
  const pawnCount = modeHasPawns()
    ? Math.max(BASE_PAWN_COUNT, Math.round(BASE_PAWN_COUNT * boardWidth / BASE_WIDTH))
    : BASE_PAWN_COUNT;
  const generalColumns = getGeneralColumns();
  const columns = includeRequiredColumns(
    spreadPositions(pawnCount, boardWidth),
    generalColumns
  );
  const blackRow = boardMeta.scaleY(3);
  const redRow = boardMeta.scaleY(6);
  columns.forEach(col => {
    placePiece(col, blackRow, 'p', 'black');
    placePiece(col, redRow, 'p', 'red');
  });
}
function calcMoves(x, y, piece) {
  const moves = [];
  const type = piece.type;
  const color = piece.color;
  const { riverRow, riverSplit } = boardMeta;

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
    for (const redG of redGenerals) {
      for (const blackG of blackGenerals) {
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
    directions.forEach(dir => {
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
    });
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
    horseMoves.forEach(m => {
      const legX = x + m.blockX;
      const legY = y + m.blockY;
      if (legX < 0 || legX >= boardWidth || legY < 0 || legY >= boardHeight) return;
      if (board[legY][legX]) return;
      const tx = x + m.dx;
      const ty = y + m.dy;
      if (canMoveTo(tx, ty)) {
        if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
      }
    });
  } else if (type === 'e') {
    const eleMoves = [
      { dx: 2, dy: 2 },
      { dx: 2, dy: -2 },
      { dx: -2, dy: 2 },
      { dx: -2, dy: -2 }
    ];
    eleMoves.forEach(m => {
      const eyeX = x + m.dx / 2;
      const eyeY = y + m.dy / 2;
      const tx = x + m.dx;
      const ty = y + m.dy;
      if (tx < 0 || tx >= boardWidth || ty < 0 || ty >= boardHeight) return;
      if (board[eyeY][eyeX]) return;
      if (color === 'black' && ty > riverRow) return;
      if (color === 'red' && ty < riverSplit) return;
      if (canMoveTo(tx, ty)) {
        if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
      }
    });
  } else if (type === 'a') {
    const advMoves = [
      { dx: 1, dy: 1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
      { dx: -1, dy: -1 }
    ];
    advMoves.forEach(m => {
      const tx = x + m.dx;
      const ty = y + m.dy;
      if (isInPalace(color, tx, ty)) {
        if (canMoveTo(tx, ty)) {
          if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
        }
      }
    });
  } else if (type === 'g') {
    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];
    dirs.forEach(dir => {
      const tx = x + dir.dx;
      const ty = y + dir.dy;
      if (isInPalace(color, tx, ty)) {
        if (canMoveTo(tx, ty)) {
          if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
        }
      }
    });
  } else if (type === 'c') {
    const directions = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];
    directions.forEach(dir => {
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
    });
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
      sideMoves.forEach(m => {
        const tx = x + m.dx;
        const ty = y;
        if (canMoveTo(tx, ty)) {
          if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
        }
      });
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
    directions.forEach(dir => {
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
    });
  }

  return moves;
}
function getPieceChar(piece) {
  if (!piece) return '';
  const { type, color } = piece;
  if (type === 'b') return '';
  const redChars = { g: '\u5e05', a: '\u4ed5', e: '\u76f8', h: '\u9a6c', r: '\u8f66', c: '\u70ae', p: '\u5175', q: '\u540e' };
  const blackChars = { g: '\u5c06', a: '\u58eb', e: '\u8c61', h: '\u9a6c', r: '\u8f66', c: '\u70ae', p: '\u5352', q: '\u540e' };
  if (color === 'red') return redChars[type] || '';
  if (color === 'black') return blackChars[type] || '';
  return '';
}

function renderBoard() {
  const boardDiv = document.getElementById('board');
  if (!boardDiv) return;
  boardDiv.innerHTML = '';
  boardDiv.style.gridTemplateColumns = `repeat(${boardWidth}, ${CELL_SIZE}px)`;
  boardDiv.style.gridTemplateRows = `repeat(${boardHeight}, ${CELL_SIZE}px)`;
  boardDiv.style.width = `${boardWidth * CELL_SIZE}px`;
  boardDiv.style.height = `${boardHeight * CELL_SIZE}px`;
  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      const cellDiv = document.createElement('div');
      cellDiv.className = 'cell';
      cellDiv.dataset.x = x;
      cellDiv.dataset.y = y;
      if (x === 0) cellDiv.classList.add('left-edge');
      if (y === 0) cellDiv.classList.add('top-edge');
      if (x === boardWidth - 1) cellDiv.classList.add('right-edge');
      if (y === boardHeight - 1) cellDiv.classList.add('bottom-edge');
      const isRedPalace = isInPalaceForMeta(boardMeta, 'red', x, y);
      const isBlackPalace = isInPalaceForMeta(boardMeta, 'black', x, y);
      if (isRedPalace || isBlackPalace) {
        cellDiv.classList.add('palace-cell');
      }
      if (isRedPalace && isBlackPalace) {
        cellDiv.classList.add('palace-overlap');
      } else if (isRedPalace) {
        cellDiv.classList.add('palace-red');
      } else if (isBlackPalace) {
        cellDiv.classList.add('palace-black');
      }
      if (possibleMoves.some(m => m.x === x && m.y === y)) {
        cellDiv.classList.add('highlight');
      }
      const piece = board[y][x];
      if (piece) {
        let pieceEl;
        if (piece.type === 'b') {
          pieceEl = document.createElement('div');
          pieceEl.className = 'piece block';
        } else {
          const span = document.createElement('span');
          span.className = `piece ${piece.color}`;
          span.textContent = getPieceChar(piece);
          pieceEl = span;
        }
        if (selected && selected.x === x && selected.y === y && piece.type !== 'b') {
          pieceEl.classList.add('selected-piece');
        }
        cellDiv.appendChild(pieceEl);
      }
      cellDiv.addEventListener('click', () => onCellClick(x, y));
      boardDiv.appendChild(cellDiv);
    }
  }
  renderRiverOverlay(boardDiv, boardMeta);
}

function renderRiverOverlay(boardDiv, meta) {
  if (!meta) return;
  const riverOverlay = document.createElement('div');
  riverOverlay.className = 'river-overlay';
  const lineThickness = 4;
  riverOverlay.style.height = `${lineThickness}px`;
  const riverY = (meta.riverRow + 1) * CELL_SIZE;
  riverOverlay.style.top = `${riverY - lineThickness / 2}px`;
  boardDiv.appendChild(riverOverlay);
}

function onCellClick(x, y) {
  if (gameOver) return;
  const clickedPiece = board[y][x];
  if (selected) {
    if (possibleMoves.some(m => m.x === x && m.y === y)) {
      board[y][x] = { ...selected.piece };
      board[selected.y][selected.x] = null;
      selected = null;
      possibleMoves = [];
      const winner = checkWinner();
      if (winner) {
        gameOver = true;
        updateStatus(winner);
        showResultDialog(winner);
        renderBoard();
        return;
      }
      currentPlayer = currentPlayer === 'red' ? 'black' : 'red';
      updateStatus();
      renderBoard();
      return;
    }
    if (clickedPiece && clickedPiece.color === currentPlayer && clickedPiece.type !== 'b') {
      selected = { x, y, piece: clickedPiece };
      possibleMoves = calcMoves(x, y, clickedPiece);
      renderBoard();
      return;
    }
    selected = null;
    possibleMoves = [];
    renderBoard();
    return;
  }
  if (clickedPiece && clickedPiece.color === currentPlayer && clickedPiece.type !== 'b') {
    selected = { x, y, piece: clickedPiece };
    possibleMoves = calcMoves(x, y, clickedPiece);
    renderBoard();
  }
}
function getStoredBoards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function saveStoredBoards(boards) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
}

function collectEditorConfig(name) {
  const pieces = [];
  for (let y = 0; y < editorHeight; y++) {
    for (let x = 0; x < editorWidth; x++) {
      const piece = editorBoard[y][x];
      if (!piece) continue;
      pieces.push({
        x,
        y,
        type: piece.type,
        color: piece.color ?? null
      });
    }
  }
  const palaceBlack = editorMeta.palace.black;
  const palaceRed = editorMeta.palace.red;
  return {
    name,
    width: editorWidth,
    height: editorHeight,
    riverRow: editorMeta.riverRow,
    palace: {
      black: {
        left: palaceBlack.left,
        top: palaceBlack.top,
        width: palaceBlack.width,
        height: palaceBlack.height
      },
      red: {
        left: palaceRed.left,
        top: palaceRed.top,
        width: palaceRed.width,
        height: palaceRed.height
      }
    },
    pieces
  };
}

function syncEditorInputs() {
  const widthInput = document.getElementById('editorWidth');
  const heightInput = document.getElementById('editorHeight');
  const riverInput = document.getElementById('editorRiver');
  const blackLeftInput = document.getElementById('editorBlackLeft');
  const blackTopInput = document.getElementById('editorBlackTop');
  const blackWidthInput = document.getElementById('editorBlackWidth');
  const blackHeightInput = document.getElementById('editorBlackHeight');
  const redLeftInput = document.getElementById('editorRedLeft');
  const redTopInput = document.getElementById('editorRedTop');
  const redWidthInput = document.getElementById('editorRedWidth');
  const redHeightInput = document.getElementById('editorRedHeight');

  if (widthInput) widthInput.value = editorWidth;
  if (heightInput) heightInput.value = editorHeight;
  if (riverInput) riverInput.value = editorMeta.riverRow + 1;

  if (blackLeftInput) blackLeftInput.value = editorMeta.palace.black.left + 1;
  if (blackTopInput) blackTopInput.value = editorMeta.palace.black.top + 1;
  if (blackWidthInput) blackWidthInput.value = editorMeta.palace.black.width;
  if (blackHeightInput) blackHeightInput.value = editorMeta.palace.black.height;

  if (redLeftInput) redLeftInput.value = editorMeta.palace.red.left + 1;
  if (redTopInput) redTopInput.value = editorMeta.palace.red.top + 1;
  if (redWidthInput) redWidthInput.value = editorMeta.palace.red.width;
  if (redHeightInput) redHeightInput.value = editorMeta.palace.red.height;
}

function resizeEditorBoard(nextWidth, nextHeight) {
  const nextBoard = createEmptyBoard(nextWidth, nextHeight);
  const copyHeight = Math.min(nextHeight, editorBoard.length);
  const copyWidth = editorBoard.length ? Math.min(nextWidth, editorBoard[0].length) : 0;
  for (let y = 0; y < copyHeight; y++) {
    for (let x = 0; x < copyWidth; x++) {
      nextBoard[y][x] = editorBoard[y][x];
    }
  }
  editorBoard = nextBoard;
}

function applyEditorSettings(preservePieces = true) {
  const width = parseSize(parseIntOr(document.getElementById('editorWidth')?.value, BASE_WIDTH), 3);
  const height = parseSize(parseIntOr(document.getElementById('editorHeight')?.value, BASE_HEIGHT), 3);
  const riverLine = clamp(
    parseIntOr(document.getElementById('editorRiver')?.value, Math.floor(height / 2)),
    1,
    Math.max(1, height - 1)
  );
  const blackPalaceInput = {
    left: parseIntOr(document.getElementById('editorBlackLeft')?.value, 1) - 1,
    top: parseIntOr(document.getElementById('editorBlackTop')?.value, 1) - 1,
    width: parseIntOr(document.getElementById('editorBlackWidth')?.value, BASE_PALACE_WIDTH),
    height: parseIntOr(document.getElementById('editorBlackHeight')?.value, BASE_PALACE_HEIGHT)
  };
  const redPalaceInput = {
    left: parseIntOr(document.getElementById('editorRedLeft')?.value, 1) - 1,
    top: parseIntOr(document.getElementById('editorRedTop')?.value, height - BASE_PALACE_HEIGHT + 1) - 1,
    width: parseIntOr(document.getElementById('editorRedWidth')?.value, BASE_PALACE_WIDTH),
    height: parseIntOr(document.getElementById('editorRedHeight')?.value, BASE_PALACE_HEIGHT)
  };

  editorWidth = width;
  editorHeight = height;
  editorRiverLine = riverLine - 1;
  const blackPalace = normalizePalace(blackPalaceInput, width, height);
  const redPalace = normalizePalace(redPalaceInput, width, height);
  if (!preservePieces || !editorBoard.length) {
    editorBoard = createEmptyBoard(width, height);
  } else {
    resizeEditorBoard(width, height);
  }
  editorMeta = buildBoardMeta(width, height, editorRiverLine, blackPalace, redPalace);
  editorPalaceBlack = editorMeta.palace.black;
  editorPalaceRed = editorMeta.palace.red;
  syncEditorInputs();
  renderEditorBoard();
}

function canPlacePieceInEditor(piece, x, y) {
  if (!piece) return false;
  if (x < 0 || x >= editorWidth || y < 0 || y >= editorHeight) return false;
  if (piece.type === 'empty') return true;
  if (piece.type === 'g' || piece.type === 'a') {
    if (!piece.color) return false;
    return isInPalaceForMeta(editorMeta, piece.color, x, y);
  }
  if (piece.type === 'e') {
    if (!piece.color) return false;
    if (piece.color === 'black') return y <= editorMeta.riverRow;
    return y >= editorMeta.riverSplit;
  }
  return true;
}

function parseDragData(data) {
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

function renderEditorPalettes() {
  const paletteItems = [
    { type: 'empty', label: '\u7a7a\u767d' },
    { type: 'g', label: '\u5c06/\u5e05' },
    { type: 'a', label: '\u58eb/\u4ed5' },
    { type: 'e', label: '\u8c61/\u76f8' },
    { type: 'h', label: '\u9a6c' },
    { type: 'r', label: '\u8f66' },
    { type: 'c', label: '\u70ae' },
    { type: 'p', label: '\u5175/\u5352' },
    { type: 'q', label: '\u540e' },
    { type: 'b', label: '\u8def\u969c' }
  ];

  function renderPalette(containerId, color) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    paletteItems.forEach(item => {
      const pieceEl = document.createElement('div');
      pieceEl.className = 'palette-piece';
      pieceEl.draggable = true;
      pieceEl.title = item.label;
      if (item.type === 'empty') {
        pieceEl.classList.add('empty');
        pieceEl.textContent = '\u7a7a';
      } else if (item.type === 'b') {
        pieceEl.classList.add('block');
      } else {
        pieceEl.classList.add(color);
        pieceEl.textContent = getPieceChar({ type: item.type, color });
      }
      pieceEl.addEventListener('dragstart', (event) => {
        const payload = {
          source: 'palette',
          type: item.type,
          color: item.type === 'b' || item.type === 'empty' ? null : color
        };
        editorDragPayload = payload;
        event.dataTransfer.setData('text/plain', JSON.stringify(payload));
        event.dataTransfer.effectAllowed = 'copy';
      });
      pieceEl.addEventListener('dragend', () => {
        editorDragPayload = null;
      });
      container.appendChild(pieceEl);
    });
  }

  renderPalette('paletteRedItems', 'red');
  renderPalette('paletteBlackItems', 'black');
}
function renderEditorBoard() {
  const boardDiv = document.getElementById('editorBoard');
  if (!boardDiv) return;
  boardDiv.innerHTML = '';
  boardDiv.style.gridTemplateColumns = `repeat(${editorWidth}, ${CELL_SIZE}px)`;
  boardDiv.style.gridTemplateRows = `repeat(${editorHeight}, ${CELL_SIZE}px)`;
  boardDiv.style.width = `${editorWidth * CELL_SIZE}px`;
  boardDiv.style.height = `${editorHeight * CELL_SIZE}px`;
  for (let y = 0; y < editorHeight; y++) {
    for (let x = 0; x < editorWidth; x++) {
      const cellDiv = document.createElement('div');
      cellDiv.className = 'cell';
      cellDiv.dataset.x = x;
      cellDiv.dataset.y = y;
      if (x === 0) cellDiv.classList.add('left-edge');
      if (y === 0) cellDiv.classList.add('top-edge');
      if (x === editorWidth - 1) cellDiv.classList.add('right-edge');
      if (y === editorHeight - 1) cellDiv.classList.add('bottom-edge');
      const isRedPalace = isInPalaceForMeta(editorMeta, 'red', x, y);
      const isBlackPalace = isInPalaceForMeta(editorMeta, 'black', x, y);
      if (isRedPalace || isBlackPalace) {
        cellDiv.classList.add('palace-cell');
      }
      if (isRedPalace && isBlackPalace) {
        cellDiv.classList.add('palace-overlap');
      } else if (isRedPalace) {
        cellDiv.classList.add('palace-red');
      } else if (isBlackPalace) {
        cellDiv.classList.add('palace-black');
      }
      const piece = editorBoard[y][x];
      if (piece) {
        let pieceEl;
        if (piece.type === 'b') {
          pieceEl = document.createElement('div');
          pieceEl.className = 'piece block';
        } else {
          const span = document.createElement('span');
          span.className = `piece ${piece.color}`;
          span.textContent = getPieceChar(piece);
          pieceEl = span;
        }
        pieceEl.draggable = true;
        pieceEl.addEventListener('dragstart', (event) => {
          const payload = {
            source: 'board',
            type: piece.type,
            color: piece.color ?? null,
            x,
            y
          };
          editorDragPayload = payload;
          event.dataTransfer.setData('text/plain', JSON.stringify(payload));
          event.dataTransfer.effectAllowed = 'move';
        });
        pieceEl.addEventListener('dragend', () => {
          editorDragPayload = null;
        });
        cellDiv.appendChild(pieceEl);
      }
      cellDiv.addEventListener('dragover', (event) => {
        event.preventDefault();
        const allowed = (event.dataTransfer?.effectAllowed || '').toLowerCase();
        event.dataTransfer.dropEffect = allowed.includes('move') ? 'move' : 'copy';
      });
      cellDiv.addEventListener('drop', (event) => {
        event.preventDefault();
        const payload = parseDragData(event.dataTransfer.getData('text/plain')) || editorDragPayload;
        editorDragPayload = null;
        if (!payload || !payload.type) return;
        if (payload.type === 'empty') {
          editorBoard[y][x] = null;
          renderEditorBoard();
          return;
        }
        const piece = { type: payload.type, color: payload.color ?? null };
        if (!canPlacePieceInEditor(piece, x, y)) return;
        if (payload.source === 'board') {
          if (payload.x === x && payload.y === y) return;
          if (editorBoard[payload.y] && editorBoard[payload.y][payload.x]) {
            editorBoard[payload.y][payload.x] = null;
          }
        }
        editorBoard[y][x] = piece;
        renderEditorBoard();
      });
      boardDiv.appendChild(cellDiv);
    }
  }
  renderRiverOverlay(boardDiv, editorMeta);
}

function initEditor() {
  editorWidth = BASE_WIDTH;
  editorHeight = BASE_HEIGHT;
  editorRiverLine = Math.floor(BASE_HEIGHT / 2) - 1;
  editorPalaceBlack = { left: 3, top: 0, width: 3, height: 3 };
  editorPalaceRed = { left: 3, top: BASE_HEIGHT - BASE_PALACE_HEIGHT, width: 3, height: 3 };
  editorBoard = createEmptyBoard(editorWidth, editorHeight);
  editorMeta = buildBoardMeta(editorWidth, editorHeight, editorRiverLine, editorPalaceBlack, editorPalaceRed);
  editorPalaceBlack = editorMeta.palace.black;
  editorPalaceRed = editorMeta.palace.red;
  renderEditorPalettes();
  syncEditorInputs();
  renderEditorBoard();
}

function openLoadDialog() {
  const boards = getStoredBoards();
  if (!boards.length) {
    alert('暂无保存的棋盘');
    return;
  }
  const select = document.getElementById('loadBoardSelect');
  if (!select) return;
  select.innerHTML = '';
  boards.forEach((boardItem, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = boardItem.name || `自定义棋盘${index + 1}`;
    select.appendChild(option);
  });
  const overlay = document.getElementById('loadOverlay');
  if (overlay) overlay.classList.remove('hidden');
}

function closeLoadDialog() {
  const overlay = document.getElementById('loadOverlay');
  if (overlay) overlay.classList.add('hidden');
}

const startBtn = document.getElementById('startBtn');
if (startBtn) startBtn.addEventListener('click', startGame);

const backBtn = document.getElementById('backBtn');
if (backBtn) backBtn.addEventListener('click', () => {
  closeResultDialog();
  showMenu();
});

const resetBtn = document.getElementById('resetBtn');
if (resetBtn) resetBtn.addEventListener('click', () => {
  initBoard();
  renderBoard();
  closeResultDialog();
});

const resultCloseBtn = document.getElementById('resultCloseBtn');
if (resultCloseBtn) resultCloseBtn.addEventListener('click', closeResultDialog);

const editBoardBtn = document.getElementById('editBoardBtn');
if (editBoardBtn) editBoardBtn.addEventListener('click', () => {
  if (!editorInitialized) {
    editorInitialized = true;
    initEditor();
  } else {
    renderEditorBoard();
  }
  showEditor();
});

const loadBoardBtn = document.getElementById('loadBoardBtn');
if (loadBoardBtn) loadBoardBtn.addEventListener('click', openLoadDialog);

const editorBackBtn = document.getElementById('editorBackBtn');
if (editorBackBtn) editorBackBtn.addEventListener('click', showMenu);

const editorApplyBtn = document.getElementById('editorApplyBtn');
if (editorApplyBtn) editorApplyBtn.addEventListener('click', () => applyEditorSettings(false));

const editorSaveBtn = document.getElementById('editorSaveBtn');
if (editorSaveBtn) editorSaveBtn.addEventListener('click', () => {
  const nameInput = document.getElementById('editorName');
  const name = nameInput ? nameInput.value.trim() : '';
  if (!name) {
    alert('请填写棋盘名称');
    return;
  }
  const config = collectEditorConfig(name);
  const boards = getStoredBoards();
  const existingIndex = boards.findIndex(boardItem => boardItem.name === name);
  if (existingIndex >= 0) {
    if (!confirm('同名棋盘已存在，是否覆盖？')) return;
    boards[existingIndex] = config;
  } else {
    boards.push(config);
  }
  saveStoredBoards(boards);
  alert('棋盘已保存');
});

const loadStartBtn = document.getElementById('loadStartBtn');
if (loadStartBtn) loadStartBtn.addEventListener('click', () => {
  const boards = getStoredBoards();
  const select = document.getElementById('loadBoardSelect');
  const index = parseInt(select ? select.value : '', 10);
  const config = boards[index];
  if (!config) return;
  closeLoadDialog();
  startGameWithConfig(config);
});

const loadCancelBtn = document.getElementById('loadCancelBtn');
if (loadCancelBtn) loadCancelBtn.addEventListener('click', closeLoadDialog);

document.querySelectorAll('input[name="boardMode"]').forEach((radio) => {
  radio.addEventListener('change', updateCustomSizeVisibility);
});
updateCustomSizeVisibility();

showMenu();

