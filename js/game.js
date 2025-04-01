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
        backgroundMusic.src = `assets/sound/Music${currentMusicIndex}.mp3`;
        if (!gameState.musicSavedOff) {
            backgroundMusic.play();
        }
    });
    
    // Randomly select initial track (1 to totalMusicTracks)
    currentMusicIndex = Math.floor(Math.random() * totalMusicTracks) + 1;
    backgroundMusic.src = `assets/sound/Music${currentMusicIndex}.mp3`;
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
    // Skip if texture is already preloaded
    if (preloadedTextures.has(areaNumber)) return;
    
    // Create new texture loader
    const textureLoader = new THREE.TextureLoader();
    
    // Load texture
    const backgroundTexture = textureLoader.load(`assets/backgrounds/${areaNumber}.jpeg`, () => {
        // Once loaded, store it in our preloaded textures map
        backgroundTexture.wrapS = THREE.RepeatWrapping;
        backgroundTexture.wrapT = THREE.RepeatWrapping;
        backgroundTexture.repeat.set(9, 9);
        preloadedTextures.set(areaNumber, backgroundTexture);
    });
}

// Function to update background texture based on current area
function updateBackgroundTexture() {
    if (!gameState.backgroundPlane) return;
    
    // Get the preloaded texture for current area
    const backgroundTexture = preloadedTextures.get(gameState.currentArea);
    
    if (backgroundTexture) {
        // Use preloaded texture
        gameState.backgroundPlane.material.map = backgroundTexture;
        gameState.backgroundPlane.material.needsUpdate = true;
    } else {
        // Fallback to loading texture directly if not preloaded
        const textureLoader = new THREE.TextureLoader();
        const backgroundTexture = textureLoader.load(`assets/backgrounds/${gameState.currentArea}.jpeg`);
        backgroundTexture.wrapS = THREE.RepeatWrapping;
        backgroundTexture.wrapT = THREE.RepeatWrapping;
        backgroundTexture.repeat.set(9, 9);
        gameState.backgroundPlane.material.map = backgroundTexture;
        gameState.backgroundPlane.material.needsUpdate = true;
    }
}

// Function to preload adjacent area textures
function preloadAdjacentAreaTextures(currentArea) {
    // Always preload area 1 texture
    preloadBackgroundTexture(1);
    
    // Preload next area texture if it exists
    const nextArea = currentArea + 1;
    if (AREAS[nextArea]) {
        preloadBackgroundTexture(nextArea);
    }
    
    // Preload previous area texture if it exists
    const prevArea = currentArea - 1;
    if (AREAS[prevArea]) {
        preloadBackgroundTexture(prevArea);
    }
}

