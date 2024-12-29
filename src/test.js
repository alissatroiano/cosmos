window.focus(); // Capture keys right away (by default focus is on editor)

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
scene.add(playerPlanet);

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

// Update animation to move along first track (you can modify this as needed)
function animate() {
    requestAnimationFrame(animate);
    
    angle += 0.01;
    playerPlanet.position.x = Math.cos(angle) * 225 + centerAdjustX;
    playerPlanet.position.z = Math.sin(angle) * 225 + centerAdjustZ;
    
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
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'w') {
        angle += 0.1;
    }
    if (event.key === 'ArrowDown' || event.key === 's') {
        angle -= 0.1;
    }
});

