// Initialize Three.js
let backgroundMusic;
let musicInitialized = false;

function initMusic() {
    backgroundMusic = new Audio('assets/sound/Music.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5;
}

function startMusicOnFirstInput() {
    if (!musicInitialized) {
        backgroundMusic.play();
        musicInitialized = true;
        // Remove all the input event listeners for music start
        document.removeEventListener('click', startMusicOnFirstInput);
        document.removeEventListener('keydown', startMusicOnFirstInput);
        document.removeEventListener('touchstart', startMusicOnFirstInput);
    }
}

function initThree() {
    // Create scene
    gameState.scene = new THREE.Scene();
    gameState.scene.background = new THREE.Color(0x66aa66); // Green background for grass
    
    // Create camera
    const aspectRatio = window.innerWidth / window.innerHeight;
    
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Adjust view size for mobile devices
    const viewSize = isMobile ? GAME_CONFIG.baseViewSize * 1.5 : GAME_CONFIG.baseViewSize;
    
    gameState.camera = new THREE.OrthographicCamera(
        -viewSize * aspectRatio, viewSize * aspectRatio,
        viewSize, -viewSize,
        1, 1000
    );
    gameState.camera.position.set(0, 0, 500);
    gameState.camera.lookAt(0, 0, 0);
    
    // Create renderer
    gameState.renderer = new THREE.WebGLRenderer({ 
        antialias: true
    });
    
    // Use a higher pixel ratio to maintain quality when zoomed out
    gameState.renderer.setPixelRatio(window.devicePixelRatio * 1);

    gameState.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(gameState.renderer.domElement);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const aspectRatio = window.innerWidth / window.innerHeight;
        const viewSize = isMobile ? GAME_CONFIG.baseViewSize * 2 : GAME_CONFIG.baseViewSize;
        gameState.camera.left = -viewSize * aspectRatio;
        gameState.camera.right = viewSize * aspectRatio;
        gameState.camera.updateProjectionMatrix();
        gameState.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Update pixel ratio on resize for mobile
        gameState.renderer.setPixelRatio(window.devicePixelRatio * 1);
    });
    
    // Add mouse/touch state tracking
    gameState.isMouseDown = false;
    gameState.lastMousePosition = new THREE.Vector2();
    
    // Add event listeners for click/touch controls
    gameState.renderer.domElement.addEventListener('click', handleClick);
    gameState.renderer.domElement.addEventListener('mousedown', handleMouseDown);
    gameState.renderer.domElement.addEventListener('mousemove', handleMouseMove);
    gameState.renderer.domElement.addEventListener('mouseup', handleMouseUp);
    gameState.renderer.domElement.addEventListener('touchstart', handleTouch);
    gameState.renderer.domElement.addEventListener('touchmove', handleTouchMove);
    gameState.renderer.domElement.addEventListener('touchend', handleTouchEnd);
    
    // Add capture button event listener
    document.getElementById('captureButton').addEventListener('click', handleCapture);
    
    // Add storage button event listener
    document.getElementById('storageButton').addEventListener('click', toggleStorageUI);
    
    // Add close button event listener for storage UI
    document.querySelector('#storageUI .close-button').addEventListener('click', toggleStorageUI);
}

// Initialize player
function initPlayer() {
    // Create player visual
    const geometry = new THREE.CircleGeometry(12, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const playerMesh = new THREE.Mesh(geometry, material);
    playerMesh.position.z = 2; // Above ground
    gameState.scene.add(playerMesh);
    
    // Store player mesh
    gameState.player.mesh = playerMesh;
    
    // Create starter monster (Stupid Fish) with all rare modifiers
    const starterMonster = createMonster(1, 5, ["Strong"], false, 0, "Earth");
    //const starterMonster = createMonster(1, 5, ["Smooth", "Sharp", "Witty", "Shocking", "Athletic", "Strong", "Sturdy", "Slick", "Tough", "Decisive", "Aggressive", "Determined", "Smart", "Stoic", "Thoughtful"], false, 0, "Earth");

    // Add to player's monsters
    addMonsterToPlayer(starterMonster);
    
    // Check if user is on mobile and show warning
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        addChatMessage("Use the button in the top left of the menu to play/pause music.", 10000);
    } else {
        addChatMessage("Welcome to the game! Press M to play/pause the music, or use the button in the top left of the Menu.", 30000)
    }
}

