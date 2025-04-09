// Camera/View Constants
const GAME_CONFIG = {
    // View and Camera
    baseViewSize: 500,  // Base size for camera view and calculations
    
    // World Size
    worldSpawnDiameter: 4000,  // Total diameter of monster spawn area
    minSpawnDistance: 500,     // Minimum spawn distance from origin/player
    
    // Game Balance
    maxLevel: 70, //Maximum monster level
    innerZoneRatio: 0.4, // Ratio of map that maintains minimum level (40%)
    outerZoneRatio: 0.6, // Ratio of map for level scaling (80%)
    combatStatusTime: 5, // Time in seconds before a monster exits combat status
    wildMonsterDamageBonus: 0.03, // 3% damage bonus for wild monsters (for each area level above 1)
    wildMonsterDamageReduction: 0.03, // 3% damage reduction for wild monsters (for each area level above 1)
    defaultAttackCooldown: 10, // Time in seconds for default attack cooldown
    defaultStaminaCost: 50, //Default stamina cost per attack
    outOfStaminaDamageMultiplier: 0.5, // 50% less damage for out of stamina monsters
    physicalBase: 50, // Base physical damage for normal attacks
    specialBase: 50, // Base special damage for normal attacks
    rareModLevelWeight: 5, //How many levels higher a monster is considered for rewards per rare mod
    catchLevelPenalty: 0.5, //Monsters lose half their levels when caught from the wild
    staminaRegenRate: 0.1, // Out of combat stamina regen rate
    staminaRegenRateCombat: 0.01, // Combat stamina regen rate
    hpRegenRate: 0.05, // Out of combat HP regen rate
    hpRegenRateCombat: 0, // combat HP regen rate
    speedAttackScaling: 0.006, //0.6% attack speed scaling per speed stat
    
    // Movement Speeds (units per second)
    playerSpeed: 200, // Base player movement speed
    playerMonsterSpeed: 210, // Player monster movement speed (all states)
    wildMonsterSpeed: 160, // Wild monster movement speed
    monsterCollisionDistance: 30, // Distance to move monsters apart when they collide
    
    // Monster Properties
    monsterBaseSize: 80, // Base size for monster rendering
    
    // Existing properties...
    monsterFollowDistance: {
        slot1: 25,
        slot2: 50
    },
    aggroRange: 300, // Wild monster aggro range
    playerMonsterAggroRange: 150, // Player monster aggro range
    retreatCheckRange: 300, // Player range at which the player's monsters will retreat from combat
    attackRange: 100, //Monster attack range
    attackRangeSlot1: 50, // Half the normal attack range for slot 1 monsters (so it tanks)
    respawnTime: 50, // Time for player owned monsters to respawn after being defeated
    catchTimeout: 30, // 30 seconds during which the player can capture a monster
    monsterDensity: 1, // Monsters per 500x500 area (reduced from 2)
    spawnAreaSize: 500, // Size of each spawn region
    maxMonsterWanderDistance: 1000, // Maximum distance a monster can wander from spawn
    rareModifierRate: 5, // Rate of rare modifiers in percentage, for each monster
    statGainRatePerLevel: 0.20, // % stat gain per level
    statNames: { 1: "spd", 2: "pDef", 3: "sDef", 4: "pAtk", 5: "sAtk", 6: "endur" },
    statNamesProper: { 1: "Speed", 2: "Physical Defense", 3: "Special Defense", 4: "Physical Attack", 5: "Special Attack", 6: "Endurance" },
    monsterTextures: {}
};

