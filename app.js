/**
 * 象棋扩展版小游戏逻辑
 *
 * 棋盘采用网格布局，支持自定义扩展尺寸，初始布局与宫界、河界随尺寸调整。
 * 棋子和规则与标准象棋一致，包含：车、马、象、士、将（帅）、炮、兵（卒）。
 */

// 基础棋盘大小
const BASE_WIDTH = 9;
const BASE_HEIGHT = 10;
const CELL_SIZE = 60;
const BASE_PAWN_COUNT = 5;
const BASE_PALACE_WIDTH = 3;
const BASE_PALACE_HEIGHT = 3;
// 当前棋盘尺寸
let boardWidth = BASE_WIDTH;
let boardHeight = BASE_HEIGHT;
// 棋盘数组，存放棋子或 null
let board = [];
// 当前执子方：'red' 或 'black'
let currentPlayer = 'red';
// 已选中的棋子对象，包含 x、y、piece
let selected = null;
// 当前可走位置列表
let possibleMoves = [];
// 扩展模式
let pieceMode = 'standard';
// AI 对手等级
let aiLevel = 'none';
// 游戏是否结束
let gameOver = false;
// 盘面几何信息（宫界、河界等）
let boardMeta = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseSize(value, min) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return min;
  return Math.max(min, parsed);
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

function calcGeometry() {
  const scaleX = (x) => Math.round(x * (boardWidth - 1) / (BASE_WIDTH - 1));
  const scaleY = (y) => Math.round(y * (boardHeight - 1) / (BASE_HEIGHT - 1));
  const riverRow = Math.floor(boardHeight / 2) - 1;
  const riverSplit = riverRow + 1;
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
  const palaceRight = palaceLeft + palaceWidth - 1;
  return {
    scaleX,
    scaleY,
    riverRow,
    riverSplit,
    palace: {
      left: palaceLeft,
      right: palaceRight,
      width: palaceWidth,
      height: palaceHeight,
      black: { top: 0, bottom: palaceHeight - 1 },
      red: { top: boardHeight - palaceHeight, bottom: boardHeight - 1 }
    }
  };
}

function isInPalace(color, x, y) {
  const palace = boardMeta.palace;
  const bounds = color === 'black' ? palace.black : palace.red;
  return x >= palace.left && x <= palace.right && y >= bounds.top && y <= bounds.bottom;
}

function isPalaceCell(x, y) {
  const palace = boardMeta.palace;
  return x >= palace.left && x <= palace.right &&
    ((y >= palace.black.top && y <= palace.black.bottom) ||
     (y >= palace.red.top && y <= palace.red.bottom));
}

function placePiece(x, y, type, color) {
  if (x < 0 || x >= boardWidth || y < 0 || y >= boardHeight) return;
  if (board[y][x]) return;
  board[y][x] = { type, color };
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
  if (menuScreen) menuScreen.classList.remove('hidden');
  if (gameScreen) gameScreen.classList.add('hidden');
}

