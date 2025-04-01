// Load all monster textures at startup
function loadMonsterTextures() {
    const textureLoader = new THREE.TextureLoader();
    // Load textures for all monster types
    Object.keys(MONSTER_TYPES).forEach(typeId => {
        GAME_CONFIG.monsterTextures[typeId] = textureLoader.load(`assets/monsterimg/${typeId}.png`, (texture) => {
            // Configure texture settings for better rendering
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.encoding = THREE.sRGBEncoding;
            texture.flipY = false; // Prevent texture from being flipped
            texture.needsUpdate = true;
        }, undefined, () => {
            // On error, load 1.png instead
            GAME_CONFIG.monsterTextures[typeId] = textureLoader.load(`assets/monsterimg/1.png`, (texture) => {
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.encoding = THREE.sRGBEncoding;
                texture.flipY = false;
                texture.needsUpdate = true;
            });
        });
    });
}

// Create UI Labels for HP, Stamina, Level, and Name
function createUILabel() {
    const canvas = document.createElement('canvas');
    canvas.width = 200; // Even wider for larger name text
    canvas.height = 100; // Taller for larger name text
    const context = canvas.getContext('2d');
    
    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    
    // Create a sprite with the texture
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(90, 45, 1); // Larger scale for bigger text
    sprite.position.y = 70; // Position higher above the monster
    sprite.position.z = 1; // Ensure UI is above monster
    
    return { sprite, context, texture };
}

// Update HP, Stamina bars, Level display, and Name
function updateUILabel(uiLabel, monster) {
    const { context, texture } = uiLabel;
    const canvas = context.canvas;
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Reset font for the name
    context.font = '30px Arial';
    
    // Add monster name at the top with larger font
    let displayName = monster.name;
    
    // Add stars for monsters with rare modifiers
    // Convert string modifier to array for backward compatibility
    let modifiers = monster.rareModifiers;
    if (modifiers && typeof modifiers === 'string') {
        modifiers = [modifiers];
    }
    
    if (modifiers && Array.isArray(modifiers) && modifiers.length > 0) {
        // Add the number of modifiers to the name
        if (modifiers.length == 1) {
            displayName += "*";
        } else {
            displayName += modifiers.length;
        }
    }
    
    context.textAlign = 'center';
    
    context.strokeText(displayName, canvas.width / 2, 30);
    context.fillText(displayName, canvas.width / 2, 30);
    
    // HP bar
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(0, 40, canvas.width, 12);
    
    const hpPercent = Math.max(0, monster.currentHP / monster.maxHP);
    context.fillStyle = hpPercent > 0.5 ? 'lime' : hpPercent > 0.2 ? 'yellow' : 'red';
    context.fillRect(2, 42, (canvas.width - 4) * hpPercent, 8);
    
    // Stamina bar
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(0, 55, canvas.width, 12);
    
    const staminaPercent = Math.max(0, monster.currentStamina / monster.maxStamina);
    context.fillStyle = 'skyblue';
    context.fillRect(2, 57, (canvas.width - 4) * staminaPercent, 8);
    
    // Level display with element color
    let elementColor = ELEMENT_COLORS[monster.element];
    let color = new THREE.Color(elementColor);

    // Check if monster is typeshifted (element different from original)
    const isTypeshifted = monster.element !== MONSTER_TYPES[monster.typeId].element;
    if (isTypeshifted) {
        // Draw first part of outline for level text
        context.lineWidth = 4;
        context.fillStyle = `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 1)`;
        context.fillRect(70, 69, 60, 20);
        // Use element color for text when typeshifted
        elementColor = ELEMENT_COLORS[MONSTER_TYPES[monster.typeId].element];
        color = new THREE.Color(elementColor);
        // Draw second part of outline for level text
        context.fillStyle = `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 1)`;
        context.fillRect(70, 89, 60, 10);
    }
    else {
        // Draw an outline for level text
        context.lineWidth = 4;
        context.fillStyle = `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 1)`;
        context.fillRect(70, 69, 60, 30);
    }

    // Use white for text
    context.fillStyle = 'white';
    context.strokeStyle = 'black';

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Show level number
    context.font = 'bold 25px Arial';
    context.strokeText(monster.level, 100, 85);
    context.fillText(monster.level, 100, 85);
    
    // Update the texture
    texture.needsUpdate = true;
}