// Area Configuration
const AREAS = {
    1: { //Town
        name: "Binder Town",
        backgroundColor: 0x66aa66, // Green background for grass
        description: "A safe place for monster binders to rest and commune"
    },
    2: { //Mixed elements
        name: "Docile Plains",
        backgroundColor: 0x66aa66, // Green background for grass
        description: "A peaceful starting area with gentle monsters"
    },
    3: { //Plant
        name: "Jungle of Growth",
        backgroundColor: 0x228B22, // Forest green
        description: "A dense jungle teeming with stronger monsters"
    },
    4: { //Water
        name: "Mystic Marsh",
        backgroundColor: 0x800080, // Purple
        description: "A mysterious swampland where reality seems to bend"
    },
    5: { //Earth
        name: "Crystal Caverns",
        backgroundColor: 0x483D8B, // Dark slate blue
        description: "Ancient caves filled with crystalline formations"
    },
    6: { //Fire
        name: "Volcanic Wasteland",
        backgroundColor: 0x8B0000, // Dark red
        description: "A scorched land where only the strongest survive"
    },
    7: { //Electric
        name: "Storm Peaks",
        backgroundColor: 0x2F4F4F, // Dark slate gray
        description: "Treacherous mountain peaks crackling with electric energy"
    },
    /*8: { //Master's Keep
        name: "Master's Keep",
        backgroundColor: 0x505050, // Dark gray
        description: "A place only the most ambitious of adventurers dare to venture"
    },
    9: {
        name: "Frozen Tundra",
        backgroundColor: 0xE0FFFF, // Light cyan
        description: "A frigid wasteland where only the most resilient monsters thrive"
    },
    10: {
        name: "Dragon's Domain",
        backgroundColor: 0x4B0082, // Indigo
        description: "The legendary realm of the most powerful monsters"
    },
    11: {
        name: "Celestial Summit",
        backgroundColor: 0x191970, // Midnight blue
        description: "The final frontier where cosmic forces shape the strongest beings"
    }*/
};

