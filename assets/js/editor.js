'use strict';

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
