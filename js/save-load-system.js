// In this file here, I want to create a save and load system for my monster game using LocalStorage. It only needs to store and load the monsters the player owns. It does not need to store the monster's "id", it can just create a new one when loading.
// It should also store the player's gold, and the level of the area the player is currently in. Also save music pause/play state.


//List of things to save from each monster the player owns: typeId, level, experience, favoredStat, element, spawnLevel, rare modifiers.

//List of things to save from the player: gold, areaLevel, musicState.

//Function to save the game:
window.saveGame = function() {
    const activeMonsters = gameState.player.monsters;
    const storedMonsters = gameState.player.storedMonsters;
    const playerData = {
        gold: gameState.player.gold,
        areaLevel: gameState.currentArea,
        musicState: backgroundMusic ? !backgroundMusic.paused : true
    };

    const saveData = {
        activeMonsters: activeMonsters.map(monster => ({
            typeId: monster.typeId,
            level: monster.level,
            experience: monster.experience,
            favoredStat: monster.favoredStat,
            element: monster.element,
            spawnLevel: monster.spawnLevel,
            rareModifiers: monster.rareModifiers,
            abilId: monster.abilId != MONSTER_TYPES[monster.typeId].abilId ? monster.abilId : null
        })),
        storedMonsters: storedMonsters.map(monster => ({
            typeId: monster.typeId,
            level: monster.level,
            experience: monster.experience,
            favoredStat: monster.favoredStat,
            element: monster.element,
            spawnLevel: monster.spawnLevel,
            rareModifiers: monster.rareModifiers,
            abilId: monster.abilId != MONSTER_TYPES[monster.typeId].abilId ? monster.abilId : null
        })),
        player: playerData
    };

    localStorage.setItem('gameState', JSON.stringify(saveData));
}

//Function to load the game:
window.loadGame = function() {
    const saveData = JSON.parse(localStorage.getItem('gameState')); 
    if (!saveData) {
        console.log('No saved game found');
        return;
    }

    gameState.player.gold = saveData.player.gold;   
    updateGoldDisplay(); // Update the UI to show correct gold value
    
    gameState.currentArea = saveData.player.areaLevel;

    // Set music state
    if (saveData.player.musicState === false) {
        gameState.musicSavedOff = true;
        if (backgroundMusic) {
            backgroundMusic.pause();
        }
        // Update music button icon
        const musicButton = document.getElementById('musicToggleButton');
        if (musicButton) {
            musicButton.innerHTML = '🎵';
        }
    }

    // Clear existing active monsters
    for (const monster of gameState.player.monsters) {
        if (monster.mesh && monster.mesh.parent) {
            monster.mesh.parent.remove(monster.mesh);
        }
    }
    gameState.player.monsters = [];

    // Clear existing stored monsters
    for (const monster of gameState.player.storedMonsters) {
        if (monster.mesh && monster.mesh.parent) {
            monster.mesh.parent.remove(monster.mesh);
        }
    }
    gameState.player.storedMonsters = [];

    // Handle both old and new save formats
    const activeMonsters = saveData.activeMonsters || saveData.monsters || [];
    const storedMonsters = saveData.storedMonsters || [];

    // Create new active monsters from save data
    for (const monsterData of activeMonsters) {
        const monster = createMonster(
            monsterData.typeId, 
            monsterData.level, 
            monsterData.rareModifiers,
            0, // not wild
            monsterData.spawnLevel,
            monsterData.element,
            monsterData.favoredStat,
            null, // no masterId
            monsterData.abilId
        );
        monster.experience = monsterData.experience;
        gameState.player.monsters.push(monster);
        gameState.scene.add(monster.mesh);
    }

    // Create new stored monsters from save data
    for (const monsterData of storedMonsters) {
        const monster = createMonster(
            monsterData.typeId, 
            monsterData.level, 
            monsterData.rareModifiers,
            0, // not wild
            monsterData.spawnLevel,
            monsterData.element,
            monsterData.favoredStat,
            null, // no masterId
            monsterData.abilId
        );
        monster.experience = monsterData.experience;
        gameState.player.storedMonsters.push(monster);
    }

    // If player has no active monsters but has stored monsters, activate the first one
    if (gameState.player.monsters.length === 0 && gameState.player.storedMonsters.length > 0) {
        const firstStoredMonster = gameState.player.storedMonsters[0];
        // Remove from stored monsters
        gameState.player.storedMonsters.splice(0, 1);
        // Add to active monsters
        addMonsterToPlayer(firstStoredMonster);
        addChatMessage(`${firstStoredMonster.name} has been automatically activated!`, 5000);
    }

    // If player has 1 active monster but has stored monsters, activate the first one
    if (gameState.player.monsters.length === 1 && gameState.player.storedMonsters.length > 0) {
        const firstStoredMonster = gameState.player.storedMonsters[0];
        // Remove from stored monsters
        gameState.player.storedMonsters.splice(0, 1);
        // Add to active monsters
        addMonsterToPlayer(firstStoredMonster);
        addChatMessage(`${firstStoredMonster.name} has been automatically activated!`, 5000);
    }
}