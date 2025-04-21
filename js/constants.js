// Camera/View Constants
const GAME_CONFIG = {
    //Version number
    version: "0.7.7",

    // View and Camera
    baseViewSize: 500,  // Base size for camera view and calculations
    
    // World Size
    worldSpawnDiameter: 4000,  // Total diameter of monster spawn area
    minSpawnDistance: 500,     // Minimum spawn distance from origin/player
    
    // Game Neutral
    maxLevel: 70, //Maximum monster level
    innerZoneRatio: 0.4, // Ratio of map that maintains minimum level (40%)
    outerZoneRatio: 0.6, // Ratio of map for level scaling (60%)
    combatStatusTime: 5, // Time in seconds before a monster exits combat status
    wildMonsterDamageBonus: 0.03, // 3% damage bonus for wild monsters (for each area level above 1)
    wildMonsterDamageReduction: 0.03, // 3% damage reduction for wild monsters (for each area level above 1)
    defaultAttackCooldown: 10, // Time in seconds for default attack cooldown
    physicalBase: 50, // Base physical damage for normal attacks
    specialBase: 50, // Base special damage for normal attacks
    defaultStaminaCost: 50, //Default stamina cost per attack
    outOfStaminaDamageMultiplier: 0.5, // 50% less damage for out of stamina monsters
    rareModLevelWeight: 5, //How many levels higher a monster is considered for rewards per rare mod
    catchLevelPenalty: 0.5, //Monsters lose half their levels when caught from the wild
    staminaRegenRate: 0.1, // Out of combat stamina regen rate
    staminaRegenRateCombat: 0.01, // Combat stamina regen rate
    hpRegenRate: 0.05, // Out of combat HP regen rate
    hpRegenRateCombat: 0, // combat HP regen rate
    speedAttackScaling: 0.006, //0.6% attack speed scaling per speed stat
    masterFollowDistance: 150, // Distance to follow player for boss masters
    
    // Movement Speeds (units per second)
    playerSpeed: 200, // Base player movement speed
    playerMonsterSpeed: 210, // Player monster movement speed (all states)
    wildMonsterSpeed: 160, // Wild monster movement speed
    monsterCollisionDistance: 30, // Distance to move monsters apart when they collide
    
    // Monster Properties
    monsterBaseSize: 80, // Base size for monster rendering
    monsterBaseHP: 200, // Base HP for monsters
    monsterBaseStamina: 100, // Base stamina for monsters
    monsterFollowDistance: { slot1: 25, slot2: 50 },
    aggroRange: 300, // Wild monster aggro range
    playerMonsterAggroRange: 150, // Player owned monster aggro range
    retreatCheckRange: 300, // Player range at which the player's monsters will retreat from combat
    attackRange: 100, //Monster attack range
    attackRangeSlot1: 50, // Half the normal attack range for slot 1 monsters (so it tanks)
    catchTimeout: 30, // 30 seconds during which the player can capture a monster
    monsterDensity: 1, // Monsters per 500x500 area (reduced from 2)
    spawnAreaSize: 500, // Size of each spawn region
    maxMonsterWanderDistance: 1000, // Maximum distance a monster can wander from spawn
    rareModifierRate: 5, // Rate of rare modifiers in percentage, for each monster
    statGainRatePerLevel: 0.20, // % of base stats gained per level
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
    { // Final Boss
        masterElement: "Neutral",
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
        windowFocused: document.hasFocus(), // Track if window is focused or not
        inBossFight: 0,
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