// Main game loop
function gameLoop(time) {
    // Calculate delta time
    const deltaTime = (time - gameState.lastTime) / 1000; // Convert to seconds
    gameState.lastTime = time;
    let paused = false;

    // Check if any UI is open
    if (gameState.storageUIOpen) {
        paused = true;
    }

    // Pause game if any UI is open
    if (paused) {
        // Render the scene
        gameState.renderer.render(gameState.scene, gameState.camera);
    
        // Continue the game loop
        requestAnimationFrame(gameLoop);
        return
    }
    
    // Cap delta time to prevent physics issues after tab switching
    const cappedDeltaTime = Math.min(deltaTime, 0.1);
    
    // Update player movement
    updatePlayerMovement(cappedDeltaTime);
    
    // Update player grace period timer
    if (gameState.player.gracePeriodTimer > 0) {
        gameState.player.gracePeriodTimer -= cappedDeltaTime;
    }
    
    // Update monster following
    updateMonsterFollowing(cappedDeltaTime);
    
    // Check for combat conditions
    checkCombatRange();
    
    // Update wild monster aggro behaviors
    updateWildMonsterAggro(cappedDeltaTime);
    
    // Update combat logic
    updateCombat(cappedDeltaTime);
    
    // Update direction arrow
    updateDirectionArrow();
    
    // Check for next area transition
    checkAreaTransition();
    
    // Update stamina regeneration
    updateStaminaRegen(cappedDeltaTime);
    
    // Update HP regeneration
    updateHPRegen(cappedDeltaTime);
    
    // Update capture targets
    updateCaptureTargets(cappedDeltaTime);
    
    // Update monster revival
    updateMonsterRevival(cappedDeltaTime);
    
    // Update monster cooldowns
    updateMonsterCooldowns(cappedDeltaTime);
    
    // Cleanup defeated monsters and handle respawns
    cleanupDefeatedMonsters(cappedDeltaTime);
    
    // Render the scene
    gameState.renderer.render(gameState.scene, gameState.camera);
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

// Initialize the game
function init() {
    // Initialize Three.js
    initThree();
    
    // Load monster textures
    loadMonsterTextures();
    
    // Initialize player
    initPlayer();
    
    // Initialize music but don't play yet
    initMusic();
    
    // Add event listeners for first input
    document.addEventListener('click', startMusicOnFirstInput);
    document.addEventListener('keydown', startMusicOnFirstInput);
    document.addEventListener('touchstart', startMusicOnFirstInput);
    
    // Make sure starter monster uses correct EXP formula
    for (const monster of gameState.player.monsters) {
        monster.experience.toNextLevel = 25 * monster.level;
    }
    
    // Set random position for next area entrance
    setRandomNextAreaPosition();
    
    // Spawn wild monsters (Area Level 1)
    spawnWildMonsters(1, null); // Use null to calculate based on density
    
    // Add exit marker
    addAreaExit();
    
    // Initialize storage UI
    initStorageUI();
    
    // Set up UI event handlers
    setupUIEventHandlers();
    
    // Start the game loop
    gameState.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

// Start the game when the page is loaded
window.addEventListener('load', () => {
    init();
});

// Check if a click is on any UI element
function isClickingUI(event) {
    // Get the correct x and y coordinates whether from mouse or touch event
    let clientX, clientY;
    
    // Check if it's a touch event
    if (event.touches && event.touches.length > 0) {
        // Use the first touch point
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        // Use mouse coordinates
        clientX = event.clientX;
        clientY = event.clientY;
    }
    
    // Check if clicking on any UI element
    const uiElements = [
        document.getElementById('captureUI'),
        document.getElementById('storageUI'),
    ];
    
    // Check if click is within any UI element
    for (const element of uiElements) {
        if (element && element.style.display === 'block') {
            const rect = element.getBoundingClientRect();
            if (clientX >= rect.left && clientX <= rect.right &&
                clientY >= rect.top && clientY <= rect.bottom) {
                return true;
            }
        }
    }
    
    // Check if clicking on any button or interactive element
    const target = event.target;
    if (target.tagName === 'BUTTON' || 
        target.tagName === 'INPUT' || 
        target.tagName === 'SELECT' || 
        target.classList.contains('monster-card') ||
        target.closest('.monster-card')) {
        return true;
    }
    
    return false;
}

// Handle click events to move player
function handleClick(event) {
    event.preventDefault();
    
    // Don't process clicks if clicking on UI elements
    if (isClickingUI(event)) {
        gameState.isMouseDown = false;
        return;
    }
    
    // Don't process clicks if storage UI is open
    if (gameState.storageUIOpen) {
        return;
    }
    
    // Check if capture UI is open
    const captureUIOpen = document.getElementById('captureUI').style.display === 'block';
    
    // Convert mouse position to world coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Raycasting to get clicked position
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, gameState.camera);
    
    // Calculate intersection with z=0 plane
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const targetPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, targetPoint);
    
    // Check if clicked on a capture target
    for (const target of gameState.captureTargets) {
        const distanceToTarget = targetPoint.distanceTo(target.mesh.position);
        
        if (distanceToTarget < 20) {
            if (!target.clicked) {
                showCaptureUI(target);
            }
            return; // Always return if clicked on a capture target, regardless of UI state
        }
    }
    
    // Hide capture UI if visible
    if (captureUIOpen) {
        document.getElementById('captureUI').style.display = 'none';
        // Reset clicked flag for the capture target
        for (const target of gameState.captureTargets) {
            if (target.clicked) {
                target.clicked = false;
                break;
            }
        }
        return; // Don't process movement if we just closed the UI
    }
    
    // Set target position for player movement only if mouse is down
    if (gameState.isMouseDown) {
        gameState.clickTargetPosition = new THREE.Vector3(targetPoint.x, targetPoint.y, 0);
    }
}

// Handle mouse down event to start tracking
function handleMouseDown(event) {
    event.preventDefault();
    
    // Don't process if storage UI is open
    if (gameState.storageUIOpen) {
        return;
    }
    
    // Set mouse down flag
    gameState.isMouseDown = true;
    
    // Store mouse position
    gameState.lastMousePosition.x = event.clientX;
    gameState.lastMousePosition.y = event.clientY;
    
    // Handle initial position like a click
    handleClick(event);
}

// Handle mouse move event for continuous movement
function handleMouseMove(event) {
    event.preventDefault();
    
    // Don't process if mouse is not down, if storage UI is open, or if clicking UI elements
    if (!gameState.isMouseDown || gameState.storageUIOpen || isClickingUI(event)) {
        gameState.isMouseDown = false;
        return;
    }
    
    // Store mouse position
    gameState.lastMousePosition.x = event.clientX;
    gameState.lastMousePosition.y = event.clientY;
    
    // Convert mouse position to world coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Raycasting to get clicked position
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, gameState.camera);
    
    // Calculate intersection with z=0 plane
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const targetPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, targetPoint);
    
    // Set target position for player movement
    gameState.clickTargetPosition = new THREE.Vector3(targetPoint.x, targetPoint.y, 0);
}

// Handle mouse up event to stop tracking
function handleMouseUp(event) {
    event.preventDefault();
    
    // Reset mouse down flag
    gameState.isMouseDown = false;
}

// Handle touch events (mobile)
function handleTouch(event) {
    event.preventDefault();
    
    // Don't process if storage UI is open
    if (gameState.storageUIOpen) {
        return;
    }
    
    // Don't process if touching UI elements
    if (isClickingUI(event)) {
        gameState.isMouseDown = false;
        return;
    }
    
    // Set mouse down flag
    gameState.isMouseDown = true;
    
    // Use first touch point
    if (event.touches.length > 0) {
        const touch = event.touches[0];
        
        // Store touch position
        gameState.lastMousePosition.x = touch.clientX;
        gameState.lastMousePosition.y = touch.clientY;
        
        // Check if capture UI is open
        const captureUIOpen = document.getElementById('captureUI').style.display === 'block';
        
        // Convert touch position to world coordinates
        const mouse = new THREE.Vector2();
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        
        // Raycasting to get touched position
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, gameState.camera);
        
        // Calculate intersection with z=0 plane
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const targetPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, targetPoint);
        
        // Check if touched on a capture target
        for (const target of gameState.captureTargets) {
            const distanceToTarget = targetPoint.distanceTo(target.mesh.position);
            
            if (distanceToTarget < 20) {
                if (!target.clicked) {
                    showCaptureUI(target);
                }
                return; // Always return if touched on a capture target
            }
        }
        
        // Hide capture UI if visible
        if (captureUIOpen) {
            document.getElementById('captureUI').style.display = 'none';
            // Reset clicked flag for the capture target
            for (const target of gameState.captureTargets) {
                if (target.clicked) {
                    target.clicked = false;
                    break;
                }
            }
            return; // Don't process movement if we just closed the UI
        }
        
        // Set target position for player movement
        gameState.clickTargetPosition = new THREE.Vector3(targetPoint.x, targetPoint.y, 0);
    }
}

