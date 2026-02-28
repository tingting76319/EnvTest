// Solitaire - 接龍遊戲

const SUITS = ['♠', '♥', '♣', '♦'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

let deck = [];
let piles = [[], [], [], [], [], [], []];
let foundations = [[], [], [], []];
let waste = [];
let stock = [];

let timer = 0;
let timerInterval = null;
let moves = 0;
let score = 0;
let history = [];

// 初始化遊戲
function initGame() {
    newGame();
}

// 新遊戲
function newGame() {
    // 重置變數
    deck = [];
    piles = [[], [], [], [], [], [], []];
    foundations = [[], [], [], []];
    waste = [];
    history = [];
    moves = 0;
    score = 0;
    timer = 0;
    
    // 停止計時
    if (timerInterval) clearInterval(timerInterval);
    
    // 創建牌組
    createDeck();
    shuffleDeck();
    dealCards();
    
    // 開始計時
    timerInterval = setInterval(() => {
        timer++;
        updateTimer();
    }, 1000);
    
    // 渲染
    renderGame();
    updateStats();
    
    // 隱藏勝利Modal
    document.getElementById('win-modal').classList.remove('show');
}

// 創建牌組
function createDeck() {
    deck = [];
    SUITS.forEach((suit, suitIndex) => {
        RANKS.forEach((rank, rankIndex) => {
            deck.push({
                suit: suit,
                rank: rank,
                value: rankIndex + 1,
                color: (suit === '♥' || suit === '♦') ? 'red' : 'black',
                faceUp: false
            });
        });
    });
}

// 洗牌
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// 發牌
function dealCards() {
    // 發到7個牌疊
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j <= i; j++) {
            let card = deck.pop();
            if (j === i) card.faceUp = true;
            piles[i].push(card);
        }
    }
    
    // 剩餘的放到牌堆
    stock = deck;
}

// 翻牌
function drawCards() {
    if (stock.length === 0) {
        // 回收廢牌
        stock = waste.reverse().map(card => ({ ...card, faceUp: false }));
        waste = [];
    } else {
        // 翻3張牌
        for (let i = 0; i < 3 && stock.length > 0; i++) {
            let card = stock.pop();
            card.faceUp = true;
            waste.push(card);
        }
    }
    
    moves++;
    saveHistory();
    renderGame();
    updateStats();
}

// 渲染遊戲
function renderGame() {
    renderStock();
    renderWaste();
    renderPiles();
    renderFoundations();
}

// 渲染牌堆
function renderStock() {
    const stockEl = document.getElementById('stock');
    stockEl.innerHTML = stock.length > 0 
        ? '<div class="card back"></div>' 
        : '<span style="font-size:2rem;opacity:0.5">↻</span>';
}

// 渲染廢牌區
function renderWaste() {
    const wasteEl = document.getElementById('waste');
    wasteEl.innerHTML = '';
    
    if (waste.length > 0) {
        const card = waste[waste.length - 1];
        const cardEl = createCardElement(card);
        cardEl.draggable = true;
        cardEl.addEventListener('dragstart', (e) => handleDragStart(e, 'waste', waste.length - 1));
        wasteEl.appendChild(cardEl);
    }
}

// 渲染牌疊
function renderPiles() {
    for (let i = 0; i < 7; i++) {
        const pileEl = document.getElementById(`pile-${i}`);
        pileEl.innerHTML = '';
        
        piles[i].forEach((card, index) => {
            const cardEl = createCardElement(card);
            cardEl.style.top = (index * 25) + 'px';
            
            if (card.faceUp) {
                cardEl.draggable = true;
                cardEl.addEventListener('dragstart', (e) => handleDragStart(e, `pile-${i}`, index));
            }
            
            pileEl.appendChild(cardEl);
        });
        
        // 放置區
        pileEl.addEventListener('dragover', (e) => e.preventDefault());
        pileEl.addEventListener('drop', (e) => handleDrop(e, `pile-${i}`));
    }
}

// 渲染收牌區
function renderFoundations() {
    for (let i = 0; i < 4; i++) {
        const foundationEl = document.getElementById(`foundation-${i}`);
        const suit = SUITS[i];
        foundationEl.textContent = suit;
        foundationEl.dataset.suit = suit;
        
        if (foundations[i].length > 0) {
            const card = foundations[i][foundations[i].length - 1];
            const cardEl = createCardElement(card);
            foundationEl.appendChild(cardEl);
        }
        
        foundationEl.addEventListener('dragover', (e) => e.preventDefault());
        foundationEl.addEventListener('drop', (e) => handleFoundationDrop(e, i));
    }
}

