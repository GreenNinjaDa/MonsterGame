// Update gold display
function updateGoldDisplay() {
    gameState.player.gold = Math.floor(gameState.player.gold);
    document.getElementById('goldCounter').textContent = `Gold: ${gameState.player.gold}`;
}

// Update area display
function updateAreaDisplay() {
    const areaInfo = AREAS[gameState.currentArea];
    document.getElementById('areaDisplay').textContent = `Area: ${areaInfo.name} v${GAME_CONFIG.version}`;
}

// Toggle storage UI visibility
function toggleStorageUI() {
    gameState.storageUIOpen = !gameState.storageUIOpen;
    document.getElementById('storageUI').style.display = gameState.storageUIOpen ? 'block' : 'none';
    
    // Hide/show help button on mobile when storage UI is opened/closed
    if (gameState.onMobile) {
        const helpButton = document.getElementById('helpButton');
        helpButton.style.display = gameState.storageUIOpen ? 'none' : 'flex';
    }
    
    // Update storage UI content if opening, clear if closing
    if (gameState.storageUIOpen) {
        saveGame();
        addChatMessage("Game saved.", 1000);
        updateStorageUI();
    } else {
        // Clear the monster lists when closing
        document.getElementById('activeMonsterList').innerHTML = '';
        document.getElementById('monsterList').innerHTML = '';
    }
}

// Initialize storage UI
function initStorageUI() {
    // Set up initial content
    updateStorageUI();
    
    // Create a container for toggle buttons
    const storageHeader = document.querySelector('#storageUI h2');
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'toggle-buttons-container';
    
    // Add music toggle button
    const musicButton = document.createElement('button');
    musicButton.id = 'musicToggleButton';
    musicButton.className = 'music-toggle';
    musicButton.innerHTML = '🎶'; // Default to sound-on icon
    musicButton.title = 'Toggle Music';
    
    // Add fullscreen toggle button
    const fullscreenButton = document.createElement('button');
    fullscreenButton.id = 'fullscreenToggleButton';
    fullscreenButton.className = 'music-toggle'; // Reuse the same style
    fullscreenButton.innerHTML = '⤴️'; // Default to fullscreen icon
    fullscreenButton.title = 'Toggle Fullscreen';
    
    // Add buttons to container
    buttonsContainer.appendChild(musicButton);
    buttonsContainer.appendChild(fullscreenButton);
    
    // Insert before the header text
    storageHeader.parentNode.insertBefore(buttonsContainer, storageHeader);
    
    // Add click handler for music toggle
    musicButton.addEventListener('click', toggleMusic);
    
    // Add click handler for fullscreen toggle
    fullscreenButton.addEventListener('click', toggleFullscreen);
}

// Toggle music playback
function toggleMusic() {
    const button = document.getElementById('musicToggleButton');
    
    if (!musicInitialized) {
        // If music hasn't started yet, start it
        backgroundMusic.play();
        musicInitialized = true;
        button.innerHTML = '🎶';
        gameState.musicSavedOff = false;
    } else if (backgroundMusic.paused) {
        // If music is paused, resume it
        backgroundMusic.play();
        button.innerHTML = '🎶';
        gameState.musicSavedOff = false;
    } else {
        // If music is playing, pause it
        backgroundMusic.pause();
        button.innerHTML = '🎵';
        gameState.musicSavedOff = true;
    }
}

// Toggle fullscreen mode
function toggleFullscreen() {
    const button = document.getElementById('fullscreenToggleButton');
    
    if (!document.fullscreenElement) {
        // Enter fullscreen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen()
                .then(() => {
                    button.innerHTML = '⤵️';
                })
                .catch((err) => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen()
                .then(() => {
                    button.innerHTML = '⤴️';
                })
                .catch((err) => {
                    console.error(`Error attempting to exit fullscreen: ${err.message}`);
                });
        }
    }
}

// Listen for fullscreen changes (handles F11 and other methods)
document.addEventListener('fullscreenchange', function() {
    const button = document.getElementById('fullscreenToggleButton');
    if (button) {
        button.innerHTML = document.fullscreenElement ? '⤵️' : '⤴️';
    }
});

// Helper function to format modifiers for display
function formatModifiers(monster, showCount = true) {
    // Convert string modifier to array for backward compatibility
    let modifiers = monster.rareModifiers;
    if (!modifiers) return '';
    
    if (typeof modifiers === 'string') {
        modifiers = [modifiers];
    }
    
    if (Array.isArray(modifiers) && modifiers.length > 0) {
        if (showCount && modifiers.length > 3) {
            return `(${modifiers.length} mods)`;
        }
        return `(${modifiers.join(', ')})`;
    }
    
    return '';
}