// Calculate monster stats from base values, level, element, and rare modifiers
function calculateMonsterStats(baseStats, level, element, rareModifiers, spawnLevel = 0, typeId = null, favoredStat = null) {
    // Create copies to avoid modifying original objects
    const stats = {};
    
    // Apply spawn level adjustment to base stats
    const baseStatAdjustment = 1 / (1 + spawnLevel / 100);
    const statGainMultiplier = 1 + (level+spawnLevel-Math.abs(level-spawnLevel)) / 130;
    
    // Step 1: Start with adjusted base stats
    Object.keys(baseStats).forEach(stat => {
        stats[stat] = Math.round(baseStats[stat] * baseStatAdjustment);
    });
    
    if (favoredStat === null) {
        favoredStat = Math.floor(Math.random() * 6) + 1; // 1-6
    }

    // Step 2: Apply stat boost if present
    if (favoredStat !== null) {
        const boostedStat = GAME_CONFIG.statNames[favoredStat];
        if (boostedStat && stats[boostedStat]) {
            stats[boostedStat] += 10;
        }
    }
    
    // Step 3: Apply level-up stat bonuses
    Object.keys(stats).forEach(stat => {
        stats[stat] = Math.round(stats[stat] * (1 + GAME_CONFIG.statGainRatePerLevel * (level - 1) * statGainMultiplier));
    });
    
    // Step 4: Apply element modifiers AFTER level-up stats
    // First, get the original element modifiers from the monster's type
    const originalElement = typeId ? MONSTER_TYPES[typeId].element : element;
    const originalElementMods = ELEMENT_MODIFIERS[originalElement];
    const currentElementMods = ELEMENT_MODIFIERS[element];
    
    // Combine element modifiers before applying them
    const totalElementModifiers = {};
    
    // Initialize total modifiers with current element
    Object.keys(currentElementMods).forEach(stat => {
        totalElementModifiers[stat] = currentElementMods[stat];
    });
    
    // If element is different from original, add original element modifiers
    if (element !== originalElement) {
        Object.keys(originalElementMods).forEach(stat => {
            if (!totalElementModifiers[stat]) {
                totalElementModifiers[stat] = 0;
            }
            totalElementModifiers[stat] += originalElementMods[stat];
        });
    }
    
    // Apply combined element modifiers once
    Object.keys(totalElementModifiers).forEach(stat => {
        if (stats[stat]) {
            stats[stat] = Math.round(stats[stat] * (1 + totalElementModifiers[stat] / 100));
        }
    });
    
    // Step 5: Apply rare modifiers if present - FIX: Sum all modifiers first, then apply once
    let sizeMultiplier = 1;
    let sizeMultiplierCount = 0;
    if (rareModifiers && Array.isArray(rareModifiers) && rareModifiers.length > 0) {
        // Create an object to track total modifier percentages per stat
        const totalRareModifiers = {};
        
        // Sum up all rare modifier percentages
        for (const modifierName of rareModifiers) {
            if (RARE_MODIFIERS[modifierName]) {
                const rareMods = RARE_MODIFIERS[modifierName];
                Object.keys(rareMods).forEach(stat => {
                    if (!totalRareModifiers[stat]) {
                        totalRareModifiers[stat] = 0;
                    }
                    totalRareModifiers[stat] += rareMods[stat];
                });
                // Increase size by 5% for each modifier
                sizeMultiplierCount++;
            }
        }

        sizeMultiplier = 2 - (1 / (1 + (sizeMultiplierCount * 0.1)));
        
        // Apply the total modifier percentages once
        Object.keys(totalRareModifiers).forEach(stat => {
            if (stats[stat]) {
                stats[stat] = Math.round(stats[stat] * (1 + totalRareModifiers[stat] / 100));
            }
        });
    }
    
    // Step 6: Calculate derived stats
    const maxHP = Math.round(200 * (1 + 0.4 * stats.endur / 100));
    const maxStamina = Math.round(100 * (1 + 0.4 * stats.endur / 100));
    const attackCooldown = 5 / (1 + 0.006 * stats.spd); // 5 seconds base, reduced by speed
    
    return {
        stats,
        maxHP,
        maxStamina,
        attackCooldown,
        sizeMultiplier
    };
}