// Handle touch end events to stop tracking
function handleTouchEnd(event) {
    event.preventDefault();
    
    // Reset mouse down flag
    gameState.isMouseDown = false;
}

// Handle touch move events for continuous movement
function handleTouchMove(event) {
    event.preventDefault();
    
    // Don't process if not touching, if storage UI is open, or if touching UI elements
    if (!gameState.isMouseDown || gameState.storageUIOpen || isClickingUI(event)) {
        gameState.isMouseDown = false;
        return;
    }
    
    // Use first touch point
    if (event.touches.length > 0) {
        const touch = event.touches[0];
        
        // Store touch position
        gameState.lastMousePosition.x = touch.clientX;
        gameState.lastMousePosition.y = touch.clientY;
        
        // Convert touch position to world coordinates
        const mouse = new THREE.Vector2();
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        
        // Raycasting to get touched position
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, gameState.camera);
        
        // Calculate intersection with z=0 plane
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const targetPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, targetPoint);
        
        // Set target position for player movement
        gameState.clickTargetPosition = new THREE.Vector3(targetPoint.x, targetPoint.y, 0);
    }
}

// Update player movement
function updatePlayerMovement(deltaTime) {
    // Don't allow movement if capture UI is open
    if (document.getElementById('captureUI').style.display === 'block') return;
    
    if (!gameState.clickTargetPosition) return;
    
    // Direction to target
    const direction = new THREE.Vector3()
        .subVectors(gameState.clickTargetPosition, gameState.player.position)
        .normalize();
    
    // Distance to target
    const distanceToTarget = gameState.player.position.distanceTo(gameState.clickTargetPosition);
    
    // Move player towards target
    if (distanceToTarget > 5) {
        const movement = Math.min(distanceToTarget, GAME_CONFIG.playerSpeed * deltaTime);
        gameState.player.position.x += direction.x * movement;
        gameState.player.position.y += direction.y * movement;
        
        // Update player mesh
        gameState.player.mesh.position.copy(gameState.player.position);
    } else {
        // Target reached
        gameState.clickTargetPosition = null;
    }
    
    // Update camera position to follow player
    gameState.camera.position.x = gameState.player.position.x;
    gameState.camera.position.y = gameState.player.position.y;
    gameState.camera.lookAt(
        gameState.player.position.x,
        gameState.player.position.y,
        0
    );
}

// Handle player monster revival
function updateMonsterRevival(deltaTime) {
    // Check all player monsters (active and stored)
    const allPlayerMonsters = [...gameState.player.monsters, ...gameState.player.storedMonsters];
    
    for (const monster of allPlayerMonsters) {
        if (monster.defeated && monster.reviveTimer) {
            // Reduce timer
            monster.reviveTimer -= deltaTime;
            
            // Check if revival time is up
            if (monster.reviveTimer <= 0) {
                monster.defeated = false;
                monster.reviveTimer = null;
                
                // Restore to 50% HP
                monster.currentHP = Math.floor(monster.maxHP * 0.5);
                monster.currentStamina = monster.maxStamina;
                
                // Make visible again
                monster.mesh.visible = true;
                
                // Update UI
                updateUILabel(monster.uiLabel, monster);
                
                console.log(`${monster.name} has revived!`);
            }
        }
    }
}

// Check for next area transition
function checkAreaTransition() {
    const distanceToNextArea = gameState.player.position.distanceTo(gameState.nextAreaPosition);
    
    if (distanceToNextArea < 50) {
        // Check if we can transition to next area
        if (gameState.currentArea < Object.keys(AREAS).length) {
            // Increment current area
            gameState.currentArea++;
            
            // Get area info
            const areaInfo = AREAS[gameState.currentArea];
            
            // Update background color
            if (gameState.scene) {
                gameState.scene.background = new THREE.Color(areaInfo.backgroundColor);
            }
            
            // Show transition message
            addChatMessage(`Welcome to ${areaInfo.name}! ${areaInfo.description}`);
            
            // Update area display
            updateAreaDisplay();
            
            // Reset player position to start of new area
            gameState.player.position.set(0, 0, 0);
            gameState.player.mesh.position.copy(gameState.player.position);
            
            // Move player's active monsters with them
            for (const monster of gameState.player.monsters) {
                monster.mesh.position.copy(gameState.player.position);
                monster.lastPosition.copy(gameState.player.position);
                monster.targetPosition.copy(gameState.player.position);
            }
            
            // Update camera
            gameState.camera.position.x = 0;
            gameState.camera.position.y = 0;
            gameState.camera.lookAt(0, 0, 0);
            
            // Clear existing wild monsters
            gameState.wildMonsters.forEach(monster => {
                if (monster.mesh && monster.mesh.parent) {
                    monster.mesh.parent.remove(monster.mesh);
                }
            });
            gameState.wildMonsters = [];
            
            // Set new random position for next area entrance
            setRandomNextAreaPosition();
            
            // Spawn new monsters for the new area
            spawnWildMonsters(gameState.currentArea);
        } else {
            addChatMessage("You've reached the final area! There's nowhere else to go...");
        }
    }
}

