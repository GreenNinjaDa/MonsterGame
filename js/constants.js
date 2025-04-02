// Camera/View Constants
const GAME_CONFIG = {
    // View and Camera
    baseViewSize: 500,  // Base size for camera view and calculations
    
    // World Size
    worldSpawnDiameter: 4000,  // Total diameter of monster spawn area
    minSpawnDistance: 500,     // Minimum spawn distance from origin/player
    
    // Game Balance
    hpRegenRate: 0.02,         // HP regeneration rate (2% per second)
    innerZoneRatio: 0.4,       // Ratio of map that maintains minimum level (40%)
    outerZoneRatio: 0.8,       // Ratio of map for level scaling (80%)
    combatStatusTime: 5,      // Time in seconds before a monster exits combat status
    wildMonsterDamageBonus: 0.03, // 3% damage bonus for wild monsters (for each area level above 1)
    wildMonsterDamageReduction: 0.03, // 3% damage reduction for wild monsters (for each area level above 1)
    outOfStaminaDamageMultiplier: 0.25, // 75% less damage for out of stamina monsters
    physicalBase: 25, // Base physical damage for normal attacks
    specialBase: 25, // Base special damage for normal attacks
    
    // Movement Speeds (units per second)
    playerSpeed: 200,          // Base player movement speed
    playerMonsterSpeed: 210,   // Player monster movement speed (all states)
    wildMonsterSpeed: 160,     // Wild monster movement speed
    monsterCollisionDistance: 30, // Distance to move monsters apart when they collide
    
    // Monster Properties
    monsterBaseSize: 80,       // Base size for monster rendering
    
    // Existing properties...
    monsterFollowDistance: {
        slot1: 25,
        slot2: 50
    },
    aggroRange: 350,           // Wild monster aggro range
    playerMonsterAggroRange: 175, // Player monster aggro range
    attackRange: 100,
    attackRangeSlot1: 50, // Half the normal attack range for slot 1 monsters
    respawnTime: 50, // Time for player owned monsters to respawn after being defeated
    catchTimeout: 30, // 30 seconds during which the player can capture a monster
    monsterDensity: 1, // Monsters per 500x500 area (reduced from 2)
    spawnAreaSize: 500, // Size of each spawn region
    maxMonsterWanderDistance: 1000, // Maximum distance a monster can wander from spawn
    playerGracePeriod: 5, // 5 seconds grace period after being sent back to start
    rareModifierRate: 5, // Rate of rare modifiers in percentage, for each monster
    statGainRatePerLevel: 0.20, // % stat gain per level
    statNames: { 1: "spd", 2: "pDef", 3: "sDef", 4: "pAtk", 5: "sAtk", 6: "endur" },
    statNamesProper: { 1: "Speed", 2: "Physical Defense", 3: "Special Defense", 4: "Physical Attack", 5: "Special Attack", 6: "Endurance" },
    monsterTextures: {}
};

// Area Configuration
const AREAS = {
    1: { //Mixed elements
        name: "Starting Plains",
        backgroundColor: 0x66aa66, // Green background for grass
        description: "A peaceful starting area with gentle monsters"
    },
    2: { //Plant
        name: "Jungle of Growth",
        backgroundColor: 0x228B22, // Forest green
        description: "A dense jungle teeming with stronger monsters"
    },
    3: { //Water
        name: "Mystic Marsh",
        backgroundColor: 0x800080, // Purple
        description: "A mysterious swampland where reality seems to bend"
    },
    4: { //Earth
        name: "Crystal Caverns",
        backgroundColor: 0x483D8B, // Dark slate blue
        description: "Ancient caves filled with crystalline formations"
    },
    5: { //Fire
        name: "Volcanic Wasteland",
        backgroundColor: 0x8B0000, // Dark red
        description: "A scorched land where only the strongest survive"
    },
    6: { //Electric
        name: "Storm Peaks",
        backgroundColor: 0x2F4F4F, // Dark slate gray
        description: "Treacherous mountain peaks crackling with electric energy"
    },
    /*7: { //Master's Keep
        name: "Master's Keep",
        backgroundColor: 0x505050, // Dark gray
        description: "A place only the most ambitious of adventurers dare to venture"
    },
    8: {
        name: "Frozen Tundra",
        backgroundColor: 0xE0FFFF, // Light cyan
        description: "A frigid wasteland where only the most resilient monsters thrive"
    },
    9: {
        name: "Dragon's Domain",
        backgroundColor: 0x4B0082, // Indigo
        description: "The legendary realm of the most powerful monsters"
    },
    10: {
        name: "Celestial Summit",
        backgroundColor: 0x191970, // Midnight blue
        description: "The final frontier where cosmic forces shape the strongest beings"
    }*/
};