// Update storage UI content
function updateStorageUI() {
    // Update active monster list
    const activeList = document.getElementById('activeMonsterList');
    activeList.innerHTML = '';
    
    // Update stored monsters header with count
    const storedMonstersHeader = document.querySelector('#storageSlots h3');
    if (storedMonstersHeader) {
        storedMonstersHeader.textContent = `Stored Monsters (${gameState.player.storedMonsters.length})`;
    }
    
    gameState.player.monsters.forEach((monster, index) => {
        const monsterCard = document.createElement('div');
        monsterCard.className = 'monster-card';
        
        // Monster sprite image instead of color circle
        const spriteDiv = document.createElement('div');
        spriteDiv.className = 'monster-sprite';
        const spriteImg = document.createElement('img');
        spriteImg.src = `assets/monsterimg/${monster.typeId}.png`;
        spriteImg.alt = monster.name;
        spriteDiv.appendChild(spriteImg);
        
        // Monster info
        const infoDiv = document.createElement('div');
        const hasInheritedAbil = monster.abilId !== MONSTER_TYPES[monster.typeId].abilId && monster.abilId !== null;
        infoDiv.innerHTML = `
            <h4>${hasInheritedAbil ? "!" : ""}${monster.name} ${formatModifiers(monster)}</h4>
            <p>Lvl: ${monster.level} | Type: <span style="color: #${new THREE.Color(ELEMENT_COLORS[monster.element]).getHexString()}">${monster.element}</span>${monster.element !== MONSTER_TYPES[monster.typeId].element ? ` (<span style="color: #${new THREE.Color(ELEMENT_COLORS[MONSTER_TYPES[monster.typeId].element]).getHexString()}">${MONSTER_TYPES[monster.typeId].element}</span>)` : ''}</p>
            <p>${monster.defeated ? `<span style="color: red">Respawn: ${Math.ceil(monster.reviveTimer)}/${monster.level * 2}s</span>` : `HP: ${Math.round(monster.currentHP)}/${monster.maxHP}`}</p>
            <p>EXP: ${monster.level >= GAME_CONFIG.maxLevel ? 'Max Level' : `${monster.experience.current}/${monster.experience.toNextLevel}`}</p>
            <div class="monster-actions">
                <button data-id="${monster.id}" class="store-button">Store (Active ${index + 1})</button>
                ${gameState.player.monsters.length === 2 ? `<button data-id="${monster.id}" class="swap-button" style="background-color: orange;">Swap</button>` : ''}
                <button data-id="${monster.id}" class="details-button">Details</button>
            </div>
        `;
        
        monsterCard.appendChild(spriteDiv);
        monsterCard.appendChild(infoDiv);
        activeList.appendChild(monsterCard);
    });
    
    // Update stored monster list
    const storageList = document.getElementById('monsterList');
    storageList.innerHTML = '';
    
    gameState.player.storedMonsters.forEach(monster => {
        const monsterCard = document.createElement('div');
        monsterCard.className = 'monster-card';
        
        // Monster sprite image instead of color circle
        const spriteDiv = document.createElement('div');
        spriteDiv.className = 'monster-sprite';
        const spriteImg = document.createElement('img');
        spriteImg.src = `assets/monsterimg/${monster.typeId}.png`;
        spriteImg.alt = monster.name;
        spriteDiv.appendChild(spriteImg);
        
        // Monster info
        const infoDiv = document.createElement('div');
        const hasInheritedAbil = monster.abilId !== MONSTER_TYPES[monster.typeId].abilId && monster.abilId !== null;
        infoDiv.innerHTML = `
            <h4>${hasInheritedAbil ? "!" : ""}${monster.name} ${formatModifiers(monster)}</h4>
            <p>Lvl: ${monster.level} | Type: <span style="color: #${new THREE.Color(ELEMENT_COLORS[monster.element]).getHexString()}">${monster.element}</span>${monster.element !== MONSTER_TYPES[monster.typeId].element ? ` (<span style="color: #${new THREE.Color(ELEMENT_COLORS[MONSTER_TYPES[monster.typeId].element]).getHexString()}">${MONSTER_TYPES[monster.typeId].element}</span>)` : ''}</p>
            <p>${monster.defeated ? `<span style="color: red">Respawn: ${Math.ceil(monster.reviveTimer)}/${monster.level * 2}s</span>` : `HP: ${Math.round(monster.currentHP)}/${monster.maxHP}`}</p>
            <p>EXP: ${monster.level >= GAME_CONFIG.maxLevel ? 'Max Level' : `${monster.experience.current}/${monster.experience.toNextLevel}`}</p>
            <div class="monster-actions">
                <button data-id="${monster.id}" class="activate-button">Activate</button>
                <button data-id="${monster.id}" class="sell-button">Sell</button>
                <button data-id="${monster.id}" class="details-button">Details</button>
            </div>
        `;
        
        monsterCard.appendChild(spriteDiv);
        monsterCard.appendChild(infoDiv);
        storageList.appendChild(monsterCard);
    });
    
    // Add event listeners for store and activate buttons
    document.querySelectorAll('.store-button').forEach(button => {
        button.addEventListener('click', (e) => storeMonster(e.target.dataset.id));
    });
    
    document.querySelectorAll('.activate-button').forEach(button => {
        button.addEventListener('click', (e) => activateMonster(e.target.dataset.id));
    });

    // Add event listeners for sell buttons
    document.querySelectorAll('.sell-button').forEach(button => {
        button.addEventListener('click', (e) => showSellConfirmation(e.target.dataset.id));
    });
    
    // Add event listeners for details buttons
    document.querySelectorAll('.details-button').forEach(button => {
        button.addEventListener('click', (e) => showMonsterDetails(e.target.dataset.id));
    });

    // Add event listener for swap buttons
    document.querySelectorAll('.swap-button').forEach(button => {
        button.addEventListener('click', (e) => swapActiveMonsters());
    });
}

// Store an active monster
function storeMonster(monsterId) {
    if (gameState.inBossFight > 0) {
        addChatMessage("Cannot store or activate monsters during a boss fight!", 3000);
        return;
    }
    const index = gameState.player.monsters.findIndex(m => m.id.toString() === monsterId);
    
    if (index !== -1) {
        const monster = gameState.player.monsters[index];
        
        // Check if monster is in combat
        if (inCombat(monster)) {
            addChatMessage("Cannot store a monster that has been in combat recently! (5 seconds)");
            return;
        }
        
        // Remove from scene
        gameState.scene.remove(monster.mesh);
        
        // Remove from active monsters
        gameState.player.monsters.splice(index, 1);
        
        // Add to stored monsters at the beginning
        gameState.player.storedMonsters.unshift(monster);
        
        // Update storage UI
        updateStorageUI();
    }
}

// Activate a stored monster
function activateMonster(monsterId) {
    if (gameState.inBossFight > 0) {
        addChatMessage("Cannot activate or store monsters during a boss fight!", 3000);
        return;
    }
    // Check if there's room in active slots
    if (gameState.player.monsters.length >= 2) {
        addChatMessage("You already have 2 active monsters. Store one first.");
        return;
    }
    
    const index = gameState.player.storedMonsters.findIndex(m => m.id.toString() === monsterId);
    
    if (index !== -1) {
        const monster = gameState.player.storedMonsters[index];
        
        // Check if monster is defeated
        if (monster.defeated) {
            addChatMessage("Cannot activate a defeated monster. Wait for it to revive.");
            return;
        }
        
        // Clear any color timeout before moving to active
        if (monster.colorResetTimeout) {
            clearTimeout(monster.colorResetTimeout);
            monster.colorResetTimeout = null;
        }
        
        // Remove from stored monsters
        gameState.player.storedMonsters.splice(index, 1);
        
        // Add to active monsters
        addMonsterToPlayer(monster);
        
        // Update storage UI
        updateStorageUI();
    }
}

