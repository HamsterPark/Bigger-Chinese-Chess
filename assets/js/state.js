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
let aiThinking = false;
let aiTimeoutId = null;
let aiToken = 0;

let editorBoard = [];
let editorMeta = null;
let editorWidth = BASE_WIDTH;
let editorHeight = BASE_HEIGHT;
let editorRiverLine = Math.floor(BASE_HEIGHT / 2) - 1;
let editorPalaceBlack = { left: 3, top: 0, width: 3, height: 3 };
let editorPalaceRed = { left: 3, top: 7, width: 3, height: 3 };
let editorInitialized = false;
let editorDragPayload = null;
let moveHistory = [];