// Helper function to select a random enemy with distance-based weighting
function selectWeightedRandomTarget(monster, potentialTargets) {
    // Filter out invalid targets
    const validTargets = potentialTargets.filter(target => 
        target !== monster && 
        !target.defeated && 
        target.isWild !== monster.isWild
    );
    
    if (validTargets.length === 0) return null;
    
    // Calculate distances and weights for each target
    const targetWeights = validTargets.map(target => {
        const distance = monster.mesh.position.distanceTo(target.mesh.position);
        // Use inverse square of distance for weight calculation
        // This makes closer targets much more likely to be chosen
        return {
            target,
            distance,
            weight: 1 / (distance * distance)
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
    return {
        target: targetWeights[targetWeights.length - 1].target,
        distance: targetWeights[targetWeights.length - 1].distance
    };
}

// Update combat logic
function updateCombat(deltaTime) {
    // Process each active combat
    for (const combat of gameState.activeCombats) {
        // For each monster in combat
        for (const monster of combat.participants) {
            if (monster.defeated) continue;
            
            // Find the closest enemy for movement
            let closestEnemy = null;
            let closestDistance = Infinity;
            
            for (const potentialTarget of combat.participants) {
                // Skip same monster, defeated monsters, or friendly monsters (wild vs wild or player vs player)
                if (potentialTarget === monster || 
                    potentialTarget.defeated || 
                    (potentialTarget.isWild === monster.isWild)) {
                    continue;
                }
                
                const distance = monster.mesh.position.distanceTo(potentialTarget.mesh.position);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestEnemy = potentialTarget;
                }
            }
            
            // Update movement target to closest enemy
            monster.target = closestEnemy;
            
            // If no valid target found and this is a wild monster, exit combat and return to origin
            if (!monster.target && monster.isWild && monster.originalPosition) {
                monster.inCombat = false;
                monster.returningToOrigin = true;
                continue;
            }
            
            // If no valid target found, skip
            if (!monster.target) continue;
            
            // Determine the appropriate attack range based on monster slot
            let attackRange = GAME_CONFIG.attackRange;
            if (!monster.isWild && gameState.player.monsters.indexOf(monster) === 0) {
                // This is the first slot monster (index 0), use shorter range
                attackRange = GAME_CONFIG.attackRangeSlot1;
            }
            
            // If in attack range, select a random target to attack
            if (closestDistance <= attackRange) {
                const attackTargetInfo = selectWeightedRandomTarget(monster, combat.participants);
                if (attackTargetInfo) {
                    monsterAttack(monster, attackTargetInfo.target, deltaTime);
                }
            }
            // Otherwise, move towards closest target
            else {
                // Calculate direction
                const direction = new THREE.Vector3()
                    .subVectors(monster.target.mesh.position, monster.mesh.position)
                    .normalize();
                
                // Update monster direction before moving
                updateMonsterDirection(monster, monster.target.mesh.position.x);
                
                // Calculate speed (wild monsters are slower)
                const speed = GAME_CONFIG.playerSpeed * (monster.isWild ? 0.8 : 1.2) * deltaTime;
                
                // Move towards target
                monster.mesh.position.x += direction.x * speed;
                monster.mesh.position.y += direction.y * speed;
            }
        }
        
        // Check if combat has ended (only one type of monster left)
        let hasWildMonster = false;
        let hasPlayerMonster = false;
        
        for (const monster of combat.participants) {
            if (!monster.defeated) {
                if (monster.isWild) {
                    hasWildMonster = true;
                } else {
                    hasPlayerMonster = true;
                }
            }
        }
        
        // If only one type remains, end combat
        if (!hasWildMonster || !hasPlayerMonster) {
            for (const monster of combat.participants) {
                monster.inCombat = false;
                monster.target = null;
                
                // Set wild monsters to return to their original position
                if (monster.isWild && monster.originalPosition && !monster.defeated) {
                    monster.returningToOrigin = true;
                }
            }
        }
    }
}

// Update stamina regeneration
function updateStaminaRegen(deltaTime) {
    // Update all monsters (both player and wild)
    const allMonsters = [...gameState.player.monsters, ...gameState.player.storedMonsters, ...gameState.wildMonsters];
    
    for (const monster of allMonsters) {
        if (monster.defeated) continue;
        
        // Calculate regen rate (1% in combat, 5% out of combat or always 5% for stored monsters)
        const isStored = gameState.player.storedMonsters.includes(monster);
        const regenRate = (monster.inCombat && !isStored) ? 0.01 : 0.05;
        const regenAmount = monster.maxStamina * regenRate * deltaTime;
        
        // Apply stamina regeneration
        monster.currentStamina = Math.min(monster.maxStamina, monster.currentStamina + regenAmount);
        
        // Update UI
        updateUILabel(monster.uiLabel, monster);
    }
}

// Update HP regeneration (out of combat only)
function updateHPRegen(deltaTime) {
    // Player monsters (both active and stored) and wild monsters regenerate HP when not in combat
    const allMonsters = [...gameState.player.monsters, ...gameState.player.storedMonsters, ...gameState.wildMonsters];
    
    for (const monster of allMonsters) {
        if (monster.defeated) continue;
        
        // Only regenerate if not in combat (active monsters) or always regenerate (stored monsters)
        const canRegenerate = monster.inCombat ? false : true;
        const isStored = gameState.player.storedMonsters.includes(monster);
        
        if (canRegenerate || isStored) {
            // Regenerate HP using constant rate
            const regenAmount = monster.maxHP * GAME_CONFIG.hpRegenRate * deltaTime;
            
            // Apply HP regeneration
            if (monster.currentHP < monster.maxHP) {
                monster.currentHP = Math.min(monster.maxHP, monster.currentHP + regenAmount);
                updateUILabel(monster.uiLabel, monster);
            }
        }
    }
}

// Update capture targets
function updateCaptureTargets(deltaTime) {
    for (let i = gameState.captureTargets.length - 1; i >= 0; i--) {
        const target = gameState.captureTargets[i];
        
        // Reduce time left
        target.timeLeft -= deltaTime;
        
        // Remove if time expired
        if (target.timeLeft <= 0) {
            gameState.scene.remove(target.mesh);
            gameState.captureTargets.splice(i, 1);
            
            // Hide capture UI if this was the active target
            if (target.clicked) {
                document.getElementById('captureUI').style.display = 'none';
            }
        }
    }
}

// Handle monster following behavior
function updateMonsterFollowing(deltaTime) {
    // Update player monsters following behavior
    for (let i = 0; i < gameState.player.monsters.length; i++) {
        const monster = gameState.player.monsters[i];
        
        // Skip if in combat
        if (monster.inCombat || monster.defeated) continue;
        
        // Calculate target position behind player
        const distanceFromPlayer = i === 0 ? 
            GAME_CONFIG.monsterFollowDistance.slot1 : 
            GAME_CONFIG.monsterFollowDistance.slot2;
        
        // Store the last player position
        const playerDirection = new THREE.Vector3(
            gameState.player.position.x - monster.lastPosition.x,
            gameState.player.position.y - monster.lastPosition.y,
            0
        ).normalize();
        
        // Update target position
        monster.targetPosition.copy(gameState.player.position)
            .sub(playerDirection.multiplyScalar(distanceFromPlayer));
        
        // Update monster direction before moving
        updateMonsterDirection(monster, monster.targetPosition.x);
        
        // Move towards target position
        const direction = new THREE.Vector3()
            .subVectors(monster.targetPosition, monster.mesh.position)
            .normalize();
        
        const distanceToTarget = monster.mesh.position.distanceTo(monster.targetPosition);
        const speed = GAME_CONFIG.playerSpeed * 1.2 * deltaTime; // 120% of player speed
        
        // Only move if not already at target
        if (distanceToTarget > 5) {
            const movement = Math.min(distanceToTarget, speed);
            monster.mesh.position.x += direction.x * movement;
            monster.mesh.position.y += direction.y * movement;
        }
        
        // Update last position
        monster.lastPosition.copy(monster.mesh.position);
    }
}

// Update wild monster aggro behaviors (chasing without combat)
function updateWildMonsterAggro(deltaTime) {
    for (const monster of gameState.wildMonsters) {
        // Skip if already in combat or defeated
        if (monster.inCombat || monster.defeated) continue;
        
        // If player has no active monsters, check for player aggro
        if (gameState.player.monsters.length === 0) {
            // Skip if player is in grace period
            if (gameState.player.gracePeriodTimer > 0) {
                // If monster was chasing player or not already returning, make it return to origin
                if (monster.aggroPlayer || !monster.returningToOrigin) {
                    monster.aggroPlayer = false;
                    monster.returningToOrigin = true;
                }
                
                // Since we're now returning, we should continue to the return logic
                // so we don't just idle during grace period
                if (monster.returningToOrigin) {
                    continue;
                }
            }
            
            // Calculate distance to player
            const distanceToPlayer = monster.mesh.position.distanceTo(gameState.player.position);
            
            // Calculate distance from original position
            const distanceFromOrigin = monster.originalPosition ? 
                monster.mesh.position.distanceTo(monster.originalPosition) : 0;
            
            // If within aggro range and not too far from origin, target player directly
            if (distanceToPlayer <= GAME_CONFIG.aggroRange) {
                // Check if monster has wandered too far
                if (distanceFromOrigin > GAME_CONFIG.maxMonsterWanderDistance) {
                    // Monster has gone too far, make it return to origin
                    monster.aggroPlayer = false;
                    monster.returningToOrigin = true;
                    continue;
                }
                
                monster.aggroPlayer = true;
                monster.aggroTarget = null;
                monster.returningToOrigin = false;
                
                // Move toward player
                const direction = new THREE.Vector3()
                    .subVectors(gameState.player.position, monster.mesh.position)
                    .normalize();
                
                // Move slightly faster than normal when chasing player
                const speed = GAME_CONFIG.playerSpeed * 0.9 * deltaTime;
                
                // Update monster direction before moving
                updateMonsterDirection(monster, gameState.player.position.x);
                
                monster.mesh.position.x += direction.x * speed;
                monster.mesh.position.y += direction.y * speed;
                
                // Check if reached the player
                if (distanceToPlayer < 20) {
                    // Teleport player back to start
                    gameState.player.position.set(0, 0, 0);
                    gameState.player.mesh.position.copy(gameState.player.position);
                    
                    // Update camera
                    gameState.camera.position.x = 0;
                    gameState.camera.position.y = 0;
                    gameState.camera.lookAt(0, 0, 0);
                    
                    // Reset click target
                    gameState.clickTargetPosition = null;
                    
                    // Set grace period timer
                    gameState.player.gracePeriodTimer = GAME_CONFIG.playerGracePeriod;
                    
                    // Make all monsters return to origin
                    for (const m of gameState.wildMonsters) {
                        if (m.originalPosition) {
                            m.aggroPlayer = false;
                            m.aggroTarget = null;
                            m.returningToOrigin = true;
                        }
                    }
                    
                    // Show message
                    addChatMessage("You were sent back to the starting point! You need monsters to protect you!");
                    
                    // Break out of the loop
                    break;
                }
            }
            // If player moved outside of aggro range OR monster has wandered too far, return to original position
            else if (monster.aggroPlayer) {
                monster.aggroPlayer = false;
                monster.returningToOrigin = true;
            }
            
            // If this monster is chasing the player, skip the rest of this iteration
            if (monster.aggroPlayer) {
                continue;
            }
        }
        
        // If monster has an aggro target but isn't in combat
        if (monster.aggroTarget) {
            const targetMonster = monster.aggroTarget;
            
            // Check if target is valid
            if (targetMonster.defeated) {
                // Target is defeated, return to original position
                monster.aggroTarget = null;
                monster.returningToOrigin = true;
                continue;
            }
            
            // Calculate distance to target
            const distanceToTarget = monster.mesh.position.distanceTo(targetMonster.mesh.position);
            
            // Calculate distance from original position
            const distanceFromOrigin = monster.originalPosition ? 
                monster.mesh.position.distanceTo(monster.originalPosition) : 0;
            
            // If monster has wandered too far, return to original position regardless of target
            if (distanceFromOrigin > GAME_CONFIG.maxMonsterWanderDistance) {
                monster.aggroTarget = null;
                monster.returningToOrigin = true;
            }
            // If target moved outside of aggro range, return to original position
            else if (distanceToTarget > GAME_CONFIG.aggroRange) {
                monster.aggroTarget = null;
                monster.returningToOrigin = true;
            } 
            // Otherwise, move toward target
            else {
                // Calculate direction to target
                const direction = new THREE.Vector3()
                    .subVectors(targetMonster.mesh.position, monster.mesh.position)
                    .normalize();
                
                // Update monster direction before moving
                updateMonsterDirection(monster, targetMonster.mesh.position.x);
                
                // Calculate speed (wild monsters are slower)
                const speed = GAME_CONFIG.playerSpeed * 0.8 * deltaTime;
                
                // Move toward target
                monster.mesh.position.x += direction.x * speed;
                monster.mesh.position.y += direction.y * speed;
            }
        }
        // If monster is returning to its original position
        else if (monster.returningToOrigin && monster.originalPosition) {
            // Calculate distance to original position
            const distanceToOrigin = monster.mesh.position.distanceTo(monster.originalPosition);
            
            // If reached origin, stop returning
            if (distanceToOrigin < 5) {
                monster.returningToOrigin = false;
            } else {
                // Calculate direction to origin
                const direction = new THREE.Vector3()
                    .subVectors(monster.originalPosition, monster.mesh.position)
                    .normalize();
                
                // Update monster direction before moving
                updateMonsterDirection(monster, monster.originalPosition.x);
                
                // Speed is slower when returning
                const speed = GAME_CONFIG.playerSpeed * 0.7 * deltaTime;
                
                // Move toward origin
                monster.mesh.position.x += direction.x * speed;
                monster.mesh.position.y += direction.y * speed;
            }
        }
        // If monster is not aggroed, not returning to origin, and not in combat, do random movement
        else if (!monster.aggroPlayer && !monster.returningToOrigin && !monster.inCombat) {
            // Initialize random movement target if not set
            if (!monster.randomMoveTarget) {
                monster.randomMoveTimer = 2 + Math.random() * 3;
                monster.randomMoveTarget = new THREE.Vector3();
                monster.randomMoveTarget.x = monster.originalPosition.x;
                monster.randomMoveTarget.y = monster.originalPosition.y;
            }
            
            // Update random movement timer
            monster.randomMoveTimer -= deltaTime;
            
            // If timer is up, set new random target
            if (monster.randomMoveTimer <= 0) {
                
                // Calculate random movement radius based on area level
                const moveRadius = gameState.currentArea * 50;
                
                // Generate random angle
                const angle = Math.random() * Math.PI * 2;
                
                // Calculate new target position within radius
                monster.randomMoveTarget.x = monster.originalPosition.x + Math.cos(angle) * moveRadius;
                monster.randomMoveTarget.y = monster.originalPosition.y + Math.sin(angle) * moveRadius;
                
                // Set new random timer (between 2 and 5 seconds)
                monster.randomMoveTimer = 2 + Math.random() * 3;
            }
            
            // Move toward random target if distance is greater than 5
            if (monster.mesh.position.distanceTo(monster.randomMoveTarget) > 5) {
                const direction = new THREE.Vector3()
                    .subVectors(monster.randomMoveTarget, monster.mesh.position)
                    .normalize();
            // Update monster direction before moving
            updateMonsterDirection(monster, monster.randomMoveTarget.x);
            
            // Move at a slower speed for random movement
            const speed = GAME_CONFIG.playerSpeed * 0.5 * deltaTime;
            
            monster.mesh.position.x += direction.x * speed;
            monster.mesh.position.y += direction.y * speed;
            }
        }
    }
}

// Spawn wild monsters
function spawnWildMonsters(areaLevel, count = null) {
    // Clear any existing wild monsters
    for (const monster of gameState.wildMonsters) {
        if (monster.mesh) {
            gameState.scene.remove(monster.mesh);
        }
    }
    gameState.wildMonsters = [];
    
    const spawnArea = GAME_CONFIG.worldSpawnDiameter; // Size of the area in units
    const minDistanceFromOrigin = GAME_CONFIG.minSpawnDistance; // Minimum distance from player
    
    // Calculate number of monsters based on density if count is not provided
    if (count === null) {
        const spawnRegions = Math.floor(spawnArea / GAME_CONFIG.spawnAreaSize);
        const spawnRegionCount = spawnRegions * spawnRegions;
        count = spawnRegionCount * GAME_CONFIG.monsterDensity;
        console.log(`Spawning ${count} monsters based on density of ${GAME_CONFIG.monsterDensity} per ${GAME_CONFIG.spawnAreaSize}x${GAME_CONFIG.spawnAreaSize} area`);
    }
    
    for (let i = 0; i < count; i++) {
        // Determine spawn position
        let x, y, distanceFromPlayer;
        do {
            x = Math.random() * spawnArea - spawnArea / 2;
            y = Math.random() * spawnArea - spawnArea / 2;
            distanceFromPlayer = new THREE.Vector2(x, y)
                .distanceTo(new THREE.Vector2(gameState.player.position.x, gameState.player.position.y));
        } while (distanceFromPlayer < minDistanceFromOrigin);
        
        // Determine monster level based on area and distance from center
        const distanceFromCenter = Math.sqrt(x * x + y * y);
        const maxAreaLevel = areaLevel * 10;
        const minAreaLevel = (areaLevel - 1) * 10 + 1; // This is 1 for area level 1
        
        // Calculate level strictly based on distance from center (origin)
        // The closer to center, the lower the level (minimum is minAreaLevel)
        const levelRange = maxAreaLevel - minAreaLevel;
        
        // Get ratio between 0 and 1 of how far from center (0 = center, 1 = edge)
        const distanceRatio = Math.min(1, distanceFromCenter / (spawnArea / 2));
        
        // Apply a curve where monsters close to center are always minimum level
        // The minimum level zone extends for 40% of the map radius
        let level;
        if (distanceRatio < GAME_CONFIG.innerZoneRatio) {
            level = minAreaLevel; // Minimum level for this area (level 1 for area level 1)
        } else {
            // Scale from minAreaLevel to maxAreaLevel for the outer 60% of the map
            // Normalize the distance ratio to be 0-1 for the remaining 60% of the distance
            const adjustedRatio = (distanceRatio - GAME_CONFIG.innerZoneRatio) / GAME_CONFIG.outerZoneRatio;
            level = Math.floor(minAreaLevel + (levelRange * adjustedRatio));
        }
        
        // Get available monster types for this area level
        const availableTypes = Object.keys(MONSTER_TYPES)
            .map(Number)
            .filter(id => Math.ceil(id / 5) <= (areaLevel + 1));
        
        if (availableTypes.length === 0) {
            console.warn(`No valid monster types for area level ${areaLevel}, skipping spawn`);
            continue;
        }
        
        // Randomly choose from available monster types
        const typeId = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        
        // Check for rare modifiers - each has a separate 2% chance
        let rareModifiers = [];
        const modifiersList = Object.keys(RARE_MODIFIERS);
        
        // Roll for each possible modifier independently
        for (const modifier of modifiersList) {
            const modifierChance = Math.random() * 100;
            if (modifierChance <= GAME_CONFIG.rareModifierRate) {
                rareModifiers.push(modifier);
            }
        }
        
        // Create monster
        const monster = createMonster(typeId, level, rareModifiers, true, level, MONSTER_TYPES[typeId].element);
        
        // Position monster
        monster.mesh.position.set(x, y, 1);
        monster.lastPosition.copy(monster.mesh.position);
        monster.targetPosition.copy(monster.mesh.position);
        
        // Set original position for random movement and returning behavior
        monster.originalPosition = new THREE.Vector3().copy(monster.mesh.position);
        
        // Add to scene
        gameState.scene.add(monster.mesh);
        
        // Add to wild monsters array
        gameState.wildMonsters.push(monster);
    }
}

// Cleanup defeated monsters and handle respawns
function cleanupDefeatedMonsters(deltaTime) {
    // Remove defeated wild monsters
    for (let i = gameState.wildMonsters.length - 1; i >= 0; i--) {
        const monster = gameState.wildMonsters[i];
        
        if (monster.defeated) {
            // Check if it's in capture targets
            const isCaptureTarget = gameState.captureTargets.some(
                target => target.monster.id === monster.id
            );
            
            // Only handle respawn if not a capture target
            if (!isCaptureTarget) {
                // If monster has a respawn timer, count it down
                if (monster.respawnTimer) {
                    monster.respawnTimer -= deltaTime;
                    
                    // Check if respawn time is up
                    if (monster.respawnTimer <= 0) {
                        // Clear any color reset timeout before removing from scene
                        if (monster.colorResetTimeout) {
                            clearTimeout(monster.colorResetTimeout);
                            monster.colorResetTimeout = null;
                        }
                        
                        // Remove from scene
                        gameState.scene.remove(monster.mesh);
                        gameState.wildMonsters.splice(i, 1);
                        
                        // Schedule a new monster to spawn
                        scheduleMonsterRespawn();
                    }
                } else {
                    // Set respawn timer
                    monster.respawnTimer = GAME_CONFIG.respawnTime;
                }
            }
        }
    }
}

// Schedule a new monster to spawn
function scheduleMonsterRespawn() {
    // Get current area level
    let areaLevel = gameState.currentArea;
    
    // Calculate spawn position away from player
    const spawnArea = GAME_CONFIG.worldSpawnDiameter;
    const minDistanceFromOrigin = GAME_CONFIG.minSpawnDistance; // Further away to avoid immediate combat
    const maxDistanceFromPlayer = 2500; // Not too far
    
    let x, y, distanceFromPlayer;
    do {
        x = Math.random() * spawnArea - spawnArea / 2;
        y = Math.random() * spawnArea - spawnArea / 2;
        distanceFromPlayer = new THREE.Vector2(x, y)
            .distanceTo(new THREE.Vector2(gameState.player.position.x, gameState.player.position.y));
    } while (distanceFromPlayer < minDistanceFromOrigin || distanceFromPlayer > maxDistanceFromPlayer);
    
    // Determine monster level based on area and distance from center
    const distanceFromCenter = Math.sqrt(x * x + y * y);
    const maxAreaLevel = areaLevel * 10;
    const minAreaLevel = (areaLevel - 1) * 10 + 1;
    
    // Calculate level strictly based on distance from center (origin)
    // The closer to center, the lower the level (minimum is minAreaLevel)
    const levelRange = maxAreaLevel - minAreaLevel;
    
    // Get ratio between 0 and 1 of how far from center (0 = center, 1 = edge)
    const distanceRatio = Math.min(1, distanceFromCenter / (spawnArea / 2));
    
    // Apply a curve where monsters close to center are always minimum level
    // The minimum level zone extends for 40% of the map radius
    let level;
    if (distanceRatio < GAME_CONFIG.innerZoneRatio) {
        level = minAreaLevel; // Minimum level for this area (level 1 for area level 1)
    } else {
        // Scale from minAreaLevel to maxAreaLevel for the outer 60% of the map
        // Normalize the distance ratio to be 0-1 for the remaining 60% of the distance
        const adjustedRatio = (distanceRatio - GAME_CONFIG.innerZoneRatio) / GAME_CONFIG.outerZoneRatio;
        level = Math.floor(minAreaLevel + (levelRange * adjustedRatio));
    }
    
    // Get available monster types for this area level
    const availableTypes = Object.keys(MONSTER_TYPES)
        .map(Number)
        .filter(id => Math.ceil(id / 5) <= (areaLevel + 2));
    
    if (availableTypes.length === 0) {
        console.warn(`No valid monster types for area level ${areaLevel}, skipping respawn`);
        return;
    }
    
    // Randomly choose from available monster types
    const typeId = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    
    // Check for rare modifiers - each has a separate 2% chance
    let rareModifiers = [];
    const modifiersList = Object.keys(RARE_MODIFIERS);
    
    // Roll for each possible modifier independently
    for (const modifier of modifiersList) {
        const modifierChance = Math.random() * 100;
        if (modifierChance <= GAME_CONFIG.rareModifierRate) {
            rareModifiers.push(modifier);
        }
    }
    
    // Create monster
    const monster = createMonster(typeId, level, rareModifiers, true, level, MONSTER_TYPES[typeId].element);
    
    // Position monster
    monster.mesh.position.set(x, y, 1);
    monster.lastPosition.copy(monster.mesh.position);
    monster.targetPosition.copy(monster.mesh.position);
    
    // Set original position for random movement and returning behavior
    monster.originalPosition = new THREE.Vector3().copy(monster.mesh.position);
    
    // Add to scene
    gameState.scene.add(monster.mesh);
    
    // Add to wild monsters array
    gameState.wildMonsters.push(monster);
}

// Add exit marker for next area
function addAreaExit() {
    const geometry = new THREE.RingGeometry(20, 25, 32);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        transparent: true,
        opacity: 0.7
    });
    const exitMesh = new THREE.Mesh(geometry, material);
    exitMesh.position.copy(gameState.nextAreaPosition);
    exitMesh.position.z = 0.5;
    gameState.scene.add(exitMesh);
    
    // Add pulsing animation
    const pulseTween = () => {
        exitMesh.scale.set(1, 1, 1);
        setTimeout(() => {
            exitMesh.scale.set(1.2, 1.2, 1);
            setTimeout(pulseTween, 1000);
        }, 1000);
    };
    pulseTween();
    
    // Create direction arrow
    addDirectionArrow();
}

