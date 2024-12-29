import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Constants
const GAME_CONSTANTS = {
    CAMERA_WIDTH: 960,
    ARC_CENTER_X: 250,
    TRACK_RADIUS: 225,
    TRACK_WIDTH: 45,
    PLAYER_SPEED: 0.0017,
    MIN_COLLISION_DISTANCE: 40
};

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

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Scene setup
const scene = new THREE.Scene();

// Set up camera
const aspectRatio = window.innerWidth / window.innerHeight;
const cameraWidth = 960;
const cameraHeight = cameraWidth / aspectRatio;

const camera = new THREE.OrthographicCamera(
    cameraWidth / -2, // left
    cameraWidth / 2, // right
    cameraHeight / 2, // top
    cameraHeight / -2, // bottom
    50, // near plane
    700 // far plane
);

camera.position.set(0, -210, 300);
camera.lookAt(0, 0, 0);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(100, -300, 400);
dirLight.castShadow = true;
scene.add(dirLight);

// Create a Planet function
function Planet(color = 0x4287f5, radius = 1) {
    const planet = new THREE.Group();

    // Create the main sphere
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 32, 32),
        new THREE.MeshPhongMaterial({
            color: color,
            shininess: 25
        })
    );
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    planet.add(sphere);

    return planet;
}

// Create player planet
const playerPlanet = Planet(0x44aa88, 25); // Green color, larger radius
scene.add(playerPlanet);

playerPlanet.position.set(0, 0, 0); // Set initial position

// Setup track parameters to look like an infinity symbol, so the user's challenge is to not collide with the other planets (using up/down keyboard acceleration controls)
const arcCenterX = 250; // Distance between the centers of the circles
const trackRadius = 225;
const trackWidth = 45;
const innerTrackRadius = trackRadius - trackWidth;
const outerTrackRadius = trackRadius + trackWidth;

// Create infinity-shaped track
function createInfinityTrack() {
    const trackShape = new THREE.Shape();
    
    // Create outer path (right circle)
    trackShape.absarc(arcCenterX, 0, outerTrackRadius, 0, Math.PI * 2, false);
    // Create outer path (left circle)
    trackShape.absarc(-arcCenterX, 0, outerTrackRadius, 0, Math.PI * 2, false);
    
    // Create hole (right circle)
    const holeRight = new THREE.Path();
    holeRight.absarc(arcCenterX, 0, innerTrackRadius, 0, Math.PI * 2, true);
    
    // Create hole (left circle)
    const holeLeft = new THREE.Path();
    holeLeft.absarc(-arcCenterX, 0, innerTrackRadius, 0, Math.PI * 2, true);
    
    trackShape.holes.push(holeRight);
    trackShape.holes.push(holeLeft);
    
    const geometry = new THREE.ShapeGeometry(trackShape);
    const material = new THREE.MeshLambertMaterial({
        color: 0x111111,
        side: THREE.DoubleSide
    });
    
    const track = new THREE.Mesh(geometry, material);
    track.rotation.x = Math.PI / 2;
    track.receiveShadow = true;
    return track;
}

// Create and add track
const track = createInfinityTrack();
scene.add(track);


// Create and add both tracks
// const innerTrack = createTrack(innerTrackRadius, trackWidth);
// const outerTrack = createTrack(outerTrackRadius, trackWidth);
// scene.add(innerTrack);
// scene.add(outerTrack);


// Game state
let gameStarted = false;
let lastTimestamp;
let playerAngleMoved = 0;
let playerAngleInitial = 0;
let score;
let lapsCompleted = 0;
const speed = 0.0017;

let otherPlanets = [];

// Movement controls
let accelerate = false;
let decelerate = false;

function hitDetection() {
    const playerPosition = new THREE.Vector3();
    playerPlanet.getWorldPosition(playerPosition);

    for (const planet of otherPlanets) {
        const planetPosition = new THREE.Vector3();
        planet.mesh.getWorldPosition(planetPosition);

        const distance = playerPosition.distanceTo(planetPosition);
        const minDistance = 40; // Adjust this value based on where tracks overlap

        if (distance < minDistance) {
            console.log('Game Over! Planet collision!');
            gameStarted = false;
            return true;
        }
    }
    return false;
}


// Add keyboard controls
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'w') accelerate = true;
    if (event.key === 'ArrowDown' || event.key === 's') decelerate = true;
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'w') accelerate = false;
    if (event.key === 'ArrowDown' || event.key === 's') decelerate = false;
});

function getPlayerSpeed() {
    if (accelerate) return speed * 2;     // Double speed when accelerating
    if (decelerate) return speed * 0.5;   // Half speed when decelerating
    return speed;                         // Normal speed otherwise
}


