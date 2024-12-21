import * as THREE from "three";

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
