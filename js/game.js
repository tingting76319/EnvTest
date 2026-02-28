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

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', initGame);

// 頁面關閉前儲存
window.addEventListener('beforeunload', () => {
    saveGame();
});