function movePlayerPlanet(timeDelta) {
    const playerSpeed = getPlayerSpeed();
    playerAngleMoved -= playerSpeed * timeDelta;

    // Track laps
    const previousLaps = Math.floor(Math.abs(playerAngleMoved) / (Math.PI * 4)); // Now needs 4π for full lap
    const currentLaps = Math.floor(Math.abs(playerAngleMoved + (playerSpeed * timeDelta)) / (Math.PI * 4));
    
    if (currentLaps > previousLaps) {
        lapsCompleted = currentLaps;
        console.log(`Completed lap ${lapsCompleted}`);
        if (lapsCompleted % 2 === 0) {
            addOtherPlanet();
            addOtherPlanet();
        }
    }

    const totalPlayerAngle = playerAngleInitial + playerAngleMoved;
    
    // Calculate position on infinity track
    let playerX, playerY;
    if (totalPlayerAngle % (Math.PI * 2) < Math.PI) {
        // Right circle
        playerX = Math.cos(totalPlayerAngle) * outerTrackRadius + arcCenterX;
        playerY = Math.sin(totalPlayerAngle) * outerTrackRadius;
    } else {
        // Left circle
        playerX = Math.cos(totalPlayerAngle) * outerTrackRadius - arcCenterX;
        playerY = Math.sin(totalPlayerAngle) * outerTrackRadius;
    }

    playerPlanet.position.x = playerX;
    playerPlanet.position.y = playerY;
    playerPlanet.rotation.z = totalPlayerAngle - Math.PI / 2;
    playerPlanet.rotation.y += 0.01;
}

function moveOtherPlanets(timeDelta) {
    otherPlanets.forEach((planetInfo) => {
        planetInfo.angle += planetInfo.speed * timeDelta * (planetInfo.clockwise ? 1 : -1);
        
        // Calculate position on infinity track (inner track)
        let x, y;
        if (planetInfo.angle % (Math.PI * 2) < Math.PI) {
            // Right circle
            x = Math.cos(planetInfo.angle) * innerTrackRadius + arcCenterX;
            y = Math.sin(planetInfo.angle) * innerTrackRadius;
        } else {
            // Left circle
            x = Math.cos(planetInfo.angle) * innerTrackRadius - arcCenterX;
            y = Math.sin(planetInfo.angle) * innerTrackRadius;
        }
        
        planetInfo.mesh.position.x = x;
        planetInfo.mesh.position.y = y;
        planetInfo.mesh.rotation.y += 0.01;
    });
}

// Add initial planets
function addOtherPlanet() {
    const radius = 32 + Math.random();
    const color = Math.random() * 0xffffff;
    const speed = 0.001 + Math.random() * 0.001;
    const clockwise = Math.random() >= 0.5;
    const angle = Math.random() * Math.PI * 4;

    const planet = Planet(color, radius);
    scene.add(planet);

    // Initial position on inner track
    let x, y;
    if (angle % (Math.PI * 2) < Math.PI) {
        x = Math.cos(angle) * innerTrackRadius + arcCenterX;
        y = Math.sin(angle) * innerTrackRadius;
    } else {
        x = Math.cos(angle) * innerTrackRadius - arcCenterX;
        y = Math.sin(angle) * innerTrackRadius;
    }
    planet.position.set(x, y, 0);

    otherPlanets.push({
        mesh: planet,
        speed,
        clockwise,
        angle
    });
}



// Add some initial planets
for (let i = 0; i < 1; i++) {
    addOtherPlanet();
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 100;
controls.maxDistance = 500;
controls.maxPolarAngle = Math.PI / 2;


// Animation loop
function animate(timestamp) {
    if (!lastTimestamp) {
        lastTimestamp = timestamp;
        requestAnimationFrame(animate);
        return;
    }

    if (!gameStarted) {
        gameStarted = true;
        lastTimestamp = timestamp;
        playerAngleMoved = 0;
        lapsCompleted = 0;
        score = 0;
    }

    const timeDelta = timestamp - lastTimestamp;

    movePlayerPlanet(timeDelta);
    moveOtherPlanets(timeDelta);

    // Check for collisions
    if (hitDetection()) {
        // Game over logic
        console.log(`Game Over! Final Score: ${score}`);
        console.log(`Completed Laps: ${lapsCompleted}`);
        resetGame();
    }

    controls.update();
    renderer.render(scene, camera);
    lastTimestamp = timestamp;
    requestAnimationFrame(animate);
}

function resetGame() {
    // Reset game state
    gameStarted = false;
    playerAngleMoved = 0;
    lapsCompleted = 0;
    score = 0;
    playerAngleInitial = 0;
    playerPlanet.position.set(0, 0, 0); // Reset player position
    otherPlanets.forEach((planetInfo) => {
        scene.remove(planetInfo.mesh);
    });
    otherPlanets = [];
    for (let i = 0; i < 1; i++) {
        addOtherPlanet();
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    const newAspectRatio = window.innerWidth / window.innerHeight;
    const newCameraHeight = cameraWidth / newAspectRatio;

    camera.top = newCameraHeight / 2;
    camera.bottom = -newCameraHeight / 2;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the game
resetGame();
requestAnimationFrame(animate);