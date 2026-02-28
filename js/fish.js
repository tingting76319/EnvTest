// AquaLife - 魚類資料

const FISH_DATA = {
    // 基礎魚類
    goldfish: {
        id: 'goldfish',
        name: '金魚',
        emoji: '🐠',
        price: 50,
        sellPrice: 30,
        exp: 10,
        growthTime: 60000, // 1分鐘
        lifespan: 300000, // 5分鐘
        income: 1, // 每秒金幣收入
        hungerRate: 5, // 飢餓速度
        color: '#ffd700'
    },
    guppy: {
        id: 'guppy',
        name: '孔雀魚',
        emoji: '🐟',
        price: 30,
        sellPrice: 15,
        exp: 5,
        growthTime: 30000,
        lifespan: 180000,
        income: 0.5,
        hungerRate: 8,
        color: '#ffa500'
    },
    betta: {
        id: 'betta',
        name: '鬥魚',
        emoji: '🐡',
        price: 80,
        sellPrice: 40,
        exp: 15,
        growthTime: 90000,
        lifespan: 360000,
        income: 2,
        hungerRate: 3,
        color: '#9b59b6'
    },
    koi: {
        id: 'koi',
        name: '錦鯉',
        emoji: '🎏',
        price: 200,
        sellPrice: 100,
        exp: 30,
        growthTime: 120000,
        lifespan: 600000,
        income: 5,
        hungerRate: 2,
        color: '#ff6b6b'
    },
    
    // 中級魚類
    clownfish: {
        id: 'clownfish',
        name: '小丑魚',
        emoji: '🐠',
        price: 150,
        sellPrice: 75,
        exp: 25,
        growthTime: 90000,
        lifespan: 420000,
        income: 3,
        hungerRate: 4,
        color: '#ff7f50'
    },
    angelfish: {
        id: 'angelfish',
        name: '神仙魚',
        emoji: '🐟',
        price: 180,
        sellPrice: 90,
        exp: 28,
        growthTime: 100000,
        lifespan: 480000,
        income: 4,
        hungerRate: 3,
        color: '#c0c0c0'
    },
    neon: {
        id: 'neon',
        name: '霓虹燈魚',
        emoji: '💎',
        price: 100,
        sellPrice: 50,
        exp: 18,
        growthTime: 60000,
        lifespan: 300000,
        income: 2,
        hungerRate: 6,
        color: '#00ffff'
    },
    cichlid: {
        id: 'cichlid',
        name: '慈鯛魚',
        emoji: '🐠',
        price: 250,
        sellPrice: 125,
        exp: 35,
        growthTime: 150000,
        lifespan: 600000,
        income: 6,
        hungerRate: 2,
        color: '#4169e1'
    },
    
    // 高級魚類
    arowana: {
        id: 'arowana',
        name: '龍魚',
        emoji: '🐉',
        price: 800,
        sellPrice: 400,
        exp: 80,
        growthTime: 300000,
        lifespan: 1800000,
        income: 20,
        hungerRate: 1,
        color: '#ffd700'
    },
    stingray: {
        id: 'stingray',
        name: '魟魚',
        emoji: '🟢',
        price: 1200,
        sellPrice: 600,
        exp: 100,
        growthTime: 360000,
        lifespan: 2400000,
        income: 30,
        hungerRate: 1,
        color: '#8b4513'
    },
    seahorse: {
        id: 'seahorse',
        name: '海馬',
        emoji: '🐴',
        price: 500,
        sellPrice: 250,
        exp: 50,
        growthTime: 180000,
        lifespan: 1200000,
        income: 12,
        hungerRate: 2,
        color: '#ffa07a'
    },
    lionfish: {
        id: 'lionfish',
        name: '獅子魚',
        emoji: '🦁',
        price: 1000,
        sellPrice: 500,
        exp: 90,
        growthTime: 300000,
        lifespan: 1800000,
        income: 25,
        hungerRate: 1,
        color: '#dc143c'
    }
};

// 飼料資料
const FOOD_DATA = {
    basic: {
        id: 'basic',
        name: '普通飼料',
        emoji: '🍞',
        price: 10,
        hungerRestore: 20,
        stock: Infinity
    },
    premium: {
        id: 'premium',
        name: '高級飼料',
        emoji: '🍪',
        price: 30,
        hungerRestore: 50,
        stock: Infinity
    },
    super: {
        id: 'super',
        name: '超級飼料',
        emoji: '🍖',
        price: 80,
        hungerRestore: 100,
        stock: Infinity
    }
};

// 裝飾品資料
const DECOR_DATA = {
    seaweed: {
        id: 'seaweed',
        name: '水草',
        emoji: '🌿',
        price: 50,
        happiness: 5,
        waterQuality: 3
    },
    coral: {
        id: 'coral',
        name: '珊瑚',
        emoji: '🪸',
        price: 150,
        happiness: 10,
        waterQuality: 5
    },
    treasure: {
        id: 'treasure',
        name: '寶藏',
        emoji: '🏺',
        price: 300,
        happiness: 15,
        waterQuality: 0
    },
    castle: {
        id: 'castle',
        name: '城堡',
        emoji: '🏰',
        price: 500,
        happiness: 20,
        waterQuality: 0
    },
    filter: {
        id: 'filter',
        name: '濾水器',
        emoji: '⚙️',
        price: 200,
        happiness: 0,
        waterQuality: 10,
        autoClean: true
    }
};

// 魚缸升級資料
const TANK_UPGRADES = [
    { level: 1, name: '小魚缸', price: 0, fishLimit: 3, quality: 50 },
    { level: 2, name: '中魚缸', price: 500, fishLimit: 6, quality: 70 },
    { level: 3, name: '大魚缸', price: 2000, fishLimit: 12, quality: 85 },
    { level: 4, name: '巨型魚缸', price: 8000, fishLimit: 25, quality: 95 },
    { level: 5, name: '夢幻水族箱', price: 30000, fishLimit: 50, quality: 100 }
];

// 取得所有魚類
function getAllFish() {
    return Object.values(FISH_DATA);
}

// 取得魚類資料
function getFishData(fishId) {
    return FISH_DATA[fishId];
}

// 取得魚類價格
function getFishPrice(fishId) {
    const fish = FISH_DATA[fishId];
    return fish ? fish.price : 0;
}
