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
    Object.assign(gameState, getDefaultSave());
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

// 儲存到指定槽位
function saveGameToSlot(slotNum) {
    const slotKey = `${STORAGE_KEY}_slot${slotNum}`;
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
        localStorage.setItem(slotKey, JSON.stringify(saveData));
        return true;
    } catch (e) {
        console.error('儲存失敗:', e);
        return false;
    }
}

// 從指定槽位讀取
function loadGameFromSlot(slotNum) {
    const slotKey = `${STORAGE_KEY}_slot${slotNum}`;
    try {
        const savedData = localStorage.getItem(slotKey);
        if (!savedData) return null;
        
        const data = JSON.parse(savedData);
        if (!data.coins && data.coins !== 0) return null;
        
        return data;
    } catch (e) {
        console.error('讀取失敗:', e);
        return null;
    }
}

// 取得槽位資訊
function getSlotInfo(slotNum) {
    const slotKey = `${STORAGE_KEY}_slot${slotNum}`;
    try {
        const savedData = localStorage.getItem(slotKey);
        if (!savedData) return null;
        
        const data = JSON.parse(savedData);
        const date = new Date(data.lastSave);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        return {
            level: data.level,
            coins: data.coins,
            date: dateStr
        };
    } catch (e) {
        return null;
    }
}

// 檢查槽位是否有存檔
function hasSlotData(slotNum) {
    const slotKey = `${STORAGE_KEY}_slot${slotNum}`;
    return localStorage.getItem(slotKey) !== null;
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