// Update monster facing direction based on movement or target
function updateMonsterDirection(monster, targetX) {
    // Get the monster's current x position
    const currentX = monster.mesh.position.x;
    
    // Determine if monster should face left or right
    const shouldFaceLeft = targetX < currentX;
    
    // Only update if direction changed
    if (shouldFaceLeft !== monster.facingLeft) {
        monster.facingLeft = shouldFaceLeft;
        // Scale the monster mesh (not the container) to flip horizontally
        monster.monsterMesh.scale.x = shouldFaceLeft ? -1 : 1;
    }
}

// Create monster object
function createMonster(typeId, level = 1, rareModifiers = null, isWild = true, spawnLevel = 0, tempElement = MONSTER_TYPES[typeId].element, favoredStat = null) {
    const monsterType = MONSTER_TYPES[typeId];

    //Wild monsters have a 20% chance to spawn as a random element this is called typeshifting
    if (isWild && Math.random() < 0.2) {
        tempElement = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
    }
    
    // Convert string modifier to array for backward compatibility
    if (rareModifiers && typeof rareModifiers === 'string') {
        rareModifiers = [rareModifiers];
    }
    
    // If favoredStat not specified, randomly generate one
    if (favoredStat === null) {
        favoredStat = Math.floor(Math.random() * 6) + 1; // 1-6
    }
    
    // Calculate all stats using the centralized function
    const calculatedStats = calculateMonsterStats(
        monsterType.stats, 
        level, 
        tempElement, 
        rareModifiers, 
        spawnLevel,
        typeId,
        favoredStat
    );

    // Create the monster's visual representation using a plane with texture
    const size = monsterType.size * GAME_CONFIG.monsterBaseSize * calculatedStats.sizeMultiplier;
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshBasicMaterial({ 
        map: GAME_CONFIG.monsterTextures[typeId],
        transparent: true,
        side: THREE.DoubleSide,
        color: 0xffffff,
        alphaTest: 0.5
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = 1;
    
    // Create a container for the monster and UI
    const container = new THREE.Object3D();
    
    // Add the monster mesh to the container and flip it
    container.add(mesh);
    mesh.rotation.x = Math.PI; // Flip only the monster mesh
    
    // Store the original texture for reference
    const originalTexture = GAME_CONFIG.monsterTextures[typeId];
    const originalMaterial = material;
    
    // Add UI label for HP and Stamina
    const uiLabel = createUILabel();
    
    // Create a separate container for the UI that won't be affected by monster rotation
    const uiContainer = new THREE.Object3D();
    uiContainer.position.z = 2; // Position above the monster mesh
    container.add(uiContainer);
    uiContainer.add(uiLabel.sprite);
    
    // Monster object
    const monster = {
        id: Date.now() + Math.random(),
        typeId,
        abilId: monsterType.abilId,
        name: monsterType.name,
        element: tempElement,
        level,
        rareModifiers,
        isWild,
        spawnLevel,
        favoredStat,
        stats: calculatedStats.stats,
        maxHP: calculatedStats.maxHP,
        currentHP: calculatedStats.maxHP,
        maxStamina: calculatedStats.maxStamina,
        currentStamina: calculatedStats.maxStamina,
        attackCooldown: calculatedStats.attackCooldown,
        currentCooldown: 0,
        mesh: container, // Use the container as the main mesh
        monsterMesh: mesh, // Store reference to actual monster mesh
        uiLabel,
        target: null,
        inCombat: false,
        timeSinceCombat: 0,
        experience: {
            current: 0,
            toNextLevel: 25 * level
        },
        lastPosition: new THREE.Vector3(),
        targetPosition: new THREE.Vector3(),
        defeated: false,
        reviveTimer: null,
        respawnTimer: null,
        originalPosition: null,
        aggroTarget: null,
        returningToOrigin: false,
        originalTexture,
        originalMaterial,
        facingLeft: false, // Track which direction monster is facing
    };

    //Make sure it's not considered in combat
    monster.timeSinceCombat = 9999;

    // Update the UI label
    updateUILabel(uiLabel, monster);
    
    return monster;
}

// Calculate damage based on stats and elemental relations
function dealDamage(attacker, defender, physicalBase = GAME_CONFIG.physicalBase, specialBase = GAME_CONFIG.specialBase) {
    
    // Calculate physical damage
    const physicalDamage = Math.floor(
        (physicalBase * (100 + attacker.stats.pAtk)) / 
        (100 + defender.stats.pDef)
    );
    
    // Calculate special damage
    const specialDamage = Math.floor(
        (specialBase * (100 + attacker.stats.sAtk)) / 
        (100 + defender.stats.sDef)
    );
    
    // Check for elemental advantage
    let elementMultiplier = 1;
    
    // Apply elemental relationships: Plant → Earth → Electric → Water → Fire → Plant
    if (ELEMENT_RELATIONS[attacker.element].strong === defender.element) {
        elementMultiplier = 1.5; // 50% more damage
    } else if (ELEMENT_RELATIONS[attacker.element].weak === defender.element) {
        elementMultiplier = 0.67; // 33% less damage
    }

    // Add damage bonus/reduction for wild monsters based on area level
    let tempMultiplier = 1

    if (attacker.isWild) {
        tempMultiplier = tempMultiplier * (2 - (1 / (1 + (gameState.currentArea - 1) * GAME_CONFIG.wildMonsterDamageBonus)));
    }
    if (defender.isWild) {
        tempMultiplier = tempMultiplier * (1 / (1 + (gameState.currentArea - 1) * GAME_CONFIG.wildMonsterDamageReduction));
    }

    tempMultiplier = tempMultiplier * elementMultiplier;
    
    // Apply element multiplier to both damage types
    const adjustedSpecialDamage = Math.floor(specialDamage * tempMultiplier);
    const adjustedPhysicalDamage = Math.floor(physicalDamage * tempMultiplier);
    
    // Total damage
    const totalDamage = adjustedPhysicalDamage + adjustedSpecialDamage;
    
    return {
        physical: adjustedPhysicalDamage,
        special: adjustedSpecialDamage,
        total: totalDamage,
        elementMultiplier
    };
}

// Shader material for tinting textures
const tintShaderMaterial = {
    uniforms: {
        tMap: { value: null },
        tintColor: { value: new THREE.Color(1, 1, 1) }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tMap;
        uniform vec3 tintColor;
        varying vec2 vUv;
        void main() {
            vec4 texColor = texture2D(tMap, vUv);
            if (texColor.a < 0.5) discard;
            vec3 tinted = mix(texColor.rgb, texColor.rgb * tintColor, 0.6);
            gl_FragColor = vec4(tinted, texColor.a);
        }
    `
};

// Handle monster attack logic
function monsterAttack(attacker, defender, deltaTime) {
    // Check if attacker is on cooldown
    if (attacker.currentCooldown > 0) {
        return;
    }
    
    // Reset cooldown at the start
    attacker.currentCooldown = attacker.attackCooldown;
    
    // Update attacker direction to face defender
    updateMonsterDirection(attacker, defender.mesh.position.x);
    
    // Check if attacker has enough stamina
    const staminaCost = 25;
    let damageMulti = 1;
    
    if (attacker.currentStamina < staminaCost) {
        // Not enough stamina, double cooldown and don't consume stamina
        damageMulti = GAME_CONFIG.outOfStaminaDamageMultiplier;
    } else {
        // Consume stamina
        attacker.currentStamina -= staminaCost;
    }

    // Check for Double Team ability (abilId 15)
    if (defender.abilId === 15 && Math.random() < 0.2) {
        // Attack missed
        createFloatingText("Missed!", defender.mesh.position, 0xffffff);
        return;
    }
    
    // Calculate damage
    const damageResult = dealDamage(attacker, defender, GAME_CONFIG.physicalBase * damageMulti, GAME_CONFIG.specialBase * damageMulti);
    
    // Apply damage to defender
    defender.currentHP = Math.max(0, defender.currentHP - damageResult.total);
    
    // Reset time since last damage for both monsters
    attacker.timeSinceCombat = 0;
    defender.timeSinceCombat = 0;
    
    // Visual feedback for elemental interactions
    if (damageResult.elementMultiplier < 1.1 && damageResult.elementMultiplier > 0.9) {
        // Clear any existing color flash timeout and revert material
        if (defender.colorResetTimeout) {
            clearTimeout(defender.colorResetTimeout);
            defender.colorResetTimeout = null;
            if (defender.monsterMesh && defender.originalMaterial) {
                defender.monsterMesh.material = defender.originalMaterial;
            }
        }
        
        // Create a new shader material for the flash effect
        const flashMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tMap: { value: defender.originalTexture },
                tintColor: { value: new THREE.Color(1, 1, 1) }
            },
            vertexShader: tintShaderMaterial.vertexShader,
            fragmentShader: tintShaderMaterial.fragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        // Set the tint color based on effectiveness
        if (damageResult.elementMultiplier > 1) {
            flashMaterial.uniforms.tintColor.value.set(1, 0, 0);
        } else {
            flashMaterial.uniforms.tintColor.value.set(0, 0, 1);
        }
        
        // Apply the flash material
        defender.monsterMesh.material = flashMaterial;
        
        // Store the flash timeout in the monster object
        defender.colorResetTimeout = setTimeout(() => {
            if (defender.monsterMesh && defender.originalMaterial) {
                defender.monsterMesh.material = defender.originalMaterial;
                defender.colorResetTimeout = null;
            }
        }, 200);
    }
    
    // Show damage number with color based on effectiveness
    let textColor;
    if (damageResult.elementMultiplier >= 1.1) {
        // Super effective - red text
        textColor = 0xff0000;
    } else if (damageResult.elementMultiplier <= 0.9) {
        // Not very effective - blue text
        textColor = 0x0000ff;
    } else {
        // Normal effectiveness - yellow text
        textColor = 0xffff00;
    }
    
    createFloatingText(`-${damageResult.total}`, defender.mesh.position, textColor);
    
    // Update health bars
    updateUILabel(defender.uiLabel, defender);
    updateUILabel(attacker.uiLabel, attacker);
    
    // Move attacker in a random direction after attack
    const randomAngle = Math.random() * Math.PI * 2;
    const moveDistance = 5;
    attacker.mesh.position.x += Math.cos(randomAngle) * moveDistance;
    attacker.mesh.position.y += Math.sin(randomAngle) * moveDistance;
    
    // Check if defender is defeated
    if (defender.currentHP <= 0) {
        handleMonsterDefeat(defender, attacker);
    }
}

// Handle monster defeat
function handleMonsterDefeat(defeated, victor) {
    // Only process if the monster hasn't already been marked as defeated
    if (defeated.defeated) return;
    
    // Clear any color reset timeout to prevent color bugs
    if (defeated.colorResetTimeout) {
        clearTimeout(defeated.colorResetTimeout);
        defeated.colorResetTimeout = null;
    }
    
    // Reset material to original if it exists
    if (defeated.monsterMesh && defeated.originalMaterial) {
        defeated.monsterMesh.material = defeated.originalMaterial;
    }
    
    defeated.defeated = true;
    
    // Handle EXP gain if a wild monster was defeated by a player monster
    if (defeated.isWild && !victor.isWild) {
        let avgLevel= 0;
        let monstersGainedExp = 0;
        // Distribute EXP to all active player monsters
        for (const playerMonster of gameState.player.monsters) {
            if (!playerMonster.defeated) {
                handleExperienceGain(playerMonster, defeated);
                avgLevel += playerMonster.level;
                monstersGainedExp++;
            }
        }

        if (monstersGainedExp > 0) {
            avgLevel = Math.floor(avgLevel / monstersGainedExp);
        }

        //If the player's monsters are too high level, player gets no gold
        if (monstersGainedExp == 0 || avgLevel > defeated.level + 10) {
            goldReward = 0;
            addChatMessage(`No gold gained from defeating ${defeated.name}.`);
        }
        else {
            // Calculate effective level for gold reward based on rare modifiers
            let effectiveLevel = defeated.level;
            if (defeated.rareModifiers && Array.isArray(defeated.rareModifiers)) {
                effectiveLevel += defeated.rareModifiers.length * 5;
            }
        
            // Add gold based on effective level
            const goldReward = 2 + Math.ceil((effectiveLevel * (effectiveLevel + 1)) / 10);
            gameState.player.gold += goldReward;
            updateGoldDisplay();

            // Create floating gold coin animation
            createFloatingGoldCoin(defeated.mesh.position);

            addChatMessage(`Defeated ${defeated.name} for ${goldReward} gold!`);
        }

        // Reduce level to 40% (rounded up) and recalculate stats
        defeated.level = Math.max(1, Math.ceil(defeated.level * 0.4));
        
        // Get the base stats from the monster type
        const monsterType = MONSTER_TYPES[defeated.typeId];
        
        // Calculate all stats from scratch using the centralized function
        const calculatedStats = calculateMonsterStats(
            monsterType.stats, 
            defeated.level, 
            defeated.element, 
            defeated.rareModifiers, 
            defeated.spawnLevel,
            defeated.typeId,
            defeated.favoredStat
        );
        
        // Update monster with new stats
        defeated.stats = calculatedStats.stats;
        defeated.maxHP = calculatedStats.maxHP;
        defeated.maxStamina = calculatedStats.maxStamina;
        defeated.attackCooldown = calculatedStats.attackCooldown;
        
        // Update UI
        updateUILabel(defeated.uiLabel, defeated);
        
        addCaptureTarget(defeated);
    }
    
    // Handle player monster defeat - set revival timer and move to storage
    if (!defeated.isWild) {
        defeated.reviveTimer = defeated.level * 2; // 2x monster level seconds to revive

        //Notify the player that their monster was defeated and will respawn in 2x level seconds.
        addChatMessage(`${defeated.name} was defeated. Reviving in ${defeated.reviveTimer} seconds...`, 10000);
        
        // Move defeated monster to storage automatically
        const monsterIndex = gameState.player.monsters.findIndex(m => m.id === defeated.id);
        if (monsterIndex !== -1) {
            // Remove from scene
            gameState.scene.remove(defeated.mesh);
            
            // Remove from active monsters
            gameState.player.monsters.splice(monsterIndex, 1);
            
            // Add to stored monsters
            gameState.player.storedMonsters.unshift(defeated);
        }
    }
    
    // Hide the defeated monster's mesh (will be removed during cleanup for wild monsters)
    defeated.mesh.visible = false;
}

// Add a defeated wild monster to the capture targets
function addCaptureTarget(monster) {
    // Get the base size from monster type and apply the same scaling as in createMonster
    const monsterType = MONSTER_TYPES[monster.typeId];
    const monsterSize = monsterType.size * GAME_CONFIG.monsterBaseSize * 0.8; // Slightly smaller than the actual monster
    
    // Create a capture icon with the monster's image
    // Create the outer ring
    const ringGeometry = new THREE.RingGeometry(27, 33.75, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
    });
    const captureMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    
    // Create the monster sprite
    const monsterSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: monster.originalTexture,
            transparent: true,
            alphaTest: 0.5,
            rotation: Math.PI // Rotate the texture 180 degrees
        })
    );
    // Set scale
    monsterSprite.scale.set(monsterSize, monsterSize, 1);
    
    // Create a container for both the ring and sprite
    const container = new THREE.Object3D();
    container.add(captureMesh);
    container.add(monsterSprite);
    
    // Position the container at the monster's position
    container.position.copy(monster.mesh.position);
    container.position.z = 2;
    
    gameState.scene.add(container);
    
    // Add to capture targets with timeout
    const captureInfo = {
        monster,
        mesh: container,
        timeLeft: GAME_CONFIG.catchTimeout,
        clicked: false
    };
    
    gameState.captureTargets.push(captureInfo);
    
    // Add a pulsing animation to the capture icon
    const pulseTween = () => {
        if (captureInfo.timeLeft <= 0) return;
        container.scale.set(1, 1, 1);
        setTimeout(() => {
            if (captureInfo.timeLeft <= 0) return;
            container.scale.set(1.2, 1.2, 1);
            setTimeout(pulseTween, 500);
        }, 500);
    };
    pulseTween();
}

// Add monster to player's active monsters
function addMonsterToPlayer(monster) {
    // Position behind player based on slot
    const slotPosition = gameState.player.monsters.length === 0 ? 
        GAME_CONFIG.monsterFollowDistance.slot1 : 
        GAME_CONFIG.monsterFollowDistance.slot2;
    
    // Set target position behind player
    const angle = Math.atan2(
        gameState.player.position.y - monster.targetPosition.y,
        gameState.player.position.x - monster.targetPosition.x
    );
    
    monster.targetPosition.x = gameState.player.position.x - Math.cos(angle) * slotPosition;
    monster.targetPosition.y = gameState.player.position.y - Math.sin(angle) * slotPosition;
    monster.mesh.position.copy(monster.targetPosition);
    
    // Add to scene
    gameState.scene.add(monster.mesh);
    
    // Add to player's monsters
    gameState.player.monsters.push(monster);
}

// Handle experience gain from defeating monsters
function handleExperienceGain(victor, defeated) {
    // Calculate effective level based on rare modifiers
    let effectiveLevel = defeated.level;
    if (defeated.rareModifiers && Array.isArray(defeated.rareModifiers)) {
        effectiveLevel += defeated.rareModifiers.length * 5;
    }
    
    // Base EXP calculation using effective level
    let baseExp = ((4 * effectiveLevel) + 20);
    
    // Check level difference
    const levelDifference = defeated.level - victor.level;
    
    // Apply modifier based on level difference
    let expModifier = 1;
    
    // Reduce EXP for lower-level monsters
    if (levelDifference < 0) {
        // For every level below, reduce EXP by 5%
        expModifier = Math.max(0, 1 + (levelDifference * 0.05));
    } else if (levelDifference > 0) {
        // For every level above, increase EXP by 5%
        expModifier = Math.min(2, 1 + (levelDifference * 0.05));
    }
    
    // Calculate final EXP and apply the 2x bonus
    const expGain = Math.ceil(baseExp * expModifier);
    
    // Apply EXP gain
    victor.experience.current += expGain;
    
    // Show floating EXP text
    createFloatingText(`+${expGain} EXP`, victor.mesh.position, 0x00ff00);
    
    // Check for level up
    checkLevelUp(victor);
}

// Check for level up and handle it
function checkLevelUp(monster) {
    while (monster.experience.current >= monster.experience.toNextLevel) {
        // Level up the monster
        monster.level++;
        
        // Reduce current EXP by the amount needed to level up
        monster.experience.current -= monster.experience.toNextLevel;
        
        // Calculate new EXP requirement (use halved formula)
        monster.experience.toNextLevel = 25 * monster.level;
        
        // Get the base stats from the monster type
        const monsterType = MONSTER_TYPES[monster.typeId];
        
        // Calculate all stats from scratch using the centralized function
        const calculatedStats = calculateMonsterStats(
            monsterType.stats, 
            monster.level, 
            monster.element, 
            monster.rareModifiers, 
            monster.spawnLevel,
            monster.typeId,
            monster.favoredStat
        );
        
        // Store current HP and stamina percentages to maintain proportions
        const hpPercent = monster.currentHP / monster.maxHP;
        const staminaPercent = monster.currentStamina / monster.maxStamina;
        
        // Update monster with new stats
        monster.stats = calculatedStats.stats;
        monster.maxHP = calculatedStats.maxHP;
        monster.maxStamina = calculatedStats.maxStamina;
        monster.attackCooldown = calculatedStats.attackCooldown;
        
        // Restore HP and stamina proportionately
        monster.currentHP = Math.round(monster.maxHP * hpPercent);
        monster.currentStamina = Math.round(monster.maxStamina * staminaPercent);
        
        // Show visual feedback
        createFloatingText(`LEVEL UP! ${monster.level}`, monster.mesh.position, 0xffff00);
        
        // Update UI
        updateUILabel(monster.uiLabel, monster);
    }
} 

function inCombat(monster) {
    return monster.timeSinceCombat < GAME_CONFIG.combatStatusTime;
}