// Add direction arrow pointing to next area
function addDirectionArrow() {
    // Create arrow shape
    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 8);   // Point of arrow
    arrowShape.lineTo(-4, -4); // Left wing
    arrowShape.lineTo(0, -2);  // Inner left notch
    arrowShape.lineTo(4, -4);  // Right wing
    arrowShape.lineTo(0, 8);   // Back to point
    
    const geometry = new THREE.ShapeGeometry(arrowShape);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,       // White arrow
        transparent: true,
        opacity: 0.9
    });
    
    const arrowMesh = new THREE.Mesh(geometry, material);
    arrowMesh.position.z = 3;  // Above player
    
    // Store arrow mesh in gameState for updates
    gameState.directionArrow = arrowMesh;
    gameState.scene.add(arrowMesh);
}

// Update direction arrow to point toward next area
function updateDirectionArrow() {
    if (!gameState.directionArrow) return;
    
    // Calculate direction to next area
    const direction = new THREE.Vector2()
        .subVectors(
            new THREE.Vector2(gameState.nextAreaPosition.x, gameState.nextAreaPosition.y),
            new THREE.Vector2(gameState.player.position.x, gameState.player.position.y)
        )
        .normalize();
    
    // Position arrow offset from player in the direction of the next area
    const arrowDistance = 35; // Distance from player to arrow
    gameState.directionArrow.position.x = gameState.player.position.x + direction.x * arrowDistance;
    gameState.directionArrow.position.y = gameState.player.position.y + direction.y * arrowDistance;
    gameState.directionArrow.position.z = 3; // Above player
    
    // Calculate rotation angle from direction vector
    const angle = Math.atan2(direction.y, direction.x) - Math.PI/2; // Subtract PI/2 because the arrow points up by default
    gameState.directionArrow.rotation.z = angle;
}

