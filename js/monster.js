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
    canvas.width = 400; // Even wider for larger name text
    canvas.height = 110; // Taller for larger name text
    const context = canvas.getContext('2d');
    
    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    
    // Create a sprite with the texture
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(150, 45, 1); // Larger scale for bigger text
    sprite.position.y = 70; // Position higher above the monster
    sprite.position.z = 1; // Ensure UI is above monster
    
    return { sprite, context, texture };
}

// Update HP, Stamina bars, Level display, and Name
function updateUILabel(monster) {
    const uiLabel = monster.uiLabel;
    // --- Optimization: Don't update UI for certain states --- 
    if (monster.defeated) return; // Exit if defeated
    if (gameState.player.storedMonsters.includes(monster)) return; // Exit if stored
    // Exit if the monster is a capture target (check by ID)
    const isCaptureTarget = gameState.captureTargets.some(target => target.monster.id === monster.id);
    if (isCaptureTarget) return;
    // --- End Optimization ---
    
    const { context, texture } = uiLabel;
    const canvas = context.canvas;
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Reset font for the name
    context.font = '45px Arial';
    
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
        displayName += modifiers.length;
    }
    
    if (!MONSTER_ABILITIES[monster.abilId]) {
        monster.abilId = null;
    }
    
    // Add "!" to name if monster has an inherited ability
    if (monster.abilId != MONSTER_TYPES[monster.typeId].abilId && monster.abilId != null) {
        displayName = "!" +displayName;
    }
    
    context.textAlign = 'center';
    
    // Calculate color based on number of modifiers
    let nameColor;
    if (!modifiers || modifiers.length === 0) {
        nameColor = 'white';
    } else {
        // Three-stage color transition based on number of modifiers
        const modifierCount = modifiers.length;
        
        if (modifierCount <= 5) {
            // Stage 1: White to Gold (1-5 mods)
            const ratio = modifierCount / 5;
            const r = 255; // Red stays at 255
            const g = Math.round(255 - (255 - 215) * ratio);
            const b = Math.round(255 - (255 - 0) * ratio);
            nameColor = `rgb(${r}, ${g}, ${b})`;
        } else if (modifierCount <= 10) {
            // Stage 2: Gold to Red (6-10 mods)
            const ratio = (modifierCount - 5) / 5;
            const r = 255; // Red stays at 255
            const g = Math.round(215 - (215 - 0) * ratio);
            const b = Math.round(0 - (0 - 0) * ratio);
            nameColor = `rgb(${r}, ${g}, ${b})`;
        } else {
            // Stage 3: Red to Purple (11-15 mods)
            const ratio = Math.min((modifierCount - 10) / 5, 1);
            const r = Math.round(255 - (255 - 128) * ratio);
            const g = 0; // Green stays at 0
            const b = Math.round(0 - (0 - 128) * ratio);
            nameColor = `rgb(${r}, ${g}, ${b})`;
        }
    }
    
    context.strokeStyle = 'black';
    context.strokeText(displayName, canvas.width / 2, 30);
    context.fillStyle = nameColor;
    context.fillText(displayName, canvas.width / 2, 30);
    
    // HP bar
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(75, 45, canvas.width - 150, 12);
    
    const hpPercent = Math.max(0, monster.currentHP / monster.maxHP);
    context.fillStyle = hpPercent > 0.5 ? 'lime' : hpPercent > 0.2 ? 'yellow' : 'red';
    context.fillRect(77, 47, (canvas.width - 154) * hpPercent, 8);
    
    // Stamina bar
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(75, 60, canvas.width - 150, 12);
    
    const staminaPercent = Math.max(0, monster.currentStamina / monster.maxStamina);
    context.fillStyle = 'skyblue';
    context.fillRect(77, 62, (canvas.width - 154) * staminaPercent, 8);
    
    // Level display with element color
    let elementColor = ELEMENT_COLORS[monster.element];
    let color = new THREE.Color(elementColor);

    // Check if monster is typeshifted (element different from original)
    const isTypeshifted = monster.element !== MONSTER_TYPES[monster.typeId].element;
    if (isTypeshifted) {
        // Draw first part of outline for level text
        context.lineWidth = 4;
        context.fillStyle = `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 1)`;
        context.fillRect(160, 74, 80, 20);
        // Use element color for text when typeshifted
        elementColor = ELEMENT_COLORS[MONSTER_TYPES[monster.typeId].element];
        color = new THREE.Color(elementColor);
        // Draw second part of outline for level text
        context.fillStyle = `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 1)`;
        context.fillRect(160, 94, 80, 15);
    }
    else {
        // Draw an outline for level text
        context.lineWidth = 4;
        context.fillStyle = `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 1)`;
        context.fillRect(160, 74, 80, 35);
    }

    // Use white for text
    context.fillStyle = 'white';
    context.strokeStyle = 'black';

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Show level number
    context.font = 'bold 35px Arial';
    context.strokeText(monster.level, 200, 93);
    context.fillText(monster.level, 200, 93);
    
    // Update the texture
    texture.needsUpdate = true;
}

