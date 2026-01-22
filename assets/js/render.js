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