// 創建紙牌元素
function createCardElement(card) {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${card.color}`;
    
    if (!card.faceUp) {
        cardEl.classList.add('back');
        return cardEl;
    }
    
    cardEl.innerHTML = `
        <span class="card-top">${card.rank}${card.suit}</span>
        <span class="card-center">${card.suit}</span>
        <span class="card-bottom">${card.rank}${card.suit}</span>
    `;
    
    return cardEl;
}

// 拖放處理
let dragData = null;

function handleDragStart(e, source, index) {
    dragData = { source, index };
    e.target.classList.add('dragging');
}

function handleDrop(e, pileIndex) {
    e.preventDefault();
    
    if (!dragData) return;
    
    const pileNum = parseInt(pileIndex.split('-')[1]);
    let sourcePile, sourceCards;
    
    // 取得來源牌
    if (dragData.source === 'waste') {
        sourceCards = [waste[waste.length - 1]];
    } else {
        const sourcePileNum = parseInt(dragData.source.split('-')[1]);
        sourcePile = piles[sourcePileNum];
        sourceCards = sourcePile.slice(dragData.index);
    }
    
    const targetCard = piles[pileNum].length > 0 
        ? piles[pileNum][piles[pileNum].length - 1] 
        : null;
    
    // 檢查是否可放置
    if (canPlaceOnPile(sourceCards[0], targetCard)) {
        // 移動牌
        if (dragData.source === 'waste') {
            waste.pop();
        } else {
            const sourcePileNum = parseInt(dragData.source.split('-')[1]);
            piles[sourcePileNum].splice(dragData.index);
            
            // 翻開下一張
            if (piles[sourcePileNum].length > 0) {
                piles[sourcePileNum][piles[sourcePileNum].length - 1].faceUp = true;
            }
        }
        
        piles[pileNum].push(...sourceCards);
        moves++;
        score += 5;
        saveHistory();
        
        renderGame();
        updateStats();
        checkWin();
    }
    
    dragData = null;
}

function handleFoundationDrop(e, foundationIndex) {
    e.preventDefault();
    
    if (!dragData) return;
    
    let card;
    
    if (dragData.source === 'waste') {
        card = waste[waste.length - 1];
    } else {
        const sourcePileNum = parseInt(dragData.source.split('-')[1]);
        card = piles[sourcePileNum][piles[sourcePileNum].length - 1];
    }
    
    // 檢查是否可收牌
    const suit = SUITS[foundationIndex];
    if (card.suit === suit) {
        if (foundations[foundationIndex].length === 0) {
            if (card.value === 1) {
                placeOnFoundation(card, foundationIndex);
            }
        } else {
            const topCard = foundations[foundationIndex][foundations[foundationIndex].length - 1];
            if (card.value === topCard.value + 1) {
                placeOnFoundation(card, foundationIndex);
            }
        }
    }
    
    dragData = null;
}

function placeOnFoundation(card, foundationIndex) {
    if (dragData.source === 'waste') {
        waste.pop();
    } else {
        const sourcePileNum = parseInt(dragData.source.split('-')[1]);
        piles[sourcePileNum].pop();
        
        if (piles[sourcePileNum].length > 0) {
            piles[sourcePileNum][piles[sourcePileNum].length - 1].faceUp = true;
        }
    }
    
    foundations[foundationIndex].push(card);
    moves++;
    score += 10;
    saveHistory();
    
    renderGame();
    updateStats();
    checkWin();
}

// 檢查是否可放置
function canPlaceOnPile(card, targetCard) {
    if (!targetCard) return card.value === 13; // King on empty
    
    return card.color !== targetCard.color && card.value === targetCard.value - 1;
}

// 悔棋
function undo() {
    if (history.length === 0) return;
    
    const state = history.pop();
    piles = state.piles;
    waste = state.waste;
    foundations = state.foundations;
    stock = state.stock;
    moves = state.moves;
    score = Math.max(0, score - 10);
    
    renderGame();
    updateStats();
}

// 儲存歷史
function saveHistory() {
    history.push({
        piles: JSON.parse(JSON.stringify(piles)),
        waste: JSON.parse(JSON.stringify(waste)),
        foundations: JSON.parse(JSON.stringify(foundations)),
        stock: JSON.parse(JSON.stringify(stock)),
        moves: moves
    });
    
    if (history.length > 20) history.shift();
}

// 更新計時器
function updateTimer() {
    const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
    const seconds = (timer % 60).toString().padStart(2, '0');
    document.getElementById('timer').textContent = `${minutes}:${seconds}`;
}

// 更新統計
function updateStats() {
    document.getElementById('moves').textContent = moves;
    document.getElementById('score').textContent = score;
}

// 勝利檢查
function checkWin() {
    const total = foundations.reduce((sum, f) => sum + f.length, 0);
    
    if (total === 52) {
        clearInterval(timerInterval);
        
        document.getElementById('final-time').textContent = document.getElementById('timer').textContent;
        document.getElementById('final-moves').textContent = moves;
        document.getElementById('final-score').textContent = score;
        
        document.getElementById('win-modal').classList.add('show');
    }
}

// 頁面載入
document.addEventListener('DOMContentLoaded', initGame);
