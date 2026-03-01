// AquaLife - 商店系統

let currentShopTab = 'fish';
let selectedFishId = null;

// 初始化商店
function initShop() {
    // Tab 切換
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentShopTab = btn.dataset.tab;
            renderShopItems();
        });
    });
    
    renderShopItems();
}

// 渲染商店商品
function renderShopItems() {
    const container = document.getElementById('shop-items');
    container.innerHTML = '';
    
    let items = [];
    
    switch (currentShopTab) {
        case 'fish':
            items = getAllFish();
            break;
        case 'food':
            items = Object.values(FOOD_DATA);
            break;
        case 'decor':
            items = Object.values(DECOR_DATA);
            break;
        case 'tank':
            items = TANK_UPGRADES.filter(u => u.level > gameState.tankLevel);
            break;
    }
    
    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shop-item';
        
        if (currentShopTab === 'fish') {
            const canAfford = gameState.coins >= item.price;
            const fishLimit = TANK_UPGRADES[gameState.tankLevel - 1].fishLimit;
            const currentFish = gameState.fish.length;
            const atLimit = currentFish >= fishLimit;
            
            itemDiv.innerHTML = `
                <div class="icon">${item.emoji}</div>
                <div class="name">${item.name}</div>
                <div class="price">💰 ${item.price}</div>
                <div class="info">收入: ${item.income}/秒 | 經驗: ${item.exp}</div>
                <button class="buy-btn" ${!canAfford || atLimit ? 'disabled' : ''} 
                    onclick="buyFish('${item.id}')">
                    ${atLimit ? '魚缸已滿' : (canAfford ? '購買' : '金幣不足')}
                </button>
            `;
        } else if (currentShopTab === 'food') {
            const canAfford = gameState.coins >= item.price;
            
            itemDiv.innerHTML = `
                <div class="icon">${item.emoji}</div>
                <div class="name">${item.name}</div>
                <div class="price">💰 ${item.price}</div>
                <div class="info">飢餓恢復: ${item.hungerRestore}%</div>
                <button class="buy-btn" ${!canAfford ? 'disabled' : ''} 
                    onclick="buyFood('${item.id}')">
                    ${canAfford ? '購買' : '金幣不足'}
                </button>
            `;
        } else if (currentShopTab === 'decor') {
            const canAfford = gameState.coins >= item.price;
            const owned = gameState.decorations.some(d => d.id === item.id);
            
            itemDiv.innerHTML = `
                <div class="icon">${item.emoji}</div>
                <div class="name">${item.name}</div>
                <div class="price">💰 ${item.price}</div>
                <div class="info">幸福+${item.happiness} | 水質+${item.waterQuality}</div>
                <button class="buy-btn" ${!canAfford || owned ? 'disabled' : ''} 
                    onclick="buyDecor('${item.id}')">
                    ${owned ? '已擁有' : (canAfford ? '購買' : '金幣不足')}
                </button>
            `;
        } else if (currentShopTab === 'tank') {
            const canAfford = gameState.coins >= item.price;
            const isNextLevel = item.level === gameState.tankLevel + 1;
            
            itemDiv.innerHTML = `
                <div class="icon">🏠</div>
                <div class="name">${item.name}</div>
                <div class="price">💰 ${item.price}</div>
                <div class="info">魚數上限: ${item.fishLimit} | 水質基礎: ${item.quality}%</div>
                <button class="buy-btn" ${!canAfford || !isNextLevel ? 'disabled' : ''} 
                    onclick="buyTankUpgrade(${item.level})">
                    ${isNextLevel ? (canAfford ? '升級' : '金幣不足') : '需先升級'}
                </button>
            `;
        }
        
        container.appendChild(itemDiv);
    });
    
    // 顯示當前魚缸資訊
    if (currentShopTab === 'tank') {
        const currentTank = TANK_UPGRADES[gameState.tankLevel - 1];
        const infoDiv = document.createElement('div');
        infoDiv.className = 'shop-info';
        infoDiv.innerHTML = `
            <div class="current-tank">
                <h3>當前魚缸: ${currentTank.name}</h3>
                <p>魚數上限: ${currentTank.fishLimit}</p>
                <p>水質基礎: ${currentTank.quality}%</p>
                <p>目前魚數: ${gameState.fish.length}</p>
            </div>
        `;
        container.appendChild(infoDiv);
    }
}

// 購買魚
function buyFish(fishId) {
    const fishData = getFishData(fishId);
    if (!fishData) return;
    
    const fishLimit = TANK_UPGRADES[gameState.tankLevel - 1].fishLimit;
    
    if (gameState.fish.length >= fishLimit) {
        showToast('魚缸已滿！請升級魚缸');
        return;
    }
    
    if (gameState.coins < fishData.price) {
        showToast('金幣不足！');
        return;
    }
    
    // 扣款
    gameState.coins -= fishData.price;
    
    // 添加魚
    const newFish = {
        id: generateId(),
        fishId: fishId,
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 20,
        hunger: 100,
        happiness: 100,
        age: 0,
        isAdult: false,
        birthTime: Date.now()
    };
    
    gameState.fish.push(newFish);
    
    // 增加經驗
    gameState.exp += fishData.exp;
    checkLevelUp();
    
    // 重新渲染
    renderFish();
    updateUI();
    renderShopItems();
    showToast(`购买了 ${fishData.name}！`);
    
    checkAchievements();
}

// 購買飼料
function buyFood(foodId) {
    const foodData = FOOD_DATA[foodId];
    if (!foodData) return;
    
    if (gameState.coins < foodData.price) {
        showToast('金幣不足！');
        return;
    }
    
    gameState.coins -= foodData.price;
    
    // 直接餵食所有魚
    gameState.fish.forEach(fish => {
        fish.hunger = Math.min(100, fish.hunger + foodData.hungerRestore);
    });
    
    updateUI();
    renderShopItems();
    showToast(`使用了 ${foodData.name}！`);
}

// 購買裝飾
function buyDecor(decorId) {
    const decorData = DECOR_DATA[decorId];
    if (!decorData) return;
    
    if (gameState.decorations.some(d => d.id === decorId)) {
        showToast('已經擁有這個裝飾！');
        return;
    }
    
    if (gameState.coins < decorData.price) {
        showToast('金幣不足！');
        return;
    }
    
    gameState.coins -= decorData.price;
    gameState.decorations.push(decorData);
    
    // 更新水質和幸福度
    gameState.waterQuality = Math.min(100, gameState.waterQuality + decorData.waterQuality);
    
    // 重新渲染裝飾
    renderDecorations();
    updateUI();
    renderShopItems();
    showToast(`購買了 ${decorData.name}！`);
    
    checkAchievements();
}

// 購買魚缸升級
function buyTankUpgrade(level) {
    const upgradeData = TANK_UPGRADES[level - 1];
    if (!upgradeData) return;
    
    if (gameState.tankLevel >= level) {
        showToast('無法降級魚缸！');
        return;
    }
    
    if (gameState.coins < upgradeData.price) {
        showToast('金幣不足！');
        return;
    }
    
    gameState.coins -= upgradeData.price;
    gameState.tankLevel = level;
    
    // 提升水質
    gameState.waterQuality = Math.min(100, gameState.waterQuality + 10);
    
    updateUI();
    renderShopItems();
    showToast(`魚缸升級為 ${upgradeData.name}！`);
    
    checkAchievements();
}

// 生成唯一ID
function generateId() {
    return 'fish_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
