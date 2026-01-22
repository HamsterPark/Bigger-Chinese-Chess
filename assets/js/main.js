function updateStatus(winner) {
  const statusEl = document.getElementById('status');
  if (!statusEl) return;
  const reason = arguments.length > 1 ? arguments[1] : null;
  if (winner) {
    if (reason === 'forfeit') {
      const loser = winner === 'red' ? 'black' : 'red';
      statusEl.textContent = `${loser === 'red' ? '红方' : '黑方'}判负`;
      return;
    }
    statusEl.textContent = `${winner === 'red' ? '红方' : '黑方'}胜`;
    return;
  }
  if (aiThinking && isAiEnabled()) {
    const limitMs = getAiTimeLimit();
    const limitSec = limitMs > 0 ? Math.max(1, Math.ceil(limitMs / 1000)) : 0;
    if (limitSec > 0 && aiThinkStart > 0) {
      const elapsedSec = Math.floor((Date.now() - aiThinkStart) / 1000);
      if (elapsedSec > 0) {
        const shown = Math.min(elapsedSec, limitSec);
        statusEl.textContent = `AI思考中 ${shown}/${limitSec}s`;
        return;
      }
    }
    statusEl.textContent = 'AI思考中';
    return;
  }
  statusEl.textContent = `当前：${currentPlayer === 'red' ? '红方' : '黑方'}`;
}

function showMenu() {
  cancelAiMove();
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

function showResultDialog(winner, reason) {
  const overlay = document.getElementById('resultOverlay');
  const text = document.getElementById('resultText');
  if (!overlay || !text) return;
  if (reason === 'forfeit') {
    const loser = winner === 'red' ? 'black' : 'red';
    text.textContent = `${loser === 'red' ? '红方' : '黑方'}判负`;
  } else {
    text.textContent = `${winner === 'red' ? '红方' : '黑方'}胜`;
  }
  overlay.classList.remove('hidden');
}

function closeResultDialog() {
  const overlay = document.getElementById('resultOverlay');
  if (overlay) overlay.classList.add('hidden');
}

function endGame(winner, reason) {
  cancelAiMove(true);
  gameOver = true;
  updateStatus(winner, reason);
  showResultDialog(winner, reason);
  recordMoveHistory();
  updateUndoButton();
  renderBoard();
}

function handleForfeit(loser) {
  const winner = loser === 'red' ? 'black' : 'red';
  endGame(winner, 'forfeit');
}

function updateUndoButton() {
  const undoBtn = document.getElementById('undoBtn');
  if (!undoBtn) return;
  undoBtn.disabled = aiThinking || !canUndoTurn();
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
  cancelAiMove();
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
  updateUndoButton();
  closeResultDialog();
  showGame();
}

function startGameWithConfig(config) {
  cancelAiMove();
  activeCustomBoard = config;
  aiLevel = getSelectedValue('aiLevel', 'none');
  pieceMode = 'standard';
  initBoard();
  renderBoard();
  updateUndoButton();
  closeResultDialog();
  showGame();
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
  cancelAiMove();
  initBoard();
  renderBoard();
  updateUndoButton();
  closeResultDialog();
});

const undoBtn = document.getElementById('undoBtn');
if (undoBtn) undoBtn.addEventListener('click', () => {
  cancelAiMove();
  if (!undoLastTurn()) return;
  closeResultDialog();
  updateStatus(gameOver ? checkWinner() : null);
  renderBoard();
  updateUndoButton();
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

document.querySelectorAll('[data-board-index]').forEach((button) => {
  button.addEventListener('click', () => {
    if (typeof BUILTIN_BOARDS === 'undefined') return;
    const index = parseInt(button.dataset.boardIndex, 10);
    if (Number.isNaN(index)) return;
    const config = BUILTIN_BOARDS[index];
    if (!config) return;
    startGameWithConfig(config);
  });
});

document.querySelectorAll('input[name="boardMode"]').forEach((radio) => {
  radio.addEventListener('change', updateCustomSizeVisibility);
});
updateCustomSizeVisibility();

showMenu();

