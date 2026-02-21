'use strict';

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
  lastMove = null;
  gameOver = false;
  updateStatus();
  resetMoveHistory();
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
  lastMove = null;
  gameOver = false;
  updateStatus();
  resetMoveHistory();
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

function cloneBoardSnapshot(sourceBoard) {
  return sourceBoard.map(row => row.map(cell => cell ? { ...cell } : null));
}

function buildHistorySnapshot() {
  return {
    board: cloneBoardSnapshot(board),
    currentPlayer,
    gameOver,
    lastMove: lastMove ? { ...lastMove } : null
  };
}

function resetMoveHistory() {
  moveHistory = [buildHistorySnapshot()];
}

function recordMoveHistory() {
  moveHistory.push(buildHistorySnapshot());
}

function canUndoTurn() {
  return moveHistory.length >= 3;
}

function undoLastTurn() {
  if (!canUndoTurn()) return false;
  moveHistory.splice(-2, 2);
  const snapshot = moveHistory[moveHistory.length - 1];
  board = cloneBoardSnapshot(snapshot.board);
  currentPlayer = snapshot.currentPlayer;
  gameOver = snapshot.gameOver;
  lastMove = snapshot.lastMove ? { ...snapshot.lastMove } : null;
  selected = null;
  possibleMoves = [];
  return true;
}

function getAllMovesForColor(color) {
  const moves = [];
  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      const piece = board[y][x];
      if (!piece || piece.type === 'b' || piece.color !== color) continue;
      const targets = calcMoves(x, y, piece);
      targets.forEach(target => {
        moves.push({
          fromX: x,
          fromY: y,
          toX: target.x,
          toY: target.y
        });
      });
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