// Show sell confirmation dialog
function showSellConfirmation(monsterId) {
    // Check total monster count (active + stored)
    const totalMonsters = gameState.player.monsters.length + gameState.player.storedMonsters.length;
    if (totalMonsters <= 2) {
        addChatMessage("You need to keep at least 2 monsters! Cannot sell when you have 2 or fewer monsters.");
        return;
    }

    const monster = gameState.player.storedMonsters.find(m => m.id.toString() === monsterId);
    if (!monster) return;

    let effectiveLevel = monster.level;
    if (monster.rareModifiers && Array.isArray(monster.rareModifiers)) {
        effectiveLevel += monster.rareModifiers.length * GAME_CONFIG.rareModLevelWeight;
    }
    // Calculate sell price
    let sellPrice = 5 + Math.ceil(Math.pow(effectiveLevel, 1.7));

    // Show confirmation dialog
    if (confirm(`Are you sure you want to sell ${monster.name} (Level ${monster.level})${formatModifiers(monster)} for ${sellPrice} gold?`)) {
        sellMonster(monsterId, sellPrice);
    }
}

// Sell a monster
function sellMonster(monsterId, sellPrice) {
    const index = gameState.player.storedMonsters.findIndex(m => m.id.toString() === monsterId);
    
    if (index !== -1) {
        const monster = gameState.player.storedMonsters[index];
        
        // Clear any color timeout before removing
        if (monster.colorResetTimeout) {
            clearTimeout(monster.colorResetTimeout);
            monster.colorResetTimeout = null;
        }
        
        // Remove from stored monsters
        gameState.player.storedMonsters.splice(index, 1);
        
        // Add gold
        gameState.player.gold += sellPrice;
        updateGoldDisplay();
        
        // Update storage UI
        updateStorageUI();
        
        addChatMessage(`Sold ${monster.name} for ${sellPrice} gold!`);
    }
}

// Show capture UI
function showCaptureUI(captureInfo) {
    const monster = captureInfo.monster;

    // Calculate catch chance and cost
    let effectiveLevel = monster.spawnLevel;
    if (monster.rareModifiers && Array.isArray(monster.rareModifiers)) {
        effectiveLevel += monster.rareModifiers.length * GAME_CONFIG.rareModLevelWeight;
    }
    const catchChance = Math.min(100, Math.floor(10000 / (100 + 2 * effectiveLevel)));
    let cost = 10 + Math.ceil(Math.pow(effectiveLevel, 1.6));
    
    // Update UI
    document.getElementById('captureText').textContent = 
        `${monster.name} Level ${Math.ceil(monster.level)} (Spawn level${monster.spawnLevel}) ${formatModifiers(monster)}`;
    document.getElementById('captureCost').innerHTML = `Cost: <span style="color: gold; font-weight: bold;">${cost}</span> Gold (50% refund on failure)`;
    document.getElementById('captureChance').textContent = `Chance: ${catchChance}%`;
    
    // Store info for the capture button
    document.getElementById('captureButton').dataset.monsterId = monster.id;
    document.getElementById('captureButton').dataset.cost = cost;
    document.getElementById('captureButton').dataset.chance = catchChance;
    
    // Store monster for details button and set up event listener
    const detailsButton = document.getElementById('captureDetailsButton');
    detailsButton.dataset.monsterId = monster.id;
    
    // Remove any existing event listeners to prevent duplicates
    const newDetailsButton = detailsButton.cloneNode(true);
    detailsButton.parentNode.replaceChild(newDetailsButton, detailsButton);
    
    // Add the event listener to the new button
    newDetailsButton.addEventListener('click', function() {
        const monsterId = this.dataset.monsterId;
        // Find the monster in capture targets
        const target = gameState.captureTargets.find(t => t.monster.id.toString() === monsterId);
        if (target) {
            showMonsterDetails(monsterId);
        }
    });

    // Store current target index and update next target button visibility
    const currentIndex = gameState.captureTargets.findIndex(t => t.monster.id === monster.id);
    const nextTargetButton = document.getElementById('nextTargetButton');
    nextTargetButton.dataset.currentIndex = currentIndex;
    nextTargetButton.style.display = gameState.captureTargets.filter(t => !t.clicked).length > 1 ? 'inline-block' : 'none';
    
    // Show the UI
    document.getElementById('captureUI').style.display = 'block';
    gameState.captureUIOpen = true;
    
    // Cancel player movement
    gameState.clickTargetPosition = null;
    gameState.isMouseDown = false;
    
    // Mark as clicked to prevent multiple UI openings
    captureInfo.clicked = true;
}

// Handle capture button click
function handleCapture() {
    const button = document.getElementById('captureButton');
    const monsterId = button.dataset.monsterId;
    const cost = parseInt(button.dataset.cost);
    const chance = parseInt(button.dataset.chance);

    // Find the monster in capture targets
    const target = gameState.captureTargets.find(t => t.monster.id.toString() === monsterId);
    
    // Check if player has enough gold
    if (gameState.player.gold < cost) {
        addChatMessage("Not enough gold!");
        target.clicked = false;
        return;
    }
    
    // Roll for capture
    const roll = Math.random() * 100;
    if (roll <= chance) {
        // Deduct gold
        gameState.player.gold -= cost;
        updateGoldDisplay();
        
        if (target) {
            const monster = target.monster;
            
            // Remove from capture targets
            gameState.scene.remove(target.mesh);
            gameState.captureTargets.splice(gameState.captureTargets.indexOf(target), 1);
            
            // Convert to player monster
            const capturedMonster = createMonster(
                monster.typeId,
                monster.level,
                monster.rareModifiers,
                0,
                monster.spawnLevel,
                monster.element,
                monster.favoredStat,
                null,
                monster.abilId
            );
            
            // Ensure EXP formula is correct (halved requirement)
            capturedMonster.experience.toNextLevel = 25 * capturedMonster.level;
            
            // Add to player's monsters if there's room
            if (gameState.player.monsters.length < 2) {
                addMonsterToPlayer(capturedMonster);
                addChatMessage(`Successfully captured ${monster.name}!`);
            } else {
                // Add to storage
                gameState.player.storedMonsters.push(capturedMonster);
                updateStorageUI();
                addChatMessage(`Successfully captured ${monster.name} and added to storage!`);

                // Create capture success animation
                createFloatingCaptureOrb(target.mesh.position);
            }
        }
    } else {
        addChatMessage("Failed to capture the monster! Try again!");
        gameState.player.gold -= Math.ceil(cost * 0.5);
        updateGoldDisplay();
        return;
    }
    
    // Hide the UI
    document.getElementById('captureUI').style.display = 'none';
    gameState.captureUIOpen = false;
    
    // Reset clicked flag for the capture target to allow retrying
    if (target) {
        target.clicked = false;
    }
}