// Start combat between two monsters
function startCombat(monster1, monster2) {
    // Don't start combat if either monster is already defeated
    if (monster1.defeated || monster2.defeated) {
        return;
    }
    
    // Set combat flags
    monster1.inCombat = true;
    monster2.inCombat = true;
    
    // Only set target if the monster doesn't have one already
    if (!monster1.target) monster1.target = monster2;
    if (!monster2.target) monster2.target = monster1;
    
    // Check if either monster is already in a combat
    let foundCombat = false;
    for (const combat of gameState.activeCombats) {
        if (combat.participants.includes(monster1) || combat.participants.includes(monster2)) {
            // Add the other monster to this combat if not already present
            if (!combat.participants.includes(monster1)) {
                combat.participants.push(monster1);
            }
            if (!combat.participants.includes(monster2)) {
                combat.participants.push(monster2);
            }
            foundCombat = true;
            break;
        }
    }
    
    // If no existing combat found, create a new one
    if (!foundCombat) {
        gameState.activeCombats.push({ participants: [monster1, monster2] });
    }
}

// Remove a monster from combat
function removeFromCombat(monster) {
    // Clear combat flag and target
    monster.inCombat = false;
    monster.target = null;
    
    // If it's a wild monster and it has an original position, set it to return there
    if (monster.isWild && monster.originalPosition) {
        monster.returningToOrigin = true;
    }
    
    // Remove from active combats
    for (let i = gameState.activeCombats.length - 1; i >= 0; i--) {
        const combat = gameState.activeCombats[i];
        const index = combat.participants.indexOf(monster);
        
        if (index !== -1) {
            // Remove from participants
            combat.participants.splice(index, 1);
            
            // If only one participant left, clear their combat too
            if (combat.participants.length === 1) {
                combat.participants[0].inCombat = false;
                combat.participants[0].target = null;
                
                // If it's a wild monster, set it to return to its original position
                if (combat.participants[0].isWild && combat.participants[0].originalPosition) {
                    combat.participants[0].returningToOrigin = true;
                }
                
                // Remove the combat entry
                gameState.activeCombats.splice(i, 1);
            }
        }
    }
}

