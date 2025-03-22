// Update gold display
function updateGoldDisplay() {
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
        updateStorageUI();
    }
}

// Initialize storage UI
function initStorageUI() {
    // Set up initial content
    updateStorageUI();
}

// Helper function to format modifiers for display
function formatModifiers(monster) {
    // Convert string modifier to array for backward compatibility
    let modifiers = monster.rareModifiers;
    if (!modifiers) return '';
    
    if (typeof modifiers === 'string') {
        modifiers = [modifiers];
    }
    
    if (Array.isArray(modifiers) && modifiers.length > 0) {
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
        
        // Monster color circle
        const colorDiv = document.createElement('div');
        colorDiv.className = 'monster-color';
        colorDiv.style.backgroundColor = '#' + monster.mesh.material.color.getHexString();
        
        // Monster info
        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `
            <h4>${monster.name} ${formatModifiers(monster)}</h4>
            <p>Lvl: ${monster.level} | Type: ${monster.element}</p>
            <p>HP: ${Math.round(monster.currentHP)}/${monster.maxHP}</p>
            <p>EXP: ${monster.experience.current}/${monster.experience.toNextLevel}</p>
            <div class="monster-actions">
                <button class="monster-active" disabled>Active (Slot ${index + 1})</button>
                <button data-id="${monster.id}" class="store-button">Store</button>
                <button data-id="${monster.id}" class="details-button">Details</button>
            </div>
        `;
        
        monsterCard.appendChild(colorDiv);
        monsterCard.appendChild(infoDiv);
        activeList.appendChild(monsterCard);
    });
    
    // Update stored monster list
    const storageList = document.getElementById('monsterList');
    storageList.innerHTML = '';
    
    gameState.player.storedMonsters.forEach(monster => {
        const monsterCard = document.createElement('div');
        monsterCard.className = 'monster-card';
        
        // Monster color circle matching its type
        const colorDiv = document.createElement('div');
        colorDiv.className = 'monster-color';
        colorDiv.style.backgroundColor = '#' + new THREE.Color(MONSTER_TYPES[monster.typeId].color).getHexString();
        
        // Monster info
        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `
            <h4>${monster.name} ${formatModifiers(monster)}</h4>
            <p>Lvl: ${monster.level} | Type: ${monster.element}</p>
            <p>HP: ${Math.round(monster.currentHP)}/${monster.maxHP}</p>
            <p>EXP: ${monster.experience.current}/${monster.experience.toNextLevel}</p>
            <div class="monster-actions">
                <button data-id="${monster.id}" class="activate-button">Activate</button>
                <button data-id="${monster.id}" class="sell-button">Sell</button>
                <button data-id="${monster.id}" class="details-button">Details</button>
            </div>
        `;
        
        monsterCard.appendChild(colorDiv);
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
        if (monster.inCombat) {
            addChatMessage("Cannot store a monster that is currently in combat!");
            return;
        }
        
        // Remove from scene
        gameState.scene.remove(monster.mesh);
        
        // Remove from active monsters
        gameState.player.monsters.splice(index, 1);
        
        // Add to stored monsters
        gameState.player.storedMonsters.push(monster);
        
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

    // Calculate sell price (same as capture cost)
    let sellPrice = 10;
    for (let i = 1; i <= monster.level; i++) {
        sellPrice += i;
    }

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
        
        // Check if monster is defeated
        if (monster.defeated) {
            addChatMessage("Cannot sell a defeated monster. Wait for it to revive.");
            return;
        }
        
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
    const catchChance = Math.min(100, Math.floor(10000 / (100 + 2 * monster.level)));
    let cost = 10;
    for (let i = 1; i <= monster.level; i++) {
        cost += i;
    }
    
    // Update UI
    document.getElementById('captureText').textContent = 
        `Capture ${monster.name} (Level ${monster.level})${formatModifiers(monster)}?`;
    document.getElementById('captureCost').textContent = `Cost: ${cost} Gold`;
    document.getElementById('captureChance').textContent = `Chance: ${catchChance}%`;
    
    // Store info for the capture button
    document.getElementById('captureButton').dataset.monsterId = monster.id;
    document.getElementById('captureButton').dataset.cost = cost;
    document.getElementById('captureButton').dataset.chance = catchChance;
    
    // Show the UI
    document.getElementById('captureUI').style.display = 'block';
    
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
    
    // Check if player has enough gold
    if (gameState.player.gold < cost) {
        addChatMessage("Not enough gold!");
        document.getElementById('captureUI').style.display = 'none';
        return;
    }
    
    // Deduct gold
    gameState.player.gold -= cost;
    updateGoldDisplay();
    
    // Roll for capture
    const roll = Math.random() * 100;
    if (roll <= chance) {
        // Find the monster in capture targets
        const targetIndex = gameState.captureTargets.findIndex(
            target => target.monster.id.toString() === monsterId
        );
        
        if (targetIndex !== -1) {
            const monster = gameState.captureTargets[targetIndex].monster;
            
            // Remove from capture targets
            gameState.scene.remove(gameState.captureTargets[targetIndex].mesh);
            gameState.captureTargets.splice(targetIndex, 1);
            
            // Convert to player monster (revert to 40% of level)
            const newLevel = Math.max(1, Math.floor(monster.level * 0.4));
            const capturedMonster = createMonster(
                monster.typeId,
                newLevel,
                monster.rareModifiers,
                false,
                monster.spawnLevel
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
        }
    } else {
        addChatMessage("Failed to capture the monster! Try again!");
    }
    
    // Hide the UI
    document.getElementById('captureUI').style.display = 'none';
    
    // Reset clicked flag for the capture target to allow retrying
    const targetIndex = gameState.captureTargets.findIndex(
        target => target.monster.id.toString() === monsterId
    );
    if (targetIndex !== -1) {
        gameState.captureTargets[targetIndex].clicked = false;
    }
}

// Create floating text indicator
function createFloatingText(text, position, color = 0xffffff) {
    // Create a canvas for the text
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 40;
    const context = canvas.getContext('2d');
    
    // Draw text on canvas
    context.font = 'bold 20px Arial';
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
    sprite.scale.set(100, 20, 1);
    
    // Add to scene
    gameState.scene.add(sprite);
    
    // Animate the text floating up and fading out
    let opacity = 1;
    const animateText = () => {
        if (opacity <= 0) {
            gameState.scene.remove(sprite);
            return;
        }
        
        opacity -= 0.01;
        sprite.position.y += 0.5;
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
        console.error("Monster not found:", monsterId);
        return;
    }
    
    // Get the monster type data
    const monsterType = MONSTER_TYPES[monster.typeId];
    
    // Create details content
    const detailsContent = document.getElementById('detailsContent');
    
    // Color and basic info
    let headerHTML = `
        <div class="monster-header">
            <div class="monster-color" style="background-color: #${new THREE.Color(monsterType.color).getHexString()}"></div>
            <div>
                <h3>${monster.name} ${formatModifiers(monster)}</h3>
                <p>${monster.element} Level ${monster.level}</p>
                <p>Spawn Level (Potential): ${monster.spawnLevel}</p>
                <p>EXP: ${monster.experience.current}/${monster.experience.toNextLevel}</p>
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
    
    // Get element modifiers
    const elementMods = ELEMENT_MODIFIERS[monster.element];
    
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
    
    // Stat names for display
    const statDisplayNames = {
        'speed': 'Speed',
        'physDef': 'Physical Defense',
        'physAtk': 'Physical Attack',
        'specDef': 'Special Defense',
        'specAtk': 'Special Attack',
        'endur': 'Endurance'
    };
    
    // Store intermediate values for calculating derived stats
    let statsAfterLevel = {};
    let statsBeforeRare = {};
    let statValues = {};
    
    // For each stat, calculate the modifiers
    Object.keys(monster.stats).forEach(stat => {
        const baseValue = baseStats[stat];
        const levelModifier = Math.round(baseValue * (GAME_CONFIG.statGainRatePerLevel * (monster.level - 1) * (1 + monster.spawnLevel / 50)));
        const afterLevel = baseValue + levelModifier;
        statsAfterLevel[stat] = afterLevel;
        
        // Element modifier - calculated based on stats AFTER level modifier
        let elementModifier = 0;
        if (elementMods[stat]) {
            elementModifier = Math.round(afterLevel * elementMods[stat] / 100);
        }
        
        // Calculate intermediate value after level and element modifiers
        const afterLevelAndElement = afterLevel + elementModifier;
        statsBeforeRare[stat] = afterLevelAndElement;
        
        // Rare modifiers - calculated based on stats AFTER level and element modifiers
        let rareModifier = 0;
        if (rareModifiers && rareModifiers.length > 0) {
            for (const modifierName of rareModifiers) {
                if (RARE_MODIFIERS[modifierName] && RARE_MODIFIERS[modifierName][stat]) {
                    rareModifier += afterLevelAndElement * RARE_MODIFIERS[modifierName][stat] / 100;
                    rareModifier = Math.round(rareModifier);
                }
            }
        }
        
        // Total value
        const totalValue = monster.stats[stat];
        statValues[stat] = totalValue;
        
        // Display the stat row
        statsHTML += `
            <tr>
                <td>${statDisplayNames[stat]}</td>
                <td class="stat-value">${baseValue}</td>
                <td class="stat-modifier">
                    ${levelModifier > 0 ? '+' + levelModifier : (levelModifier < 0 ? levelModifier : '')}
                </td>
                <td class="stat-modifier ${elementModifier < 0 ? 'negative' : ''}">
                    ${elementModifier > 0 ? '+' + elementModifier : (elementModifier < 0 ? elementModifier : '')}
                </td>
                <td class="stat-modifier ${rareModifier < 0 ? 'negative' : ''}">
                    ${rareModifier > 0 ? '+' + rareModifier : (rareModifier < 0 ? rareModifier : '')}
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
}

// Close the details modal when clicking the close button
document.addEventListener('DOMContentLoaded', function() {
    const detailsModal = document.getElementById('monsterDetailsUI');
    const closeButton = detailsModal.querySelector('.close-button');
    
    closeButton.addEventListener('click', function() {
        detailsModal.style.display = 'none';
    });
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

// Example usage:
// addChatMessage("Monster defeated!");
// addChatMessage("Level up!", 5000); // Custom duration in ms 