// Handle next target button click
function handleNextTarget() {
    const button = document.getElementById('nextTargetButton');
    const currentIndex = parseInt(button.dataset.currentIndex);
    
    // Find the next non-clicked target
    let nextIndex = (currentIndex + 1) % gameState.captureTargets.length;
    let attempts = 0;
    
    while (gameState.captureTargets[nextIndex].clicked && attempts < gameState.captureTargets.length) {
        nextIndex = (nextIndex + 1) % gameState.captureTargets.length;
        attempts++;
    }
    
    // If we found a non-clicked target, show its UI
    if (!gameState.captureTargets[nextIndex].clicked) {
        // Reset clicked flag for current target
        gameState.captureTargets[currentIndex].clicked = false;
        // Show UI for next target
        showCaptureUI(gameState.captureTargets[nextIndex]);
    } else {
        // If all targets are clicked, close the UI
        document.getElementById('captureUI').style.display = 'none';
        gameState.captureUIOpen = false;
        // Reset all clicked flags
        gameState.captureTargets.forEach(target => target.clicked = false);
    }
}

// Create floating text indicator
function createFloatingText(text, position, color = 0xffffff, floatRate = 0.5) {
    // Create a canvas for the text
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 60;
    const context = canvas.getContext('2d');
    
    // Draw text on canvas
    context.font = 'bold 30px Arial';
    context.fillStyle = '#' + new THREE.Color(color).getHexString();
    context.strokeStyle = 'black';
    context.lineWidth = 4;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.strokeText(text, canvas.width / 2, canvas.height / 2);
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    
    // Create a sprite with the texture
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    
    // Position the sprite
    sprite.position.copy(position);
    sprite.position.y += 30; // Above the monster
    sprite.position.z = 10;  // In front of everything
    sprite.scale.set(150, 30, 1);
    
    // Add to scene
    gameState.scene.add(sprite);
    
    // Animate the text floating up and fading out
    let opacity = 1;
    const animateText = () => {
        if (opacity <= 0) {
            gameState.scene.remove(sprite);
            return;
        }
        
        opacity -= 0.005;
        sprite.position.y += floatRate;
        sprite.material.opacity = opacity;
        
        requestAnimationFrame(animateText);
    };
    
    animateText();
    
    return sprite;
}

