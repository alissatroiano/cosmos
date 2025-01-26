window.focus(); // Capture keys right away (by default focus is on editor)

// Create Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a); // Black background for space

// Camera setup
const aspectRatio = window.innerWidth / window.innerHeight;
const cameraWidth = 960;
const cameraHeight = cameraWidth / aspectRatio;

const camera = new THREE.OrthographicCamera(
    cameraWidth / -2,
    cameraWidth / 2,
    cameraHeight / 2,
    cameraHeight / -2,
    50,
    700
);
camera.position.set(0, -210, 300);
camera.lookAt(0, 0, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x757575);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(100, -100, 100).normalize();
dirLight.castShadow = true;
scene.add(dirLight);

// Create planetTextures array using 'textures' files
const planetTextures = [
    'https://i.im.ge/2025/01/27/HlOamP.colorio.jpeg',
    'https://i.im.ge/2025/01/27/HlO7Z1.callisto.jpeg',
    'https://i.im.ge/2025/01/27/HlOUbr.mars.jpeg',
    'https://i.im.ge/2025/01/27/HlOhBW.europa.jpeg',
    'https://i.im.ge/2025/01/27/HlO5AT.jupiter.jpeg',
    'https://i.im.ge/2025/01/27/HlO9Hc.saturn.jpeg',
    'https://i.im.ge/2025/01/27/HlOm1L.tehys.jpeg', ,
];

// Helper function to get a random item from an array
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Create a planet
function createPlanet(color = [], radius = 25, texturePath = null) {
    const geometry = new THREE.SphereGeometry(radius, 25, 25);
    const loader = new THREE.TextureLoader();

    // Load the specified texture or a random one if none is provided
    const texture = loader.load(
        texturePath || getRandomElement(planetTextures),
        () => console.log(`Texture loaded: ${texturePath || "Random texture"}`),
        undefined,
        (err) => console.error(`Error loading texture: ${err}`)
    );

    const material = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 30,
        map: texture,
    });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    sphere.position.set(0, 0, 0);
    sphere.renderOrder = 1;
    return sphere;
}

const enemyColors = [
    0x8c2b3d, // Red
    0x96a4a8, // grey
    0xe66363, // salmon red
    0x545a5c, // dark grey
    0xa2a8a8 // light grey
]

// Create player planet
const playerPlanet = createPlanet(0x5acbed, 25, 'https://i.im.ge/2025/01/27/HlOsOp.earth.jpeg'); // Player planet is always Earth
let enemyPlanet = createPlanet(enemyColors[Math.floor(Math.random() * enemyColors.length)]);

scene.add(playerPlanet);
scene.add(enemyPlanet);

// Create a function for a custom orbit track shape
function createOrbitTrack(trackRadius, color, centerX, centerZ) {
    const outlineGeometry = new THREE.BufferGeometry();
    const points = [];
    const segments = 64;

    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(
            Math.cos(theta) * trackRadius + centerX,
            0,
            Math.sin(theta) * trackRadius + centerZ
        );
    }

    outlineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    const outlineMaterial = new THREE.LineDashedMaterial({
        color: color,
        dashSize: 10,
        gapSize: 15,
    });

    const outline = new THREE.LineLoop(outlineGeometry, outlineMaterial);
    outline.computeLineDistances(); // Enable dashed line effect
    return outline;
}

// Calculate offset for second track
var angle = 360 * (Math.PI / 180);

const offsetDistance = 280; // Distance to offset the second track
const offsetX = Math.cos(angle) * offsetDistance;
const offsetZ = Math.sin(angle) * offsetDistance;

const centerAdjustX = -offsetX / 2;
const centerAdjustZ = -offsetZ / 2;
// Create two tracks
const track1 = createOrbitTrack(280, 0x32a852, centerAdjustX, centerAdjustZ); // First track
const track2 = createOrbitTrack(280, 0x825a5a, offsetX + centerAdjustX, offsetZ + centerAdjustZ); // Second track

// Add both tracks to the scene
scene.add(track1);
scene.add(track2);

// Game state
const gameState = {
    started: false,
    lastTimestamp: null,
    playerAngleMoved: 0,
    playerAngleInitial: 0,
    score: 0,
    lapsCompleted: 0,
    otherPlanets: [],
    controls: {
        accelerate: false,
        decelerate: false
    }
};

gameState.otherPlanets.push({
    mesh: enemyPlanet,
    angle: 0,
    speed: 0.025,
    radius: 260, // Adjust as needed
    clockwise: true
});

// Setup game settings
let gameOver = false;
let playerAngle = 0;
let enemyAngle = 0;
let newEnemyAngle = 0;
let velocity = 0; // Initial speed for the player
const maxSpeed = 0.0425; // Maximum speed
const minimumSpeed = 0.01245;
const decelerationRate = 0.0125; // Deceleration rate per second
let lastUpdateTime = performance.now();

// Player scores 1 point every time they go around the track
function scorePoint() {
    gameState.score += 1;
    document.getElementById('score').innerText = gameState.score;
    // log score in console
    console.log('Score: ' + gameState.score);
}

