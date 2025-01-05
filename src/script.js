window.focus(); // Capture keys right away (by default focus is on editor)

// Define Game Constants
const GAME_CONSTANTS = {
    CAMERA_WIDTH: 960,
    ARC_CENTER_X: 285,
    TRACK_RADIUS: 285,
    TRACK_WIDTH: 45,
    PLAYER_SPEED: .0017,
    MIN_COLLISION_DISTANCE: 40
};

// Pick a random value from an array
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Black background for space

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
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(100, -300, 300);
dirLight.castShadow = true;
scene.add(dirLight);

// Create a planet
function createPlanet(color = 0x732bb3, radius = 30) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 35
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    return sphere;
}

const enemyColors = [
    0xfcba03, // Yellow
    0xf22e62, // Pink
    0x8c2b3d, // Red
    0xf6ff33, // yellow
    0x3db32b, // lime green
    0xc94779, // pink
    0xeb3f3f, // salmon red
    0xff8800, // Orange
    0x3babd4,  // Blue
    0xf70fc9 // Neon Pink
]

// Create player planet
const playerPlanet = createPlanet(0x732bb3);
// Create enemy planet and use ememyColors array to shuffle planet colors
let enemyPlanet = createPlanet(enemyColors[Math.floor(Math.random() * enemyColors.length)]);

scene.add(playerPlanet);
scene.add(enemyPlanet);

// Create a function for a custom orbit track shape
function createOrbitTrack(trackRadius = 285, color = 0x3333ff, offsetX = 0, offsetZ = 0) {
    // Create dotted outline
    const outlineGeometry = new THREE.BufferGeometry();
    const points = [];
    const segments = 64;

    // Create points for outer circle
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(
            Math.cos(theta) * (trackRadius),
            0,
            Math.sin(theta) * (trackRadius)
        );
    }

    // Create points for inner circle
    for (let i = segments; i >= 0; i--) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(
            Math.cos(theta) * (trackRadius - 50),
            0,
            Math.sin(theta) * (trackRadius - 50)
        );
    }

    outlineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    const outlineMaterial = new THREE.LineDashedMaterial({
        color: color,
        dashSize: 10,
        gapSize: 10,
        opacity: 1, // Increased opacity since it's the only visual element now
        transparent: true
    });

    const outline = new THREE.Line(outlineGeometry, outlineMaterial);
    outline.computeLineDistances(); // Required for dashed lines

    outline.rotation.x = Math.PI / 2;
    outline.position.x = offsetX;
    outline.position.z = offsetZ;

    return outline;
}

// Calculate offset for second track
var angle = 360 * (Math.PI / 180); // Convert 30 degrees to radians
const offsetDistance = 285; // Distance to offset the second track
const offsetX = Math.cos(angle) * offsetDistance;
const offsetZ = Math.sin(angle) * offsetDistance;

const centerAdjustX = -offsetX / 2;
const centerAdjustZ = -offsetZ / 2;
// Create two tracks
const track1 = createOrbitTrack(285, 0x757575, centerAdjustX, centerAdjustZ); // First track
const track2 = createOrbitTrack(285, 0x825a5a, offsetX + centerAdjustX, offsetZ + centerAdjustZ); // Second track

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
    angle: Math.PI,
    speed: 0.035,
    clockwise: true
});

let gameOver = false;
let playerAngle = 0;
let enemyAngle = Math.PI; // Start moving enemy planet on opposite side
let newEnemyAngle = Math.PI;
let velocity = 0.035; // Initial speed for the player
const maxSpeed = 0.035; // Maximum speed
const decelerationRate = 0.01; // Deceleration rate per second
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

// Update animation to move along first track (you can modify this as needed)
function animate() {
    if (gameOver) return;
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastUpdateTime) / 1000; // Time in seconds since the last frame
    lastUpdateTime = currentTime;

    // Apply deceleration to player velocity
    if (velocity > 0) {
        velocity = Math.max(velocity - decelerationRate * deltaTime, 0); // Decelerate to 0
    } else if (velocity < 0) {
        velocity = Math.min(velocity + decelerationRate * deltaTime, 0); // Accelerate back to 0 for negative values
    }

    // Move player planet based on velocity
    playerAngle += velocity;
    playerPlanet.position.x = Math.cos(playerAngle) * 285 + centerAdjustX;
    playerPlanet.position.z = Math.sin(playerAngle) * 285 + centerAdjustZ;

    // Move enemy planet on track 2
    enemyAngle += 0.025; // Speed for enemy
    enemyPlanet.position.x = Math.cos(enemyAngle) * 285 + (offsetX + centerAdjustX);
    enemyPlanet.position.z = Math.sin(enemyAngle) * 285 + (offsetZ + centerAdjustZ);

    // Whenever the player planet goes around the track three times, spawn a new enemy planet
    if (playerAngle >= Math.PI * 6) {
        let newEnemyPlanet = createPlanet(enemyColors[Math.floor(Math.random() * enemyColors.length)]);
        scene.add(newEnemyPlanet);
        gameState.otherPlanets.push({ mesh: newEnemyPlanet, angle: enemyAngle, speed: 0.030, clockwise: true });
        scorePoint();
        playerAngle = 0;
    }

    // Move new enemy planets on track 2
    gameState.otherPlanets.forEach((enemyPlanet) => {
        enemyPlanet.angle += enemyPlanet.speed * (enemyPlanet.clockwise ? 1 : -1);
        enemyPlanet.mesh.position.x = Math.cos(enemyPlanet.angle) * 285 + (offsetX + centerAdjustX);
        enemyPlanet.mesh.position.z = Math.sin(enemyPlanet.angle) * 285 + (offsetZ + centerAdjustZ);

        if (checkCollision(playerPlanet, enemyPlanet.mesh)) {
            gameOver = true;
            alert('Game Over! Planets collided! Your score: ' + gameState.score);
            return;
        }
    });

    renderer.render(scene, camera);
}

// Add some stars
function addStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
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

// Control handlers
document.addEventListener('keydown', (event) => {
    if (gameOver) return;

    if (event.key === 'ArrowUp' || event.key === 'w') {
        velocity = Math.min(velocity + 0.01, maxSpeed); // Speed up, capped at maxSpeed
    }

    if (event.key === 'ArrowDown' || event.key === 's') {
        velocity = Math.max(velocity - 0.01, -maxSpeed); // Slow down, capped at negative maxSpeed
    }
});

// update resetGame() function to reload browser and restart game
function resetGame() {
    gameOver = false;
    playerAngle = 0;
    enemyAngle = Math.PI;
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

// Start the game
animate();