// Show monster details
function showMonsterDetails(monsterId) {
    // Find the monster in either active or stored monsters
    let monster = gameState.player.monsters.find(m => m.id.toString() === monsterId);
    
    if (!monster) {
        monster = gameState.player.storedMonsters.find(m => m.id.toString() === monsterId);
    }
    
    if (!monster) {
        const captureTarget = gameState.captureTargets.find(t => t.monster.id.toString() === monsterId);
        if (captureTarget) {
            monster = captureTarget.monster;
        }
    }
    
    if (!monster) {
        console.error("Monster not found:", monsterId);
        return;
    }
    
    // Hide help button on mobile when details UI is opened
    if (gameState.onMobile) {
        const helpButton = document.getElementById('helpButton');
        helpButton.style.display = 'none';
    }
    
    // Get the monster type data
    const monsterType = MONSTER_TYPES[monster.typeId];
    
    // Create details content
    const detailsContent = document.getElementById('detailsContent');

    let ability = MONSTER_ABILITIES[monster.typeId];
    let ability2 = MONSTER_ABILITIES[monster.abilId];

    let abilityText = "Natural Ability: None";
    if (ability) {
        abilityText = "Natural Ability: " + ability.name + " - " + ability.desc;
    }
    
    let abilityText2 = "";
    if (ability2) {
        abilityText2 = "Inherited Ability: " + ability2.name + " - " + ability2.desc;
    }
    
    // Sprite and basic info
    let headerHTML = `
        <div class="monster-header">
            <div class="monster-sprite">
                <img src="assets/monsterimg/${monster.typeId}.png" alt="${monster.name}">
            </div>
            <div>
                <h3>#${monster.typeId} ${monster.name} ${formatModifiers(monster, false)}</h3>
                <p><span style="color: #${new THREE.Color(ELEMENT_COLORS[monster.element]).getHexString()}">${monster.element}</span>${monster.element !== MONSTER_TYPES[monster.typeId].element ? ` (<span style="color: #${new THREE.Color(ELEMENT_COLORS[MONSTER_TYPES[monster.typeId].element]).getHexString()}">${MONSTER_TYPES[monster.typeId].element}</span>)` : ''} Level ${monster.level}, Spawn Level (Potential): ${monster.spawnLevel}</p>
                <p>Favors ${GAME_CONFIG.statNamesProper[monster.favoredStat]}</p>
                <p>${abilityText}</p>
                ${abilityText2 ? `<p>${abilityText2}</p>` : ''}
            </div>
        </div>
    `;
    
    // Stats table
    let statsHTML = `
        <table class="stats-table">
            <tr>
                <th>Stat</th>
                <th class="stat-value">Base</th>
                <th class="stat-modifier">Level</th>
                <th class="stat-modifier">Element</th>
                <th class="stat-modifier">Mods</th>
                <th class="stat-total">Total</th>
            </tr>
    `;
    
    // Get element modifiers for both current and original element
    const currentElementMods = ELEMENT_MODIFIERS[monster.element];
    const originalElementMods = ELEMENT_MODIFIERS[MONSTER_TYPES[monster.typeId].element];
    
    // Get rare modifiers
    let rareModifiers = monster.rareModifiers || [];
    if (typeof rareModifiers === 'string') {
        rareModifiers = [rareModifiers];
    }
    
    // Calculate modifiers for each stat
    const baseStats = { ...monsterType.stats };
    
    // Apply typeshifted modifiers first
    if (monster.element !== MONSTER_TYPES[monster.typeId].element) {
        Object.keys(ELEMENT_TYPESHIFT_STATS[monster.element]).forEach(stat => {
            baseStats[stat] += ELEMENT_TYPESHIFT_STATS[monster.element][stat];
        });
    }
    
    // Apply spawn level modifiers
    Object.keys(baseStats).forEach(stat => {
        baseStats[stat] = Math.round(baseStats[stat] * (1 / (1 + monster.spawnLevel / 100)));
    });
    
    //Add 10 to the stat that was boosted
    baseStats[GAME_CONFIG.statNames[monster.favoredStat]] += 10;
    
    // Store intermediate values for calculating derived stats
    let statValues = {};
    
    // For each stat, calculate the modifiers
    Object.keys(baseStats).forEach(stat => {
        // Find the stat index by looking up in GAME_CONFIG.statNames
        const statIndex = Object.entries(GAME_CONFIG.statNames).find(([key, value]) => value === stat)?.[0];
        
        if (!statIndex) {
            console.error(`Could not find index for stat: ${stat}`);
            return;
        }
        
        const baseValue = baseStats[stat];
        const statGainMultiplier = 1 + (monster.level+monster.spawnLevel-Math.abs(monster.level-monster.spawnLevel)) / 130;
        const levelModifier = Math.round(baseValue * (GAME_CONFIG.statGainRatePerLevel * (monster.level - 1) * statGainMultiplier));
        
        // Get element modifier percentages
        let elementModifierPercent = 0;
        if (monster.element !== MONSTER_TYPES[monster.typeId].element) {
            // If shifted, combine both element modifiers
            if (originalElementMods[stat]) elementModifierPercent += originalElementMods[stat];
            if (currentElementMods[stat]) elementModifierPercent += currentElementMods[stat];
        } else {
            // If not shifted, just use current element modifier
            if (currentElementMods[stat]) elementModifierPercent = currentElementMods[stat];
        }
        
        // Calculate rare modifier percentages
        let rareModifierPercent = 0;
        if (rareModifiers && rareModifiers.length > 0) {
            for (const modifierName of rareModifiers) {
                if (RARE_MODIFIERS[modifierName] && RARE_MODIFIERS[modifierName][stat]) {
                    rareModifierPercent += RARE_MODIFIERS[modifierName][stat];
                }
            }
        }
        
        // Total value
        const totalValue = monster.stats[stat];
        statValues[stat] = totalValue;
        
        // Determine the title attribute based on the stat
        let statTitle = '';
        switch (stat) {
            case 'pAtk':
                statTitle = ' title="Each Physical Attack increases physical damage dealt by 1%"';
                break;
            case 'sAtk':
                statTitle = ' title="Each Special Attack increases Special damage dealt by 1%"';
                break;
            case 'pDef':
                statTitle = ' title="Each Physical Defense reduces physical damage taken by 1%"';
                break;
            case 'sDef':
                statTitle = ' title="Each Special Defense reduces special damage taken by 1%"';
                break;
            case 'spd':
                const speedAttackPercent = (GAME_CONFIG.speedAttackScaling * 100).toFixed(1); // Calculate percentage
                statTitle = ` title="Each Speed increases attack speed and cooldown rates by ${speedAttackPercent}%"`;
                break;
            case 'endur':
                statTitle = ' title="Each Endurance increases HP and stamina by 0.4%"';
                break;
        }
        
        // Display the stat row
        statsHTML += `
            <tr>
                <td${statTitle}>${GAME_CONFIG.statNamesProper[statIndex]}</td>
                <td class="stat-value ${stat === GAME_CONFIG.statNames[monster.favoredStat] ? 'boosted-stat' : ''}">${baseValue}</td>
                <td class="stat-modifier">
                    ${levelModifier > 0 ? '+' + levelModifier : (levelModifier < 0 ? levelModifier : '')}
                </td>
                <td class="stat-modifier ${elementModifierPercent < 0 ? 'negative' : ''}">
                    ${elementModifierPercent !== 0 ? (elementModifierPercent > 0 ? '+' : '') + elementModifierPercent + '%' : ''}
                </td>
                <td class="stat-modifier ${rareModifierPercent < 0 ? 'negative' : ''}">
                    ${rareModifierPercent !== 0 ? (rareModifierPercent > 0 ? '+' : '') + rareModifierPercent + '%' : ''}
                </td>
                <td class="stat-total">${totalValue}</td>
            </tr>
        `;
    });
    
    // Add derived stats
    statsHTML += `
        <tr>
            <th colspan="1" style="padding-top: 15px;">Derived Stats</th>
            <th class="stat-total">Base</th>
            <th></th>
            <th class="stat-total">Current</th>
            <th></th>
            <th class="stat-total">Max Level</th>
        </tr>
    `;
    
    // Calculate total of all final calculated stats
    const totalStats = Object.values(statValues).reduce((sum, stat) => sum + stat, 0);

    // Calculate derived stats at base level
    const baseLevelStatsData = calculateMonsterStats(
        monsterType.stats, 
        1, 
        monster.element, 
        monster.rareModifiers, 
        monster.spawnLevel,
        monster.typeId,
        monster.favoredStat,
        monster.abilId
    );
    const baseLevelTotalStats = Object.values(baseLevelStatsData.stats).reduce((sum, stat) => sum + stat, 0);
    
    // Calculate derived stats at current level
    const maxHPFinal = monster.maxHP;
    const maxStaminaFinal = monster.maxStamina;
    const attackCooldownFinal = monster.attackCooldown;

    // Calculate derived stats at max level
    const maxLevelStatsData = calculateMonsterStats(
        monsterType.stats, 
        GAME_CONFIG.maxLevel, 
        monster.element, 
        monster.rareModifiers, 
        monster.spawnLevel,
        monster.typeId,
        monster.favoredStat,
        monster.abilId
    );
    const maxLevelTotalStats = Object.values(maxLevelStatsData.stats).reduce((sum, stat) => sum + stat, 0);
    const maxLevelMaxHP = maxLevelStatsData.maxHP;
    const maxLevelMaxStamina = maxLevelStatsData.maxStamina;
    const maxLevelAttackCooldown = maxLevelStatsData.attackCooldown;
    
    // Prepare base stats for ability 8 "Rotund"
    let baseMaxHP = GAME_CONFIG.monsterBaseHP;
    let baseMaxStamina = GAME_CONFIG.monsterBaseStamina;

    if (hasAbility(monster, 8)) {
        baseMaxHP = Math.round(baseMaxHP * (1 + MONSTER_ABILITIES[8].value));
        baseMaxStamina = Math.round(baseMaxStamina * (1 - MONSTER_ABILITIES[8].value));
    }

    // Show progression of stats
    statsHTML += `
        <tr class="derived-stat-row">
            <td>Total Stats</td>
            <td class="stat-total">${baseLevelTotalStats}</td>
            <td></td>
            <td class="stat-total">${totalStats}</td>
            <td></td>
            <td class="stat-total">${maxLevelTotalStats}</td>
        </tr>
        <tr class="derived-stat-row">
            <td>Max HP</td>
            <td class="stat-total">${baseMaxHP}</td>
            <td></td>
            <td class="stat-total">${maxHPFinal}</td>
            <td></td>
            <td class="stat-total">${maxLevelMaxHP}</td>
        </tr>
        <tr class="derived-stat-row">
            <td>Max Stamina</td>
            <td class="stat-total">${baseMaxStamina}</td>
            <td></td>
            <td class="stat-total">${maxStaminaFinal}</td>
            <td></td>
            <td class="stat-total">${maxLevelMaxStamina}</td>
        </tr>
        <tr class="derived-stat-row">
            <td>Attack Cooldown</td>
            <td class="stat-total">${MONSTER_TYPES[monster.typeId].atkCd ? MONSTER_TYPES[monster.typeId].atkCd.toFixed(1) : GAME_CONFIG.defaultAttackCooldown.toFixed(1)}s</td>
            <td></td>
            <td class="stat-total">${attackCooldownFinal.toPrecision(3)}s</td>
            <td></td>
            <td class="stat-total">${maxLevelAttackCooldown.toPrecision(3)}s</td>
        </tr>
    `;
    
    statsHTML += `</table>`;
    
    // Put everything together
    detailsContent.innerHTML = headerHTML + statsHTML;
    
    // Show the modal
    document.getElementById('monsterDetailsUI').style.display = 'block';
    gameState.detailsUIOpen = true;
}

