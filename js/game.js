// Initialize Three.js
let backgroundMusic;
let musicInitialized = false;
let preloadedTextures = new Map(); // Store preloaded textures
let currentMusicIndex = 1;
const totalMusicTracks = 8; // Update this number based on how many music files you have

function initMusic() {
    // Create audio element
    backgroundMusic = new Audio();
    backgroundMusic.volume = 0.5;
    
    // Set up event listener for when a track ends
    backgroundMusic.addEventListener('ended', () => {
        // Move to next track
        currentMusicIndex = (currentMusicIndex % totalMusicTracks) + 1;
        // Load and play next track
        backgroundMusic.src = `sound/Music${currentMusicIndex}.mp3`;
        if (!gameState.musicSavedOff) {
            backgroundMusic.play();
        }
    });
    
    // Randomly select initial track (1 to totalMusicTracks)
    currentMusicIndex = Math.floor(Math.random() * totalMusicTracks) + 1;
    backgroundMusic.src = `sound/Music${currentMusicIndex}.mp3`;
}

function startMusicOnFirstInput() {
    if (!musicInitialized) {
        if (!gameState.musicSavedOff) {
            backgroundMusic.play();
        }
        musicInitialized = true;
        // Remove all the input event listeners for music start
        document.removeEventListener('click', startMusicOnFirstInput);
        document.removeEventListener('keydown', startMusicOnFirstInput);
        document.removeEventListener('touchstart', startMusicOnFirstInput);
    }
}

// Function to preload background textures
function preloadBackgroundTexture(areaNumber) {
    // Skip if texture data (even partially) is already initiated for this area
    if (preloadedTextures.has(areaNumber)) return;

    const textureLoader = new THREE.TextureLoader();
    const textureData = { base: null, variant: null };
    preloadedTextures.set(areaNumber, textureData); // Initialize entry

    // Load base texture
    textureData.base = textureLoader.load(
        `assets/backgrounds/${areaNumber}.jpeg`,
        (texture) => { // onLoad callback
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            console.log(`Preloaded base texture for area ${areaNumber}`);
            // If this texture is for the currently displayed area, update the background now
            if (areaNumber === gameState.currentArea) {
                updateBackgroundTexture();
            }
        },
        undefined, // onProgress callback (optional)
        (error) => { // onError callback
            console.error(`Failed to load base texture for area ${areaNumber}:`, error);
            // Optionally remove the entry or handle error
            // preloadedTextures.delete(areaNumber); 
        }
    );

    // Attempt to load variant texture
    textureData.variant = textureLoader.load(
        `assets/backgrounds/${areaNumber}-2.jpeg`,
        (texture) => { // onLoad callback
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            console.log(`Preloaded variant texture for area ${areaNumber}`);
        },
        undefined, // onProgress callback (optional)
        (error) => { // onError callback
            console.log(`No variant texture found for area ${areaNumber} (or failed to load):`, error);
            textureData.variant = null; // Ensure variant is null if loading fails
        }
    );
}

// Function to update background texture based on current area
function updateBackgroundTexture() {
    // Ensure the background tile grid exists
    if (!gameState.backgroundTiles || gameState.backgroundTiles.length === 0) return;

    // Get the preloaded texture data for the current area
    const textures = preloadedTextures.get(gameState.currentArea);

    // Check if base texture is loaded
    if (!textures || !textures.base) {
        console.error(`Base texture for area ${gameState.currentArea} not loaded yet.`);
        // Optionally, trigger loading or use a fallback
        // preloadBackgroundTexture(gameState.currentArea); // Re-trigger loading
        // Fallback: Make tiles gray
        const fallbackMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
        gameState.backgroundTiles.forEach(tile => {
            tile.material = fallbackMaterial;
            tile.material.needsUpdate = true;
        });
        return;
    }

    // Create materials (with tint)
    const baseMaterial = new THREE.MeshBasicMaterial({
        map: textures.base,
        side: THREE.DoubleSide,
        color: 0xD0D0D0 // Add gray tint
    });

    let variantMaterial = null;
    if (textures.variant) {
        variantMaterial = new THREE.MeshBasicMaterial({
            map: textures.variant,
            side: THREE.DoubleSide,
            color: 0xD0D0D0 // Add gray tint
        });
    }

    // Assign materials to tiles randomly
    gameState.backgroundTiles.forEach(tile => {
        // 50% chance to use variant if it exists
        if (variantMaterial && Math.random() < 0.5) {
            tile.material = variantMaterial;
        } else {
            tile.material = baseMaterial;
        }
        tile.material.needsUpdate = true; // Ensure material update is rendered
    });

    console.log(`Updated background tiles for area ${gameState.currentArea}`);
}

// Function to preload adjacent area textures
function preloadAdjacentAreaTextures(currentArea) {
    // Always preload area 1 texture
    preloadBackgroundTexture(1);
    preloadBackgroundTexture(currentArea);
    if (AREAS[currentArea + 1]) {
        preloadBackgroundTexture(currentArea + 1);
    }
    if (AREAS[currentArea - 1]) {
        preloadBackgroundTexture(currentArea - 1);
    }
}

function initThree() {
    // Create scene
    gameState.scene = new THREE.Scene();
    
    // --- Create Background Tile Grid ---
    gameState.backgroundTileGroup = new THREE.Group();
    gameState.backgroundTiles = [];
    const worldSize = 5000; // Total size of the background area
    const gridSize = 9;      // 9x9 grid
    const tileSize = worldSize / gridSize;

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const tileGeometry = new THREE.PlaneGeometry(tileSize, tileSize);
            // Use a placeholder material initially
            const tileMaterial = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide });
            const tileMesh = new THREE.Mesh(tileGeometry, tileMaterial);

            // Calculate position (center of the grid is 0,0)
            const x = (j - (gridSize - 1) / 2) * tileSize;
            const y = (i - (gridSize - 1) / 2) * tileSize;
            tileMesh.position.set(x, y, -1); // Place slightly behind everything

            gameState.backgroundTileGroup.add(tileMesh);
            gameState.backgroundTiles.push(tileMesh);
        }
    }
    gameState.scene.add(gameState.backgroundTileGroup);
    // --- End Background Tile Grid ---
    
    // Preload initial textures (this will trigger updateBackgroundTexture via onLoad callback when ready)
    preloadAdjacentAreaTextures(gameState.currentArea);
    
    // Create camera
    const aspectRatio = window.innerWidth / window.innerHeight;
    
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    gameState.onMobile = isMobile;
    
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
        const viewSize = isMobile ? GAME_CONFIG.baseViewSize * 1.5 : GAME_CONFIG.baseViewSize;
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
    
    // Add focus/blur event listeners to manage frame rate
    window.addEventListener('blur', () => {
        gameState.windowFocused = false;
        console.log('Window lost focus - reducing frame rate to 10 FPS');
    });
    
    window.addEventListener('focus', () => {
        gameState.windowFocused = true;
        console.log('Window gained focus - restoring normal frame rate');
    });
    
    // Set initial focus state
    gameState.windowFocused = document.hasFocus();
    
    // Add capture button event listener
    document.getElementById('captureButton').addEventListener('click', handleCapture);
    
    // Add storage button event listener
    document.getElementById('storageButton').addEventListener('click', toggleStorageUI);
    
    // Add close button event listener for storage UI
    document.querySelector('#storageUI .close-button').addEventListener('click', toggleStorageUI);

    // Create portal if starting in level 1 and it doesn't exist yet
    if (gameState.currentArea === 1 && !gameState.portalMesh) {
        createPortal();
    }
}

// Create portal mesh and label
function createPortal() {
    // Create portal mesh (using CircleGeometry instead of EllipseGeometry)
    const portalGeometry = new THREE.CircleGeometry(25, 32);
    const portalMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8
    });
    const portalMesh = new THREE.Mesh(portalGeometry, portalMaterial);
    portalMesh.position.set(0, -500, 1); // South of start
    gameState.scene.add(portalMesh);
    gameState.portalMesh = portalMesh;

    // Create portal label
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 384; // Increased canvas width to accommodate larger text
    canvas.height = 144;  // Increased canvas height to accommodate two lines of text
    
    // Set up text
    context.fillStyle = 'white';
    context.font = 'bold 48px Arial'; // Increased from 32px to 48px (50% larger)
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Vibeverse Portal', canvas.width/2, canvas.height/3);
    
    // Add second line of text
    context.fillText('(Leaves Game!)', canvas.width/2, (canvas.height/3) * 2);
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    const labelGeometry = new THREE.PlaneGeometry(150, 56.25); // Increased height proportionally for two lines
    const labelMaterial = new THREE.MeshBasicMaterial({ 
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
    });
    const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
    labelMesh.position.set(0, -460, 2); // Slightly above portal
    gameState.scene.add(labelMesh);
    gameState.portalLabel = labelMesh;

    // Add pulsing animation
    const pulsePortal = () => {
        if (gameState.currentArea === 1) {
            portalMesh.visible = true;
            labelMesh.visible = true;
            portalMesh.scale.set(1, 1, 1);
            setTimeout(() => {
                if (gameState.currentArea === 1) {
                    portalMesh.scale.set(1.2, 1.2, 1);
                }
                setTimeout(pulsePortal, 1000);
            }, 1000);
        } else {
            portalMesh.visible = false;
            labelMesh.visible = false;
            setTimeout(pulsePortal, 1000);
        }
    };
    pulsePortal();
}