function showGame() {
  const menuScreen = document.getElementById('menuScreen');
  const gameScreen = document.getElementById('gameScreen');
  if (menuScreen) menuScreen.classList.add('hidden');
  if (gameScreen) gameScreen.classList.remove('hidden');
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
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : fallback;
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

/**
 * 初始化棋盘数据：生成空棋盘并放置初始棋子。
 */
function initBoard() {
  boardMeta = calcGeometry();
  // 创建空棋盘
  board = [];
  for (let y = 0; y < boardHeight; y++) {
    const row = [];
    for (let x = 0; x < boardWidth; x++) {
      row.push(null);
    }
    board.push(row);
  }
  const { scaleX, scaleY } = boardMeta;
  // 放置标准初始棋子（不含兵、将、士）
  const placements = [
    // 黑方主力
    { x: 0, y: 0, type: 'r', color: 'black' },
    { x: 1, y: 0, type: 'h', color: 'black' },
    { x: 2, y: 0, type: 'e', color: 'black' },
    { x: 6, y: 0, type: 'e', color: 'black' },
    { x: 7, y: 0, type: 'h', color: 'black' },
    { x: 8, y: 0, type: 'r', color: 'black' },
    // 黑方炮
    { x: 1, y: 2, type: 'c', color: 'black' },
    { x: 7, y: 2, type: 'c', color: 'black' },
    // 红方炮
    { x: 1, y: 7, type: 'c', color: 'red' },
    { x: 7, y: 7, type: 'c', color: 'red' },
    // 红方主力
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

function placeAdvisors() {
  const palace = boardMeta.palace;
  placePiece(palace.left, palace.black.top, 'a', 'black');
  placePiece(palace.right, palace.black.top, 'a', 'black');
  placePiece(palace.left, palace.red.bottom, 'a', 'red');
  placePiece(palace.right, palace.red.bottom, 'a', 'red');
}

function placeGenerals() {
  const palace = boardMeta.palace;
  const innerLeft = palace.left + 1;
  const innerRight = palace.right - 1;
  const innerWidth = Math.max(1, innerRight - innerLeft + 1);
  let count = 1;
  if (modeHasGenerals()) {
    count = Math.max(1, Math.round(palace.width / BASE_PALACE_WIDTH));
  }
  count = Math.min(count, innerWidth);
  const columns = spreadPositions(count, innerWidth).map(pos => pos + innerLeft);
  columns.forEach(col => {
    placePiece(col, palace.black.top, 'g', 'black');
    placePiece(col, palace.red.bottom, 'g', 'red');
  });
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

/**
 * 根据棋子类别和当前局面，计算指定棋子可走的位置
 * @param {number} x 当前位置 x
 * @param {number} y 当前位置 y
 * @param {Object} piece 棋子对象
 * @returns {Array<{x:number,y:number}>} 合法目标位置数组
 */
function calcMoves(x, y, piece) {
  const moves = [];
  const type = piece.type;
  const color = piece.color;
  const { riverRow, riverSplit } = boardMeta;
  // 辅助函数：检查目标是否在界内且不是己方棋子
  function canMoveTo(tx, ty) {
    if (tx < 0 || tx >= boardWidth || ty < 0 || ty >= boardHeight) return false;
    const target = board[ty][tx];
    return !target || target.color !== color;
  }

  // 判断将帅不能对脸（飞将）
  function violatesFlyingGeneral(tx, ty, pieceObj) {
    // 仅在落子后才检查
    // 创建临时棋盘副本
    const temp = board.map(row => row.map(cell => cell ? { ...cell } : null));
    // 在副本上移动棋子
    temp[y][x] = null;
    temp[ty][tx] = { type: pieceObj.type, color: pieceObj.color };
    // 找到双方将的位置（支持多个将）
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

  // 车（rook）
  if (type === 'r') {
    // 横向和纵向
    const directions = [ { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 } ];
    directions.forEach(dir => {
      let tx = x + dir.dx;
      let ty = y + dir.dy;
      while (tx >= 0 && tx < boardWidth && ty >= 0 && ty < boardHeight) {
        const target = board[ty][tx];
        if (!target) {
          // 空格
          if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
        } else {
          // 有棋子
          if (target.color !== color) {
            if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
          }
          // 被阻挡
          break;
        }
        tx += dir.dx;
        ty += dir.dy;
      }
    });
  }
  // 马（horse）
  else if (type === 'h') {
    // 八个跳跃方向
    const horseMoves = [ { dx: 2, dy: 1, blockX: 1, blockY: 0 }, { dx: 2, dy: -1, blockX: 1, blockY: 0 },
                         { dx: -2, dy: 1, blockX: -1, blockY: 0 }, { dx: -2, dy: -1, blockX: -1, blockY: 0 },
                         { dx: 1, dy: 2, blockX: 0, blockY: 1 }, { dx: -1, dy: 2, blockX: 0, blockY: 1 },
                         { dx: 1, dy: -2, blockX: 0, blockY: -1 }, { dx: -1, dy: -2, blockX: 0, blockY: -1 } ];
    horseMoves.forEach(m => {
      const legX = x + m.blockX;
      const legY = y + m.blockY;
      if (legX < 0 || legX >= boardWidth || legY < 0 || legY >= boardHeight) return;
      // 阻马脚
      if (board[legY][legX]) return;
      const tx = x + m.dx;
      const ty = y + m.dy;
      if (canMoveTo(tx, ty)) {
        if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
      }
    });
  }
  // 象（elephant）
  else if (type === 'e') {
    // 四个对角线
    const eleMoves = [ { dx: 2, dy: 2 }, { dx: 2, dy: -2 }, { dx: -2, dy: 2 }, { dx: -2, dy: -2 } ];
    eleMoves.forEach(m => {
      const eyeX = x + m.dx / 2;
      const eyeY = y + m.dy / 2;
      const tx = x + m.dx;
      const ty = y + m.dy;
      // 不出界
      if (tx < 0 || tx >= boardWidth || ty < 0 || ty >= boardHeight) return;
      // 不能被堵象眼
      if (board[eyeY][eyeX]) return;
      // 不能过河
      if (color === 'black' && ty > riverRow) return;
      if (color === 'red' && ty < riverSplit) return;
      if (canMoveTo(tx, ty)) {
        if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
      }
    });
  }
  // 士（advisor）
  else if (type === 'a') {
    // 四个对角线一步
    const advMoves = [ { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 } ];
    advMoves.forEach(m => {
      const tx = x + m.dx;
      const ty = y + m.dy;
      // 目标在己方宫内
      if (isInPalace(color, tx, ty)) {
        if (canMoveTo(tx, ty)) {
          if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
        }
      }
    });
  }
  // 将/帅（general/king）
  else if (type === 'g') {
    const dirs = [ { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 } ];
    dirs.forEach(dir => {
      const tx = x + dir.dx;
      const ty = y + dir.dy;
      // 目标需在己方宫内
      if (isInPalace(color, tx, ty)) {
        if (canMoveTo(tx, ty)) {
          if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
        }
      }
    });
  }
  // 炮（cannon）
  else if (type === 'c') {
    // 像车一样的移动，但吃子必须隔一个
    const directions = [ { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 } ];
    directions.forEach(dir => {
      let tx = x + dir.dx;
      let ty = y + dir.dy;
      let jumped = false;
      while (tx >= 0 && tx < boardWidth && ty >= 0 && ty < boardHeight) {
        const target = board[ty][tx];
        if (!jumped) {
          // 未跳过屏风
          if (!target) {
            // 可以走
            if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
          } else {
            // 第一次遇到棋子，标记为已跳
            jumped = true;
          }
        } else {
          // 已跳过屏风，只能吃第一个对方棋子
          if (target) {
            if (target.color !== color) {
              if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
            }
            break;
          }
        }
        tx += dir.dx;
        ty += dir.dy;
      }
    });
  }
  // 兵/卒（pawn）
  else if (type === 'p') {
    // 对于黑方，向下走；红方，向上走
    const dy = color === 'red' ? -1 : 1;
    const forwardX = x;
    const forwardY = y + dy;
    // 前进一步
    if (canMoveTo(forwardX, forwardY)) {
      if (!violatesFlyingGeneral(forwardX, forwardY, piece)) moves.push({ x: forwardX, y: forwardY });
    }
    // 过河后，可以左右移动
    if ((color === 'red' && y <= riverRow) || (color === 'black' && y >= riverSplit)) {
      const sideMoves = [ { dx: -1, dy: 0 }, { dx: 1, dy: 0 } ];
      sideMoves.forEach(m => {
        const tx = x + m.dx;
        const ty = y;
        if (canMoveTo(tx, ty)) {
          if (!violatesFlyingGeneral(tx, ty, piece)) moves.push({ x: tx, y: ty });
        }
      });
    }
  }
  return moves;
}

/**
 * 根据棋子类型和颜色返回显示字符
 * @param {Object} piece 棋子对象
 * @returns {string}
 */
function getPieceChar(piece) {
  if (!piece) return '';
  const { type, color } = piece;
  // 使用常见的象棋字形
  const redChars = { g: '帅', a: '仕', e: '相', h: '傌', r: '俥', c: '炮', p: '兵' };
  const blackChars = { g: '将', a: '士', e: '象', h: '馬', r: '車', c: '砲', p: '卒' };
  return color === 'red' ? redChars[type] : blackChars[type];
}

/**
 * 渲染棋盘到页面
 */
function renderBoard() {
  const boardDiv = document.getElementById('board');
  boardDiv.innerHTML = '';
  // 设置网格列数
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
      // 边界线加粗
      if (x === 0) cellDiv.classList.add('left-edge');
      if (y === 0) cellDiv.classList.add('top-edge');
      if (x === boardWidth - 1) cellDiv.classList.add('right-edge');
      if (y === boardHeight - 1) cellDiv.classList.add('bottom-edge');
      // 如果是宫内格子，添加 palace 类
      if (isPalaceCell(x, y)) {
        cellDiv.classList.add('palace');
      }
      // 是否在可移动列表内
      if (possibleMoves.some(m => m.x === x && m.y === y)) {
        cellDiv.classList.add('highlight');
      }
      const piece = board[y][x];
      if (piece) {
        const span = document.createElement('span');
        span.className = 'piece ' + piece.color;
        span.textContent = getPieceChar(piece);
        // 选中棋子样式
        if (selected && selected.x === x && selected.y === y) {
          span.classList.add('selected-piece');
        }
        cellDiv.appendChild(span);
      }
      // 单元格点击事件
      cellDiv.addEventListener('click', () => onCellClick(x, y));
      boardDiv.appendChild(cellDiv);
    }
  }
  renderRiverOverlay(boardDiv);
}

function renderRiverOverlay(boardDiv) {
  const riverOverlay = document.createElement('div');
  riverOverlay.className = 'river-overlay';
  const riverY = (boardMeta.riverRow + 1) * CELL_SIZE;
  const lineThickness = 4;
  riverOverlay.style.borderTopWidth = `${lineThickness}px`;
  riverOverlay.style.top = `${riverY - lineThickness / 2}px`;
  boardDiv.appendChild(riverOverlay);
}

/**
 * 处理点击棋盘单元格
 * @param {number} x
 * @param {number} y
 */
function onCellClick(x, y) {
  if (gameOver) return;
  const clickedPiece = board[y][x];
  if (selected) {
    // 如果点击的是合法移动位置
    if (possibleMoves.some(m => m.x === x && m.y === y)) {
      // 执行移动
      board[y][x] = { ...selected.piece };
      board[selected.y][selected.x] = null;
      // 清除选择
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
      // 切换玩家
      currentPlayer = currentPlayer === 'red' ? 'black' : 'red';
      updateStatus();
      renderBoard();
      return;
    }
    // 若再次点击己方棋子，则重新计算
    if (clickedPiece && clickedPiece.color === currentPlayer) {
      selected = { x, y, piece: clickedPiece };
      possibleMoves = calcMoves(x, y, clickedPiece);
      renderBoard();
      return;
    }
    // 点击其他位置，取消选择
    selected = null;
    possibleMoves = [];
    renderBoard();
    return;
  }
  // 尚未选中棋子时
  if (clickedPiece && clickedPiece.color === currentPlayer) {
    selected = { x, y, piece: clickedPiece };
    possibleMoves = calcMoves(x, y, clickedPiece);
    renderBoard();
  }
}

// 绑定按钮事件
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

document.querySelectorAll('input[name="boardMode"]').forEach((radio) => {
  radio.addEventListener('change', updateCustomSizeVisibility);
});
updateCustomSizeVisibility();

showMenu();
