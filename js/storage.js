// AquaLife - 存檔系統

const STORAGE_KEY = 'aqualife_save';

// 預設存檔資料
function getDefaultSave() {
    return {
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
        lastSave: Date.now(),
        achievements: []
    };
}

// 儲存遊戲
function saveGame() {
    const saveData = {
        coins: gameState.coins,
        pearls: gameState.pearls,
        exp: gameState.exp,
        level: gameState.level,
        fish: gameState.fish.map(f => ({
            id: f.id,
            fishId: f.fishId,
            x: f.x,
            y: f.y,
            hunger: f.hunger,
            happiness: f.happiness,
            age: f.age,
            isAdult: f.isAdult
        })),
        decorations: gameState.decorations,
        tankLevel: gameState.tankLevel,
        waterQuality: gameState.waterQuality,
        totalEarnings: gameState.totalEarnings,
        playTime: gameState.playTime + (Date.now() - gameState.startTime),
        lastSave: Date.now(),
        achievements: gameState.achievements
    };
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
        return true;
    } catch (e) {
        console.error('儲存失敗:', e);
        return false;
    }
}

// 讀取存檔
function loadGame() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) return null;
        
        const data = JSON.parse(savedData);
        
        // 驗證資料完整性
        if (!data.coins && data.coins !== 0) return null;
        
        return data;
    } catch (e) {
        console.error('讀取失敗:', e);
        return null;
    }
}

// 重置遊戲
function resetGame() {
    localStorage.removeItem(STORAGE_KEY);
    gameState = getDefaultSave();
    gameState.startTime = Date.now();
    renderAll();
    showToast('遊戲已重置！');
}

// 自動儲存
function autoSave() {
    if (saveGame()) {
        console.log('自動儲存完成');
    }
}

// 計算升級所需經驗
function getExpForLevel(level) {
    return level * 100;
}

// 檢查升級
function checkLevelUp() {
    const expNeeded = getExpForLevel(gameState.level);
    if (gameState.exp >= expNeeded) {
        gameState.exp -= expNeeded;
        gameState.level++;
        showToast(`🎉 升級到 Lv.${gameState.level}！`);
        
        // 升級獎勵
        gameState.coins += gameState.level * 50;
        showToast(`獲得獎勵 ${gameState.level * 50} 金幣！`);
        
        // 檢查是否還能升級
        checkLevelUp();
    }
}