// Monster Types
const MONSTER_TYPES = {
    // # - Name - Element - Speed, Phyical Defense, Phyical Attack, Special Defense, Special Attack, Endurance, SizeAdjust
    1: { name: "Derpfish", element: "Water", stats: { spd: 40, pDef: 60, pAtk: 70, sDef: 70, sAtk: 20, endur: 40}, abilId: 0, size: 1}, //Total: 300
    2: { name: "Emberling", element: "Fire", stats: { spd: 70, pDef: 40, pAtk: 50, sDef: 60, sAtk: 60, endur: 20}, abilId: 0, size: 1}, //Total: 300
    3: { name: "DownTwo", element: "Earth", stats: { spd: 30, pDef: 65, pAtk: 55, sDef: 65, sAtk: 55, endur: 30}, abilId: 0, size: 1}, //Total: 300
    4: { name: "Potsy", element: "Plant", stats: { spd: 30, pDef: 60, pAtk: 60, sDef: 60, sAtk: 60, endur: 30}, abilId: 0, size: 1}, //Total: 300
    5: { name: "Shockles", element: "Electric", stats: { spd: 60, pDef: 30, pAtk: 50, sDef: 40, sAtk: 60, endur: 60}, abilId: 0, size: 0.9}, //Total: 300 //Pushes enemy away on attack???
    6: { name: "Zappy Bird", element: "Electric", stats: { spd: 70, pDef: 40, pAtk: 30, sDef: 40, sAtk: 80, endur: 40}, abilId: 0, size: 0.8}, //Total: 300
    7: { name: "Roflstump", element: "Plant", stats: { spd: 20, pDef: 40, pAtk: 100, sDef: 40, sAtk: 70, endur: 30}, abilId: 0, size: 0.8}, //Total: 300
	8: { name: "Wimbler", element: "Water", stats: { spd: 40, pDef: 60, pAtk: 45, sDef: 50, sAtk: 35, endur: 70}, abilId: 0, size: 1.2}, //Total: 300
	9: { name: "Urthmoad", element: "Earth", stats: { spd: 100, pDef: 30, pAtk: 50, sDef: 20, sAtk: 20, endur: 80}, abilId: 0, size: 1}, //Total: 300
	10: { name: "Emborgi", element: "Fire", stats: { spd: 60, pDef: 40, pAtk: 70, sDef: 40, sAtk: 40, endur: 50}, abilId: 0, size: 1}, //Total: 300
	11: { name: "Vinegents", element: "Plant", stats: { spd: 50, pDef: 40, pAtk: 35, sDef: 55, sAtk: 70, endur: 30}, abilId: 11, size: 1}, //Total: 280
	12: { name: "Blackbory", element: "Earth", stats: { spd: 30, pDef: 60, pAtk: 45, sDef: 60, sAtk: 25, endur: 60}, abilId: 12, size: 0.8}, //Total: 280
	13: { name: "Rumbleweed", element: "Plant", stats: { spd: 70, pDef: 65, pAtk: 70, sDef: 45, sAtk: 10, endur: 60}, abilId: 13, size: 0.85}, //Total: 320
	14: { name: "Blazey", element: "Fire", stats: { spd: 5, pDef: 50, pAtk: 25, sDef: 60, sAtk: 80, endur: 40 }, abilId: 14, size: 1}, //Total: 260
	15: { name: "Treezard", element: "Plant", stats: { spd: 50, pDef: 60, pAtk: 20, sDef: 30, sAtk: 60, endur: 40 }, abilId: 15, size: 1}, //Total: 260
    16: { name: "Dampyre", element: "Water", stats: { spd: 80, pDef: 30, pAtk: 30, sDef: 40, sAtk: 80, endur: 40 }, size: 1}, //Total: 300
    17: { name: "Moltenoth", element: "Fire", stats: { spd: 10, pDef: 60, pAtk: 70, sDef: 70, sAtk: 30, endur: 60 }, size: 1}, //Total: 300
    18: { name: "Puddlepus", element: "Water", stats: { spd: 30, pDef: 60, pAtk: 50, sDef: 60, sAtk: 50, endur: 50 }, size: 1}, //Total: 300
    19: { name: "Lampray", element: "Electric", stats: { spd: 40, pDef: 40, pAtk: 20, sDef: 60, sAtk: 90, endur: 50 }, size: 1}, //Total: 300
    20: { name: "Hydrant", element: "Water", stats: { spd: 20, pDef: 40, pAtk: 50, sDef: 40, sAtk: 20, endur: 60 }, size: 1}, //Total: 230 //Hydra: Upon 0 hp, spends half its stamina to revive with same % hp if stamina > 10%.
    21: { name: "Pyrithan", element: "Earth", stats: { spd: 30, pDef: 90, pAtk: 60, sDef: 50, sAtk: 30, endur: 40 }, size: 1}, //Total: 300
    22: { name: "Tesnail", element: "Electric", stats: { spd: 80, pDef: 50, pAtk: 15, sDef: 30, sAtk: 45, endur: 80 }, size: 1}, //Total: 300
    23: { name: "Crystacean", element: "Earth", stats: { spd: 30, pDef: 80, pAtk: 10, sDef: 50, sAtk: 90, endur: 40 }, size: 1}, //Total: 300
    24: { name: "Livermort", element: "Plant", stats: { spd: 30, pDef: 50, pAtk: 20, sDef: 40, sAtk: 90, endur: 50 }, size: 1}, //Total: 300
    25: { name: "Rockhemut", element: "Earth", stats: { spd: 10, pDef: 80, pAtk: 55, sDef: 60, sAtk: 15, endur: 80 }, size: 1}, //Total: 300
    26: { name: "Lavavark", element: "Fire", stats: { spd: 40, pDef: 50, pAtk: 70, sDef: 50, sAtk: 40, endur: 50 }, size: 1}, //Total: 300
    27: { name: "Helapain", element: "Plant", stats: { spd: 30, pDef: 40, pAtk: 30, sDef: 50, sAtk: 110, endur: 40 }, size: 1}, //Total: 300
    28: { name: "Scorchion", element: "Fire", stats: { spd: 40, pDef: 60, pAtk: 20, sDef: 60, sAtk: 80, endur: 40 }, size: 1}, //Total: 300
    29: { name: "PLACEHOLD", element: "Water", stats: { spd: 50, pDef: 50, pAtk: 50, sDef: 50, sAtk: 50, endur: 50 }, size: 1}, //Total: 300
    30: { name: "Igneite", element: "Fire", stats: { spd: 60, pDef: 40, pAtk: 70, sDef: 40, sAtk: 30, endur: 70 }, size: 1}, //Total: 310
    31: { name: "Boltzalea", element: "Electric", stats: { spd: 20, pDef: 40, pAtk: 10, sDef: 70, sAtk: 120, endur: 40 }, size: 1}, //Total: 300
    32: { name: "PLACEHOLD", element: "Water", stats: { spd: 50, pDef: 50, pAtk: 50, sDef: 50, sAtk: 50, endur: 50 }, size: 1}, //Total: 300
    33: { name: "Shockram", element: "Electric", stats: { spd: 60, pDef: 55, pAtk: 70, sDef: 45, sAtk: 30, endur: 40 }, size: 1}, //Total: 300
    34: { name: "RollNRock", element: "Earth", stats: { spd: 90, pDef: 40, pAtk: 60, sDef: 40, sAtk: 10, endur: 60 }, size: 1}, //Total: 300
    35: { name: "Scornfront", element: "Electric", stats: { spd: 110, pDef: 45, pAtk: 5, sDef: 40, sAtk: 60, endur: 50 }, size: 1}, //Total: 300
	36: { name: "Corgknight", element: "Fire", stats: { spd: 30, pDef: 60, pAtk: 60, sDef: 40, sAtk: 60, endur: 70 }, size: 1}, //Total: 320
    
    //Dragginball
	//Corgknight
	//Unicorg
};

