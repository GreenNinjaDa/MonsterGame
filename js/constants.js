// Camera/View Constants
const GAME_CONFIG = {
    // View and Camera
    baseViewSize: 500,  // Base size for camera view and calculations
    
    // World Size
    worldSpawnDiameter: 3000,  // Total diameter of monster spawn area
    minSpawnDistance: 500,     // Minimum spawn distance from origin/player
    
    // Game Balance
    hpRegenRate: 0.02,         // HP regeneration rate (2% per second)
    innerZoneRatio: 0.4,       // Ratio of map that maintains minimum level (40%)
    outerZoneRatio: 0.6,       // Ratio of map for level scaling (60%)
    
    // Existing properties...
    playerSpeed: 200, // Units per second
    monsterFollowDistance: {
        slot1: 25,
        slot2: 50
    },
    aggroRange: 300,
    attackRange: 50,
    attackRangeSlot1: 25, // Half the normal attack range for slot 1 monsters
    respawnTime: 50, // Time for player owned monsters to respawn after being defeated
    catchTimeout: 20, // 20 seconds during with the player can capture a monster
    monsterDensity: 1, // Monsters per 500x500 area (reduced from 2)
    spawnAreaSize: 500, // Size of each spawn region
    maxMonsterWanderDistance: 1000, // Maximum distance a monster can wander from spawn
    playerGracePeriod: 5, // 5 seconds grace period after being sent back to start
    rareModifierRate: 5, // Rate of rare modifiers in percentage, for each monster
    statGainRatePerLevel: 0.10 // % stat gain per level
};

// Area Configuration
const AREAS = {
    1: {
        name: "Starting Plains",
        backgroundColor: 0x87CEEB, // Light blue sky color
        description: "A peaceful starting area with gentle monsters"
    },
    2: {
        name: "Forest of Growth",
        backgroundColor: 0x228B22, // Forest green
        description: "A dense forest teeming with stronger monsters"
    },
    3: {
        name: "Volcanic Wasteland",
        backgroundColor: 0x8B0000, // Dark red
        description: "A scorched land where only the strongest survive"
    },
    4: {
        name: "Crystal Caverns",
        backgroundColor: 0x483D8B, // Dark slate blue
        description: "Ancient caves filled with crystalline formations"
    },
    5: {
        name: "Dragon's Domain",
        backgroundColor: 0x4B0082, // Indigo
        description: "The legendary realm of the most powerful monsters"
    }
};

// Monster Types
const MONSTER_TYPES = {
    // # - Name - Element - Speed, Phys Def, Phys Atk, Spec Def, Spec Atk, Endurance
    1: { name: "Useless Fish", element: "Water", stats: { speed: 30, physDef: 60, physAtk: 70, specDef: 80, specAtk: 10, endur: 50 }, color: 0x3498db },
    2: { name: "Emberling", element: "Fire", stats: { speed: 70, physDef: 40, physAtk: 50, specDef: 60, specAtk: 60, endur: 20 }, color: 0xe74c3c },
    3: { name: "DownTwo", element: "Earth", stats: { speed: 30, physDef: 65, physAtk: 55, specDef: 65, specAtk: 55, endur: 30 }, color: 0x964b00 },
    4: { name: "Potsy", element: "Plant", stats: { speed: 30, physDef: 60, physAtk: 60, specDef: 60, specAtk: 60, endur: 30 }, color: 0x2ecc71 },
    5: { name: "Shockles", element: "Electric", stats: { speed: 60, physDef: 30, physAtk: 50, specDef: 40, specAtk: 60, endur: 60 }, color: 0xf1c40f },
    6: { name: "Zappy Bird", element: "Electric", stats: { speed: 70, physDef: 40, physAtk: 30, specDef: 40, specAtk: 80, endur: 40 }, color: 0xf1c40f }
};

// Element Relationships (bonus/penalty)
const ELEMENT_RELATIONS = {
    "Plant": { strong: "Earth", weak: "Fire" },
    "Earth": { strong: "Electric", weak: "Plant" },
    "Electric": { strong: "Water", weak: "Earth" },
    "Water": { strong: "Fire", weak: "Electric" },
    "Fire": { strong: "Plant", weak: "Water" }
};

// Visual colors for elements (for effects)
const ELEMENT_COLORS = {
    "Plant": 0x2ecc71, // Green
    "Earth": 0x964b00, // Brown
    "Electric": 0xf1c40f, // Yellow
    "Water": 0x3498db, // Blue
    "Fire": 0xe74c3c // Red
};

// Rare Modifiers and their bonuses in per
const RARE_MODIFIERS = {
    "Smooth": { speed: 10, physDef: 10 },
    "Sharp": { speed: 10, physAtk: 10 },
    "Witty": { speed: 10, specDef: 10 },
    "Shocking": { speed: 10, specAtk: 10 },
    "Athletic": { speed: 10, endur: 10 },
    "Strong": { physDef: 10, physAtk: 10 },
    "Sturdy": { physDef: 10, specDef: 10 },
    "Slick": { physDef: 10, specAtk: 10 },
    "Tough": { physDef: 10, endur: 10 },
    "Decisive": { physAtk: 10, specDef: 10 },
    "Aggressive": { physAtk: 10, specAtk: 10 },
    "Determined": { physAtk: 10, endur: 10 },
    "Smart": { specDef: 10, specAtk: 10 },
    "Stoic": { specDef: 10, endur: 10 },
    "Thoughtful": { specAtk: 10, endur: 10 }
};

// Element Stat Modifiers in percentages
const ELEMENT_MODIFIERS = {
    "Plant": { specAtk: 10, endur: 10, speed: -15 },
    "Earth": { physAtk: 10, physDef: 10, specAtk: -15 },
    "Electric": { specAtk: 10, speed: 10, endur: -15 },
    "Water": { endur: 10, speed: 10, physDef: -15 },
    "Fire": { physAtk: 10, specAtk: 10, specDef: -15 }
};

// Initial Game State
const gameState = {
    player: {
        position: new THREE.Vector3(0, 0, 0),
        gold: 100,
        monsters: [], // Active monsters
        storedMonsters: [], // Storage for additional monsters
        gracePeriodTimer: 0 // Timer for grace period after teleportation
    },
    wildMonsters: [],
    activeCombats: [],
    captureTargets: [],
    scene: null,
    camera: null,
    renderer: null,
    clickTargetPosition: null,
    lastTime: 0,
    nextAreaPosition: new THREE.Vector3(4500, 4500, 0),
    storageUIOpen: false,
    directionArrow: null,
    currentArea: 1 // Starting area
}; 
