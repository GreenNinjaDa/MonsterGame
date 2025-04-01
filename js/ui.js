// Update gold display
function updateGoldDisplay() {
    gameState.player.gold = Math.floor(gameState.player.gold);
    document.getElementById('goldCounter').textContent = `Gold: ${gameState.player.gold}`;
}

// Update area display
function updateAreaDisplay() {
    const areaInfo = AREAS[gameState.currentArea];
    document.getElementById('areaDisplay').textContent = `Area: ${areaInfo.name}`;
}

// Toggle storage UI visibility
function toggleStorageUI() {
    gameState.storageUIOpen = !gameState.storageUIOpen;
    document.getElementById('storageUI').style.display = gameState.storageUIOpen ? 'block' : 'none';
    
    // Update storage UI content if opening
    if (gameState.storageUIOpen) {
        saveGame();
        addChatMessage("Game saved.", 1000);
        updateStorageUI();
    }
}

// Initialize storage UI
function initStorageUI() {
    // Set up initial content
    updateStorageUI();
    
    // Add music toggle button to storage UI header
    const storageHeader = document.querySelector('#storageUI h2');
    const musicButton = document.createElement('button');
    musicButton.id = 'musicToggleButton';
    musicButton.className = 'music-toggle';
    musicButton.innerHTML = '🎶'; // Default to sound-on icon
    
    // Insert before the header text
    storageHeader.parentNode.insertBefore(musicButton, storageHeader);
    
    // Add click handler for music toggle
    musicButton.addEventListener('click', toggleMusic);
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
        infoDiv.innerHTML = `
            <h4>${monster.name} ${formatModifiers(monster)}</h4>
            <p>Lvl: ${monster.level} | Type: <span style="color: #${new THREE.Color(ELEMENT_COLORS[monster.element]).getHexString()}">${monster.element}</span>${monster.element !== MONSTER_TYPES[monster.typeId].element ? ` (<span style="color: #${new THREE.Color(ELEMENT_COLORS[MONSTER_TYPES[monster.typeId].element]).getHexString()}">${MONSTER_TYPES[monster.typeId].element}</span>)` : ''}</p>
            <p>HP: ${Math.round(monster.currentHP)}/${monster.maxHP}</p>
            <p>EXP: ${monster.experience.current}/${monster.experience.toNextLevel}</p>
            <div class="monster-actions">
                <button data-id="${monster.id}" class="store-button">Store (Active ${index + 1})</button>
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
        infoDiv.innerHTML = `
            <h4>${monster.name} ${formatModifiers(monster)}</h4>
            <p>Lvl: ${monster.level} | Type: <span style="color: #${new THREE.Color(ELEMENT_COLORS[monster.element]).getHexString()}">${monster.element}</span>${monster.element !== MONSTER_TYPES[monster.typeId].element ? ` (<span style="color: #${new THREE.Color(ELEMENT_COLORS[MONSTER_TYPES[monster.typeId].element]).getHexString()}">${MONSTER_TYPES[monster.typeId].element}</span>)` : ''}</p>
            <p>HP: ${Math.round(monster.currentHP)}/${monster.maxHP}</p>
            <p>EXP: ${monster.experience.current}/${monster.experience.toNextLevel}</p>
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
}