const MONSTER_ABIL_TEXT = {
    11: { name: "Berserker", description: "Enrages when hit, dealing 50% increased damage for 2 seconds." },
    12: { name: "Magic thorns", description: "Reflects 25% of special damage taken before reduction." },
    13: { name: "Rumbler", description: "Rolls around during combat." },
    14: { name: "Lazy", description: "Always regenerates HP at half out of combat rates." },
    15: { name: "Double team", description: "Enemies have a 20% chance to miss." }
}

/*const MONSTER_TYPE_STORIES = {

    1: { story: "Even outside of water, the Derpfish lives! They can often be found sunbathing on the beach. Their lifecycle is unknown."},
    2: { story: "Emberlings are the arsonists of the monster world. They are known to set fire to anything that moves. They are also known collapse from exhaustion regularly."},
    3: { story: "DownTwo is a two-headed monster. Or maybe it's two monsters stuck together. It's *hard* to tell."},
    4: { story: "Potsy is a plant monster that carries its sproutling pot with it everywhere it goes. Some pots have been passed down for generations."},
    5: { story: "Shockles is descended from a water-type monster similar to a clam. According to legend, they are born when lightning strikes the ocean."},
    6: { story: "Zappy Bird was undiscovered until recently. Where did they come from and where will they go? Better catch some before it's too late!"},
	7:
	8: 
	9:
    10: { story: "Despite being fire type, Embergi is known to extinguish the fires that Emberlings start. But they do sometimes ignite fires on accident when they sploot for a nap."},

};*/

