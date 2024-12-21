import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


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

// Track setup
const trackRadius = 225;
const trackWidth = 45;
const innerTrackRadius = trackRadius - trackWidth;
const outerTrackRadius = trackRadius + trackWidth;

// Create track
const trackGeometry = new THREE.RingGeometry(innerTrackRadius, outerTrackRadius, 60);
const trackMaterial = new THREE.MeshLambertMaterial({
    color: 0x111111, // Dark color for space feel
    side: THREE.DoubleSide
});
const track = new THREE.Mesh(trackGeometry, trackMaterial);
track.rotation.x = Math.PI / 2;
track.receiveShadow = true;
scene.add(track);

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
        const minDistance = 4; // Adjust this value based on planet sizes

        if (distance < minDistance) {
            console.log('Game Over! Planet collision!');
            gameStarted = false;
            // You might want to add game reset logic here
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
    if (accelerate) return speed * 2;
    if (decelerate) return speed * 0.5;
    return speed;
}

function movePlayerPlanet(timeDelta) {
    const playerSpeed = getPlayerSpeed();
    playerAngleMoved -= playerSpeed * timeDelta;

    // Track laps - one lap is 2π radians
    const previousLaps = Math.floor(Math.abs(playerAngleMoved) / (Math.PI * 2));
    const currentLaps = Math.floor(Math.abs(playerAngleMoved + (playerSpeed * timeDelta)) / (Math.PI * 2));
    
    if (currentLaps > previousLaps) {
        lapsCompleted = currentLaps;
        console.log(`Completed lap ${lapsCompleted}`);
        
        // Add new planets every 2 laps
        if (lapsCompleted % 2 === 0) {
            console.log('Adding new planets!');
            addOtherPlanet();
            addOtherPlanet();
        }
    }
    const totalPlayerAngle = playerAngleInitial + playerAngleMoved;

    const playerX = Math.cos(totalPlayerAngle) * trackRadius;
    const playerY = Math.sin(totalPlayerAngle) * trackRadius;

    playerPlanet.position.x = playerX;
    playerPlanet.position.y = playerY;

    playerPlanet.rotation.z = totalPlayerAngle - Math.PI / 2;
    playerPlanet.rotation.y += 0.01;
}

function moveOtherPlanets(timeDelta) {
    otherPlanets.forEach((planetInfo) => {
        planetInfo.angle += planetInfo.speed * timeDelta * (planetInfo.clockwise ? 1 : -1);
        
        const x = Math.cos(planetInfo.angle) * trackRadius;
        const y = Math.sin(planetInfo.angle) * trackRadius;
        
        planetInfo.mesh.position.x = x;
        planetInfo.mesh.position.y = y;
        planetInfo.mesh.rotation.y += 0.01;
    });
}

function addOtherPlanet() {
    const radius = 15 + Math.random();
    const color = Math.random() * 0xffffff;
    const speed = 0.001 + Math.random() * 0.001;
    const clockwise = Math.random() >= 0.5;
    const angle = Math.random() * Math.PI * 2;

    const planet = Planet(color, radius);
    scene.add(planet);

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