// Calculate monster stats from base values, level, element, and rare modifiers
function calculateMonsterStats(baseStats, level, element, rareModifiers, spawnLevel = 0, typeId = null, favoredStat = null, abilId = null) {
    // Create copies to avoid modifying original objects
    let stats = {};
    const originalElement = MONSTER_TYPES[typeId].element;

    if (!element || element == "") {
        element = originalElement;
    }

    const typeShifted = element !== originalElement;
    
    // Apply spawn level adjustment to base stats
    const baseStatAdjustment = 1 / (1 + spawnLevel / 100);
    const statGainMultiplier = 1 + (level+spawnLevel-Math.abs(level-spawnLevel)) / 130;
    
    // Create a mutable copy of base stats to apply flat bonuses first
    let modifiedBaseStats = { ...baseStats };

    // Apply flat typeshift bonus before other multipliers
    if (typeShifted) {
        const typeShiftBonuses = ELEMENT_TYPESHIFT_STATS[element];
        if (typeShiftBonuses) { // Check if bonuses exist for the element
            Object.keys(typeShiftBonuses).forEach(stat => {
                if (modifiedBaseStats[stat] !== undefined) { // Check if the stat exists on the monster
                    modifiedBaseStats[stat] += typeShiftBonuses[stat];
                }
            });
        }
    }

    // Step 1: Start with adjusted base stats
    Object.keys(modifiedBaseStats).forEach(stat => {
        stats[stat] = Math.round(modifiedBaseStats[stat] * baseStatAdjustment);
    });

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
    const originalElementMods = ELEMENT_MODIFIERS[originalElement];
    const currentElementMods = ELEMENT_MODIFIERS[element];
    
    // Combine element modifiers before applying them
    const totalElementModifiers = {};
    
    // Initialize total modifiers with current element
    Object.keys(currentElementMods).forEach(stat => {
        totalElementModifiers[stat] = currentElementMods[stat];
    });
    
    // If element is different from original, add original element modifiers
    if (typeShifted) {
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

    //Determine attack cooldown based on typeId
    let attackCooldown = GAME_CONFIG.defaultAttackCooldown;
    if (MONSTER_TYPES[typeId].atkCd) {
        attackCooldown = MONSTER_TYPES[typeId].atkCd;
    }
    
    // Apply Rotund ability 8
    let maxHP = GAME_CONFIG.monsterBaseHP;
    let maxStamina = GAME_CONFIG.monsterBaseStamina;
    if (typeId === 8 || abilId === 8) {
        maxHP = Math.round(maxHP * (1 + MONSTER_ABILITIES[8].value));
        maxStamina = Math.round(maxStamina * (1 - MONSTER_ABILITIES[8].value));
    }

    // Step 6: Calculate derived stats
    maxHP = Math.round(maxHP * (1 + 0.4 * stats.endur / 100));
    maxStamina = Math.round(maxStamina * (1 + 0.4 * stats.endur / 100));
    attackCooldown = attackCooldown / (1 + GAME_CONFIG.speedAttackScaling * stats.spd); // Base cooldown, reduced by speed stat
    
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
function createMonster(typeId, level = 1, rareModifiers = null, team = 1, spawnLevel = 0, tempElement, favoredStat = null, masterId = null, inheritedAbilId = null) {
    const monsterType = MONSTER_TYPES[typeId];

    if (!tempElement || tempElement == "") {
        tempElement = MONSTER_TYPES[typeId].element
    }

    // Wild monsters (team 1) have a 15% chance to spawn as a random element (typeshifting)
    // and a 10% chance to inherit an ability from a random monster type if not typeshifted
    if (team === 1) {
        if (Math.random() < 0.15) {
            tempElement = ELEMENTS[Math.floor(Math.random() * (ELEMENTS.length - 1))]; // -1 because of Neutral type "Balance"
        } else if (Math.random() < 0.1) {
                inheritedAbilId = Math.floor(Math.random() * 35) + 1; // 35 possible abilities included for now
        }
    }
    
    // Do not allow two of the same ability
    if (inheritedAbilId === typeId) {
        inheritedAbilId = null;
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
        favoredStat,
        inheritedAbilId
    );

    // Create the monster's visual representation using a plane with texture
    const baseSize = monsterType.size ?? 1; // Default size to 1 if not specified
    const size = baseSize * GAME_CONFIG.monsterBaseSize * calculatedStats.sizeMultiplier;
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
    
    gameState.monsterIdFixer ++;

    // Monster object
    const monster = {
        id: Date.now() + Math.random() + gameState.monsterIdFixer,
        typeId,
        abilId: inheritedAbilId ?? monsterType.abilId ?? null,
        name: monsterType.name,
        element: tempElement,
        level,
        rareModifiers,
        team,
        masterId: masterId,
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
        inCombat: false,
        timeSinceDamageTaken: 9999,
        timeSinceDamageDealt: 9999,
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
        glowSprite: null, // Initialize glow sprite
    };

    // Update the UI label
    updateUILabel(monster);
    
    // Add floating element sphere if element is different from default
    const defaultElement = MONSTER_TYPES[typeId].element;
    if (monster.element !== defaultElement) {
        const sphereRadius = 8; // Size of the sphere
        const elementColor = ELEMENT_COLORS[monster.element];
        const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 16, 16);
        const sphereMaterial = new THREE.MeshBasicMaterial({ 
            color: elementColor, 
            transparent: true, 
            opacity: 0.8 
        });
        const elementSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        
        // Initialize random position within bounds relative to container
        elementSphere.position.x = (Math.random() - 0.5) * 100; // -50 to +50
        elementSphere.position.y = (Math.random() - 0.5) * 100; // -50 to +50
        elementSphere.position.z = (Math.random() - 0.5) * 1;   // -0.5 to +0.5 (relative to monster sprite at z=1)

        // Add sphere to the container (which is monster.mesh)
        container.add(elementSphere);
        
        // Store reference and movement data on the main monster object
        monster.elementSphere = elementSphere;
        monster.elementSphereTarget = new THREE.Vector3().copy(elementSphere.position); // Initial target is current position
        monster.elementSphereMoveTimer = Math.random() * 2 + 1; // Initial timer (1-3 seconds)
    }

    // Set initial HP/Stamina
    monster.currentHP = monster.maxHP;
    
    return monster;
}

// Calculate damage based on stats and elemental relations
function dealDamage(attacker, defender, physicalBase = 0, specialBase = 0, isAttack = false) {

    if (isAttack) {
        // Ability 12: Magic Thorns reflects 25% of attack special damage taken before reduction
        if (hasAbility(defender, 12)) {
            dealDamage(defender, attacker, 0, specialBase * MONSTER_ABILITIES[12].value, false);
        }
        // Ability 31: Beautiful but Deadly - When attacked, deals special damage in retaliation.
        if (hasAbility(defender, 31)) {
            const retaliationDamage = MONSTER_ABILITIES[31].value * (1 + 0.01 * defender.stats.sAtk);
            dealDamage(defender, attacker, 0, retaliationDamage, false);
        }
    }

    // Ability 11: Vengeance
    if (hasAbility(attacker, 11) && attacker.timeSinceDamageTaken < MONSTER_ABILITIES[11].time) {
        physicalBase = physicalBase * MONSTER_ABILITIES[11].value;
        specialBase = specialBase * MONSTER_ABILITIES[11].value;
    }

    // Calculate physical damage reduction
    const physicalDamage = Math.floor(
        (physicalBase / (1 + (defender.stats.pDef / 100)))
    );
    
    // Calculate special damage reduction
    const specialDamage = Math.floor(
        (specialBase / (1 + (defender.stats.sDef / 100)))
    );
    
    // Check for elemental advantage
    let elementMultiplier = 1;
    
    // Apply elemental relationships: Plant → Earth → Electric → Water → Fire → Plant
    if (ELEMENT_RELATIONS[attacker.element].strong === defender.element) {
        elementMultiplier = 1.5; // 50% more damage
    } else if (ELEMENT_RELATIONS[attacker.element].weak === defender.element) {
        elementMultiplier = 0.67; // 33% less damage
    }

    // Ability 1 - Infertile - Takes 20% less damage from plant element enemies.
    if (hasAbility(defender, 1) && (attacker.element === "Plant" || MONSTER_TYPES[attacker.typeId].element === "Plant")) {
        elementMultiplier = elementMultiplier * MONSTER_ABILITIES[1].value;
    }

    // Ability 2 - Greek Fire - Deals 25% more damage to water element enemies.
    if (hasAbility(attacker, 2) && (defender.element === "Water" || MONSTER_TYPES[defender.typeId].element === "Water")) {
        elementMultiplier = elementMultiplier * MONSTER_ABILITIES[2].value;
    }

    // Ability 10 - Extinguisher - Deals 25% more damage to fire element enemies.
    if (hasAbility(attacker, 10) && (defender.element === "Fire" || MONSTER_TYPES[defender.typeId].element === "Fire")) {
        elementMultiplier = elementMultiplier * MONSTER_ABILITIES[10].value;
    }

    // Ability 18 - Waterproof - Takes 20% less damage from water element enemies.
    if (hasAbility(defender, 18) && (attacker.element === "Water" || MONSTER_TYPES[attacker.typeId].element === "Water")) {
        elementMultiplier = elementMultiplier * MONSTER_ABILITIES[18].value;
    }

    // Add damage bonus/reduction for wild monsters (team 1) based on area level
    let tempMultiplier = 1

    if (attacker.team === 1) {
        tempMultiplier = tempMultiplier * (2 - (1 / (1 + (gameState.currentArea - 1) * GAME_CONFIG.wildMonsterDamageBonus)));
    }
    if (defender.team === 1) {
        tempMultiplier = tempMultiplier * (1 / (1 + (gameState.currentArea - 1) * GAME_CONFIG.wildMonsterDamageReduction));
    }
    
    // Apply multipliers to both damage types
    let adjustedSpecialDamage = Math.floor(specialDamage * tempMultiplier * elementMultiplier);
    let adjustedPhysicalDamage = Math.floor(physicalDamage * tempMultiplier * elementMultiplier);

    // Ability 7 - Stomper - Deals 25% more physical damage to enemies below 50% HP.
    if (hasAbility(attacker, 7) && defender.currentHP < defender.maxHP * MONSTER_ABILITIES[7].threshold) {
        adjustedPhysicalDamage = adjustedPhysicalDamage * MONSTER_ABILITIES[7].value;
    }
    
    // Total damage
    let totalDamage = adjustedPhysicalDamage + adjustedSpecialDamage;

    // Ability 3 - Between a Rock.. - Takes 5% less damage from enemies per level higher they are.
    if (hasAbility(defender, 3) && (attacker.level > defender.level)) {
        totalDamage /= 1 + (attacker.level - defender.level) * MONSTER_ABILITIES[3].value;
    }

    // Ability 9003 - ..And a Hard Place - Deals 5% increased damage to enemies per level higher they are.
    if (hasAbility(attacker, 9003) && (defender.level > attacker.level)) {
        totalDamage *= 1 + (1 / (1 + (defender.level - attacker.level) * MONSTER_ABILITIES[9003].value));
    }

    // Apply Hardened Skin ability 17
    if (hasAbility(defender, 17) && totalDamage > 10) {
        totalDamage = Math.max(MONSTER_ABILITIES[17].value, totalDamage - MONSTER_ABILITIES[17].value);
    }

    totalDamage = Math.ceil(totalDamage);
    
    // Apply damage to defender
    defender.currentHP = Math.max(0, defender.currentHP - totalDamage);

    // Apply ensnaring ability 5
    if (hasAbility(attacker, 5)) {
        defender.currentStamina = Math.max(0, defender.currentStamina - (totalDamage * MONSTER_ABILITIES[5].value));
    }

    // Ability 20 - Hydra - Upon 0 HP, spends all its stamina to swap HP and staminaif stamina > 10%.
    if (hasAbility(defender, 20) && defender.currentHP <= 0 && defender.currentStamina > (MONSTER_ABILITIES[20].threshold * defender.maxStamina)) {
        defender.currentHP = defender.maxHP * (defender.currentStamina / defender.maxStamina);
        defender.currentStamina = 0;
    }

    // Set both monsters to be in combat
    defender.timeSinceDamageTaken = 0;
    attacker.timeSinceDamageDealt = 0;

    // Physical Drain ability 16
    if (hasAbility(attacker, 16)) {
        attacker.currentHP = Math.min(attacker.maxHP, attacker.currentHP + (adjustedPhysicalDamage * MONSTER_ABILITIES[16].value));
    }

    // Special Drain ability 19
    if (hasAbility(attacker, 19)) {
        attacker.currentHP = Math.min(attacker.maxHP, attacker.currentHP + (adjustedSpecialDamage * MONSTER_ABILITIES[19].value));
    }

    // Ability 35 - Static Charge - gains 15% of physical damage taken as stamina
    if (hasAbility(defender, 35)) {
        defender.currentStamina += adjustedPhysicalDamage * MONSTER_ABILITIES[35].value;
    }

    // Visual feedback for elemental interactions
    if (elementMultiplier < 1.1 && elementMultiplier > 0.9) {
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
        if (elementMultiplier > 1) {
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
    if (elementMultiplier >= 1.1) {
        // Super effective - red text
        textColor = 0xff0000;
    } else if (elementMultiplier <= 0.9) {
        // Not very effective - blue text
        textColor = 0x0000ff;
    } else {
        // Normal effectiveness - yellow text
        textColor = 0xffff00;
    }
    
    createFloatingText(`-${totalDamage}`, defender.mesh.position, textColor);
    
    // Update health bars
    updateUILabel(defender);
    updateUILabel(attacker);
    
    // Check if defender is defeated
    if (defender.currentHP <= 0) {
        handleMonsterDefeat(defender, attacker);
    }
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
function monsterAttack(attacker, defender) {
    // Check if attacker is on cooldown
    if (attacker.currentCooldown > 0) {
        return;
    }
    
    // Add attack cooldown to current cooldown to enable accurate attack rate
    attacker.currentCooldown += attacker.attackCooldown;
    
    // Use weighted random target selection to potentially choose a different target
    const targetResult = selectWeightedRandomTarget(attacker);
    if (!targetResult) {
        // No valid targets found, return early
        return;
    }
    
    // Use the selected target instead of the provided defender
    defender = targetResult.target;

    // Ability 21 - Glancing Blows - Adds time to enemy attack cooldown when attacked
    if (hasAbility(defender, 21)) {
        attacker.attackCooldown += MONSTER_ABILITIES[21].value;
    }
    
    // Update attacker direction to face defender
    updateMonsterDirection(attacker, defender.mesh.position.x);
    
    // Check if attacker has enough stamina
    let staminaCost = GAME_CONFIG.defaultStaminaCost;
    let staminaDmgMulti = 1;

    // Set stamina multiplier equal to ratio of attack cooldown to default attack cooldown
    if (MONSTER_TYPES[attacker.typeId].atkCd) {
        let staminaMulti = 1 * (MONSTER_TYPES[attacker.typeId].atkCd / GAME_CONFIG.defaultAttackCooldown);
        staminaCost = staminaCost * staminaMulti;
    }
    
    if (attacker.currentStamina < staminaCost) {
        if (hasAbility(attacker, 9) && attacker.currentHP > staminaCost) {
            attacker.currentHP -= staminaCost; // Ability 9: Unrelenting - spends HP instead of stamina
        }
        else {
            // Not enough stamina, double cooldown and don't consume stamina
            staminaDmgMulti = GAME_CONFIG.outOfStaminaDamageMultiplier;
        }
    } else {
        attacker.currentStamina -= staminaCost;
    }

    // Modify physical and special base damage based on MONSTER_TYPES[attacker.typeId].atkCd (attack cooldown)
    let tempPhysicalDmg = GAME_CONFIG.physicalBase;
    let tempSpecialDmg = GAME_CONFIG.specialBase;
    if (MONSTER_TYPES[attacker.typeId].atkCd) {
        tempPhysicalDmg = tempPhysicalDmg * (MONSTER_TYPES[attacker.typeId].atkCd / GAME_CONFIG.defaultAttackCooldown);
        tempSpecialDmg = tempSpecialDmg * (MONSTER_TYPES[attacker.typeId].atkCd / GAME_CONFIG.defaultAttackCooldown);
    }

    // Boost outgoing damage
    tempPhysicalDmg = tempPhysicalDmg * (1 + (attacker.stats.pAtk / 100));
    tempSpecialDmg = tempSpecialDmg * (1 + (attacker.stats.sAtk / 100));

    // Calculate damage
    dealDamage(attacker, defender, tempPhysicalDmg * staminaDmgMulti, tempSpecialDmg * staminaDmgMulti, true);
    
    // Move attacker in a random direction after attack
    const randomAngle = Math.random() * Math.PI * 2;
    const moveDistance = 5;
    attacker.mesh.position.x += Math.cos(randomAngle) * moveDistance;
    attacker.mesh.position.y += Math.sin(randomAngle) * moveDistance;
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
    
    // --- Check if this was the last monster for a boss --- 
    if (defeated.team === 2 && defeated.masterId) {
        // Get all monsters associated with this master
        const associatedMonsters = gameState.bossMonsters.filter(m => m.masterId === defeated.masterId);
        // Check if ALL associated monsters are now defeated
        const allDefeated = associatedMonsters.every(m => m.defeated);
        
        if (allDefeated) {
            console.log(`All monsters for Boss Master ${defeated.masterId} defeated.`);
            gameState.inBossFight = Math.max(0, gameState.inBossFight - 1); // Decrement boss fight counter
            addChatMessage(`Binder Master ${defeated.masterId} defeated!`, 5000);
            
            // Optional: Add reward logic here for defeating a boss master?
        }
    }
    // --- End Boss Monster Check --- 
    
    // Handle EXP gain if a wild monster (team 1) was defeated by a player monster (team 0)
    if (defeated.team === 1 && victor.team === 0) {
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
                effectiveLevel += defeated.rareModifiers.length * GAME_CONFIG.rareModLevelWeight;
            }
        
            // Add gold based on effective level
            const goldReward = 4 + Math.ceil(Math.pow(effectiveLevel / 2, 1.6));
            gameState.player.gold += goldReward;
            updateGoldDisplay();

            // Create floating gold coin animation
            createFloatingGoldCoin(defeated.mesh.position);

            addChatMessage(`Defeated ${defeated.name} for ${goldReward} gold!`);
        }

        // Reduce level to 40% (rounded up) and recalculate stats
        defeated.level = Math.max(1, Math.ceil(defeated.level * GAME_CONFIG.catchLevelPenalty));
        
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
            defeated.favoredStat,
            defeated.abilId
        );
        
        // Update monster with new stats
        defeated.stats = calculatedStats.stats;
        defeated.maxHP = calculatedStats.maxHP;
        defeated.maxStamina = calculatedStats.maxStamina;
        defeated.attackCooldown = calculatedStats.attackCooldown;
        
        // Update UI
        updateUILabel(defeated);
        
        addCaptureTarget(defeated);
    }
    
    // Handle player monster defeat (team 0) - set revival timer and move to storage
    if (defeated.team === 0) {
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
    const baseSize = monsterType.size ?? 1; // Default size to 1 if not specified
    const monsterSize = baseSize * GAME_CONFIG.monsterBaseSize * 0.8; // Slightly smaller than the actual monster
    
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

    // Update UI label for the monster
    updateUILabel(monster);
}

// Handle experience gain from defeating monsters
function handleExperienceGain(victor, defeated) {
    // Calculate effective level based on rare modifiers
    let effectiveLevel = defeated.level;
    if (defeated.rareModifiers && Array.isArray(defeated.rareModifiers)) {
        effectiveLevel += defeated.rareModifiers.length * GAME_CONFIG.rareModLevelWeight;
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

    // Apply growth spurt ability 4
    if (hasAbility(victor, 4)) {
        expModifier *= MONSTER_ABILITIES[4].value;
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
        // Check if monster is already at max level
        if (monster.level >= GAME_CONFIG.maxLevel) {
            // If at max level, just set experience to 0 and break
            monster.experience.current = 0;
            break;
        }
        
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
            monster.favoredStat,
            monster.abilId
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
        createFloatingText(`LEVEL UP! ${monster.level}`, monster.mesh.position, 0xffff00, -0.5);
        
        // Update UI
        updateUILabel(monster);
    }
}

function inCombat(monster) {
    if (gameState.inBossFight > 0) return true;
    if (monster.aggroTarget) return true;
    return monster.timeSinceDamageTaken < GAME_CONFIG.combatStatusTime || monster.timeSinceDamageDealt < GAME_CONFIG.combatStatusTime;
}

// Helper function to select a random enemy with distance-based weighting
function selectWeightedRandomTarget(attacker) {
    // Filter out invalid targets
    const potentialTargets = [...gameState.wildMonsters, ...gameState.player.monsters, ...gameState.bossMonsters];
    let attackMissed = false;

    const validTargets = potentialTargets.filter(target => {
        let filterReason = "";
        // Basic validity checks
        if (target.defeated) { filterReason = "Defeated"; }
        else if (target.team === attacker.team) { filterReason = `Same Team (${target.team})`; }

        // Check if target is within attack range
        const distance = attacker.mesh.position.distanceTo(target.mesh.position);
        const inRange = distance <= GAME_CONFIG.attackRange;
        if (!inRange && !filterReason) { filterReason = `Out of Range (Dist: ${distance.toFixed(1)}, Range: ${GAME_CONFIG.attackRange})`; } // Added distance info

        if (!filterReason) {
            // Check for Distracting Presence ability 15
            if (inRange && hasAbility(target, 15) && Math.random() < MONSTER_ABILITIES[15].value) {
                attackMissed = true; // Mark that the attack will miss
            }
        }

        return !filterReason; // Return true if no filterReason was set
    });

    // If attack missed
    if (attackMissed) {
        createFloatingText("Missed!", attacker.mesh.position, 0xffffff, -0.5);
        return null; // Return null to signify a missed attack
    }

    if (validTargets.length === 0) {
        return null;
    }

    // Calculate distances and weights for each target
    const targetWeights = validTargets.map(target => {
        const distance = attacker.mesh.position.distanceTo(target.mesh.position);
        // This makes closer targets more likely to be chosen
        return {
            target,
            distance,
            weight: 1 / (distance ** 1.5)
        };
    });

    // Calculate total weight
    const totalWeight = targetWeights.reduce((sum, tw) => sum + tw.weight, 0);

    // Generate random value between 0 and total weight
    let random = Math.random() * totalWeight;

    // Select target based on weights
    for (const tw of targetWeights) {
        random -= tw.weight;
        if (random <= 0) {
            return {
                target: tw.target,
                distance: tw.distance
            };
        }
    }

    // Fallback to last target if we somehow didn't select one
    const fallbackTarget = targetWeights[targetWeights.length - 1];
    return {
        target: fallbackTarget.target,
        distance: fallbackTarget.distance
    };
}

// Function to check if a monster has an ability naturally or has gained it
function hasAbility(monster, abilityId) {
    return abilityId === monster.typeId || abilityId === monster.abilId;
}