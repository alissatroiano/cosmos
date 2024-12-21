import * as THREE from "three";

const canvas = document.getElementById('canvas');

	if (!Detector.canvas) {
		Detector.addGetWebGLMessage(canvas);
		return;
	}

const scene = new THREE.Scene();

const playerPlanet = Planet();
scene.add(playerPlanet);

// Set Up Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Set Up Direction Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(100, -300, 400);
scene.add(directionalLight);

// Set Up Camera
const aspectRatio = window.innerWidth / window.innerHeight;
const cameraWidth = 150;
const cameraHeight = cameraWidth / aspectRatio;

const camera = new THREE.OrthographicCamera(
    cameraWidth / -2, // left
    cameraWidth / 2, // right
    cameraHeight / 2, // top
    cameraHeight / -2, // bottom
    0, // near plane
    1000 // far plane
);
camera.position.set(200, -200, 300);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

// Set Up Renderer to Render Scene in HTML
const renderer = new THREE.WebGLRenderer({ antialias: true });  
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

document.body.appendChild(renderer.domElement);


// Create array of planet colors to randomize later
const planetColors = [0x8000FF, 0xff800, 0x33fbff, 0xff5a33];

// Use planet array to randomize colors
function pickRandomColor(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

function Planet() {
    // Use three.js to create a 3D planet with a blue and purple linear gradient
    const planet  = new THREE.Group();

    const color = pickRandomColor(vehicleColors);
    
    const main  = new THREE.Mesh(
        new THREE.SphereGeometry(50, 32, 32),
        new THREE.MeshPhongMaterial({
            map: THREE.ImageUtils.loadTexture('assets/images/earth_no_clouds.jpg'),
            bumpMap: THREE.ImageUtils.loadTexture('assets/images/elev_bump_4k.jpg'),
            bumpScale: 0.05,
            specularMap: THREE.ImageUtils.loadTexture('assets/images/water.png'),
            specular: new THREE.Color('grey')
        })
    );
    main.castShadow = true;
    main.position.z = 12;
    planet.add(main);

return planet;
}

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);