// Close the details modal when clicking the close button
document.addEventListener('DOMContentLoaded', function() {
    const detailsModal = document.getElementById('monsterDetailsUI');
    const storageModal = document.getElementById('storageUI');
    const closeButton = detailsModal.querySelector('.close-button');
    
    closeButton.addEventListener('click', function() {
        detailsModal.style.display = 'none';
        gameState.detailsUIOpen = false;
        
        // Show help button on mobile when details UI is closed (if storage UI is not open)
        if (gameState.onMobile && !gameState.storageUIOpen) {
            const helpButton = document.getElementById('helpButton');
            helpButton.style.display = 'flex';
        }
    });

    // Helper function to handle both mouse and touch events
    function handleOutsideInteraction(event) {
        // Get the actual target (handle both mouse and touch)
        const target = (event.touches ? event.touches[0] : event).target;

        // Ignore if the interaction started from a button
        if (target.tagName === 'BUTTON') {
            return;
        }

        // For Monster Details UI - close if clicked outside or on storage UI
        if (detailsModal.style.display === 'block') {
            // If clicked on storage UI or outside both UIs
            if (storageModal.contains(target) || (!detailsModal.contains(target) && !storageModal.contains(target))) {
                detailsModal.style.display = 'none';
                gameState.detailsUIOpen = false;
            }
        }
        
        // For Storage UI - only close if clicked completely outside both UIs
        if (gameState.storageUIOpen && 
            !storageModal.contains(target) && 
            !detailsModal.contains(target) && 
            !target.matches('#storageButton')) {
            toggleStorageUI();
        }
    }

    // Add mouse and touch event handlers for outside clicks/taps
    document.addEventListener('mousedown', handleOutsideInteraction);
    document.addEventListener('touchstart', handleOutsideInteraction, { passive: true });

    // Only prevent propagation for the details modal
    function stopPropagation(event) {
        event.stopPropagation();
    }

    detailsModal.addEventListener('mousedown', stopPropagation);
    detailsModal.addEventListener('touchstart', stopPropagation, { passive: true });
});

// Chat UI System
function addChatMessage(text, duration = 10000) {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    messageElement.textContent = text;
    
    // Add to chat UI
    const chatUI = document.getElementById('chatUI');
    chatUI.appendChild(messageElement);
    
    // Force reflow to enable transition
    messageElement.offsetHeight;
    
    // Make visible
    messageElement.classList.add('visible');
    
    // Set up removal
    setTimeout(() => {
        // Add fade out class
        messageElement.classList.add('fade-out');
        
        // Remove after animation
        setTimeout(() => {
            chatUI.removeChild(messageElement);
        }, 300);
    }, duration);
}