// Element Relationships (bonus/penalty)
const ELEMENT_RELATIONS = {
    "Plant": { strong: "Earth", weak: "Fire" },
    "Earth": { strong: "Electric", weak: "Plant" },
    "Electric": { strong: "Water", weak: "Earth" },
    "Water": { strong: "Fire", weak: "Electric" },
    "Fire": { strong: "Plant", weak: "Water" }
};

// List of all available elements
const ELEMENTS = ["Plant", "Earth", "Electric", "Water", "Fire"];

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
    "Smooth": { spd: 10, pDef: 10 },
    "Sharp": { spd: 10, pAtk: 10 },
    "Witty": { spd: 10, sDef: 10 },
    "Shocking": { spd: 10, sAtk: 10 },
    "Athletic": { spd: 10, endur: 10 },
    "Strong": { pDef: 10, pAtk: 10 },
    "Sturdy": { pDef: 10, sDef: 10 },
    "Slick": { pDef: 10, sAtk: 10 },
    "Tough": { pDef: 10, endur: 10 },
    "Decisive": { pAtk: 10, sDef: 10 },
    "Aggressive": { pAtk: 10, sAtk: 10 },
    "Determined": { pAtk: 10, endur: 10 },
    "Smart": { sDef: 10, sAtk: 10 },
    "Stoic": { sDef: 10, endur: 10 },
    "Thoughtful": { sAtk: 10, endur: 10 }
};

// Element Stat Modifiers in percentages
const ELEMENT_MODIFIERS = {
    "Plant": { sAtk: 10, endur: 10, spd: -15 },
    "Earth": { pAtk: 10, pDef: 10, sAtk: -15 },
    "Electric": { sAtk: 10, spd: 10, endur: -15 },
    "Water": { endur: 10, spd: 10, pDef: -15 },
    "Fire": { pAtk: 10, sAtk: 10, sDef: -15 }
};

// Initial Game State
let gameState;

function initializeGameState() {
    // Try to load saved data first
    const savedData = JSON.parse(localStorage.getItem('gameState'));
    
    // Create base gameState structure
    gameState = {
        player: {
            position: new THREE.Vector3(0, 0, 0),
            gold: savedData?.player?.gold ?? 100, // Use saved gold if it exists, otherwise 100
            monsters: [], // Active monsters
            storedMonsters: [], // Storage for additional monsters
            gracePeriodTimer: 0 // Timer for grace period after teleportation
        },
        wildMonsters: [],
        captureTargets: [],
        scene: null,
        camera: null,
        renderer: null,
        clickTargetPosition: null,
        lastTime: 0,
        nextAreaPosition: new THREE.Vector3(4500, 4500, 0),
        storageUIOpen: false,
        captureUIOpen: false,
        detailsUIOpen: false,
        directionArrow: null,
        currentArea: savedData?.player?.areaLevel ?? 1, // Use saved area if it exists, otherwise 1
        musicSavedOff: savedData?.player?.musicState === false // Music is off if saved state is false
    };
    
    return gameState;
}

// Export gameState initialization
window.initializeGameState = initializeGameState;

//Monster 