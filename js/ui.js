// AquaLife - UI 控制

// 顯示訊息
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// 更新UI
function updateUI() {
    // 更新資源
    document.getElementById('coins').textContent = Math.floor(gameState.coins);
    document.getElementById('pearls').textContent = gameState.pearls;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('exp').textContent = gameState.exp;
    document.getElementById('exp-needed').textContent = getExpForLevel(gameState.level);
    
    // 更新水質
    const waterQuality = Math.floor(gameState.waterQuality);
    document.getElementById('water-quality').style.width = waterQuality + '%';
    document.getElementById('water-quality-text').textContent = waterQuality + '%';
}

// 渲染所有
function renderAll() {
    renderFish();
    renderDecorations();
    updateUI();
}

// 渲染魚
function renderFish() {
    const container = document.getElementById('fish-container');
    container.innerHTML = '';
    
    gameState.fish.forEach((fish, index) => {
        const fishData = getFishData(fish.fishId);
        if (!fishData) return;
        
        const fishDiv = document.createElement('div');
        fishDiv.className = 'fish';
        fishDiv.id = fish.id;
        fishDiv.textContent = fishData.emoji;
        fishDiv.style.left = fish.x + '%';
        fishDiv.style.top = fish.y + '%';
        
        // 隨機方向
        if (Math.random() > 0.5) {
            fishDiv.classList.add('swim-left');
        }
        
        // 點擊顯示資訊
        fishDiv.addEventListener('click', () => {
            showFishInfo(fish, fishData);
        });
        
        container.appendChild(fishDiv);
    });
}

// 渲染裝飾
function renderDecorations() {
    const container = document.getElementById('decorations');
    
    // 移除舊的自定義裝飾
    container.querySelectorAll('.custom-decor').forEach(el => el.remove());
    
    // 添加購買的裝飾
    gameState.decorations.forEach((decor, index) => {
        const decorDiv = document.createElement('div');
        decorDiv.className = 'decoration custom-decor';
        decorDiv.textContent = decor.emoji;
        decorDiv.style.left = (15 + index * 20) + '%';
        decorDiv.style.bottom = '30px';
        decorDiv.style.fontSize = '2rem';
        container.appendChild(decorDiv);
    });
}

// 顯示魚的資訊
function showFishInfo(fish, fishData) {
    const info = `
${fishData.name}
飢餓度: ${Math.floor(fish.hunger)}%
幸福度: ${Math.floor(fish.happiness)}%
年齡: ${Math.floor(fish.age / 1000)}秒
    `.trim();
    showToast(info, 3000);
}

// 更新存檔槽顯示
function updateSlotDisplay() {
    for (let i = 1; i <= 3; i++) {
        const info = getSlotInfo(i);
        const infoEl = document.getElementById(`slot-${i}-info`);
        if (info) {
            infoEl.textContent = `Lv.${info.level} ${info.coins}💰 ${info.date}`;
        } else {
            infoEl.textContent = '空';
        }
    }
}