// Monster Types
const MONSTER_TYPES = {
    // # - Name - Element - Speed, Phyical Defense, Special Defense, Phyical Attack, Special Attack, Endurance, SizeAdjust
    1: { name: "Derpfish", element: "Water", stats: { spd: 40, pDef: 60, sDef: 70, pAtk: 70, sAtk: 20, endur: 40}, abilId: 0, size: 1}, //Total: 300
    2: { name: "Emberling", element: "Fire", stats: { spd: 70, pDef: 40, sDef: 60, pAtk: 50, sAtk: 60, endur: 20}, abilId: 0, size: 1}, //Total: 300
    3: { name: "DownTwo", element: "Earth", stats: { spd: 30, pDef: 65, sDef: 65, pAtk: 55, sAtk: 55, endur: 30}, abilId: 0, size: 1}, //Total: 300
    4: { name: "Potsy", element: "Plant", stats: { spd: 30, pDef: 60, sDef: 60, pAtk: 60, sAtk: 60, endur: 30}, abilId: 0, size: 1}, //Total: 300
    5: { name: "Shockles", element: "Electric", stats: { spd: 60, pDef: 30, sDef: 40, pAtk: 50, sAtk: 60, endur: 60}, abilId: 0, size: 0.9}, //Total: 300 //Pushes enemy away on attack???
    6: { name: "Zappy Bird", element: "Electric", stats: { spd: 70, pDef: 40, sDef: 40, pAtk: 30, sAtk: 80, endur: 40}, abilId: 0, size: 0.8}, //Total: 300
    7: { name: "Roflstump", element: "Plant", stats: { spd: 20, pDef: 40, sDef: 40, pAtk: 100, sAtk: 70, endur: 30}, abilId: 0, size: 0.8}, //Total: 300
    8: { name: "Wimbler", element: "Water", stats: { spd: 40, pDef: 60, sDef: 50, pAtk: 45, sAtk: 35, endur: 70}, abilId: 0, size: 1.2}, //Total: 300
    9: { name: "Urthmoad", element: "Earth", stats: { spd: 100, pDef: 30, sDef: 20, pAtk: 50, sAtk: 20, endur: 80}, abilId: 0, size: 1}, //Total: 300
    10: { name: "Emborgi", element: "Fire", stats: { spd: 60, pDef: 30, sDef: 50, pAtk: 40, sAtk: 70, endur: 50}, abilId: 0, size: 1}, //Total: 300
    11: { name: "Vinegents", element: "Plant", stats: { spd: 50, pDef: 40, sDef: 55, pAtk: 35, sAtk: 70, endur: 30}, abilId: 11, size: 1}, //Total: 280
    12: { name: "Blackbory", element: "Earth", stats: { spd: 30, pDef: 60, sDef: 60, pAtk: 45, sAtk: 25, endur: 60}, abilId: 12, size: 0.8}, //Total: 280
    13: { name: "Rumbleweed", element: "Plant", stats: { spd: 50, pDef: 65, sDef: 45, pAtk: 70, sAtk: 10, endur: 60}, abilId: 13, size: 0.85}, //Total: 300
    14: { name: "Blazey", element: "Fire", stats: { spd: 5, pDef: 50, sDef: 60, pAtk: 25, sAtk: 80, endur: 40 }, abilId: 14, size: 1}, //Total: 260
    15: { name: "Treezard", element: "Plant", stats: { spd: 50, pDef: 60, sDef: 30, pAtk: 20, sAtk: 60, endur: 40 }, abilId: 15, size: 1}, //Total: 260
    16: { name: "Dampyre", element: "Water", stats: { spd: 80, pDef: 40, sDef: 30, pAtk: 80, sAtk: 30, endur: 40 }, size: 1}, //Total: 300
    17: { name: "Moltenoth", element: "Fire", stats: { spd: 10, pDef: 60, sDef: 70, pAtk: 70, sAtk: 30, endur: 60 }, size: 1}, //Total: 300
    18: { name: "Puddlepus", element: "Water", stats: { spd: 30, pDef: 60, sDef: 60, pAtk: 50, sAtk: 50, endur: 50 }, size: 0.95}, //Total: 300
    19: { name: "Lampray", element: "Electric", stats: { spd: 40, pDef: 40, sDef: 60, pAtk: 20, sAtk: 90, endur: 50 }, size: 1}, //Total: 300
    20: { name: "Hydrant", element: "Water", stats: { spd: 20, pDef: 40, sDef: 40, pAtk: 50, sAtk: 20, endur: 60 }, size: 1}, //Total: 230 //Hydra: Upon 0 hp, spends half its stamina to revive with current stamina% hp if stamina > 10%.
    21: { name: "Pyrithan", element: "Earth", stats: { spd: 30, pDef: 90, sDef: 50, pAtk: 60, sAtk: 30, endur: 40 }, size: 1}, //Total: 300
    22: { name: "Tesnail", element: "Electric", stats: { spd: 80, pDef: 50, sDef: 30, pAtk: 15, sAtk: 45, endur: 80 }, size: 1}, //Total: 300
    23: { name: "Crystacean", element: "Earth", stats: { spd: 30, pDef: 40, sDef: 90, pAtk: 80, sAtk: 20, endur: 40 }, size: 1}, //Total: 300
    24: { name: "Livermort", element: "Plant", stats: { spd: 30, pDef: 50, sDef: 40, pAtk: 30, sAtk: 100, endur: 50 }, size: 1}, //Total: 300
    25: { name: "Rockhemut", element: "Earth", stats: { spd: 10, pDef: 80, sDef: 60, pAtk: 55, sAtk: 15, endur: 80 }, size: 1.2}, //Total: 300
    26: { name: "Lavavark", element: "Fire", stats: { spd: 40, pDef: 50, sDef: 50, pAtk: 70, sAtk: 40, endur: 50 }, size: 1}, //Total: 300
    27: { name: "Helapain", element: "Plant", stats: { spd: 30, pDef: 40, sDef: 50, pAtk: 30, sAtk: 110, endur: 40 }, size: 1}, //Total: 300
    28: { name: "Scorchion", element: "Fire", stats: { spd: 40, pDef: 60, sDef: 60, pAtk: 20, sAtk: 80, endur: 40 }, size: 1}, //Total: 300
    29: { name: "Steanix", element: "Water", stats: { spd: 50, pDef: 30, sDef: 40, pAtk: 70, sAtk: 70, endur: 40 }, size: 1}, //Total: 300
    30: { name: "Igneite", element: "Fire", stats: { spd: 60, pDef: 50, sDef: 30, pAtk: 80, sAtk: 20, endur: 60 }, size: 0.9}, //Total: 300
    31: { name: "Boltzalea", element: "Electric", stats: { spd: 20, pDef: 40, sDef: 70, pAtk: 10, sAtk: 120, endur: 40 }, size: 1}, //Total: 300
    32: { name: "Polrus", element: "Water", stats: { spd: 30, pDef: 50, sDef: 60, pAtk: 35, sAtk: 25, endur: 100 }, size: .95}, //Total: 300
    33: { name: "Shockram", element: "Electric", stats: { spd: 60, pDef: 55, sDef: 45, pAtk: 70, sAtk: 30, endur: 40 }, size: 1.2}, //Total: 300
    34: { name: "RollNRock", element: "Earth", stats: { spd: 90, pDef: 40, sDef: 40, pAtk: 60, sAtk: 10, endur: 60 }, size: 0.75}, //Total: 300
    35: { name: "Scornfront", element: "Electric", stats: { spd: 90, pDef: 45, sDef: 40, pAtk: 5, sAtk: 70, endur: 50 }, size: 1.2}, //Total: 300
    36: { name: "Corgknight", element: "Fire", stats: { spd: 30, pDef: 60, sDef: 40, pAtk: 60, sAtk: 60, endur: 70 }, size: 0.9}, //Total: 320
    
    //Dragginball
    //Corgknight
    //Unicorg
};