// Collision detection function
function checkCollision(planet1, planet2) {
    const distance = planet1.position.distanceTo(planet2.position);
    return distance < 50; // Adjust this value based on planet sizes
}

// Track the number of player loops
let loopCount = 0;

function animate() {
    if (gameOver) return;
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastUpdateTime) / 1000; // Time in seconds since the last frame
    lastUpdateTime = currentTime;

    // Game starts when user starts moving the player planet
    if (velocity > 0) {
        velocity = Math.min(velocity + 0.0001, maxSpeed);
    } else if (velocity < 0) {
        velocity = Math.max(velocity - 0.0001, -maxSpeed);
    }

    // Define a unified track radius for circular paths
    const trackRadius = 280;

    // Move player planet based on velocity
    playerAngle += velocity;
    playerPlanet.position.x = Math.cos(playerAngle) * trackRadius + centerAdjustX;
    playerPlanet.position.z = Math.sin(playerAngle) * trackRadius + centerAdjustZ;


    // Track player loops and spawn enemy planets every 3 loops
    if (playerAngle >= Math.PI * 2) {
        playerAngle -= Math.PI * 2; // Reset angle after each loop
        loopCount++;
        // Score point after every 3 loops
        if (loopCount % 3 === 0) {
            scorePoint();
        }

        // Spawn a new enemy planet every 3 loops
        if (loopCount % 3 === 0) {
            const randomColor = enemyColors[Math.floor(Math.random() * enemyColors.length)];
            const randomAngle = Math.random() * Math.PI * 2; // Random spawn angle
            const randomSpeed = 0.02 + Math.random() * 0.02; // Random speed between 0.02 and 0.05

            const newEnemyPlanet = createPlanet(randomColor, Math.random() * 20 + 10); // Random radius
            newEnemyPlanet.position.x = Math.cos(randomAngle) * trackRadius + (offsetX + centerAdjustX);
            newEnemyPlanet.position.z = Math.sin(randomAngle) * trackRadius + (offsetZ + centerAdjustZ);

            scene.add(newEnemyPlanet);

            // Add enemy planet to game state with unified direction
            gameState.otherPlanets.push({
                mesh: newEnemyPlanet,
                angle: randomAngle,
                speed: randomSpeed,
                clockwise: false, // Unified direction
            });
        }
    }

    // Move enemy planets along track
    if (playerAngle > 0) {
        gameState.otherPlanets.forEach((enemyPlanet) => {
            enemyPlanet.angle += enemyPlanet.speed * (enemyPlanet.clockwise ? 1 : 1);
            enemyPlanet.mesh.position.x = Math.cos(enemyPlanet.angle) * trackRadius + (offsetX + centerAdjustX);
            enemyPlanet.mesh.position.z = Math.sin(enemyPlanet.angle) * trackRadius + (offsetZ + centerAdjustZ);

            // Check for collisions with the player planet
            if (checkCollision(playerPlanet, enemyPlanet.mesh)) {
                gameOver = true;
                alert(
                    `Game Over! Planets collided! Your score: ${gameState.score}. Press R or click the reload button to play again!`
                );
                return;
            }
        });
    }
    renderer.render(scene, camera);
}

// Add some stars
function addStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xFAFAFA,
        size: 1,
        sizeAttenuation: false
    });

    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position',
        new THREE.Float32BufferAttribute(starsVertices, 3));

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}
addStars();

// Handle window resize
window.addEventListener('resize', () => {
    const newAspectRatio = window.innerWidth / window.innerHeight;
    const newCameraHeight = cameraWidth / newAspectRatio;

    camera.top = newCameraHeight / 2;
    camera.bottom = -newCameraHeight / 2;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Bind acceleration to arrow up button for mobile & tablet
document.getElementById('accelerate').addEventListener('click', () => {
    velocity = Math.min(velocity + 0.01, maxSpeed); // Speed up, capped at maxSpeed
});

// Bind deceleration to arrow down for mobile & tablet
document.getElementById('decelerate').addEventListener('click', () => {
    velocity = minimumSpeed; // Slow down, using minimumSpeed
});

// Accelerate player planet speed on keyup and decelerate on keydown
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        velocity = Math.min(velocity + 0.01, maxSpeed); // Speed up, capped at maxSpeed
    } else if (event.key === 'ArrowDown') {
        velocity = minimumSpeed; // Slow down, using minimumSpeed
    }
});

// update resetGame() function to reload browser and restart game
function resetGame() {
    gameOver = false;
    playerAngle = 0;
    enemyAngle = 0;
    animate();
}

// Add reset listener
document.addEventListener('keydown', (event) => {
    if (event.key === 'r' || event.key === 'R') {
        resetGame();
        // reload browser
        window.location.reload();
    }
});

document.getElementById('reset').addEventListener('click', () => {
    resetGame();
    // reload browser
    window.location.reload();
});

// Add event listener for mobile & tablet
document.getElementById('accelerate').addEventListener('touchstart', () => {
    velocity = Math.min(velocity + 0.01, maxSpeed); // Speed up, capped at maxSpeed
});


// Start the game
animate();