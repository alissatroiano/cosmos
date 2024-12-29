window.focus(); // Capture keys right away (by default focus is on editor)


// Define Game Constants
const GAME_CONSTANTS = {
    CAMERA_WIDTH: 960,
    PLAYER_MAX_SPEED: 0.03,
    PLAYER_ACCELERATION: 0.001,
    PLAYER_DECELERATION: 0.0005,
    BASE_SPEED: 0.01
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
function createPlanet(color = 0x4287f5, radius = 25) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 25
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    return sphere;
}

// Create player planet
const playerPlanet = createPlanet(0x44aa88);
// Create enemy planet
const enemyPlanet = createPlanet(0xaa4444);
scene.add(playerPlanet);
scene.add(enemyPlanet);

// Create orbit track
// Modify the createOrbitTrack function to accept a radius parameter
// Create a function for a custom orbit track shape
function createOrbitTrack(trackRadius = 225, color = 0x3333ff, offsetX = 0, offsetZ = 0) {
    const geometry = new THREE.RingGeometry(trackRadius - 20, trackRadius + 20, 64);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        opacity: 0.3,
        transparent: true
    });
    const track = new THREE.Mesh(geometry, material);
    track.rotation.x = Math.PI / 2; // Rotate to horizontal plane
    
    // Apply position offset
    track.position.x = offsetX;
    track.position.z = offsetZ;
    
    return track;
}

// Calculate offset for second track
var angle = 360 * (Math.PI / 180); // Convert 30 degrees to radians
const offsetDistance = 225; // Distance to offset the second track
const offsetX = Math.cos(angle) * offsetDistance;
const offsetZ = Math.sin(angle) * offsetDistance;

const centerAdjustX = -offsetX / 2;
const centerAdjustZ = -offsetZ / 2;
// Create two tracks
const track1 = createOrbitTrack(225, 0x3333ff, centerAdjustX, centerAdjustZ); // First track
const track2 = createOrbitTrack(225, 0x33ff33, offsetX + centerAdjustX, offsetZ + centerAdjustZ); // Second track

// Add both tracks to the scene
scene.add(track1);
scene.add(track2);


// Game State
const gameState = {
    started: false,
    gameOver: false,
    playerSpeed: GAME_CONSTANTS.BASE_SPEED,
    controls: {
        accelerate: false,
        decelerate: false
    }
};

let gameOver = false;
let playerAngle = 0;
let enemyAngle = Math.PI; // Start moving enemy planet on opposite side

// Collision detection function
function checkCollision(planet1, planet2) {
    const distance = planet1.position.distanceTo(planet2.position);
    return distance < 50; // Adjust this value based on planet sizes
}

// Update animation to move along first track (you can modify this as needed)
function animate() {
    if (gameOver) return;
    requestAnimationFrame(animate);
    
    // Move player planet
    playerAngle += 0.01;
    playerPlanet.position.x = Math.cos(playerAngle) * 225 + centerAdjustX;
    playerPlanet.position.z = Math.sin(playerAngle) * 225 + centerAdjustZ;
    
    // Move enemy planet on track 2
    enemyAngle += 0.015; // Different speed for enemy
    enemyPlanet.position.x = Math.cos(enemyAngle) * 225 + (offsetX + centerAdjustX);
    enemyPlanet.position.z = Math.sin(enemyAngle) * 225 + (offsetZ + centerAdjustZ);
    
    // Check for collision
    if (checkCollision(playerPlanet, enemyPlanet)) {
        gameOver = true;
        alert('Game Over! Planets collided!');
    }
    
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
    for(let i = 0; i < 1000; i++) {
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

// Start animation
animate();

// Basic controls
// Control handlers
document.addEventListener('keydown', (event) => {
    if (gameOver) return;
    
    if (event.key === 'ArrowUp' || event.key === 'w') {
        playerAngle += 0.2; // Speed up
    }
    if (event.key === 'ArrowDown' || event.key === 's') {
        playerAngle -= 0.1; // Slow down
    }
});

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
    }
});

// Start the game
animate();