const ABILITY = {
    11: { name: "Berserker", desc: "Enrages when hit, dealing 50% increased damage for 2 seconds." },
    12: { name: "Magic thorns", desc: "Reflects 25% of special damage taken before reduction." },
    13: { name: "Rumbler", desc: "Rolls around during combat." },
    14: { name: "Lazy", desc: "Always regenerates HP at half out of combat rates." },
    15: { name: "Distracting Presence", desc: "Nearby enemies have a 20% chance to miss." },
	35: { name: "Static Charge", desc: "20% less stamina cost of attacks." },
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
    10: { story: "Despite being fire element, Emborgi is known to extinguish the fires that Emberlings start. But Emborgis do sometimes ignite fires on accident when they sploot for a nap."},

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

// Define Boss Data Structure
const BOSS_DATA = [
    { // Water Boss
        masterElement: "Water",
        monsters: [
            { typeId: 32, level: 65, mods: ["Sharp", "Strong", "Aggressive"], spawnLvl: 55, favoredStat: 1 },
            { typeId: 19, level: 70, mods: ["Shocking", "Thoughtful"], spawnLvl: 60, element: "Water", favoredStat: 5 }
        ]
    },
    { // Fire Boss
        masterElement: "Fire",
        monsters: [
            { typeId: 36, level: 70, mods: ["Tough", "Decisive"], spawnLvl: 40, favoredStat: 4 },
            { typeId: 27, level: 65, mods: ["Stoic", "Athletic", "Slick"], spawnLvl: 55, element: "Fire", favoredStat: 6 }
        ]
    },
    { // Earth Boss
        masterElement: "Earth",
        monsters: [
            { typeId: 12, level: 70, mods: ["Aggressive", "Sharp"], spawnLvl: 60, favoredStat: 4 },
            { typeId: 30, level: 65, mods: ["Strong", "Decisive", "Determined"], spawnLvl: 55, element: "Earth", favoredStat: 3 }
        ]
    },
    { // Plant Boss
        masterElement: "Plant",
        monsters: [
            { typeId: 15, level: 65, mods: ["Tough", "Sturdy", "Stoic"], spawnLvl: 55, favoredStat: 3 },
            { typeId: 31, level: 70, mods: ["Shocking", "Thoughtful"], spawnLvl: 60, element: "Plant", favoredStat: 1 }
        ]
    },
    { // Electric Boss
        masterElement: "Electric",
        monsters: [
            { typeId: 28, level: 65, mods: ["Shocking", "Athletic", "Sharp"], spawnLvl: 55, element: "Electric", favoredStat: 5 },
            { typeId: 6, level: 70, mods: ["Witty", "Tough"], spawnLvl: 60, favoredStat: 6 }
        ]
    },
    { // Final Boss (Placeholder Element)
        masterElement: "Fire", // Example element, adjust as needed
        monsters: [
            { typeId: 14, level: 70, mods: ["Slick", "Smart"], spawnLvl: 60, element: "Plant", favoredStat: 1 },
            { typeId: 13, level: 65, mods: ["Tough", "Stoic", "Sturdy"], spawnLvl: 55, element: "Water", favoredStat: 3 }
        ]
    }
];

// Function to create a simple mesh for the boss master
function createBossMasterMesh(element) {
    const geometry = new THREE.ConeGeometry( 40, 100, 8 ); // Simple cone shape
    const color = ELEMENT_COLORS[element] || 0xffffff; // Use element color or white default
    const material = new THREE.MeshBasicMaterial( {color: color, transparent: true, opacity: 0.9} );
    const mesh = new THREE.Mesh( geometry, material );
    mesh.rotation.x = Math.PI / 2; // Rotate to stand upright on the plane
    mesh.position.z = 50; // Raise slightly off the ground plane
    return mesh;
}

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
        },
        wildMonsters: [],
        bossMasters: [], // Array to hold boss master objects {id, mesh, position, element}
        bossMonsters: [], // Array to hold boss monsters (team 2)
        bossMasterIdCounter: 0, // Counter for unique boss master IDs
        townNPC: null, // Add property for the town NPC {mesh, labelMesh}
        discordUrl: "https://discord.gg/547meQMzAY", // Discord server invite URL
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
        musicSavedOff: savedData?.player?.musicState === false, // Music is off if saved state is false
        monsterIdFixer: 0, //Used to prevent two monsters spawning at the same time and randomly getting the exact same ID
        windowFocused: document.hasFocus() // Track if window is focused or not
    };
    
    return gameState;
}