// Sort stored monsters by different criteria
function sortStoredMonsters(sortBy) {
    // Store the current order before sorting
    const previousOrder = [...gameState.player.storedMonsters];
    
    // Create a map of monster IDs to their previous positions
    const previousPositions = {};
    previousOrder.forEach((monster, index) => {
        previousPositions[monster.id] = index;
    });
    
    // Sort the stored monsters array based on the specified criteria
    switch(sortBy) {
        case 'name':
            gameState.player.storedMonsters.sort((a, b) => {
                // First compare by name
                const nameComparison = a.name.localeCompare(b.name);
                // If names are equal, use previous order as tiebreaker
                return nameComparison !== 0 ? nameComparison : previousPositions[a.id] - previousPositions[b.id];
            });
            addChatMessage("Monsters sorted by name.", 2000);
            break;
            
        case 'type':
            gameState.player.storedMonsters.sort((a, b) => {
                // First compare by typeId
                const typeComparison = a.typeId - b.typeId;
                // If types are equal, use previous order as tiebreaker
                return typeComparison !== 0 ? typeComparison : previousPositions[a.id] - previousPositions[b.id];
            });
            addChatMessage("Monsters sorted by monster type ID.", 2000);
            break;
            
        case 'stats':
            gameState.player.storedMonsters.sort((a, b) => {
                // Calculate total stats for each monster
                const aTotalStats = Object.values(a.stats).reduce((sum, stat) => sum + stat, 0);
                const bTotalStats = Object.values(b.stats).reduce((sum, stat) => sum + stat, 0);
                // First compare by total stats
                const statsComparison = bTotalStats - aTotalStats; // Sort in descending order (highest first)
                // If stats are equal, use previous order as tiebreaker
                return statsComparison !== 0 ? statsComparison : previousPositions[a.id] - previousPositions[b.id];
            });
            addChatMessage("Monsters sorted by total stats.", 2000);
            break;
            
        case 'element':
            gameState.player.storedMonsters.sort((a, b) => {
                // First compare by element name
                const elementComparison = a.element.localeCompare(b.element);
                // If elements are equal, use previous order as tiebreaker
                return elementComparison !== 0 ? elementComparison : previousPositions[a.id] - previousPositions[b.id];
            });
            addChatMessage("Monsters sorted by element.", 2000);
            break;
            
        case 'rarity':
            gameState.player.storedMonsters.sort((a, b) => {
                // Count rare modifiers for each monster
                const aModCount = Array.isArray(a.rareModifiers) ? a.rareModifiers.length : 
                                (a.rareModifiers ? 1 : 0);
                const bModCount = Array.isArray(b.rareModifiers) ? b.rareModifiers.length : 
                                (b.rareModifiers ? 1 : 0);
                // First compare by modifier count
                const rarityComparison = bModCount - aModCount; // Sort in descending order
                // If modifier counts are equal, use previous order as tiebreaker
                return rarityComparison !== 0 ? rarityComparison : previousPositions[a.id] - previousPositions[b.id];
            });
            addChatMessage("Monsters sorted by rarity (modifier count).", 2000);
            break;
            
        case 'dualElement':
            gameState.player.storedMonsters.sort((a, b) => {
                // Check if monster has dual elements (element differs from type's element)
                const aIsDual = a.element !== MONSTER_TYPES[a.typeId].element;
                const bIsDual = b.element !== MONSTER_TYPES[b.typeId].element;
                
                // First compare by dual element status
                if (aIsDual && !bIsDual) return -1;
                if (!aIsDual && bIsDual) return 1;
                
                // If both are dual or both are not dual, sort by element
                const elementComparison = a.element.localeCompare(b.element);
                // If elements are equal, use previous order as tiebreaker
                return elementComparison !== 0 ? elementComparison : previousPositions[a.id] - previousPositions[b.id];
            });
            addChatMessage("Monsters sorted by dual element status.", 2000);
            break;
            
        case 'maxLvlStats':
            gameState.player.storedMonsters.sort((a, b) => {
                // Calculate what each monster's stats would be at max level
                const aMaxLvlStats = calculateMonsterStats(
                    MONSTER_TYPES[a.typeId].stats,
                    GAME_CONFIG.maxLevel,
                    a.element,
                    a.rareModifiers,
                    a.spawnLevel,
                    a.typeId,
                    a.favoredStat
                );
                
                const bMaxLvlStats = calculateMonsterStats(
                    MONSTER_TYPES[b.typeId].stats,
                    GAME_CONFIG.maxLevel,
                    b.element,
                    b.rareModifiers,
                    b.spawnLevel,
                    b.typeId,
                    b.favoredStat
                );
                
                // Calculate total stats for each monster at max level
                const aTotalMaxLvlStats = Object.values(aMaxLvlStats.stats).reduce((sum, stat) => sum + stat, 0);
                const bTotalMaxLvlStats = Object.values(bMaxLvlStats.stats).reduce((sum, stat) => sum + stat, 0);
                
                // First compare by total max level stats
                const maxLvlStatsComparison = bTotalMaxLvlStats - aTotalMaxLvlStats; // Sort in descending order (highest first)
                // If max level stats are equal, use previous order as tiebreaker
                return maxLvlStatsComparison !== 0 ? maxLvlStatsComparison : previousPositions[a.id] - previousPositions[b.id];
            });
            addChatMessage("Monsters sorted by max level stats.", 2000);
            break;
    }
    
    // Update the UI to reflect the sorted order
    updateStorageUI();
}

// Set up UI event handlers
function setupUIEventHandlers() {
    // Storage button
    document.getElementById('storageButton').addEventListener('click', toggleStorageUI);
    
    // Close button for storage UI
    document.querySelector('#storageUI .close-button').addEventListener('click', toggleStorageUI);
    
    // Capture button
    document.getElementById('captureButton').addEventListener('click', handleCapture);
    
    // Next target button
    document.getElementById('nextTargetButton').addEventListener('click', handleNextTarget);
    
    // Sort buttons
    document.getElementById('sortByNameButton').addEventListener('click', () => sortStoredMonsters('name'));
    document.getElementById('sortByTypeButton').addEventListener('click', () => sortStoredMonsters('type'));
    document.getElementById('sortByStatsButton').addEventListener('click', () => sortStoredMonsters('stats'));
    document.getElementById('sortByElementButton').addEventListener('click', () => sortStoredMonsters('element'));
    document.getElementById('sortByRarityButton').addEventListener('click', () => sortStoredMonsters('rarity'));
    document.getElementById('sortByMaxLvlStatsButton').addEventListener('click', () => sortStoredMonsters('maxLvlStats'));
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // 'Q' key to toggle storage
        if (event.key === 'q' || event.key === 'Q' || event.key === 'Escape') {
            toggleStorageUI();
        }
        // 'E' key to swap active monsters
        if (event.key === 'e' || event.key === 'E') {
            swapActiveMonsters();
        }
        // 'M' key to toggle music
        if (event.key === 'm' || event.key === 'M') {
            toggleMusic();
        }
        // 'H' key to toggle help menu
        if (event.key === 'h' || event.key === 'H') {
            const helpPopup = document.getElementById('helpPopup');
            const helpButton = document.getElementById('helpButton');
            if (helpPopup.style.display === 'block') {
                helpPopup.style.display = 'none';
                helpButton.style.display = 'flex';
                gameState.helpUIOpen = false;
            } else {
                helpPopup.style.display = 'block';
                helpButton.style.display = 'none';
                helpButton.classList.remove('flash');
                gameState.helpUIOpen = true;
            }
        }
        // 'F11' key to toggle fullscreen
        if (event.key === 'F11') {
            event.preventDefault(); // Prevent default F11 behavior
            toggleFullscreen();
        }
        // 'F' key to toggle fullscreen, but not if CTRL is also held down
        if ((event.key === 'f' || event.key === 'F') && !event.ctrlKey) {
            toggleFullscreen();
        }
    });
}