// 初始化事件監聽
function initUI() {
    // 商店按鈕
    document.getElementById('shop-btn').addEventListener('click', () => {
        document.getElementById('shop-modal').classList.add('show');
        renderShopItems();
    });
    
    // 關閉商店
    document.getElementById('close-shop').addEventListener('click', () => {
        document.getElementById('shop-modal').classList.remove('show');
    });
    
    // 設定按鈕
    document.getElementById('settings-btn').addEventListener('click', () => {
        document.getElementById('settings-modal').classList.add('show');
        updateSlotDisplay();
    });
    
    // 關閉設定
    document.getElementById('close-settings').addEventListener('click', () => {
        document.getElementById('settings-modal').classList.remove('show');
    });
    
    // 儲存遊戲
    document.getElementById('save-game').addEventListener('click', () => {
        if (saveGame()) {
            showToast('遊戲已儲存！');
        } else {
            showToast('儲存失敗！');
        }
    });
    
    // 讀取存檔
    document.getElementById('load-game').addEventListener('click', () => {
        const data = loadGame();
        if (data) {
            loadGameState(data);
            showToast('遊戲已讀取！');
        } else
            showToast('沒有找到存檔！');
    });
    
    // 重置遊戲
    document.getElementById('reset-game').addEventListener('click', () => {
        if (confirm('確定要重置遊戲嗎？所有進度將會失去！')) {
            resetGame();
            document.getElementById('settings-modal').classList.remove('show');
        }
    });
    
    // 餵食按鈕
    document.getElementById('feed-btn').addEventListener('click', () => {
        feedFish();
    });
    
    // 換水按鈕
    document.getElementById('clean-btn').addEventListener('click', () => {
        changeWater();
    });
    
    // 清理按鈕
    document.getElementById('clear-btn').addEventListener('click', () => {
        cleanTank();
    });
    
    // 撈魚按鈕
    document.getElementById('sell-btn').addEventListener('click', () => {
        sellFish();
    });
    
    // 點擊背景關閉modal
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
    
    // 存檔槽按鈕事件
    document.querySelectorAll('.slot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const slotNum = parseInt(btn.dataset.slot);
            const slotInfo = getSlotInfo(slotNum);
            
            if (slotInfo) {
                const data = loadGameFromSlot(slotNum);
                if (data) {
                    loadGameState(data);
                    showToast(`已從存檔 ${slotNum} 載入！`);
                }
            } else {
                if (saveGameToSlot(slotNum)) {
                    showToast(`已儲存到存檔槽 ${slotNum}！`);
                } else {
                    showToast('儲存失敗！');
                }
            }
        });
    });
}

// 餵食
function feedFish() {
    if (gameState.fish.length === 0) {
        showToast('沒有魚可以餵！');
        return;
    }
    
    gameState.fish.forEach(fish => {
        fish.hunger = Math.min(100, fish.hunger + 30);
        fish.happiness = Math.min(100, fish.happiness + 10);
    });
    
    updateUI();
    renderFish();
    showToast('🦈 餵食完成！');
}

// 換水
function changeWater() {
    gameState.waterQuality = Math.min(100, gameState.waterQuality + 20);
    gameState.fish.forEach(fish => {
        fish.happiness = Math.min(100, fish.happiness + 5);
    });
    
    updateUI();
    showToast('💧 換水完成！');
}

// 清理魚缸
function cleanTank() {
    gameState.waterQuality = Math.min(100, gameState.waterQuality + 15);
    
    updateUI();
    showToast('🧹 清理完成！');
}

// 撈魚（賣魚）
function sellFish() {
    if (gameState.fish.length === 0) {
        showToast('沒有魚可以賣！');
        return;
    }
    
    // 隨機賣一條魚
    const fishIndex = Math.floor(Math.random() * gameState.fish.length);
    const fish = gameState.fish[fishIndex];
    const fishData = getFishData(fish.fishId);
    
    gameState.coins += fishData.sellPrice;
    gameState.fish.splice(fishIndex, 1);
    
    renderFish();
    updateUI();
    showToast(`💰 賣了 ${fishData.name}，獲得 ${fishData.sellPrice} 金幣！`);
}

// 讀取存檔資料到遊戲狀態
function loadGameState(data) {
    gameState.coins = data.coins;
    gameState.pearls = data.pearls;
    gameState.exp = data.exp;
    gameState.level = data.level;
    gameState.fish = data.fish || [];
    gameState.decorations = data.decorations || [];
    gameState.tankLevel = data.tankLevel || 1;
    gameState.waterQuality = data.waterQuality || 80;
    gameState.totalEarnings = data.totalEarnings || 0;
    gameState.playTime = data.playTime || 0;
    gameState.startTime = Date.now();
    gameState.achievements = data.achievements || [];
    
    renderAll();
}