// Export gameState initialization
window.initializeGameState = initializeGameState;

function bossMonsterDebug() {

    //createMonster(typeId, lvl, rareModifiers, team, spawnLvl, element = "", favoredStat = "") {

    //Tutorial enemy?
    //let boss0_1 = createMonster(6, 3, [""], 0, 3, null, 1);

    //Water boss - Polrus and Lamprey
    let boss1_1 = createMonster(32, 65, ["Sharp", "Strong", "Aggressive"], 0, 55, null, 1);
    let boss1_2 = createMonster(19, 70, ["Shocking", "Thoughtful"], 0, 60, "Water", 5);

    //Fire boss - Corgknight and Helapain
    let boss2_1 = createMonster(36, 70, ["Tough", "Decisive"], 0, 40, null, 4);
    let boss2_2 = createMonster(27, 65, ["Stoic", "Athletic", "Slick"], 0, 55, "Fire", 6);

    //Earth boss - Blackbory and Igneite
    let boss3_1 = createMonster(12, 70, ["Aggressive", "Sharp"], 0, 60, null, 4);
    let boss3_2 = createMonster(30, 65, ["Strong", "Decisive", "Determined"], 0, 55, "Earth", 3);

    //Plant boss - Treezard and Boltzalea
    let boss4_1 = createMonster(15, 65, ["Tough", "Sturdy", "Stoic"], 0, 55, null, 3);
    let boss4_2 = createMonster(31, 70, ["Shocking", "Thoughtful"], 0, 60, "Plant", 1);

    //Electric boss - Scorchion and Zappy Bird
    let boss5_1 = createMonster(28, 65, ["Shocking", "Athletic", "Sharp"], 0, 55, "Electric", 5);
    let boss5_2 = createMonster(6, 70, ["Witty", "Tough"], 0, 60, null, 6);

    //Final boss - Blazey and Rumbleweed
    let boss6_1 = createMonster(14, 70, ["Slick", "Smart"], 0, 60, "Plant", 1);
    let boss6_2 = createMonster(13, 65, ["Tough", "Stoic", "Sturdy"], 0, 55, "Water", 3);

    /*
    gameState.player.storedMonsters.push(boss1_1);
    gameState.player.storedMonsters.push(boss1_2);
    gameState.player.storedMonsters.push(boss2_1);
    gameState.player.storedMonsters.push(boss2_2);
    gameState.player.storedMonsters.push(boss3_1);
    gameState.player.storedMonsters.push(boss3_2);
    gameState.player.storedMonsters.push(boss4_1);
    gameState.player.storedMonsters.push(boss4_2);
    gameState.player.storedMonsters.push(boss5_1);
    gameState.player.storedMonsters.push(boss5_2);
    gameState.player.storedMonsters.push(boss6_1);
    gameState.player.storedMonsters.push(boss6_2);

    gameState.player.storedMonsters.push(createMonster(1, 1, ["Smooth", "Sharp", "Witty", "Shocking", "Athletic", "Strong", "Sturdy", "Slick", "Tough", "Decisive", "Aggressive", "Determined", "Smart", "Stoic", "Thoughtful"], 0, 1, null, 1));
    gameState.player.storedMonsters.push(createMonster(1, 1, ["Smooth", "Sharp", "Witty", "Shocking", "Athletic", "Strong", "Sturdy", "Slick", "Tough", "Decisive", "Aggressive", "Determined", "Smart", "Stoic"], 0, 1, null, 1));
    gameState.player.storedMonsters.push(createMonster(1, 1, ["Smooth", "Sharp", "Witty", "Shocking", "Athletic", "Strong", "Sturdy", "Slick", "Tough", "Decisive", "Aggressive", "Determined", "Smart"], 0, 1, null, 1));
    gameState.player.storedMonsters.push(createMonster(1, 1, ["Smooth", "Sharp", "Witty", "Shocking", "Athletic", "Strong", "Sturdy", "Slick", "Tough", "Decisive", "Aggressive", "Determined"], 0, 1, null, 1));
    gameState.player.storedMonsters.push(createMonster(1, 1, ["Smooth", "Sharp", "Witty", "Shocking", "Athletic", "Strong", "Sturdy", "Slick", "Tough", "Decisive", "Aggressive"], 0, 1, null, 1));
    gameState.player.storedMonsters.push(createMonster(1, 1, ["Smooth", "Sharp", "Witty", "Shocking", "Athletic", "Strong", "Sturdy", "Slick", "Tough", "Decisive"], 0, 1, null, 1));
    gameState.player.storedMonsters.push(createMonster(1, 1, ["Smooth", "Sharp", "Witty", "Shocking", "Athletic", "Strong", "Sturdy", "Slick", "Tough"], 0, 1, null, 1));
    gameState.player.storedMonsters.push(createMonster(1, 1, ["Smooth", "Sharp", "Witty", "Shocking", "Athletic", "Strong", "Sturdy", "Slick"], 0, 1, null, 1));
    gameState.player.storedMonsters.push(createMonster(1, 1, ["Smooth", "Sharp", "Witty", "Shocking", "Athletic", "Strong", "Sturdy"], 0, 1, null, 1));
    gameState.player.storedMonsters.push(createMonster(1, 1, ["Smooth", "Sharp", "Witty", "Shocking", "Athletic", "Strong"], 0, 1, null, 1));
    gameState.player.storedMonsters.push(createMonster(1, 1, ["Smooth", "Sharp", "Witty", "Shocking", "Athletic"], 0, 1, null, 1));
    gameState.player.storedMonsters.push(createMonster(1, 1, ["Smooth", "Sharp", "Witty", "Shocking"], 0, 1, null, 1));
    gameState.player.storedMonsters.push(createMonster(1, 1, ["Smooth", "Sharp", "Witty"], 0, 1, null, 1));
    gameState.player.storedMonsters.push(createMonster(1, 1, ["Smooth", "Sharp"], 0, 1, null, 1));
    gameState.player.storedMonsters.push(createMonster(1, 1, "Smooth", 0, 1, null, 1));
    gameState.player.storedMonsters.push(createMonster(1, 1, "", 0, 1, null, 1));

    */

}