function initThree() {
    // Create scene
    gameState.scene = new THREE.Scene();
    
    // Create background plane
    const planeGeometry = new THREE.PlaneGeometry(5000, 5000);
    const planeMaterial = new THREE.MeshBasicMaterial({ 
        side: THREE.DoubleSide,
        color: 0xD0D0D0  // Add a gray tint to darken the texture
    });
    gameState.backgroundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    gameState.backgroundPlane.position.z = -1; // Place slightly behind everything
    gameState.scene.add(gameState.backgroundPlane);
    
    // Preload initial textures
    preloadAdjacentAreaTextures(gameState.currentArea);
    
    // Set initial background texture based on current area
    updateBackgroundTexture();
    
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
        const starterMonster = createMonster(1, 5, ["Strong"], false, 5, "Earth", 1);
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

// Main game loop
function gameLoop(time) {
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
    document.getElementById('fpsCounter').textContent = `FPS: ${avgFps}`;
    
    // Check if any UI is open
    if (gameState.storageUIOpen || gameState.captureUIOpen || gameState.detailsUIOpen) {
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
            
            // Redirect to website
            window.location.href = 'http://portal.pieter.com/';
        }
    }
    
    // Update time since last damage for all monsters (only when game is not paused)
    const allMonsters = [...gameState.player.monsters, ...gameState.player.storedMonsters, ...gameState.wildMonsters];
    for (const monster of allMonsters) {
        if (monster.defeated) continue;
        monster.timeSinceCombat += cappedDeltaTime;
    }
    
    // Handle monster collisions first, before any other movement
    handleMonsterCollisions();
    
    // Update player movement
    updatePlayerMovement(cappedDeltaTime);
    
    // Update player grace period timer
    if (gameState.player.gracePeriodTimer > 0) {
        gameState.player.gracePeriodTimer -= cappedDeltaTime;
    }
    
    // Update monster following
    updateMonsterFollowing(cappedDeltaTime);
    
    // Update wild monster aggro behaviors
    updateWildMonsterAggro(cappedDeltaTime);
    
    // Check for potential combat between monsters
    checkAggroRange();
    
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
    
    // Auto-save every 5 seconds
    if (!gameState.lastSaveTime) {
        gameState.lastSaveTime = time;
        gameState.saveCounter = 0;
    } else if (time - gameState.lastSaveTime >= 5000) { // 5000ms = 5 seconds
        saveGame();
        gameState.lastSaveTime = time;
        gameState.saveCounter = (gameState.saveCounter + 1) % 24;
        if (gameState.saveCounter === 2) {
            addChatMessage("Game auto-saves every 5 seconds.", 5000);
        }
    }
    
    // Render the scene
    gameState.renderer.render(gameState.scene, gameState.camera);
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

// Handle monster collisions
function handleMonsterCollisions() {
    // Combine all monsters into a single array
    const allMonsters = [...gameState.player.monsters, ...gameState.wildMonsters];
    
    // Check each monster against every other monster
    for (let i = 0; i < allMonsters.length; i++) {
        const monster = allMonsters[i];
        
        // Skip if monster is defeated
        if (monster.defeated) continue;
        
        // Check against all other monsters
        for (let j = i + 1; j < allMonsters.length; j++) {
            const target = allMonsters[j];
            
            // Skip if target is defeated
            if (target.defeated) continue;
            
            // Calculate distance between monsters
            const distance = monster.mesh.position.distanceTo(target.mesh.position);
            
            // Handle collision avoidance
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
        }
    }
}

// Initialize the game
function init() {
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
        // Show welcome popup for new players
        showWelcomePopup();
        
        // Initialize new player with starter monster
        initPlayer(true);
        
        // Spawn wild monsters (Area Level 1)
        spawnWildMonsters(1, null);
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
                if (isStored && gameState.player.monsters.length < 2) {
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
                    addChatMessage(`${monster.name} has revived!`, 5000);
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
    const isNextArea = newArea > gameState.currentArea;
    gameState.currentArea = newArea;
    
    //Stop player movement
    gameState.clickTargetPosition = null;

    // Update previous area mesh visibility
    if (gameState.previousAreaMesh) {
        gameState.previousAreaMesh.visible = gameState.currentArea > 1;
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
    
    // Set new random position for next area entrance
    setRandomNextAreaPosition();
    
    // Update next area mesh position
    if (gameState.nextAreaMesh) {
        gameState.nextAreaMesh.position.copy(gameState.nextAreaPosition);
    }
    
    // Spawn new monsters for the new area
    spawnWildMonsters(gameState.currentArea);

    // Create portal if in level 1 and it doesn't exist yet
    if (newArea === 1 && !gameState.portalMesh) {
        createPortal();
    }
    
    // Update portal visibility based on current area
    if (gameState.portalMesh && gameState.portalLabel) {
        gameState.portalMesh.visible = newArea === 1;
        gameState.portalLabel.visible = newArea === 1;
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
    // Process each monster's movement and attacks
    for (const monster of [...gameState.player.monsters, ...gameState.wildMonsters]) {
        // Skip if defeated
        if (monster.defeated) continue;
        
        // Check if player monster is too far from player
        if (!monster.isWild) {
            const distanceToPlayer = monster.mesh.position.distanceTo(gameState.player.position);
            if (distanceToPlayer > 400) {
                // Exit combat and chase player
                monster.chasingPlayer = true;
                monster.aggroTarget = null;
                monster.isAggroed = false;
                continue;
            }
        }
        
        // Get target based on aggro
        let target = monster.aggroTarget;
        
        // If no target or target is defeated, clear aggro
        if (!target || target.defeated) {
            monster.aggroTarget = null;
            monster.isAggroed = false;
            continue;
        }
        
        // Calculate distance to target
        const distance = monster.mesh.position.distanceTo(target.mesh.position);
        
        // If target is too far, clear aggro
        const aggroRange = monster.isWild ? GAME_CONFIG.aggroRange : GAME_CONFIG.playerMonsterAggroRange;
        if (distance > aggroRange) {
            monster.aggroTarget = null;
            monster.isAggroed = false;
            continue;
        }
        
        // Special rolling behavior for abilId 13
        if (monster.abilId === 13) {
            // Initialize rolling state if not exists
            if (monster.rollingState === undefined) {
                monster.rollingState = 'approaching';
            }
            
            // Get direction to target
            const direction = new THREE.Vector3()
                .subVectors(target.mesh.position, monster.mesh.position)
                .normalize();
            
            if (monster.rollingState === 'approaching') {
                // If in attack range, start rolling forward
                if (distance <= GAME_CONFIG.attackRange) {
                    monster.rollingState = 'rolling';
                    monster.rollDirection = direction.clone();
                    // Randomly decide turn direction (-1 for left, 1 for right)
                    monster.rollTurnDirection = Math.random() < 0.5 ? -1 : 1;
                } else {
                    // Move towards target normally
                    const speed = (monster.isWild ? GAME_CONFIG.wildMonsterSpeed : GAME_CONFIG.playerMonsterSpeed) * deltaTime;
                    monster.mesh.position.x += direction.x * speed;
                    monster.mesh.position.y += direction.y * speed;
                    monster.mesh.position.z = calculateZPosition(monster.mesh.position.y);
                }
            } else if (monster.rollingState === 'rolling') {
                // Roll forward at 200 units per second
                const rollSpeed = 200 * deltaTime;
                
                // Apply a slight rotation to the roll direction (30 degrees per second)
                const turnAngle = (Math.PI / 6) * deltaTime * monster.rollTurnDirection; // π/6 radians = 30 degrees
                const cos = Math.cos(turnAngle);
                const sin = Math.sin(turnAngle);
                
                // Rotate the roll direction vector
                const newX = monster.rollDirection.x * cos - monster.rollDirection.y * sin;
                const newY = monster.rollDirection.x * sin + monster.rollDirection.y * cos;
                monster.rollDirection.x = newX;
                monster.rollDirection.y = newY;
                monster.rollDirection.normalize();
                
                // Apply movement
                monster.mesh.position.x += monster.rollDirection.x * rollSpeed;
                monster.mesh.position.y += monster.rollDirection.y * rollSpeed;
                monster.mesh.position.z = calculateZPosition(monster.mesh.position.y);
                
                // If distance is over 45 units, switch back to approaching
                if (distance > 45) {
                    monster.rollingState = 'approaching';
                }
                
                // Attack if in range
                if (distance <= GAME_CONFIG.attackRange) {
                    monsterAttack(monster, target, deltaTime);
                }
            }
            
            // Update monster direction
            updateMonsterDirection(monster, target.mesh.position.x);
            
            // Skip regular combat movement
            continue;
        }

        // Determine the appropriate attack range based on monster slot
        let attackRange = GAME_CONFIG.attackRange;
        if (!monster.isWild && gameState.player.monsters.indexOf(monster) === 0) {
            // This is the first slot monster (index 0), use shorter range
            attackRange = GAME_CONFIG.attackRangeSlot1;
        }
        
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
            
            // Use appropriate speed based on monster type
            const speed = (monster.isWild ? GAME_CONFIG.wildMonsterSpeed : GAME_CONFIG.playerMonsterSpeed) * deltaTime;
            
            // Move towards target
            monster.mesh.position.x += direction.x * speed;
            monster.mesh.position.y += direction.y * speed;
            monster.mesh.position.z = calculateZPosition(monster.mesh.position.y);
        }
    }
}

// Update stamina regeneration
function updateStaminaRegen(deltaTime) {
    // Update all monsters (both player and wild)
    const allMonsters = [...gameState.player.monsters, ...gameState.player.storedMonsters, ...gameState.wildMonsters];
    
    for (const monster of allMonsters) {
        if (monster.defeated) continue;
        
        // Calculate regen rate (1% in combat, 10% out of combat or always 10% for stored monsters)
        const isStored = gameState.player.storedMonsters.includes(monster);
        let regenRate = (inCombat(monster) && !isStored) ? 0.01 : 0.1;
        const regenAmount = monster.maxStamina * regenRate * deltaTime;
        
        // Apply stamina regeneration
        monster.currentStamina = Math.min(monster.maxStamina, monster.currentStamina + regenAmount);
        
        // Update UI
        updateUILabel(monster.uiLabel, monster);
    }
}

// Update HP regeneration (out of combat only)
function updateHPRegen(deltaTime) {
    // Update all monsters (both player and wild)
    const allMonsters = [...gameState.player.monsters, ...gameState.player.storedMonsters, ...gameState.wildMonsters];
    
    for (const monster of allMonsters) {
        if (monster.defeated) continue;
        
        // Calculate regen rate (0.5% in combat, 5% out of combat or always 5% for stored monsters)
        const isStored = gameState.player.storedMonsters.includes(monster);
        let regenRate = (inCombat(monster) && !isStored) ? 0.005 : 0.05;
        if (monster.abilId == 14) {regenRate = 0.025} //Blazey always regens HP at half out of combat rates
        const regenAmount = monster.maxHP * regenRate * deltaTime;
        
        // Apply HP regeneration
        if (monster.currentHP < monster.maxHP) {
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
    // Update player monsters following behavior
    for (let i = 0; i < gameState.player.monsters.length; i++) {
        const monster = gameState.player.monsters[i];
        
        // Skip if defeated
        if (monster.defeated) continue;
        
        // Skip if monster is aggroed (has a target)
        if (monster.isAggroed && monster.aggroTarget) continue;
        
        // If monster is chasing player, move directly towards player
        if (monster.chasingPlayer) {
            const distanceToPlayer = monster.mesh.position.distanceTo(gameState.player.position);
            
            // If close enough to player, stop chasing
            if (distanceToPlayer < 150) {
                monster.chasingPlayer = false;
                continue;
            }
            
            // Move towards player
            const direction = new THREE.Vector3()
                .subVectors(gameState.player.position, monster.mesh.position)
                .normalize();
            
            // Update monster direction before moving
            updateMonsterDirection(monster, gameState.player.position.x);
            
            // Use player monster speed
            const speed = GAME_CONFIG.playerMonsterSpeed * deltaTime;
            
            monster.mesh.position.x += direction.x * speed;
            monster.mesh.position.y += direction.y * speed;
            monster.mesh.position.z = calculateZPosition(monster.mesh.position.y);
            
            // Update last position
            monster.lastPosition.copy(monster.mesh.position);
            continue;
        }
        
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
        const speed = GAME_CONFIG.playerMonsterSpeed * deltaTime;
        
        // Only move if not already at target
        if (distanceToTarget > 5) {
            const movement = Math.min(distanceToTarget, speed);
            monster.mesh.position.x += direction.x * movement;
            monster.mesh.position.y += direction.y * movement;
            monster.mesh.position.z = calculateZPosition(monster.mesh.position.y);
        }
        
        // Update last position
        monster.lastPosition.copy(monster.mesh.position);
    }
}

// Update wild monster aggro behaviors (chasing without combat)
function updateWildMonsterAggro(deltaTime) {
    for (const monster of gameState.wildMonsters) {
        // Skip if defeated or already aggroed
        if (monster.defeated || monster.isAggroed) continue;
        
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
                    
                    // Set grace period timer
                    gameState.player.gracePeriodTimer = GAME_CONFIG.playerGracePeriod;
                    
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
                const moveRadius = gameState.currentArea * 50;
                
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

// Spawn wild monsters
function spawnWildMonsters(areaLevel, count = null) {
    // Clear any existing wild monsters and remove their data
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
        // Use half density for area level 1
        const density = areaLevel === 1 ? GAME_CONFIG.monsterDensity * 0.5 : GAME_CONFIG.monsterDensity;
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
        
        // Have a 50% chance to spawn a monster from this area level, 40% chance to spawn one from any level below,
        // 5% chance to spawn one from the area level above, and 5% chance to spawn any random monster.
        const spawnRoll = Math.random() * 100;
        let availableTypes;
        
        if (spawnRoll < 50) {
            // 50% chance - spawn from current area level
            availableTypes = Object.keys(MONSTER_TYPES)
                .map(Number)
                .filter(id => Math.ceil(id / 5) === areaLevel + 1);
        } else if (spawnRoll < 90) {
            // 40% chance - spawn from any level below
            availableTypes = Object.keys(MONSTER_TYPES)
                .map(Number)
                .filter(id => Math.ceil(id / 5) < areaLevel);
        } else if (spawnRoll < 97) {
            // 7% chance - spawn from area level above with +5 levels
            availableTypes = Object.keys(MONSTER_TYPES)
                .map(Number)
                .filter(id => Math.ceil(id / 5) === areaLevel + 1);
                level +=5;
        } else {
            // 3% chance - spawn any random monster with +10 levels
            availableTypes = Object.keys(MONSTER_TYPES).map(Number);
            level +=10;
        }
        
        if (availableTypes.length === 0) {
            // If initial spawn attempt fails, try spawning from monster types 1-10
            availableTypes = Object.keys(MONSTER_TYPES)
                .map(Number)
                .filter(id => id <= 10);
                
            if (availableTypes.length === 0) {
                console.warn(`No valid monster types for area level ${areaLevel}, skipping spawn`);
                continue;
            }
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
        monster.mesh.position.set(x, y, calculateZPosition(y));
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
    
    // Clean up any defeated player monsters that have been revived WARNING: THIS CODE MAY NOT DO ANYTHING EVER
    for (let i = gameState.player.monsters.length - 1; i >= 0; i--) {
        const monster = gameState.player.monsters[i];
        if (monster.defeated && !monster.reviveTimer) {
            // Monster has been defeated and is not being revived
            gameState.player.monsters.splice(i, 1);
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
    monster.mesh.position.set(x, y, calculateZPosition(y));
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
    // Create arrow shape for next area (pointing up)
    const nextArrowShape = new THREE.Shape();
    nextArrowShape.moveTo(0, 24);    // Point of arrow (was 12)
    nextArrowShape.lineTo(-12, -12); // Left wing (was -6)
    nextArrowShape.lineTo(0, -6);    // Inner left notch (was -3)
    nextArrowShape.lineTo(12, -12);  // Right wing (was 6)
    nextArrowShape.lineTo(0, 24);    // Back to point (was 12)
    
    const nextGeometry = new THREE.ShapeGeometry(nextArrowShape);
    const nextMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        transparent: true,
        opacity: 0.7
    });
    const nextExitMesh = new THREE.Mesh(nextGeometry, nextMaterial);
    nextExitMesh.position.copy(gameState.nextAreaPosition);
    nextExitMesh.position.z = 0.5;
    gameState.scene.add(nextExitMesh);
    
    // Store reference to next area mesh in gameState
    gameState.nextAreaMesh = nextExitMesh;
    
    // Add pulsing animation for next area entrance
    const pulseTween = () => {
        nextExitMesh.scale.set(1, 1, 1);
        setTimeout(() => {
            nextExitMesh.scale.set(1.2, 1.2, 1);
            setTimeout(pulseTween, 1000);
        }, 1000);
    };
    pulseTween();
    
    // Create arrow shape for previous area (pointing down)
    const prevArrowShape = new THREE.Shape();
    prevArrowShape.moveTo(0, -24);   // Point of arrow (was -12)
    prevArrowShape.lineTo(-12, 12);  // Left wing (was -6)
    prevArrowShape.lineTo(0, 6);     // Inner left notch (was 3)
    prevArrowShape.lineTo(12, 12);   // Right wing (was 6)
    prevArrowShape.lineTo(0, -24);   // Back to point (was -12)
    
    const prevGeometry = new THREE.ShapeGeometry(prevArrowShape);
    const prevMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        transparent: true,
        opacity: 0.7
    });
    const prevExitMesh = new THREE.Mesh(prevGeometry, prevMaterial);
    prevExitMesh.position.set(0, -250, 0.5);
    gameState.scene.add(prevExitMesh);
    
    // Store reference to previous area mesh in gameState
    gameState.previousAreaMesh = prevExitMesh;
    
    // Set initial visibility based on current area
    prevExitMesh.visible = gameState.currentArea > 1;
    
    // Add pulsing animation for previous area entrance
    const prevPulseTween = () => {
        prevExitMesh.scale.set(1, 1, 1);
        setTimeout(() => {
            prevExitMesh.scale.set(1.2, 1.2, 1);
            setTimeout(prevPulseTween, 1000);
        }, 1000);
    };
    prevPulseTween();
    
    // Create direction arrow (only points to next area)
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

// Set a random position for the next area entrance
function setRandomNextAreaPosition() {
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
    monster.mesh.position.z = calculateZPosition(monster.mesh.position.y);
}

// Helper function to calculate Z position based on Y coordinate
function calculateZPosition(y, isPlayer = false) {
    // Base Z position is 1
    // For every 1000 units of Y, decrease Z by 0.1
    // This creates a subtle layering effect
    return isPlayer ? 2 - (y / 10000) : 1 - (y / 10000);
}

// Check for potential combat between monsters
function checkAggroRange() {
    // Combine all monsters into a single array
    const allMonsters = [...gameState.player.monsters, ...gameState.wildMonsters];
    
    // Check each monster against every other monster
    for (const monster of allMonsters) {
        // Skip if monster is defeated
        if (monster.defeated) continue;
        
        // Find potential targets
        let closestTarget = null;
        let closestDistance = monster.isWild ? GAME_CONFIG.aggroRange : GAME_CONFIG.playerMonsterAggroRange;
        
        for (const target of allMonsters) {
            // Skip invalid targets
            if (target === monster || target.defeated) continue;
            
            // Skip if target is the same type (wild/wild or player/player)
            if (target.isWild === monster.isWild) continue;
            
            // Calculate distance between monsters
            const distance = monster.mesh.position.distanceTo(target.mesh.position);
            
            // Skip aggro logic if player monster is chasing player
            if (!monster.isWild && monster.chasingPlayer) continue;
            
            // Check if within aggro range and closer than current closest target
            const aggroRange = monster.isWild ? GAME_CONFIG.aggroRange : GAME_CONFIG.playerMonsterAggroRange;
            if (distance <= aggroRange && distance < closestDistance) {
                closestTarget = target;
                closestDistance = distance;
            }
        }
        
        // Skip aggro logic if player monster is chasing player
        if (!monster.isWild && monster.chasingPlayer) continue;
        
        // If we found a valid target
        if (closestTarget) {
            // If monster already has a target, only switch if new target is closer
            if (monster.aggroTarget) {
                const currentDistance = monster.mesh.position.distanceTo(monster.aggroTarget.mesh.position);
                if (closestDistance < currentDistance) {
                    // Switch to closer target
                    monster.aggroTarget = closestTarget;
                    monster.isAggroed = true;
                    monster.returningToOrigin = false;
                    monster.aggroPlayer = false;
                }
            } else {
                // No current target, set the closest one
                monster.aggroTarget = closestTarget;
                monster.isAggroed = true;
                monster.returningToOrigin = false;
                monster.aggroPlayer = false;
            }
        } else {
            // No valid targets found, clear aggro state
            monster.aggroTarget = null;
            monster.isAggroed = false;
        }
    }
}

// Function to show welcome popup
function showWelcomePopup() {
    const popup = document.getElementById('welcomePopup');
    popup.style.display = 'flex';
    
    // Add click handler for close button
    document.getElementById('welcomeCloseButton').addEventListener('click', () => {
        popup.style.display = 'none';
    });
}