// Create floating gold coin that moves towards player
function createFloatingGoldCoin(position) {
    // Create a canvas for the coin
    const canvas = document.createElement('canvas');
    canvas.width = 60;
    canvas.height = 60;
    const context = canvas.getContext('2d');
    
    // Draw a gold circle
    context.beginPath();
    context.arc(30, 30, 25, 0, Math.PI * 2);
    context.fillStyle = '#FFD700'; // Gold color
    context.fill();
    context.strokeStyle = '#B8860B'; // Darker gold for border
    context.lineWidth = 3;
    context.stroke();
    
    // Add a $ symbol
    context.fillStyle = '#B8860B';
    context.font = 'bold 30px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('$', 30, 30);
    
    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    
    // Create a sprite with the texture
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    
    // Position the sprite
    sprite.position.copy(position);
    sprite.position.z = 10;  // In front of everything
    sprite.scale.set(30, 30, 1);
    
    // Add to scene
    gameState.scene.add(sprite);
    
    // Animation properties
    let time = 0;
    const floatDuration = 1; // 1 second of floating
    const moveDuration = 0.5; // 0.5 seconds of moving to player
    const floatHeight = 30; // How high it floats
    const floatSpeed = 2; // Speed of floating motion
    
    // Animate the coin
    const animateCoin = () => {
        if (time >= floatDuration + moveDuration) {
            gameState.scene.remove(sprite);
            return;
        }
        
        if (time < floatDuration) {
            // Floating phase
            sprite.position.y = position.y + Math.sin(time * floatSpeed) * floatHeight;
        } else {
            // Moving to player phase
            const moveProgress = (time - floatDuration) / moveDuration;
            const startPos = new THREE.Vector3(position.x, position.y + Math.sin(floatDuration * floatSpeed) * floatHeight, 10);
            const endPos = new THREE.Vector3(gameState.player.position.x, gameState.player.position.y, 10);
            
            // Use easing function for smooth acceleration
            const easedProgress = moveProgress * moveProgress * (3 - 2 * moveProgress);
            sprite.position.lerpVectors(startPos, endPos, easedProgress);
        }
        
        time += 0.016; // Assuming 60fps
        requestAnimationFrame(animateCoin);
    };
    
    animateCoin();
    
    return sprite;
}

// Help Button Functionality
const helpButton = document.getElementById('helpButton');
const helpPopup = document.getElementById('helpPopup');
const helpCloseButton = document.getElementById('helpCloseButton');
const helpCloseButtonX = helpPopup.querySelector('.close-button');

helpButton.addEventListener('click', () => {
    helpPopup.style.display = 'block';
    helpButton.style.display = 'none';
    helpButton.classList.remove('flash'); // Remove flashing effect
    gameState.helpUIOpen = true; // Track that help UI is open
});

helpPopup.addEventListener('click', (e) => {
    if (e.target === helpPopup) {
        helpPopup.style.display = 'none';
        helpButton.style.display = 'flex';
        gameState.helpUIOpen = false; // Track that help UI is closed
    }
});

helpCloseButton.addEventListener('click', () => {
    helpPopup.style.display = 'none';
    helpButton.style.display = 'flex';
    gameState.helpUIOpen = false; // Track that help UI is closed
});

helpCloseButtonX.addEventListener('click', () => {
    helpPopup.style.display = 'none';
    helpButton.style.display = 'flex';
    gameState.helpUIOpen = false; // Track that help UI is closed
});

// Create floating capture success orb that moves to menu button
function createFloatingCaptureOrb(position) {
    // Create a canvas for the orb
    const canvas = document.createElement('canvas');
    canvas.width = 60;
    canvas.height = 60;
    const context = canvas.getContext('2d');
    
    // Draw a white circle with glow effect
    context.beginPath();
    context.arc(30, 30, 25, 0, Math.PI * 2);
    
    // Create gradient for glow effect
    const gradient = context.createRadialGradient(30, 30, 0, 30, 30, 30);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    context.fillStyle = gradient;
    context.fill();
    
    // Add a pulsing border
    context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    context.lineWidth = 3;
    context.stroke();
    
    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    
    // Create a sprite with the texture
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    
    // Position the sprite
    sprite.position.copy(position);
    sprite.position.z = 10;  // In front of everything
    sprite.scale.set(30, 30, 1);
    
    // Add to scene
    gameState.scene.add(sprite);
    
    // Get the menu button position (top left corner)
    const menuButton = document.getElementById('storageButton');
    const menuRect = menuButton.getBoundingClientRect();
    const menuX = (menuRect.left + menuRect.right) / 2;
    const menuY = (menuRect.top + menuRect.bottom) / 2;
    
    // Convert screen coordinates to world coordinates
    const vector = new THREE.Vector3();
    vector.set(
        (menuX / window.innerWidth) * 2 - 1,
        -(menuY / window.innerHeight) * 2 + 1,
        0.5
    );
    vector.unproject(gameState.camera);
    vector.z = 10;
    
    // Animation properties
    let time = 0;
    const floatDuration = 1; // 1 second of floating
    const moveDuration = 0.5; // 0.5 seconds of moving to menu
    const floatHeight = 30; // How high it floats
    const floatSpeed = 2; // Speed of floating motion
    
    // Animate the orb
    const animateOrb = () => {
        if (time >= floatDuration + moveDuration) {
            gameState.scene.remove(sprite);
            return;
        }
        
        if (time < floatDuration) {
            // Floating phase
            sprite.position.y = position.y + Math.sin(time * floatSpeed) * floatHeight;
        } else {
            // Moving to menu phase
            const moveProgress = (time - floatDuration) / moveDuration;
            const startPos = new THREE.Vector3(position.x, position.y + Math.sin(floatDuration * floatSpeed) * floatHeight, 10);
            
            // Use easing function for smooth acceleration
            const easedProgress = moveProgress * moveProgress * (3 - 2 * moveProgress);
            sprite.position.lerpVectors(startPos, vector, easedProgress);
        }
        
        time += 0.016; // Assuming 60fps
        requestAnimationFrame(animateOrb);
    };
    
    animateOrb();
    
    return sprite;
}

// Swap the two active monsters
function swapActiveMonsters() {
    // Check if there are exactly two active monsters
    if (gameState.player.monsters.length !== 2) {
        addChatMessage("You need exactly two active monsters to swap.");
        return;
    }
    
    // Swap the monsters in the array
    [gameState.player.monsters[0], gameState.player.monsters[1]] = [gameState.player.monsters[1], gameState.player.monsters[0]];
    
    // Update the storage UI to reflect the change
    updateStorageUI();
    addChatMessage("Active monsters swapped.", 2000);
}

function toggleChatRoom() {
    const chatRoomContainer = document.getElementById('chatRoomContainer');
    const toggleChatBtn = document.getElementById('toggleChatBtn');
    
    if (chatRoomContainer.style.display === 'none') {
        chatRoomContainer.style.display = 'block';
        toggleChatBtn.textContent = 'Close Chat';
    } else {
        chatRoomContainer.style.display = 'none';
        toggleChatBtn.textContent = 'Open Chat';
    }
}