// AquaLife - 遊戲主邏輯

// 遊戲狀態
let gameState = {
    coins: 500,
    pearls: 10,
    exp: 0,
    level: 1,
    fish: [],
    decorations: [],
    tankLevel: 1,
    waterQuality: 80,
    totalEarnings: 0,
    playTime: 0,
    startTime: Date.now(),
    achievements: []
};

// 遊戲循環定時器
let gameLoopInterval = null;
let incomeInterval = null;
let autoSaveInterval = null;

// 初始化遊戲
function initGame() {
    // 嘗試讀取存檔
    const savedData = loadGame();
    if (savedData) {
        loadGameState(savedData);
    }
    
    // 初始化UI
    initUI();
    initShop();
    
    // 渲染遊戲
    renderAll();
    
    // 啟動遊戲循環
    startGameLoop();
    
    showToast('🐠 AquaLife 歡迎您！');
}

// 啟動遊戲循環
function startGameLoop() {
    // 每秒更新遊戲狀態
    gameLoopInterval = setInterval(updateGame, 1000);
    
    // 每3秒產生收入
    incomeInterval = setInterval(generateIncome, 3000);
    
    // 每30秒自動儲存
    autoSaveInterval = setInterval(autoSave, 30000);
}

// 更新遊戲狀態
function updateGame() {
    let hasChanges = false;
    
    gameState.fish.forEach((fish, index) => {
        const fishData = getFishData(fish.fishId);
        if (!fishData) return;
        
        // 年齡增加
        fish.age += 1000;
        
        // 飢餓度下降
        fish.hunger = Math.max(0, fish.hunger - fishData.hungerRate * 0.5);
        
        // 幸福度下降（根據水質和飢餓度）
        let happinessDrop = 1;
        if (fish.hunger < 30) happinessDrop += 2;
        if (gameState.waterQuality < 50) happinessDrop += 2;
        fish.happiness = Math.max(0, fish.happiness - happinessDrop);
        
        // 檢查是否死亡
        if (fish.hunger <= 0 || fish.happiness <= 0 || fish.age >= fishData.lifespan) {
            // 魚死亡
            const fishDiv = document.getElementById(fish.id);
            if (fishDiv) {
                fishDiv.classList.add('dying');
                setTimeout(() => {
                    gameState.fish.splice(index, 1);
                    renderFish();
                    showToast(`${fishData.name} 去世了...`);
                }, 2000);
            }
            hasChanges = true;
        }
        
        // 檢查成長
        if (!fish.isAdult && fish.age >= fishData.growthTime) {
            fish.isAdult = true;
            gameState.exp += fishData.exp;
            checkLevelUp();
            showToast(`${fishData.name} 長大了！`);
            hasChanges = true;
        }
        
        // 魚的移動
        if (Math.random() > 0.7) {
            fish.x = Math.max(5, Math.min(90, fish.x + (Math.random() - 0.5) * 10));
            fish.y = Math.max(10, Math.min(80, fish.y + (Math.random() - 0.5) * 10));
            hasChanges = true;
        }
    });
    
    // 水質自然下降
    gameState.waterQuality = Math.max(0, gameState.waterQuality - 0.5);
    
    // 裝飾品效果
    gameState.decorations.forEach(decor => {
        if (decor.waterQuality) {
            gameState.waterQuality = Math.min(100, gameState.waterQuality + decor.waterQuality * 0.01);
        }
        if (decor.happiness) {
            gameState.fish.forEach(fish => {
                fish.happiness = Math.min(100, fish.happiness + decor.happiness * 0.01);
            });
        }
    });
    
    // 更新UI
    updateUI();
    
    // 重新渲染魚（位置移動）
    if (hasChanges) {
        renderFish();
    }
}

// 產生收入
function generateIncome() {
    let totalIncome = 0;
    
    gameState.fish.forEach(fish => {
        const fishData = getFishData(fish.fishId);
        if (!fishData || !fish.isAdult) return;
        
        // 收入基於幸福度和飢餓度
        const happinessMultiplier = fish.happiness / 100;
        const hungerMultiplier = fish.hunger / 100;
        
        totalIncome += fishData.income * happinessMultiplier * hungerMultiplier * 0.3;
    });
    
    if (totalIncome > 0) {
        gameState.coins += totalIncome;
        gameState.totalEarnings += totalIncome;
        updateUI();
    }
}

// 停止遊戲循環
function stopGameLoop() {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    if (incomeInterval) clearInterval(incomeInterval);
    if (autoSaveInterval) clearInterval(autoSaveInterval);
}

// 成就定義
const ACHIEVEMENTS = {
    tenFish: {
        id: 'tenFish',
        name: '魚滿為患',
        description: '擁有10條魚',
        icon: '🐠',
        check: () => gameState.fish.length >= 10
    },
    thousandCoins: {
        id: 'thousandCoins',
        name: '小有積蓄',
        description: '累積賺取1000金幣',
        icon: '💰',
        check: () => gameState.totalEarnings >= 1000
    },
    allBasicFish: {
        id: 'allBasicFish',
        name: '魚類收藏家',
        description: '購買所有基礎魚種',
        icon: '🎏',
        check: () => {
            const basicFish = ['goldfish', 'guppy', 'betta', 'koi'];
            const ownedFish = gameState.fish.map(f => f.fishId);
            return basicFish.every(fish => ownedFish.includes(fish));
        }
    },
    level5: {
        id: 'level5',
        name: '水產養殖專家',
        description: '達到5級',
        icon: '⭐',
        check: () => gameState.level >= 5
    },
    tenKCoins: {
        id: 'tenKCoins',
        name: '百萬富翁',
        description: '累積賺取10000金幣',
        icon: '💎',
        check: () => gameState.totalEarnings >= 10000
    },
    fullDecor: {
        id: 'fullDecor',
        name: '美化大師',
        description: '購買所有裝飾品',
        icon: '🏰',
        check: () => {
            const decorIds = Object.keys(DECOR_DATA);
            const ownedDecors = gameState.decorations.map(d => d.id);
            return decorIds.every(id => ownedDecors.includes(id));
        }
    },
    maxTank: {
        id: 'maxTank',
        name: '夢幻水族箱',
        description: '升級到最高級魚缸',
        icon: '🏠',
        check: () => gameState.tankLevel >= 5
    }
};

// 檢查成就
function checkAchievements() {
    Object.values(ACHIEVEMENTS).forEach(achievement => {
        if (!gameState.achievements.includes(achievement.id) && achievement.check()) {
            gameState.achievements.push(achievement.id);
            showToast(`🏆 解鎖成就：${achievement.name}！`);
            renderAchievements();
        }
    });
}

// 渲染成就列表
function renderAchievements() {
    const container = document.getElementById('achievements-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.values(ACHIEVEMENTS).forEach(achievement => {
        const isUnlocked = gameState.achievements.includes(achievement.id);
        const achievementDiv = document.createElement('div');
        achievementDiv.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
        achievementDiv.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
            <div class="achievement-status">${isUnlocked ? '✅' : '🔒'}</div>
        `;
        container.appendChild(achievementDiv);
    });
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    renderAchievements();
});

// 頁面關閉前儲存
window.addEventListener('beforeunload', () => {
    saveGame();
});