// Check for combat range and initialize combat
function checkCombatRange() {
    // Create a list of all monsters in aggro range of each other
    const potentialCombatants = [];
    
    // Check player monsters against wild monsters - player monsters aggro at half range
    for (const playerMonster of gameState.player.monsters) {
        if (playerMonster.defeated) continue;
        
        for (const wildMonster of gameState.wildMonsters) {
            if (wildMonster.defeated) continue;
            
            // Calculate distance
            const distance = playerMonster.mesh.position.distanceTo(wildMonster.mesh.position);
            
            // Check if within player monster's aggro range (half the standard range)
            const playerMonsterAggroRange = GAME_CONFIG.aggroRange / 2;
            
            if (distance <= playerMonsterAggroRange) {
                potentialCombatants.push([playerMonster, wildMonster]);
            }
            // If wild monster is in its aggro range but player monster isn't close enough
            else if (distance <= GAME_CONFIG.aggroRange) {
                // Set wild monster to move toward player monster without starting combat
                if (!wildMonster.inCombat) {
                    // Store original position if not already tracking
                    if (!wildMonster.originalPosition) {
                        wildMonster.originalPosition = new THREE.Vector3().copy(wildMonster.mesh.position);
                    }
                    
                    wildMonster.aggroTarget = playerMonster;
                }
            }
        }
    }
    
    // Start combat for each pair
    for (const [monster1, monster2] of potentialCombatants) {
        startCombat(monster1, monster2);
        
        // Clear aggro target since now in actual combat
        if (monster2.aggroTarget) {
            monster2.aggroTarget = null;
        }
    }
}