// Initialize player
function initPlayer(hasStarterMonster) {
    // Create player visual using texture
    const textureLoader = new THREE.TextureLoader();
    const playerTexture = textureLoader.load('assets/player.png');
    const geometry = new THREE.PlaneGeometry(48, 48); // Same size as original circle
    const material = new THREE.MeshBasicMaterial({ 
        map: playerTexture,
        transparent: true,
        side: THREE.DoubleSide
    });
    const playerMesh = new THREE.Mesh(geometry, material);
    playerMesh.position.z = calculateZPosition(0, true);
    gameState.scene.add(playerMesh);
    
    // Store player mesh
    gameState.player.mesh = playerMesh;
    
    // Create starter monster only if needed
    if (hasStarterMonster) {
        // Create starter monster (Stupid Fish) with all rare modifiers
        const starterMonster = createMonster(1, 5, ["Strong"], 0, 5, "Earth", 1); // Changed team from false to 0
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
}

// Clean up boss masters and their monsters
function cleanupBossMasters() {
    // console.log(`Running cleanupBossMasters. Masters: ${gameState.bossMasters.length}, Monsters: ${gameState.bossMonsters.length}`);

    // Remove boss monsters from scene and array
    for (let i = gameState.bossMonsters.length - 1; i >= 0; i--) {
        const monster = gameState.bossMonsters[i];
        if (monster.mesh) {
            // console.log(`Removing boss monster mesh: ${monster.name} (ID: ${monster.id})`);
            // Dispose geometry and material
            if (monster.mesh.geometry) {
                monster.mesh.geometry.dispose();
            }
            if (monster.monsterMesh && monster.monsterMesh.material) { // Original monster material
                if (monster.monsterMesh.material.map) monster.monsterMesh.material.map.dispose();
                monster.monsterMesh.material.dispose();
            }
             if (monster.uiLabel && monster.uiLabel.sprite && monster.uiLabel.sprite.material) { // UI Label material
                if (monster.uiLabel.sprite.material.map) monster.uiLabel.sprite.material.map.dispose();
                 monster.uiLabel.sprite.material.dispose();
             }
            if (monster.elementSphere && monster.elementSphere.geometry) { // Element sphere geometry/material
                monster.elementSphere.geometry.dispose();
                if (monster.elementSphere.material) monster.elementSphere.material.dispose();
            }
            // Remove the container mesh from the scene
            gameState.scene.remove(monster.mesh);
        }
    }
    gameState.bossMonsters = [];

    // Remove boss masters from scene and array
    for (let i = gameState.bossMasters.length - 1; i >= 0; i--) {
        const master = gameState.bossMasters[i];
        if (master.mesh) {
            // console.log(`Removing boss master mesh (ID: ${master.id})`);
            // Dispose geometry and material
            if (master.mesh.geometry) {
                master.mesh.geometry.dispose();
            }
            if (master.mesh.material) {
                master.mesh.material.dispose();
            }
            // Remove mesh from scene
            gameState.scene.remove(master.mesh);
        }
    }
    gameState.bossMasters = [];
    // console.log(`Finished cleanupBossMasters. Masters: ${gameState.bossMasters.length}, Monsters: ${gameState.bossMonsters.length}`);
}

// Spawn Boss Masters and their monsters in Area 1
function spawnBossMasters(areaLevel) {
    // Only spawn in Area 1
    if (areaLevel !== 1) return;

    // Clean up any existing bosses first (this should also handle bubbles)
    cleanupBossMasters();
    
    // Initialize boss chat bubble storage if it doesn't exist
    if (!gameState.bossChatBubbles) gameState.bossChatBubbles = [];

    const numBosses = BOSS_DATA.length;
    const radius = 1200; // Spawn radius
    const angleIncrement = (2 * Math.PI) / numBosses;

    for (let i = 0; i < numBosses; i++) {
        const angle = i * angleIncrement;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const masterPosition = new THREE.Vector3(x, y, 0);

        // Create Boss Master
        gameState.bossMasterIdCounter++;
        const masterId = gameState.bossMasterIdCounter;
        const bossInfo = BOSS_DATA[i];
        const masterMesh = createBossMasterMesh(bossInfo.masterElement);
        masterMesh.position.copy(masterPosition);
        masterMesh.position.z = calculateZPosition(y, true); // Use player Z calculation for visibility

        const bossMaster = {
            id: masterId,
            mesh: masterMesh,
            position: masterPosition,
            element: bossInfo.masterElement,
            team: 0, // Start on team 0
            chatBubble: null // Placeholder for the chat bubble
        };
        
        // Create the chat bubble for this boss
        const chatText = ["Greetings, binder.",
            "I am ready for your challenge!",
            "Click this chat box to fight me."
        ];
        const chatBubbleMesh = createChatBubble(
            chatText,
            masterPosition,
            new THREE.Vector3(0, 75, 5), // Offset above the master (Z set to 5)
            500, // Width
            140,  // Height
            () => startBossFight(masterId), // Click handler
            'rgba(220, 0, 0, 1)' // Red to show aggression
        );
        gameState.scene.add(chatBubbleMesh);
        bossMaster.chatBubble = chatBubbleMesh; // Store reference
        gameState.bossChatBubbles.push(chatBubbleMesh); // Add to global boss bubble list

        gameState.bossMasters.push(bossMaster);
        gameState.scene.add(masterMesh);

        // Create Boss Monsters (Team 0 initially)
        bossInfo.monsters.forEach((monsterData, monsterIndex) => {
            const monster = createMonster(
                monsterData.typeId,
                monsterData.level,
                monsterData.mods,
                0, // Start on Team 0
                monsterData.spawnLvl,
                monsterData.element || null, // Use specific element or null
                monsterData.favoredStat,
                masterId // Assign the master's ID
            );

            // Position monster near the master (adjust offset as needed)
            const offsetAngle = angle + (monsterIndex === 0 ? -0.1 : 0.1); // Slight angle offset
            const offsetRadius = 100; // Distance from master
            monster.mesh.position.x = x + offsetRadius * Math.cos(offsetAngle);
            monster.mesh.position.y = y + offsetRadius * Math.sin(offsetAngle);
            monster.mesh.position.z = calculateZPosition(monster.mesh.position.y);
            monster.lastPosition.copy(monster.mesh.position);
            monster.targetPosition.copy(monster.mesh.position);
            monster.originalPosition = new THREE.Vector3().copy(monster.mesh.position);

            gameState.bossMonsters.push(monster);
            gameState.scene.add(monster.mesh);
        });
    }
    console.log(`Spawned ${numBosses} boss masters (Team 0) and their monsters in Area 1.`);
}

/**
 * Initiates the boss fight by changing teams and removing chat bubbles.
 * @param {number} clickedMasterId - The ID of the master whose bubble was clicked.
 */
function startBossFight(clickedMasterId) {
    // Find the specific boss master and their monsters first
    const targetMaster = gameState.bossMasters.find(m => m.id === clickedMasterId);
    if (!targetMaster) {
        console.error(`Could not find boss master with ID ${clickedMasterId} to start fight.`);
        return;
    }
    const targetMonsters = gameState.bossMonsters.filter(m => m.masterId === clickedMasterId);
    if (targetMonsters.length === 0) {
        console.error(`Could not find monsters for boss master ID ${clickedMasterId}.`);
        // Optionally add a chat message here too
        return;
    }

    // Calculate total levels
    const playerTotalLevel = gameState.player.monsters.reduce((sum, monster) => sum + monster.level, 0);
    const bossTotalLevel = targetMonsters.reduce((sum, monster) => sum + monster.level, 0);
    const requiredPlayerLevel = bossTotalLevel - 10;

    // Level Check
    if (playerTotalLevel < requiredPlayerLevel) {
        addChatMessage(`Your active monsters aren't strong enough! Their total level must be at least ${requiredPlayerLevel}.`, 5000);
        return; // Stop if player level is too low
    }

    // Fight is going to start, set flag
    gameState.inBossFight ++;

    // --- Proceed with fight initiation --- 
    console.log(`Boss fight initiated against master ${clickedMasterId}!`);
    addChatMessage(`Binder Master ${clickedMasterId} turns hostile!`, 5000);

    // Change team for the specific boss master
    targetMaster.team = 2;

    // Change team for the specific boss monsters associated with this master
    for (const monster of targetMonsters) {
        monster.team = 2;
    }

    // Remove and dispose of the specific boss chat bubble
    if (targetMaster.chatBubble) {
        const bubbleMesh = targetMaster.chatBubble;
        console.log(`Removing chat bubble for master ${clickedMasterId}.`);
        
        // Remove from scene
        gameState.scene.remove(bubbleMesh);
        
        // Dispose geometry and material
        if (bubbleMesh.geometry) bubbleMesh.geometry.dispose();
        if (bubbleMesh.material) {
            if (bubbleMesh.material.map) bubbleMesh.material.map.dispose();
            bubbleMesh.material.dispose();
        }
        
        // Remove from the global chat bubble registry
        const registryIndex = gameState.chatBubbles.findIndex(b => b.mesh === bubbleMesh);
        if (registryIndex !== -1) {
            gameState.chatBubbles.splice(registryIndex, 1);
        }
        
        // Remove from the boss-specific bubble list
        const bossBubbleIndex = gameState.bossChatBubbles.indexOf(bubbleMesh);
        if (bossBubbleIndex !== -1) {
            gameState.bossChatBubbles.splice(bossBubbleIndex, 1);
        }
        
        // Clear the reference on the master object
        targetMaster.chatBubble = null;
    }
}

// Update cleanup function to handle chat bubbles
function cleanupBossMasters() {
    // Remove boss monsters (existing code)
    for (let i = gameState.bossMonsters.length - 1; i >= 0; i--) {
        const monster = gameState.bossMonsters[i];
        // ... (rest of monster cleanup) ...
        if (monster.mesh) {
            // Dispose geometry and material
            if (monster.mesh.geometry) {
                monster.mesh.geometry.dispose();
            }
            if (monster.monsterMesh && monster.monsterMesh.material) { // Original monster material
                if (monster.monsterMesh.material.map) monster.monsterMesh.material.map.dispose();
                monster.monsterMesh.material.dispose();
            }
             if (monster.uiLabel && monster.uiLabel.sprite && monster.uiLabel.sprite.material) { // UI Label material
                if (monster.uiLabel.sprite.material.map) monster.uiLabel.sprite.material.map.dispose();
                 monster.uiLabel.sprite.material.dispose();
             }
            if (monster.elementSphere && monster.elementSphere.geometry) { // Element sphere geometry/material
                monster.elementSphere.geometry.dispose();
                if (monster.elementSphere.material) monster.elementSphere.material.dispose();
            }
            // Remove the container mesh from the scene
            gameState.scene.remove(monster.mesh);
        }
    }
    gameState.bossMonsters = [];

    // Remove boss masters and their chat bubbles
    for (let i = gameState.bossMasters.length - 1; i >= 0; i--) {
        const master = gameState.bossMasters[i];
        
        // Remove and dispose chat bubble
        if (master.chatBubble) {
            gameState.scene.remove(master.chatBubble);
            if (master.chatBubble.geometry) master.chatBubble.geometry.dispose();
            if (master.chatBubble.material) {
                if (master.chatBubble.material.map) master.chatBubble.material.map.dispose();
                master.chatBubble.material.dispose();
            }
            // Remove from the global chat bubble registry
            const registryIndex = gameState.chatBubbles.findIndex(b => b.mesh === master.chatBubble);
            if (registryIndex !== -1) {
                gameState.chatBubbles.splice(registryIndex, 1);
            }
            master.chatBubble = null; // Clear reference
        }
        
        // Remove master mesh (existing code)
        if (master.mesh) {
            if (master.mesh.geometry) {
                master.mesh.geometry.dispose();
            }
            if (master.mesh.material) {
                master.mesh.material.dispose();
            }
            gameState.scene.remove(master.mesh);
        }
    }
    gameState.bossMasters = [];
    gameState.bossChatBubbles = []; // Ensure boss bubble list is clear
}

// Main game loop
function gameLoop(time) {
    // If window is not focused, throttle to approximately 10 FPS
    const isBackgroundCapped = !gameState.windowFocused;
    if (isBackgroundCapped) {
        // Calculate time since last frame
        const timeSinceLastFrame = time - gameState.lastTime;
        // If less than 100ms (10 FPS) has passed, skip this frame
        if (timeSinceLastFrame < 100) {
            requestAnimationFrame(gameLoop);
            return;
        }
    }

    // Calculate delta time
    const deltaTime = (time - gameState.lastTime) / 1000; // Convert to seconds
    gameState.lastTime = time;
    let gamePaused = false;

    // Calculate and display framerate
    const frameRate = 1 / deltaTime;
    
    // Update framerate display with moving average
    if (!gameState.fpsHistory) {
        gameState.fpsHistory = [];
    }
    gameState.fpsHistory.push(frameRate);
    if (gameState.fpsHistory.length > 10) {
        gameState.fpsHistory.shift();
    }
    const avgFps = Math.round(gameState.fpsHistory.reduce((a, b) => a + b, 0) / gameState.fpsHistory.length);
    
    // Display FPS with background capped indicator if needed
    const fpsText = isBackgroundCapped ? `FPS: ${avgFps} (Background capped)` : `FPS: ${avgFps}`;
    document.getElementById('fpsCounter').textContent = fpsText;
    
    // Check if any UI is open
    if (gameState.storageUIOpen || gameState.captureUIOpen || gameState.detailsUIOpen || gameState.helpUIOpen) {
        gamePaused = true;
    }

    // Pause game if any UI is open
    if (gamePaused) {
        // Render the scene
        gameState.renderer.render(gameState.scene, gameState.camera);
    
        // Continue the game loop
        requestAnimationFrame(gameLoop);
        return
    }
    
    // Cap delta time to prevent physics issues after tab switching
    const cappedDeltaTime = Math.min(deltaTime, 0.1);
    
    // Check portal interaction if in level 1
    if (gameState.currentArea === 1 && gameState.portalMesh) {
        const distanceToPortal = gameState.player.position.distanceTo(gameState.portalMesh.position);
        if (distanceToPortal < 15) {
            // Reset player position first
            gameState.player.position.set(0, 0, 0);
            gameState.player.mesh.position.copy(gameState.player.position);
            gameState.player.mesh.position.z = calculateZPosition(gameState.player.position.y, true);
            
            // Update camera
            gameState.camera.position.x = 0;
            gameState.camera.position.y = 0;
            gameState.camera.lookAt(0, 0, 0);
            
            // Reset click target
            gameState.clickTargetPosition = null;
            
            //FOR DEBUG PURPOSES ONLY
            //bossMonsterDebug();
            
            // Redirect to website
            window.location.href = 'http://portal.pieter.com/';
        }
    }
    
    // Update time since last damage for all monsters (only when game is not paused)
    const allMonsters = [...gameState.player.monsters, ...gameState.player.storedMonsters, ...gameState.wildMonsters, ...gameState.bossMonsters];
    for (const monster of allMonsters) {
        if (monster.defeated) continue;
        monster.timeSinceCombat += cappedDeltaTime;
    }
    
    // Handle monster collisions and aggro in a single optimized pass
    handleMonsterCollisionsAndAggro();
    
    // Update player movement
    updatePlayerMovement(cappedDeltaTime);
    
    // Update master movement (before monster following)
    updateMasterMovement(cappedDeltaTime);
    
    // Update monster following
    updateMonsterFollowing(cappedDeltaTime);
    
    // Update wild monster aggro behaviors
    updateWildMonsterBehaviors(cappedDeltaTime);
    
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
    
    // Update floating element spheres
    updateElementSpheres(cappedDeltaTime);
    
    // Auto-save every 5 seconds
    if (!gameState.lastSaveTime) {
        gameState.lastSaveTime = time;
        gameState.saveCounter = 0;
    } else if (time - gameState.lastSaveTime >= 5000) { // 5000ms = 5 seconds
        saveGame();
        gameState.lastSaveTime = time;
        gameState.saveCounter = (gameState.saveCounter + 1) % 24;
        if (gameState.saveCounter === 2) {
            addChatMessage("Game auto-saves every 5 seconds.", 3000);
        }

        // Check if music should be playing but isn't
        if (!gameState.musicSavedOff && backgroundMusic && backgroundMusic.paused) {
            backgroundMusic.play().catch(error => {
                console.log("Failed to play music:", error);
            });
        }
    }
    
    // Render the scene
    gameState.renderer.render(gameState.scene, gameState.camera);
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

// Update floating element spheres
function updateElementSpheres(deltaTime) {
    const allMonsters = [...gameState.player.monsters, ...gameState.wildMonsters, ...gameState.bossMonsters, ...gameState.player.storedMonsters];
    
    for (const monster of allMonsters) {
        // Check if the monster has an element sphere
        if (monster.elementSphere) {
            // Update the movement timer
            monster.elementSphereMoveTimer -= deltaTime;

            // If timer is up, set a new random target position
            if (monster.elementSphereMoveTimer <= 0) {
                monster.elementSphereTarget.x = (Math.random() - 0.5) * 100; // -50 to +50
                monster.elementSphereTarget.y = (Math.random() - 0.5) * 100; // -50 to +50
                monster.elementSphereTarget.z = (Math.random() - 0.5) * 1;   // -0.5 to +0.5

                // Reset the timer (e.g., 1 to 3 seconds)
                monster.elementSphereMoveTimer = Math.random() * 2 + 1; 
            }

            // Smoothly move the sphere towards the target position using lerp
            const lerpFactor = 1.0 * deltaTime; // Adjust speed here (higher means faster movement)
            monster.elementSphere.position.lerp(monster.elementSphereTarget, lerpFactor);
        }
    }
}

// Handle monster collisions and aggro range in a single pass to optimize performance
function handleMonsterCollisionsAndAggro() {
    // Combine all monsters into a single array
    const allMonsters = [...gameState.player.monsters, ...gameState.wildMonsters, ...gameState.bossMonsters];
    const numMonsters = allMonsters.length;

    // Temporary storage for potential aggro targets found during the pair checks
    // Format: { monsterId: { target: potentialTarget, distance: closestDistance } }
    const potentialTargets = new Map();

    // Check each monster against every other monster (unique pairs)
    for (let i = 0; i < numMonsters; i++) {
        const monster = allMonsters[i];
        
        // Skip if monster is defeated
        if (monster.defeated) continue;
        
        // Ensure entry exists in potentialTargets map for this monster
        if (!potentialTargets.has(monster.id)) {
            potentialTargets.set(monster.id, { target: null, distance: Infinity });
        }
        
        // Check against subsequent monsters to avoid redundant pairs
        for (let j = i + 1; j < numMonsters; j++) {
            const target = allMonsters[j];
            
            // Skip if target is defeated
            if (target.defeated) continue;
            
            // Ensure entry exists for the target monster as well
            if (!potentialTargets.has(target.id)) {
                potentialTargets.set(target.id, { target: null, distance: Infinity });
            }

            // Calculate distance between monsters only once
            const distance = monster.mesh.position.distanceTo(target.mesh.position);
            
            // ---- COLLISION HANDLING ----
            // Handle collision avoidance (symmetrical)
            if (distance < GAME_CONFIG.monsterCollisionDistance) {
                // Calculate direction vector between monsters
                const direction = new THREE.Vector3()
                    .subVectors(monster.mesh.position, target.mesh.position)
                    .normalize();
                
                // Calculate how far to move each monster to reach collision distance
                const moveDistance = (GAME_CONFIG.monsterCollisionDistance - distance) / 2;
                
                // Move monsters apart instantly
                monster.mesh.position.x += direction.x * moveDistance;
                monster.mesh.position.y += direction.y * moveDistance;
                monster.mesh.position.z = calculateZPosition(monster.mesh.position.y);
                
                target.mesh.position.x -= direction.x * moveDistance;
                target.mesh.position.y -= direction.y * moveDistance;
                target.mesh.position.z = calculateZPosition(target.mesh.position.y);
            }
            
            // ---- AGGRO POTENTIAL CHECK (BOTH DIRECTIONS) ----

            // --- Check if monster (i) can target target (j) ---
            checkAggroPotential(monster, target, distance, potentialTargets);

            // --- Check if target (j) can target monster (i) ---
            checkAggroPotential(target, monster, distance, potentialTargets);

        }
    }

    // ---- FINAL AGGRO TARGET ASSIGNMENT ----
    // Iterate through all monsters again to assign the best target found
    for (const monster of allMonsters) {
         // Skip defeated monsters
        if (monster.defeated) continue;

        // Skip setting aggro if player monster (team 0) is chasing player
        if (monster.team === 0 && monster.chasingPlayer) continue;
        
        const potential = potentialTargets.get(monster.id);

        // If a valid potential target was found
        if (potential && potential.target) {
            // If monster already has a target, only switch if new potential target is closer
            // OR if the current target is defeated
            if (monster.aggroTarget && !monster.aggroTarget.defeated) {
                const currentDistance = monster.mesh.position.distanceTo(monster.aggroTarget.mesh.position);
                if (potential.distance < currentDistance) {
                    // Switch to closer target
                    monster.aggroTarget = potential.target;
                    monster.isAggroed = true;
                    monster.returningToOrigin = false;
                    monster.aggroPlayer = false; // Ensure aggroPlayer is off
                }
                 // If potential target is the same as current, ensure isAggroed is true
                else if (potential.target.id === monster.aggroTarget.id) {
                     monster.isAggroed = true;
                     monster.returningToOrigin = false;
                     monster.aggroPlayer = false;
                }
            } else {
                // No current target, or current target is defeated, set the potential one
                monster.aggroTarget = potential.target;
                monster.isAggroed = true;
                monster.returningToOrigin = false;
                monster.aggroPlayer = false; // Ensure aggroPlayer is off
            }
        } else {
            // No valid potential target found, clear aggro state if not already returning/aggroPlayer
            if (!monster.returningToOrigin && !monster.aggroPlayer) {
                monster.aggroTarget = null;
                monster.isAggroed = false;
            }
        }
    }
}

// Helper function to check aggro potential between two monsters
function checkAggroPotential(attacker, defender, distance, potentialTargets) {
    // Basic checks
    if (attacker.defeated || defender.defeated) return;
    if (attacker.team === 0 && attacker.chasingPlayer) return; // Skip if attacker is player monster chasing player

    // Team targeting rules
    if (defender.team === attacker.team ||
        (attacker.team === 1 && defender.team === 2) ||
        (attacker.team === 2 && defender.team === 1)) {
        return; // Invalid team matchup
    }

    // Determine appropriate aggro range
    const attackerAggroRange = attacker.team === 0 ? GAME_CONFIG.playerMonsterAggroRange : GAME_CONFIG.aggroRange;

    // Check range
    if (distance > attackerAggroRange) {
        return; // Out of range
    }

    // For WILD monsters (team 1), check if defender is within their wander distance
    if (attacker.team === 1 && attacker.originalPosition) {
        const targetDistanceFromOrigin = defender.mesh.position.distanceTo(attacker.originalPosition);
        if (targetDistanceFromOrigin > GAME_CONFIG.maxMonsterWanderDistance) {
            return; // Target too far from WILD monster's origin
        }
    }

    // Check if this defender is closer than the attacker's current best potential target
    const currentPotential = potentialTargets.get(attacker.id);
    if (distance < currentPotential.distance) {
        // Update the potential target for the attacker
        potentialTargets.set(attacker.id, { target: defender, distance: distance });
    }
}

// Initialize the game
function init() {
    
    // Enable navigation prompt if they try to leave page
    window.onbeforeunload = function() {
        return true;
    };

    // Initialize gameState first
    initializeGameState();
    
    // Initialize Three.js
    initThree();
    
    // Load monster textures
    loadMonsterTextures();
    
    // Check for saved game
    const saveData = JSON.parse(localStorage.getItem('gameState'));
    const hasSaveGame = saveData !== null;
    
    if (hasSaveGame) {
        // Initialize player without starter monster first
        initPlayer(false);
        
        // Load the saved game data
        loadGame();
        
        // Set up the area based on saved area level
        const areaInfo = AREAS[gameState.currentArea];
        if (gameState.scene) {
            gameState.scene.background = new THREE.Color(areaInfo.backgroundColor);
        }
        updateAreaDisplay();
        
        // Spawn wild monsters for the saved area
        spawnWildMonsters(gameState.currentArea);
    } else {
        // Show help button with flashing effect for new players
        const helpButton = document.getElementById('helpButton');
        helpButton.style.display = 'flex';
        helpButton.classList.add('flash');
        gameState.helpUIOpen = false;
        
        // Initialize new player with starter monster
        initPlayer(true);
        
        // Spawn wild monsters (Area Level 1)
        spawnWildMonsters(1, null);
    }
    
    // Spawn boss masters OR create Town NPC if starting in Area 1
    if (gameState.currentArea === 1) {
        console.log("Init: Starting in Area 1. Spawning bosses and creating NPC."); // Debug log
        spawnBossMasters(1);
        createTownNPC(); // Create/Show NPC if starting in Area 1
    } else {
        console.log("Init: Starting outside Area 1. Hiding NPC."); // Debug log
        // Ensure NPC state is clear if starting outside Area 1 initially
        if (gameState.townNPC) {
             hideTownNPC();
        }
    }
    
    // Set random position for next area entrance
    setRandomNextAreaPosition();
    
    // Add exit marker
    addAreaExit();
    
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
        document.getElementById('monsterDetailsUI')
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
        gameState.captureUIOpen = false;
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

    // If a click happens, assume the window should be focused
    gameState.windowFocused = true;

    // Don't process if storage UI is open
    if (gameState.storageUIOpen) {
        return;
    }
    
    // Convert mouse position to world coordinates for chat bubble interaction
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Raycasting to get clicked position
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, gameState.camera);
    
    // Check if clicked on any chat bubble
    if (gameState.chatBubbles && gameState.chatBubbles.length > 0) {
        for (const bubble of gameState.chatBubbles) {
            if (bubble.mesh && bubble.mesh.visible) {
                const intersects = raycaster.intersectObject(bubble.mesh);
                if (intersects.length > 0 && bubble.clickHandler) {
                    // Call the handler function
                    bubble.clickHandler();
                    return; // Stop processing after handling click
                }
            }
        }
    }
    
    // Fall back to old town NPC check for backwards compatibility
    if (gameState.townNPC && gameState.townNPC.labelMesh && gameState.townNPC.labelMesh.visible) {
        const intersects = raycaster.intersectObject(gameState.townNPC.labelMesh);
        if (intersects.length > 0) {
            // Open Discord URL in a new tab
            window.open(gameState.discordUrl, '_blank');
            // Don't set mouse down flag to prevent movement
            return; // Stop processing after opening link
        }
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
    
    // Don't process if mouse is not down, if any UI is open, or if clicking UI elements
    if (!gameState.isMouseDown || gameState.storageUIOpen || gameState.captureUIOpen || gameState.detailsUIOpen || isClickingUI(event)) {
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

    // If a touch happens, assume the window should be focused
    gameState.windowFocused = true;

    // Don't process if storage UI is open
    if (gameState.storageUIOpen) {
        return;
    }
    
    // Don't process if touching UI elements
    if (isClickingUI(event)) {
        gameState.isMouseDown = false;
        return;
    }
    
    // Use first touch point
    if (event.touches.length > 0) {
        const touch = event.touches[0];
        
        // Convert touch position to world coordinates for chat bubble interaction
        const mouse = new THREE.Vector2();
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        
        // Raycasting to get touched position for chat bubble interaction
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, gameState.camera);
        
        // Check if touched on any chat bubble
        if (gameState.chatBubbles && gameState.chatBubbles.length > 0) {
            for (const bubble of gameState.chatBubbles) {
                if (bubble.mesh && bubble.mesh.visible) {
                    const intersects = raycaster.intersectObject(bubble.mesh);
                    if (intersects.length > 0 && bubble.clickHandler) {
                        // Call the handler function
                        bubble.clickHandler();
                        return; // Stop processing after handling click
                    }
                }
            }
        }
        
        // Fall back to old town NPC check for backwards compatibility
        if (gameState.townNPC && gameState.townNPC.labelMesh && gameState.townNPC.labelMesh.visible) {
            const intersects = raycaster.intersectObject(gameState.townNPC.labelMesh);
            if (intersects.length > 0) {
                // Open Discord URL in a new tab
                window.open(gameState.discordUrl, '_blank');
                // Don't set touch flag to prevent movement
                return; // Stop processing after opening link
            }
        }
        
        // Set mouse down flag
        gameState.isMouseDown = true;
        
        // Store touch position
        gameState.lastMousePosition.x = touch.clientX;
        gameState.lastMousePosition.y = touch.clientY;
        
        // Check if capture UI is open
        const captureUIOpen = document.getElementById('captureUI').style.display === 'block';
        
        // Calculate intersection with z=0 plane for movement/capture targets
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
            gameState.captureUIOpen = false;
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
    
    // Don't process if not touching, if any UI is open, or if touching UI elements
    if (!gameState.isMouseDown || gameState.storageUIOpen || gameState.captureUIOpen || gameState.detailsUIOpen || isClickingUI(event)) {
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
    
    // Calculate new position
    const newPosition = new THREE.Vector3(
        gameState.player.position.x + direction.x * Math.min(distanceToTarget, GAME_CONFIG.playerSpeed * deltaTime),
        gameState.player.position.y + direction.y * Math.min(distanceToTarget, GAME_CONFIG.playerSpeed * deltaTime),
        0
    );
    
    // Define boundaries (half of the background plane size)
    const boundary = 2500; // 5000/2
    
    // Check if new position would be within square bounds
    if (Math.abs(newPosition.x) <= boundary && Math.abs(newPosition.y) <= boundary) {
        // Update player position
        gameState.player.position.copy(newPosition);
        
        // Update player mesh with Z position calculation
        gameState.player.mesh.position.copy(gameState.player.position);
        gameState.player.mesh.position.z = calculateZPosition(gameState.player.position.y, true);
    } else {
        // If target is outside bounds, clamp to the nearest valid position on the square boundary
        const clampedX = Math.max(-boundary, Math.min(boundary, newPosition.x));
        const clampedY = Math.max(-boundary, Math.min(boundary, newPosition.y));
        
        // Update player position to the clamped position
        gameState.player.position.set(clampedX, clampedY, 0);
        gameState.player.mesh.position.copy(gameState.player.position);
        gameState.player.mesh.position.z = calculateZPosition(gameState.player.position.y, true);
        
        // Clear target position to stop movement
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

// Add the new function for updating the boss master's movement
function updateMasterMovement(deltaTime) {
    // Check if player has any active monsters - if not, bosses shouldn't follow
    if (gameState.player.monsters.length === 0) {
        return; // Exit the function entirely if player has no active monsters
    }
    
    // Iterate through all boss masters
    for (const master of gameState.bossMasters) {
        // Check if bossMaster exists and has a mesh
        if (!master || !master.mesh || !master.position) {
            continue;
        }
        
        // Check if all monsters for this master are defeated
        const associatedMonsters = gameState.bossMonsters.filter(m => m.masterId === master.id);
        const allMonstersDefeated = associatedMonsters.length > 0 && associatedMonsters.every(m => m.defeated);

        if (allMonstersDefeated) {
            continue; // Stop following if all monsters are down
        }

        if (master.team === 0) {
            continue; // Skip movement logic if the master is not hostile
        }

        const playerPos = gameState.player.position;
        const masterPos = master.position;

        // Ensure masterPos is valid
        if (!masterPos) {
            console.error("Boss master position is undefined for ID:", master.id);
            continue;
        }

        const distanceToPlayer = masterPos.distanceTo(playerPos);

        // Retreat check: Stop moving if player is beyond the extended aggro range
        if (distanceToPlayer > GAME_CONFIG.aggroRange + 100) { // Check against aggroRange + 100
            continue; // Stop processing this master for this frame
        }

        // Follow player, maintaining a distance of 200
        const followDistance = 200;
        if (distanceToPlayer > followDistance) {
            const direction = new THREE.Vector3()
                .subVectors(playerPos, masterPos)
                .normalize();

            const speed = GAME_CONFIG.playerSpeed * 1.1 * deltaTime; // Boss Master moves slightly faster than player
            const movement = Math.min(speed, distanceToPlayer - followDistance);

            masterPos.x += direction.x * movement;
            masterPos.y += direction.y * movement;

            master.mesh.position.copy(masterPos);
            master.mesh.position.z = calculateZPosition(masterPos.y, true); 
        } else {
        }
    }
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
                
                // Set timeSinceCombat to a high value to ensure monster is considered out of combat
                monster.timeSinceCombat = 9999;
                
                // Make visible again
                monster.mesh.visible = true;
                
                // Update UI
                updateUILabel(monster.uiLabel, monster);

                // Check if monster is in stored monsters and player has less than 2 active monsters
                const isStored = gameState.player.storedMonsters.includes(monster);
                
                // *** ADDED CHECK: Only auto-activate if NOT in a boss fight ***
                if (isStored && gameState.player.monsters.length < 2 && gameState.inBossFight === 0) {
                    // Remove from stored monsters
                    const storedIndex = gameState.player.storedMonsters.indexOf(monster);
                    if (storedIndex !== -1) {
                        gameState.player.storedMonsters.splice(storedIndex, 1);
                    }
                    
                    // Add to active monsters using addMonsterToPlayer
                    addMonsterToPlayer(monster);
                    
                    // Add chat message
                    addChatMessage(`${monster.name} has revived and joined your active team!`, 5000);
                    
                    // Update storage UI
                    updateStorageUI();
                } else {
                    // Add chat message for normal revival
                    addChatMessage(`${monster.name} has revived in your storage!`, 5000);
                }
            }
        }
    }
}

// Check for next area transition
function checkAreaTransition() {

    // Check for next area entrance
    const distanceToNextArea = gameState.player.position.distanceTo(gameState.nextAreaPosition);
    
    // Check for previous area entrance (250 units south of spawn)
    const distanceToPreviousArea = gameState.player.position.distanceTo(new THREE.Vector3(0, -250, 0));
    
    // Check if player is near either entrance
    const isNextArea = distanceToNextArea < 50;
    if (isNextArea || distanceToPreviousArea < 50) {
        
        // Determine if area transition is allowed
        const canTransition = isNextArea ? 
            gameState.currentArea < Object.keys(AREAS).length :
            gameState.currentArea > 1;
            
        if (!canTransition) {
            // Show appropriate message if transition not allowed
            if (isNextArea) {
                addChatMessage("You've reached the final area! There's nowhere else to go...", 3000);
            }
            return;
        }
        if (isNextArea) {
            areaTransition(gameState.currentArea + 1);
        } else {
            areaTransition(gameState.currentArea - 1);
        }
    }
}

function areaTransition(newArea) {
    const previousArea = gameState.currentArea; // Store previous area for logging

    const isNextArea = newArea > previousArea;
    gameState.currentArea = newArea;
    
    //Stop player movement
    gameState.clickTargetPosition = null;

    // Update previous area mesh visibility
    if (gameState.previousAreaMesh) {
        gameState.previousAreaMesh.visible = gameState.currentArea > 1;
    }
    if (gameState.previousAreaLabel) {
        gameState.previousAreaLabel.visible = gameState.currentArea > 1;
        
        // Update previous area label text
        const prevAreaName = AREAS[gameState.currentArea - 1]?.name || "Unknown Area";
        const prevCanvas = document.createElement('canvas');
        const prevContext = prevCanvas.getContext('2d');
        prevCanvas.width = 384;
        prevCanvas.height = 96;
        
        prevContext.fillStyle = 'white';
        prevContext.font = 'bold 38px Arial';
        prevContext.textAlign = 'center';
        prevContext.textBaseline = 'middle';
        prevContext.fillText(`${prevAreaName}`, prevCanvas.width/2, prevCanvas.height/2);
        
        gameState.previousAreaLabel.material.map = new THREE.CanvasTexture(prevCanvas);
        gameState.previousAreaLabel.material.needsUpdate = true;
    }

    // Get area info
    const areaInfo = AREAS[newArea];
    
    // Update background color and texture
    if (gameState.scene) {
        gameState.scene.background = new THREE.Color(areaInfo.backgroundColor);
        updateBackgroundTexture();
        
        // Preload textures for the new area's adjacent areas
        preloadAdjacentAreaTextures(newArea);
    }
    
    // Show transition message
    addChatMessage(isNextArea ?
        `Ascending to ${areaInfo.name}! ${areaInfo.description}` :
        `Descending to ${areaInfo.name}! ${areaInfo.description}`
    );
    
    // Update area display
    updateAreaDisplay();
    
    // Reset player position to start of new area
    gameState.player.position.set(0, 0, 0);
    gameState.player.mesh.position.copy(gameState.player.position);
    gameState.player.mesh.position.z = calculateZPosition(gameState.player.position.y, true);
    
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

    // Clear existing capture targets
    gameState.captureTargets.forEach(target => {
        if (target.mesh && target.mesh.parent) {
            target.mesh.parent.remove(target.mesh);
            // Optional: Dispose geometry/material if needed
            // if (target.mesh.geometry) target.mesh.geometry.dispose();
            // if (target.mesh.material) target.mesh.material.dispose();
        }
    });
    gameState.captureTargets = [];

    // Hide capture UI if it was open
    if (gameState.captureUIOpen) {
        document.getElementById('captureUI').style.display = 'none';
        gameState.captureUIOpen = false;
    }

    // Clean up boss masters / Hide NPC if leaving Area 1
    if (previousArea === 1 && newArea !== 1) {
        console.log(`[Area Transition] Leaving Area 1. Cleaning up bosses and hiding NPC.`); // Debug log
        cleanupBossMasters();
        hideTownNPC(); // Hide NPC when leaving Area 1
    } else {
        // console.log(`[Area Transition] Not leaving Area 1.`);
    }
    
    // Set new random position for next area entrance
    setRandomNextAreaPosition();
    
    // Update next area mesh position
    if (gameState.nextAreaMesh) {
        gameState.nextAreaMesh.position.copy(gameState.nextAreaPosition);
    }

    // Update next area label position and text
    if (gameState.nextAreaLabel) {
        gameState.nextAreaLabel.position.copy(gameState.nextAreaPosition);
        gameState.nextAreaLabel.position.y += 50; // Reduced from 100 to 50 units
        
        // Update label text
        const nextAreaName = AREAS[gameState.currentArea + 1]?.name || "Unknown Area";
        const nextCanvas = document.createElement('canvas');
        const nextContext = nextCanvas.getContext('2d');
        nextCanvas.width = 384;
        nextCanvas.height = 96;
        
        nextContext.fillStyle = 'white';
        nextContext.font = 'bold 38px Arial';
        nextContext.textAlign = 'center';
        nextContext.textBaseline = 'middle';
        nextContext.fillText(`${nextAreaName}`, nextCanvas.width/2, nextCanvas.height/2);
        
        gameState.nextAreaLabel.material.map = new THREE.CanvasTexture(nextCanvas);
        gameState.nextAreaLabel.material.needsUpdate = true;
    }
    
    // Spawn new monsters for the new area
    spawnWildMonsters(gameState.currentArea);

    // Spawn boss masters / Show or Create NPC if entering Area 1
    if (newArea === 1) {
        console.log(`[Area Transition] Entering Area 1. Spawning bosses and creating/showing NPC.`); // Debug log
        spawnBossMasters(1);
        createTownNPC(); // Create/Show NPC when entering Area 1
    } else {
         // Ensure NPC is hidden if entering non-Area 1
        hideTownNPC();
    }
    
    // Create portal if in level 1 and it doesn't exist yet
    if (newArea === 1 && !gameState.portalMesh) {
        createPortal();
    }
    
    // Update portal visibility based on current area
    if (gameState.portalMesh && gameState.portalLabel) {
        gameState.portalMesh.visible = newArea === 1;
        gameState.portalLabel.visible = newArea === 1;
    }

    // Reset boss fight flag
    gameState.inBossFight = 0;

}


// Update combat logic
function updateCombat(deltaTime) {
    // Combine all relevant monsters
    const combatMonsters = [...gameState.player.monsters, ...gameState.wildMonsters, ...gameState.bossMonsters];

    // Process each monster's movement and attacks
    for (const monster of combatMonsters) {
        // Skip if defeated
        if (monster.defeated) continue;

        if (monster.team === 0) {
            const distanceToPlayer = monster.mesh.position.distanceTo(gameState.player.position);
            // If player monster is too far from player, disengage and chase player
            if (distanceToPlayer > GAME_CONFIG.retreatCheckRange) {
                monster.chasingPlayer = true;
                monster.aggroTarget = null;
                monster.isAggroed = false;
                continue;
            }
        }

        // Get the monster's current target
        let target = monster.aggroTarget;

        // If no valid target exists (not aggroed, or target is defeated), skip combat actions
        if (!monster.isAggroed || !target || target.defeated) {
            // Ensure aggro state is clear if target is invalid
            if (monster.isAggroed && (!target || target.defeated)) {
                monster.aggroTarget = null;
                monster.isAggroed = false;
            }
            continue; // Skip combat logic for this frame
        }
        
        // Calculate distance to target
        const distance = monster.mesh.position.distanceTo(target.mesh.position);

        // Determine the appropriate attack range
        let attackRange = GAME_CONFIG.attackRange;
        // Special shorter range for player's slot 1 monster (team 0, index 0)
        if (monster.team === 0 && gameState.player.monsters.indexOf(monster) === 0) {
            attackRange = GAME_CONFIG.attackRangeSlot1;
        }
        
        // Rolling behavior for Rumble (abilId 13)
        if (hasAbility(monster, 13)) {
            handleRumbleCombat(monster, target, distance, deltaTime);
            continue; // Skip default combat movement/attack
        }

        // Default Combat Logic:
        // If in attack range, attack target
        if (distance <= attackRange) {
            monsterAttack(monster, target, deltaTime);
        }
        // Otherwise, move towards target
        else {
            // Calculate direction
            const direction = new THREE.Vector3()
                .subVectors(target.mesh.position, monster.mesh.position)
                .normalize();

            // Update monster direction before moving
            updateMonsterDirection(monster, target.mesh.position.x);

            // Use appropriate speed based on monster team
            let speed;
            if (monster.team === 0) {
                speed = GAME_CONFIG.playerMonsterSpeed * deltaTime;
            } else if (monster.team === 1) {
                speed = GAME_CONFIG.wildMonsterSpeed * deltaTime;
            } else { // Team 2 (Boss)
                speed = GAME_CONFIG.playerSpeed * 1.1 * deltaTime; // Bosses move slightly faster than player in combat
            }

            // Move towards target
            monster.mesh.position.x += direction.x * speed;
            monster.mesh.position.y += direction.y * speed;
            monster.mesh.position.z = calculateZPosition(monster.mesh.position.y);
        }
    }
}

// Helper function specifically for Rumble's (abilId 13) combat logic
function handleRumbleCombat(monster, target, distance, deltaTime) {
    // Initialize rolling state if not exists
    if (monster.rollingState === undefined) {
        monster.rollingState = 'approaching'; // Start by approaching
    }

    const directionToTarget = new THREE.Vector3()
        .subVectors(target.mesh.position, monster.mesh.position)
        .normalize();

    if (monster.rollingState === 'approaching') {
        // If in attack range, start rolling
        if (distance <= GAME_CONFIG.attackRange) {
            monster.rollingState = 'rolling';
            monster.rollDirection = directionToTarget.clone(); // Start rolling towards target
            monster.rollTurnDirection = Math.random() < 0.5 ? -1 : 1; // Random initial turn
        } else {
            // Move towards target normally while approaching
            const speed = (monster.team === 1 ? GAME_CONFIG.wildMonsterSpeed : GAME_CONFIG.playerMonsterSpeed) * deltaTime;
            monster.mesh.position.x += directionToTarget.x * speed;
            monster.mesh.position.y += directionToTarget.y * speed;
            monster.mesh.position.z = calculateZPosition(monster.mesh.position.y);
        }
    } else if (monster.rollingState === 'rolling') {
        const rollSpeed = 200 * deltaTime; // Fixed rolling speed

        // Apply slight turning while rolling (e.g., 30 degrees/sec)
        const turnAngle = (Math.PI / 6) * deltaTime * monster.rollTurnDirection;
        monster.rollDirection.applyAxisAngle(new THREE.Vector3(0, 0, 1), turnAngle);
        monster.rollDirection.normalize(); // Keep direction normalized

        // Move in the rolling direction
        monster.mesh.position.x += monster.rollDirection.x * rollSpeed;
        monster.mesh.position.y += monster.rollDirection.y * rollSpeed;
        monster.mesh.position.z = calculateZPosition(monster.mesh.position.y);

        // If monster rolls too far (e.g., > 45 units), switch back to approaching
        if (distance > 45) {
            monster.rollingState = 'approaching';
        }

        // Attack if still in range while rolling
        if (distance <= GAME_CONFIG.attackRange) {
            monsterAttack(monster, target, deltaTime);
        }
    }

    // Always update direction to face the target
    updateMonsterDirection(monster, target.mesh.position.x);
}

// Update stamina regeneration
function updateStaminaRegen(deltaTime) {
    // Update all monsters (player, wild, boss, stored)
    const allMonsters = [...gameState.player.monsters, ...gameState.player.storedMonsters, ...gameState.wildMonsters, ...gameState.bossMonsters];
    
    for (const monster of allMonsters) {
        if (monster.defeated) continue;
        
        // Calculate regen rate (1% in combat, 10% out of combat or always 10% for stored monsters)
        const isStored = gameState.player.storedMonsters.includes(monster);
        let regenRate = (inCombat(monster) && !isStored) ? GAME_CONFIG.staminaRegenRateCombat : GAME_CONFIG.staminaRegenRate;
        const regenAmount = monster.maxStamina * regenRate * deltaTime;
        
        // Apply stamina regeneration
        monster.currentStamina = Math.min(monster.maxStamina, monster.currentStamina + regenAmount);
        
        // Update UI
        updateUILabel(monster.uiLabel, monster);
    }
}

// Update HP regeneration (out of combat only)
function updateHPRegen(deltaTime) {
    // Update all monsters (player, wild, boss, stored)
    const allMonsters = [...gameState.player.monsters, ...gameState.player.storedMonsters, ...gameState.wildMonsters, ...gameState.bossMonsters];
    
    for (const monster of allMonsters) {
        if (monster.defeated) continue;
        
        // Calculate regen rate (0% in combat, 5% out of combat or always 5% for stored monsters)
        const isStored = gameState.player.storedMonsters.includes(monster);
        const isInCombat = inCombat(monster); // Capture result
        let regenRate = (isInCombat && !isStored) ? GAME_CONFIG.hpRegenRateCombat : GAME_CONFIG.hpRegenRate;
        if (monster.abilId == 14) {regenRate = 0.025} //Blazey always regens HP at half out of combat rates
        const regenAmount = monster.maxHP * regenRate * deltaTime;
        
        // --- REMOVED Debug Logging ---
        // if (monster.team === 2 && monster.currentHP < monster.maxHP) {
        //     console.log(...);
        // }

        // Apply HP regeneration
        if (monster.currentHP < monster.maxHP && regenAmount > 0) { 
            monster.currentHP = Math.min(monster.maxHP, monster.currentHP + regenAmount);
            updateUILabel(monster.uiLabel, monster);
        }
    }
}

// Update capture targets
function updateCaptureTargets(deltaTime) {
    for (let i = gameState.captureTargets.length - 1; i >= 0; i--) {
        const target = gameState.captureTargets[i];
        
        // Reduce time left
        target.timeLeft -= deltaTime;
        
        // Remove monster's mesh if time expired
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
    const monstersToUpdate = [...gameState.player.monsters, ...gameState.bossMonsters];

    for (const monster of monstersToUpdate) {
        // Skip if defeated or aggroed
        if (monster.defeated || (monster.isAggroed && monster.aggroTarget)) continue;

        let targetEntity = null;
        let speed = 0;
        let distanceFromTarget = 0;
        let monsterIndex = -1; // Index relative to the follow target

        if (monster.team === 0) {
            // --- Player Monster OR Boss Monster (Team 0) Specific Logic ---
            
            // Check if this Team 0 monster belongs to a boss
            if (monster.masterId) {
                // --- Boss Monster (Team 0) Following Master ---
                const master = gameState.bossMasters.find(m => m.id === monster.masterId);
                if (!master || !master.position) continue; // Skip if master not found
                
                targetEntity = master;
                speed = GAME_CONFIG.playerSpeed * 1.1 * deltaTime; // Use boss follow speed
                
                const siblings = gameState.bossMonsters.filter(m => m.masterId === monster.masterId);
                monsterIndex = siblings.findIndex(m => m.id === monster.id);
                if (monsterIndex === -1) continue; // Should not happen
                
                distanceFromTarget = monsterIndex === 0 ?
                    GAME_CONFIG.monsterFollowDistance.slot1 :
                    GAME_CONFIG.monsterFollowDistance.slot2;
            } else {
                // --- Player Monster Following Player ---
            targetEntity = gameState.player;
            speed = GAME_CONFIG.playerMonsterSpeed * deltaTime;

            // Player monster retreat check & direct chase logic
            const distanceToPlayer = monster.mesh.position.distanceTo(targetEntity.position);
            if (monster.chasingPlayer || distanceToPlayer > GAME_CONFIG.retreatCheckRange) {
                if (!monster.chasingPlayer) {
                    monster.chasingPlayer = true; // Start chasing player
                    monster.aggroTarget = null;   // Lose current target
                    monster.isAggroed = false;
                    monster.timeSinceCombat = 9999; // Reset combat timer
                }
                // If close enough to player, stop chasing
                if (distanceToPlayer < 150) { 
                    monster.chasingPlayer = false;
                    // Don't continue here, allow normal follow logic to take over this frame
                } else {
                    // Move towards player directly if chasing
                    const direction = new THREE.Vector3()
                        .subVectors(targetEntity.position, monster.mesh.position)
                        .normalize();
                    updateMonsterDirection(monster, targetEntity.position.x);
                    const chaseSpeed = GAME_CONFIG.playerMonsterSpeed * deltaTime;
                    monster.mesh.position.x += direction.x * chaseSpeed;
                    monster.mesh.position.y += direction.y * chaseSpeed;
                    monster.mesh.position.z = calculateZPosition(monster.mesh.position.y);
                    monster.lastPosition.copy(monster.mesh.position);
                    continue; // Skip standard following logic for this frame while actively chasing
                }
            }
            // Ensure chasing is off if back in range and not actively chasing this frame
            if (!monster.chasingPlayer && distanceToPlayer <= GAME_CONFIG.retreatCheckRange) {
                 monster.chasingPlayer = false; 
            }

            monsterIndex = gameState.player.monsters.indexOf(monster);
            if (monsterIndex === -1) continue; // Should not happen, but safe check

            distanceFromTarget = monsterIndex === 0 ?
                GAME_CONFIG.monsterFollowDistance.slot1 :
                GAME_CONFIG.monsterFollowDistance.slot2;
            }

        } else if (monster.team === 2) {
            // --- Boss Monster (Team 2) Specific Logic ---
            const master = gameState.bossMasters.find(m => m.id === monster.masterId);
            if (!master || !master.position) continue; // Skip if master not found

            targetEntity = master;
            speed = GAME_CONFIG.playerSpeed * 1.1 * deltaTime; // Boss monsters follow slightly faster than player

            const siblings = gameState.bossMonsters.filter(m => m.masterId === monster.masterId);
            monsterIndex = siblings.findIndex(m => m.id === monster.id);
            if (monsterIndex === -1) continue; // Should not happen

            distanceFromTarget = monsterIndex === 0 ?
                GAME_CONFIG.monsterFollowDistance.slot1 :
                GAME_CONFIG.monsterFollowDistance.slot2;
        } else {
            continue; // Skip other teams if any somehow get here
        }

        // --- Common Following Logic (Only runs if not actively chasing player) ---
        if (!targetEntity) continue; // Safety check

        const targetEntityPos = targetEntity.position; // Player or Master position

        // Calculate the direction vector from the monster's last position to the target entity's current position
        const targetDirection = new THREE.Vector3(
            targetEntityPos.x - monster.lastPosition.x,
            targetEntityPos.y - monster.lastPosition.y,
            0
        );

        // Avoid issues if the vector is zero length
        if (targetDirection.lengthSq() > 0.0001) { 
            targetDirection.normalize();
        } else {
            // If no direction change relative to monster, use a default (e.g., straight down)
            // This prevents the target position from becoming NaN if entities haven't moved relative to each other
            targetDirection.set(0, -1, 0); 
        }

        // Calculate the desired target position for the monster (behind target entity)
        const targetPosition = new THREE.Vector3()
            .copy(targetEntityPos)
            .sub(targetDirection.multiplyScalar(distanceFromTarget)); 

        // Update monster direction to face the calculated target position (more natural than facing the entity directly)
        updateMonsterDirection(monster, targetPosition.x);

        // Move towards the calculated target position
        const directionToMove = new THREE.Vector3()
            .subVectors(targetPosition, monster.mesh.position);
            
        const distanceToTargetPos = directionToMove.length(); // Get distance from the vector itself
        directionToMove.normalize(); // Normalize after getting length

        // Only move if not already very close to the target position
        if (distanceToTargetPos > 5) {
            const movement = Math.min(distanceToTargetPos, speed); // Use the correct speed
            monster.mesh.position.x += directionToMove.x * movement;
            monster.mesh.position.y += directionToMove.y * movement;
            monster.mesh.position.z = calculateZPosition(monster.mesh.position.y);
        }

        // Update last position for the next frame's calculation
        monster.lastPosition.copy(monster.mesh.position);
    }
}

// Update wild monster aggro behaviors (chasing without combat)
function updateWildMonsterBehaviors(deltaTime) {
    for (const monster of gameState.wildMonsters) {
        // Skip if defeated or already aggroed
        if (monster.defeated || monster.isAggroed) continue;
        
        // If player has no active monsters, check for player aggro
        if (gameState.player.monsters.length === 0) {
            
            // Calculate distance to player
            const distanceToPlayer = monster.mesh.position.distanceTo(gameState.player.position);
            
            // Calculate player's distance from monster's origin
            const playerDistanceFromOrigin = monster.originalPosition ?
                gameState.player.position.distanceTo(monster.originalPosition) : 0;
            
            // If within aggro range and player is within wander distance, target player directly
            if (distanceToPlayer <= GAME_CONFIG.aggroRange && 
                playerDistanceFromOrigin <= GAME_CONFIG.maxMonsterWanderDistance) {
                
                monster.aggroPlayer = true;
                monster.aggroTarget = null;
                monster.isAggroed = false;
                monster.returningToOrigin = false;
                
                // Move toward player
                const direction = new THREE.Vector3()
                    .subVectors(gameState.player.position, monster.mesh.position)
                    .normalize();
                
                // Move slightly slower than the player when chasing player
                const speed = GAME_CONFIG.playerSpeed * 0.9 * deltaTime;
                
                // Update monster direction before moving
                updateMonsterDirection(monster, gameState.player.position.x);
                
                monster.mesh.position.x += direction.x * speed;
                monster.mesh.position.y += direction.y * speed;
                monster.mesh.position.z = calculateZPosition(monster.mesh.position.y);
                
                // Check if reached the player
                if (distanceToPlayer < 20) {
                    // Teleport player back to start
                    gameState.player.position.set(0, 0, 0);
                    gameState.player.mesh.position.copy(gameState.player.position);
                    gameState.player.mesh.position.z = calculateZPosition(gameState.player.position.y, true);
                    
                    // Update camera
                    gameState.camera.position.x = 0;
                    gameState.camera.position.y = 0;
                    gameState.camera.lookAt(0, 0, 0);
                    
                    // Reset click target
                    gameState.clickTargetPosition = null;
                    
                    // Make all monsters return to origin
                    for (const m of gameState.wildMonsters) {
                        if (m.originalPosition) {
                            m.aggroPlayer = false;
                            m.aggroTarget = null;
                            m.isAggroed = false;
                            m.returningToOrigin = true;
                        }
                    }
                    
                    // Show message
                    addChatMessage("You need monsters to protect you! Lost 10% of your gold and you've been sent back to the start.");
                    gameState.player.gold -= Math.ceil(gameState.player.gold * 0.1);
                    updateGoldDisplay();
                    
                    //Send player back to area 1
                    areaTransition(1);

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
        
        // If monster is returning to its original position
        if (monster.returningToOrigin && monster.originalPosition) {
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
                const speed = GAME_CONFIG.wildMonsterSpeed * 0.8 * deltaTime;
                
                // Move toward origin
                monster.mesh.position.x += direction.x * speed;
                monster.mesh.position.y += direction.y * speed;
                monster.mesh.position.z = calculateZPosition(monster.mesh.position.y);
            }
        }
        // If monster is not aggroed, not returning to origin, and not in combat, do random movement
        else if (!monster.aggroPlayer && !monster.returningToOrigin && !inCombat(monster)) {
            // Initialize random movement target if not set
            if (!monster.randomMoveTarget) {
                monster.randomMoveTimer = 1 + Math.random() * 9;
                monster.randomMoveTarget = new THREE.Vector3();
                monster.randomMoveTarget.x = monster.originalPosition.x;
                monster.randomMoveTarget.y = monster.originalPosition.y;
            }
            
            // Update random movement timer
            monster.randomMoveTimer -= deltaTime;
            
            // If timer is up, set new random target
            if (monster.randomMoveTimer <= 0) {
                // Calculate random movement radius based on area level
                const moveRadius = (gameState.currentArea - 1) * 50;
                
                // Generate random angle
                const angle = Math.random() * Math.PI * 2;
                
                // Calculate new target position within radius
                monster.randomMoveTarget.x = monster.originalPosition.x + Math.cos(angle) * moveRadius;
                monster.randomMoveTarget.y = monster.originalPosition.y + Math.sin(angle) * moveRadius;
                
                // Set new random timer (between 1 and 10 seconds)
                monster.randomMoveTimer = 1 + Math.random() * 9;
            }
            
            // Move toward random target if distance is greater than 5
            if (monster.mesh.position.distanceTo(monster.randomMoveTarget) > 5) {
                const direction = new THREE.Vector3()
                    .subVectors(monster.randomMoveTarget, monster.mesh.position)
                    .normalize();
                
                // Update monster direction before moving
                updateMonsterDirection(monster, monster.randomMoveTarget.x);
                
                // Move at a slower speed for random movement
                const speed = GAME_CONFIG.wildMonsterSpeed * 0.5 * deltaTime;
                
                monster.mesh.position.x += direction.x * speed;
                monster.mesh.position.y += direction.y * speed;
                monster.mesh.position.z = calculateZPosition(monster.mesh.position.y);
            }
        }
    }
}

// Create a wild monster with proper level and type selection
function createWildMonster(areaLevel, x, y) {
    // Determine monster level based on area and distance from center
    const distanceFromCenter = Math.sqrt(x * x + y * y);
    const maxAreaLevel = (areaLevel - 1) * 10;
    const minAreaLevel = (areaLevel - 2) * 10 + 1;
    
    // Calculate level strictly based on distance from center (origin)
    // The closer to center, the lower the level (minimum is minAreaLevel)
    const levelRange = maxAreaLevel - minAreaLevel;
    
    // Get ratio between 0 and 1 of how far from center (0 = center, 1 = edge)
    const distanceRatio = Math.min(1, distanceFromCenter / (GAME_CONFIG.worldSpawnDiameter / 2));
    
    // Apply a curve where monsters close to center are always minimum level
    // The minimum level zone extends for 40% of the map radius
    let level;
    if (distanceRatio < GAME_CONFIG.innerZoneRatio) {
        level = minAreaLevel; // Minimum level for this area (level 1 for area level 2)
    } else {
        // Scale from minAreaLevel to maxAreaLevel for the outer 60% of the map
        // Normalize the distance ratio to be 0-1 for the remaining 60% of the distance
        const adjustedRatio = (distanceRatio - GAME_CONFIG.innerZoneRatio) / GAME_CONFIG.outerZoneRatio;
        level = Math.floor(minAreaLevel + (levelRange * adjustedRatio));
    }
    
    // Have a 50% chance to spawn a monster from this area level, 40% chance to spawn one from any level below,
    // 5% chance to spawn one from the area level above, and 5% chance to spawn any random monster.
    const spawnRoll = Math.random() * 100;
    let availableTypes;
    
    if (spawnRoll < 75) { // 75% chance - spawn from current area level
        //Special case for area 1
        if (areaLevel === 2) {
            availableTypes = Object.keys(MONSTER_TYPES)
                .map(Number)
                .filter(id => id <= 10);
        } else {
            availableTypes = Object.keys(MONSTER_TYPES)
                .map(Number)
                .filter(id => Math.ceil(id / 5) === areaLevel);
        }
    } else if (spawnRoll < 95) { // 20% chance - spawn from any level below
        availableTypes = Object.keys(MONSTER_TYPES)
            .map(Number)
            .filter(id => Math.ceil(id / 5) < areaLevel);
    } else if (spawnRoll < 98) { // 3% chance - spawn from area level above with +5 levels
        availableTypes = Object.keys(MONSTER_TYPES)
            .map(Number)
            .filter(id => Math.ceil(id / 5) === areaLevel + 1);
        level += 5;
    } else { // 2% chance - spawn any random monster with +10 levels
        availableTypes = Object.keys(MONSTER_TYPES).map(Number);
        level += 10;
    }
    
    // Cap the level at the maximum level defined in GAME_CONFIG
    level = Math.min(level, GAME_CONFIG.maxLevel);
    
    if (availableTypes.length === 0) {
        // If initial spawn attempt fails, try spawning from monster types 1-10
        availableTypes = Object.keys(MONSTER_TYPES)
            .map(Number)
            .filter(id => id <= 10);
            
        if (availableTypes.length === 0) {
            console.warn(`No valid monster types for area level ${areaLevel}, skipping spawn`);
            return null;
        }
    }
    
    // Randomly choose from available monster types
    const typeId = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    
    // Check for rare modifiers - each has a separate 5% chance
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
    const monster = createMonster(typeId, level, rareModifiers, 1, level, MONSTER_TYPES[typeId].element); // Pass team = 1 for wild
    
    // Position monster
    monster.mesh.position.set(x, y, calculateZPosition(y));
    monster.lastPosition.copy(monster.mesh.position);
    monster.targetPosition.copy(monster.mesh.position);
    
    // Set original position for random movement and returning behavior
    monster.originalPosition = new THREE.Vector3().copy(monster.mesh.position);
    
    return monster;
}

// Spawn wild monsters
function spawnWildMonsters(areaLevel, count = null) {
    // Clear any existing wild monsters and remove their data
    for (const monster of gameState.wildMonsters) {
        if (monster.mesh) {
            gameState.scene.remove(monster.mesh);
        }
    }
    gameState.wildMonsters = [];

    // FYI: Capturable monsters should also be cleaned up here

    // Spawn nothing if areaLevel === 1 because it is town.
    if (areaLevel === 1) {return};
    
    const spawnArea = GAME_CONFIG.worldSpawnDiameter; // Size of the area in units
    const minDistanceFromOrigin = GAME_CONFIG.minSpawnDistance; // Minimum distance from player
    
    // Calculate number of monsters based on density if count is not provided
    if (count === null) {
        const spawnRegions = Math.floor(spawnArea / GAME_CONFIG.spawnAreaSize);
        const spawnRegionCount = spawnRegions * spawnRegions;
        // Use half density for area level 2
        const density = areaLevel === 2 ? GAME_CONFIG.monsterDensity * 0.5 : GAME_CONFIG.monsterDensity;
        count = spawnRegionCount * density;
        console.log(`Spawning ${count} monsters based on density of ${density} per ${GAME_CONFIG.spawnAreaSize}x${GAME_CONFIG.spawnAreaSize} area`);
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
        
        // Create monster using unified function
        const monster = createWildMonster(areaLevel, x, y);
        if (monster) {
            // Add to scene
            gameState.scene.add(monster.mesh);
            
            // Add to wild monsters array
            gameState.wildMonsters.push(monster);
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
    
    // Create monster using unified function
    const monster = createWildMonster(areaLevel, x, y);
    if (monster) {
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
    
    // Clean up any defeated player monsters that have been revived WARNING: THIS CODE MAY NOT DO ANYTHING EVER
    for (let i = gameState.player.monsters.length - 1; i >= 0; i--) {
        const monster = gameState.player.monsters[i];
        if (monster.defeated && !monster.reviveTimer) {
            // Monster has been defeated and is not being revived
            gameState.player.monsters.splice(i, 1);
        }
    }
}

// Add exit marker for next area
function addAreaExit() {
    // Create next area marker using texture
    const textureLoader = new THREE.TextureLoader();
    const nextTexture = textureLoader.load('assets/stair_up.png');
    const nextGeometry = new THREE.PlaneGeometry(120, 120);
    const nextMaterial = new THREE.MeshBasicMaterial({ 
        map: nextTexture,
        transparent: true,
        side: THREE.DoubleSide
    });
    const nextExitMesh = new THREE.Mesh(nextGeometry, nextMaterial);
    nextExitMesh.position.copy(gameState.nextAreaPosition);
    nextExitMesh.position.z = 0.5;
    gameState.scene.add(nextExitMesh);
    
    // Store reference to next area mesh in gameState
    gameState.nextAreaMesh = nextExitMesh;

    // Create label for next area
    const nextAreaName = AREAS[gameState.currentArea + 1]?.name || "Unknown Area";
    const nextCanvas = document.createElement('canvas');
    const nextContext = nextCanvas.getContext('2d');
    nextCanvas.width = 384;
    nextCanvas.height = 96;
    
    // Set up text
    nextContext.fillStyle = 'white';
    nextContext.font = 'bold 38px Arial';
    nextContext.textAlign = 'center';
    nextContext.textBaseline = 'middle';
    nextContext.fillText(`${nextAreaName}`, nextCanvas.width/2, nextCanvas.height/2);
    
    // Create texture from canvas
    const nextLabelTexture = new THREE.CanvasTexture(nextCanvas);
    const nextLabelGeometry = new THREE.PlaneGeometry(192, 48);
    const nextLabelMaterial = new THREE.MeshBasicMaterial({ 
        map: nextLabelTexture,
        transparent: true,
        side: THREE.DoubleSide
    });
    const nextLabelMesh = new THREE.Mesh(nextLabelGeometry, nextLabelMaterial);
    nextLabelMesh.position.copy(gameState.nextAreaPosition);
    nextLabelMesh.position.y += 50; // Reduced from 100 to 50 units
    nextLabelMesh.position.z = 0.5;
    gameState.scene.add(nextLabelMesh);
    gameState.nextAreaLabel = nextLabelMesh;
    
    // Create previous area marker using texture
    const prevTexture = textureLoader.load('assets/stair_down.png');
    const prevGeometry = new THREE.PlaneGeometry(144, 144); // Doubled size for the stair texture
    const prevMaterial = new THREE.MeshBasicMaterial({ 
        map: prevTexture,
        transparent: true,
        side: THREE.DoubleSide
    });
    const prevExitMesh = new THREE.Mesh(prevGeometry, prevMaterial);
    prevExitMesh.position.set(0, -250, 0.5);
    gameState.scene.add(prevExitMesh);
    
    // Store reference to previous area mesh in gameState
    gameState.previousAreaMesh = prevExitMesh;

    // Create label for previous area
    const prevAreaName = AREAS[gameState.currentArea - 1]?.name || "Unknown Area";
    const prevCanvas = document.createElement('canvas');
    const prevContext = prevCanvas.getContext('2d');
    prevCanvas.width = 384;
    prevCanvas.height = 96;
    
    // Set up text
    prevContext.fillStyle = 'white';
    prevContext.font = 'bold 38px Arial';
    prevContext.textAlign = 'center';
    prevContext.textBaseline = 'middle';
    prevContext.fillText(`${prevAreaName}`, prevCanvas.width/2, prevCanvas.height/2);
    
    // Create texture from canvas
    const prevLabelTexture = new THREE.CanvasTexture(prevCanvas);
    const prevLabelGeometry = new THREE.PlaneGeometry(192, 48);
    const prevLabelMaterial = new THREE.MeshBasicMaterial({ 
        map: prevLabelTexture,
        transparent: true,
        side: THREE.DoubleSide
    });
    const prevLabelMesh = new THREE.Mesh(prevLabelGeometry, prevLabelMaterial);
    prevLabelMesh.position.set(0, -200, 0.5); // Adjusted from -150 to -200 (50 units lower)
    gameState.scene.add(prevLabelMesh);
    gameState.previousAreaLabel = prevLabelMesh;
    
    // Set initial visibility based on current area
    prevExitMesh.visible = gameState.currentArea > 1;
    prevLabelMesh.visible = gameState.currentArea > 1;
    
    // Create direction arrow (only points to next area)
    addDirectionArrow();
}

// Add direction arrow pointing to next area
function addDirectionArrow() {
    // Create arrow shape
    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 16);   // Point of arrow (doubled from 8)
    arrowShape.lineTo(-8, -8);  // Left wing (doubled from -4)
    arrowShape.lineTo(0, -4);   // Inner left notch (doubled from -2)
    arrowShape.lineTo(8, -8);   // Right wing (doubled from 4)
    arrowShape.lineTo(0, 16);   // Back to point (doubled from 8)
    
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

// Set a random position for the next area entrance
function setRandomNextAreaPosition() {

    // If area 1 (town), set it at -500, 0
    if (gameState.currentArea === 1) {
        gameState.nextAreaPosition.set(-500, 0, 0);
        return;
    };

    // Random angle in radians (0 to 2π)
    const randomAngle = Math.random() * Math.PI * 2;
    
    // Fixed distance from center (at the edge of spawn area)
    const distance = 1800;
    
    // Calculate new position using polar coordinates
    const x = Math.cos(randomAngle) * distance;
    const y = Math.sin(randomAngle) * distance;
    
    // Update the next area position
    gameState.nextAreaPosition.set(x, y, 0);
    
    console.log(`Next area entrance set at (${x.toFixed(2)}, ${y.toFixed(2)})`);
}

// Update cooldowns for all monsters
function updateMonsterCooldowns(deltaTime) {
    // Update all monsters (player, wild, boss, stored)
    const allMonsters = [...gameState.player.monsters, ...gameState.player.storedMonsters, ...gameState.wildMonsters, ...gameState.bossMonsters];
    
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
    monster.mesh.position.z = calculateZPosition(monster.mesh.position.y);
}

// Helper function to calculate Z position based on Y coordinate
function calculateZPosition(y, isPlayer = false) {
    // Base Z position is 1
    // For every 1000 units of Y, decrease Z by 0.1
    // This creates a subtle layering effect
    return isPlayer ? 2 - (y / 10000) : 1 - (y / 10000);
}

// Create or update Town NPC
function createTownNPC() {
    // Only proceed if in Area 1
    if (gameState.currentArea !== 1) return;

    const npcPosition = new THREE.Vector3(200, 0, 0); // Updated X position

    // Create NPC mesh (white circle) if it doesn't exist
    if (!gameState.townNPC || !gameState.townNPC.mesh) {
        console.log("Creating Town NPC mesh..."); // Debug log
        const npcGeometry = new THREE.CircleGeometry(30, 32);
        const npcMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const npcMesh = new THREE.Mesh(npcGeometry, npcMaterial);
        npcMesh.position.copy(npcPosition);
        npcMesh.position.z = 1; // Ensure slightly above ground
        gameState.scene.add(npcMesh);

        if (!gameState.townNPC) gameState.townNPC = {};
        gameState.townNPC.mesh = npcMesh;
    }

    // Create NPC label (text bubble) if it doesn't exist
    if (!gameState.townNPC.labelMesh) {
        console.log("Creating Town NPC label..."); // Debug log
        
        // Text content for the town NPC
        const textLines = [
            "Welcome to Monsterbound! First you",
            "must venture forth into the Docile Plains",
            "and beyond to bind stronger monsters.",
            "Once you are strong enough,",
            "defeat the 6 Binder Masters",
            "in this area to beat the game!",
            "Click here to join the Discord server!",
        ];
        
        // Create the chat bubble with a click action to open Discord
        gameState.townNPC.labelMesh = createChatBubble(
            textLines,
            npcPosition,
            new THREE.Vector3(0, 100, 5), // Offset from NPC position
            600, // Width
            280, // Height
            () => window.open(gameState.discordUrl, '_blank'), // Click handler
            'rgba(30, 64, 175, 1)' // Deep blue for Discord link
        );
        
        gameState.scene.add(gameState.townNPC.labelMesh);
    }

    // Ensure meshes are visible (in case they were hidden)
    if (gameState.townNPC.mesh) gameState.townNPC.mesh.visible = true;
    if (gameState.townNPC.labelMesh) gameState.townNPC.labelMesh.visible = true;
    console.log("Town NPC created/shown."); // Debug log
}

/**
 * Creates a chat bubble with text and optional click functionality
 * @param {string[]} textLines - Array of text lines to display
 * @param {THREE.Vector3} basePosition - The base position to place the bubble (usually NPC position)
 * @param {THREE.Vector3} offset - Offset from the base position
 * @param {number} width - Canvas width for the bubble
 * @param {number} height - Canvas height for the bubble
 * @param {Function} clickHandler - Optional function to call when bubble is clicked
 * @param {string | null} specialLastLineColor - Color string (e.g., 'rgba(R,G,B,A)') for the last line, or null/false for no special styling.
 * @returns {THREE.Mesh} The chat bubble mesh
 */
function createChatBubble(textLines, basePosition, offset, width, height, clickHandler = null, specialLastLineColor = null) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const canvasWidth = width || 600;
    const canvasHeight = height || 280;
    const padding = 10;
    const lineHeight = 37.5; // For 30px font

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

        // Style the bubble
    context.fillStyle = 'rgba(255, 255, 255, 0.4)'; // 40% opacity white
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.beginPath();
        context.roundRect(0, 0, canvasWidth, canvasHeight - 15, 10); // Bubble shape, leave space for pointer
        context.fill();
        context.stroke();

        // Add pointer
        context.beginPath();
        context.moveTo(canvasWidth / 2 - 15, canvasHeight - 15);
        context.lineTo(canvasWidth / 2, canvasHeight);
        context.lineTo(canvasWidth / 2 + 15, canvasHeight - 15);
        context.closePath();
        context.fill();
        context.stroke();

        // Style and add text
        context.textAlign = 'center';
        context.textBaseline = 'top';

    // Function to draw text with outline for better readability
    const drawTextWithOutline = (text, x, y, fillStyle) => {
        // Draw text fill first
        context.fillStyle = fillStyle;
        context.fillText(text, x, y);

        // Draw outline on top
        context.lineWidth = 1; // Use line width 1 like default strokeText
        context.strokeStyle = 'rgba(0, 0, 0, 1)'; // Black outline, 100% opacity
        context.strokeText(text, x, y);
    };

    // Draw normal text lines
    context.font = 'bold 30px Arial';
    // Determine lines to process based on whether a special color is provided
    const linesToProcess = specialLastLineColor ? textLines.length - 1 : textLines.length;
    
    for (let i = 0; i < linesToProcess; i++) {
        drawTextWithOutline(textLines[i], canvasWidth / 2, padding + i * lineHeight, 'rgba(0, 0, 0, 1)'); // Black text
    }
    
    // Draw special last line if a color is provided
    if (specialLastLineColor && textLines.length > 0) {
        context.font = 'bold 30px Arial';
        drawTextWithOutline(
            textLines[textLines.length - 1], 
            canvasWidth / 2, 
            padding + (textLines.length - 1) * lineHeight, 
            specialLastLineColor // Apply specified color for last line
        );
    }

        // Create texture and mesh
        const texture = new THREE.CanvasTexture(canvas);
    const labelGeometry = new THREE.PlaneGeometry(canvasWidth * 0.5, canvasHeight * 0.5);
        const labelMaterial = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
    
    // Position the bubble
    labelMesh.position.copy(basePosition);
    labelMesh.position.add(offset);
    
    // Store click handler if provided
    if (clickHandler) {
        if (!gameState.chatBubbles) gameState.chatBubbles = [];
        gameState.chatBubbles.push({
            mesh: labelMesh,
            clickHandler: clickHandler
        });
    }
    
    return labelMesh;
}

// Function to hide Town NPC
function hideTownNPC() {
    if (gameState.townNPC) {
        console.log("Hiding Town NPC..."); // Debug log
        if (gameState.townNPC.mesh) gameState.townNPC.mesh.visible = false;
        if (gameState.townNPC.labelMesh) gameState.townNPC.labelMesh.visible = false;
    } else {
         console.log("Attempted to hide Town NPC, but it doesn't exist."); // Debug log
    }
}