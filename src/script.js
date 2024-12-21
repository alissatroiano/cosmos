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
let score = 0;
const speed = 0.0017;
let otherPlanets = [];

// Movement controls
let accelerate = false;
let decelerate = false;

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

    const totalPlayerAngle = playerAngleInitial + playerAngleMoved;

    const playerX = Math.cos(totalPlayerAngle) * trackRadius;
    const playerY = Math.sin(totalPlayerAngle) * trackRadius;

    playerPlanet.position.x = playerX;
    playerPlanet.position.y = playerY;

    // Add rotation to make it spin as it moves
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

    const timeDelta = timestamp - lastTimestamp;

    movePlayerPlanet(timeDelta);
    moveOtherPlanets(timeDelta);

    controls.update(); // Add this line to update controls
    renderer.render(scene, camera);
    lastTimestamp = timestamp;
    requestAnimationFrame(animate);
}


// Start the game
requestAnimationFrame(animate);

// Handle window resize
window.addEventListener('resize', () => {
    const newAspectRatio = window.innerWidth / window.innerHeight;
    const newCameraHeight = cameraWidth / newAspectRatio;
    
    camera.top = newCameraHeight / 2;
    camera.bottom = -newCameraHeight / 2;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
});