// Set up UI event handlers
function setupUIEventHandlers() {
    // Storage button
    document.getElementById('storageButton').addEventListener('click', toggleStorageUI);
    
    // Close button for storage UI
    document.querySelector('#storageUI .close-button').addEventListener('click', toggleStorageUI);
    
    // Capture button
    document.getElementById('captureButton').addEventListener('click', handleCapture);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // 'S' key to toggle storage
        if (event.key === 's' || event.key === 'S') {
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
}

// Set a random position for the next area entrance
function setRandomNextAreaPosition() {
    // Random angle in radians (0 to 2π)
    const randomAngle = Math.random() * Math.PI * 2;
    
    // Fixed distance from center (at the edge of spawn area)
    const distance = 1500;
    
    // Calculate new position using polar coordinates
    const x = Math.cos(randomAngle) * distance;
    const y = Math.sin(randomAngle) * distance;
    
    // Update the next area position
    gameState.nextAreaPosition.set(x, y, 0);
    
    console.log(`Next area entrance set at (${x.toFixed(2)}, ${y.toFixed(2)})`);
}

// Update cooldowns for all monsters
function updateMonsterCooldowns(deltaTime) {
    // Update all monsters (both player and wild)
    const allMonsters = [...gameState.player.monsters, ...gameState.player.storedMonsters, ...gameState.wildMonsters];
    
    for (const monster of allMonsters) {
        if (monster.defeated) continue;
        
        // Update cooldown if it's active
        if (monster.currentCooldown > 0) {
            monster.currentCooldown -= deltaTime;
        }
    }
}

function updateMonsterMovement(monster, targetPosition, deltaTime) {
    const speed = monster.speed;
    const direction = new THREE.Vector3()
        .subVectors(targetPosition, monster.mesh.position)
        .normalize();
    
    // Update monster direction based on movement
    updateMonsterDirection(monster, targetPosition.x);
    
    monster.mesh.position.x += direction.x * speed * deltaTime;
    monster.mesh.position.y += direction.y * speed * deltaTime;
    monster.mesh.position.z = 0;
}