// Store an active monster
function storeMonster(monsterId) {
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
        effectiveLevel += monster.rareModifiers.length * 5;
    }
    // Calculate sell price (same as capture cost)
    let sellPrice = 5 + Math.ceil(Math.pow(effectiveLevel, 1.6));

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
        effectiveLevel += monster.rareModifiers.length * 5;
    }
    const catchChance = Math.min(100, Math.floor(10000 / (100 + 2 * effectiveLevel)));
    let cost = 10 + Math.ceil(Math.pow(effectiveLevel, 1.5));
    
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
    detailsButton.addEventListener('click', function() {
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
                false,
                monster.spawnLevel,
                monster.element,
                monster.favoredStat
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
            }

            // Create capture success animation
            createFloatingCaptureOrb(target.mesh.position);
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
    
    // Get the monster type data
    const monsterType = MONSTER_TYPES[monster.typeId];
    
    // Create details content
    const detailsContent = document.getElementById('detailsContent');
    
    // Sprite and basic info
    let headerHTML = `
        <div class="monster-header">
            <div class="monster-sprite">
                <img src="assets/monsterimg/${monster.typeId}.png" alt="${monster.name}">
            </div>
            <div>
                <h3>${monster.name} ${formatModifiers(monster, false)}</h3>
                <p><span style="color: #${new THREE.Color(ELEMENT_COLORS[monster.element]).getHexString()}">${monster.element}</span>${monster.element !== MONSTER_TYPES[monster.typeId].element ? ` (<span style="color: #${new THREE.Color(ELEMENT_COLORS[MONSTER_TYPES[monster.typeId].element]).getHexString()}">${MONSTER_TYPES[monster.typeId].element}</span>)` : ''} Level ${monster.level}</p>
                <p>Spawn Level (Potential): ${monster.spawnLevel}</p>
                <p>Favors ${GAME_CONFIG.statNamesProper[monster.favoredStat]}</p>
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
        
        // Display the stat row
        statsHTML += `
            <tr>
                <td>${GAME_CONFIG.statNamesProper[statIndex]}</td>
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
            <th colspan="7" style="padding-top: 15px;">Derived Stats</th>
        </tr>
    `;
    
    // Calculate derived stats at different stages
    const maxHPFinal = monster.maxHP;
    
    const maxStaminaFinal = monster.maxStamina;
    
    const attackCooldownFinal = monster.attackCooldown;
    
    // Show progression of stats
    statsHTML += `
        <tr class="derived-stat-row">
            <td>Max HP</td>
            <td colspan="3" class="stat-total">${maxHPFinal}</td>
        </tr>
        <tr class="derived-stat-row">
            <td>Max Stamina</td>
            <td colspan="3" class="stat-total">${maxStaminaFinal}</td>
        </tr>
        <tr class="derived-stat-row">
            <td>Attack Cooldown</td>
            <td colspan="3" class="stat-total">${attackCooldownFinal.toFixed(1)}s</td>
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
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // 'ESC' key to toggle storage
        if (event.key === 'Escape') {
            toggleStorageUI();
        }
        // 'M' key to toggle music
        if (event.key === 'm' || event.key === 'M') {
            if (backgroundMusic.paused) {
                backgroundMusic.play();
                addChatMessage("Music playing, press M again to pause.", 6000)
            } else {
                backgroundMusic.pause();
                addChatMessage("Music paused, press M again to play.", 6000)
            }
        }
    });
    
    // Initialize help UI
    initHelpUI();
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

// Initialize help button and arrow
function initHelpUI() {
    const helpButton = document.getElementById('helpButton');
    const helpArrow = document.querySelector('.help-arrow');
    const helpPopup = document.getElementById('helpPopup');
    const helpCloseButton = document.getElementById('helpCloseButton');
    
    // Check if help has been viewed before
    const hasViewedHelp = localStorage.getItem('hasViewedHelp') === 'true';
    
    if (!hasViewedHelp) {
        // Show flashing help button and arrow
        helpButton.classList.add('flash');
        helpArrow.classList.add('visible');
    }
    
    // Handle help button click
    helpButton.addEventListener('click', () => {
        // Remove flashing and arrow
        helpButton.classList.remove('flash');
        helpArrow.classList.remove('visible');
        
        // Mark help as viewed
        localStorage.setItem('hasViewedHelp', 'true');
        
        // Show help popup
        helpPopup.style.display = 'block';
    });
    
    // Handle help popup close
    helpCloseButton.addEventListener('click', () => {
        helpPopup.style.display = 'none';
    });
}

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