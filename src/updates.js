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

// Scene setup
class GameScene {
    constructor() {
        this.setupRenderer();
        this.setupScene();
        this.setupCamera();
        this.setupLighting();
        this.setupTrack();
        this.setupPlayer();
        this.setupControls();
        this.bindEvents();
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
    }

    setupScene() {
        this.scene = new THREE.Scene();
    }

    setupCamera() {
        const aspectRatio = window.innerWidth / window.innerHeight;
        const cameraHeight = GAME_CONSTANTS.CAMERA_WIDTH / aspectRatio;

        this.camera = new THREE.OrthographicCamera(
            GAME_CONSTANTS.CAMERA_WIDTH / -2,
            GAME_CONSTANTS.CAMERA_WIDTH / 2,
            cameraHeight / 2,
            cameraHeight / -2,
            50,
            700
        );

        this.camera.position.set(0, -210, 300);
        this.camera.lookAt(0, 0, 0);
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
        dirLight.position.set(100, -300, 400);
        dirLight.castShadow = true;
        this.scene.add(dirLight);
    }

    setupTrack() {
        this.track = new Track();
        this.scene.add(this.track.mesh);
    }

    setupPlayer() {
        this.playerPlanet = new Planet(0x44aa88, 25);
        this.scene.add(this.playerPlanet);
        this.playerPlanet.position.set(0, 0, 0);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 100;
        this.controls.maxDistance = 500;
        this.controls.maxPolarAngle = Math.PI / 2;
    }

    bindEvents() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    handleKeyDown = (event) => {
        if (event.key === 'ArrowUp' || event.key === 'w') gameState.controls.accelerate = true;
        if (event.key === 'ArrowDown' || event.key === 's') gameState.controls.decelerate = true;
    }

    handleKeyUp = (event) => {
        if (event.key === 'ArrowUp' || event.key === 'w') gameState.controls.accelerate = false;
        if (event.key === 'ArrowDown' || event.key === 's') gameState.controls.decelerate = false;
    }
}

// Planet class
class Planet extends THREE.Group {
    constructor(color = 0x4287f5, radius = 1) {
        super();
        this.createPlanet(color, radius);
    }

    createPlanet(color, radius) {
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 32, 32),
            new THREE.MeshPhongMaterial({
                color: color,
                shininess: 25
            })
        );
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        this.add(sphere);
    }
}

// Track class
class Track {
    constructor() {
        this.mesh = this.createInfinityTrack();
    }

    createInfinityTrack() {
        const trackShape = new THREE.Shape();
        const { TRACK_RADIUS, TRACK_WIDTH, ARC_CENTER_X } = GAME_CONSTANTS;
        const innerTrackRadius = TRACK_RADIUS - TRACK_WIDTH;
        const outerTrackRadius = TRACK_RADIUS + TRACK_WIDTH;

        // Create outer paths
        trackShape.absarc(ARC_CENTER_X, 0, outerTrackRadius, 0, Math.PI * 2, false);
        trackShape.absarc(-ARC_CENTER_X, 0, outerTrackRadius, 0, Math.PI * 2, false);

        // Create holes
        const holeRight = new THREE.Path();
        holeRight.absarc(ARC_CENTER_X, 0, innerTrackRadius, 0, Math.PI * 2, true);
        const holeLeft = new THREE.Path();
        holeLeft.absarc(-ARC_CENTER_X, 0, innerTrackRadius, 0, Math.PI * 2, true);

        trackShape.holes.push(holeRight, holeLeft);

        const track = new THREE.Mesh(
            new THREE.ShapeGeometry(trackShape),
            new THREE.MeshLambertMaterial({
                color: 0x111111,
                side: THREE.DoubleSide
            })
        );
        track.rotation.x = Math.PI / 2;
        track.receiveShadow = true;
        return track;
    }
}

// Game Manager
class GameManager {
    constructor(scene) {
        this.scene = scene;
        this.initializeGame();
    }

    initializeGame() {
        this.addInitialPlanets();
        this.animate();
    }

    addInitialPlanets() {
        for (let i = 0; i < 1; i++) {
            this.addOtherPlanet();
        }
    }

    addOtherPlanet() {
        const radius = 25 + Math.random();
        const color = Math.random() * 0xffffff;
        const speed = 0.001 + Math.random() * 0.001;
        const clockwise = Math.random() >= 0.5;
        const angle = Math.random() * Math.PI * 4;

        const planet = new Planet(color, radius);
        this.scene.scene.add(planet);

        const innerTrackRadius = GAME_CONSTANTS.TRACK_RADIUS - GAME_CONSTANTS.TRACK_WIDTH;
        let x, y;
        if (angle % (Math.PI * 2) < Math.PI) {
            x = Math.cos(angle) * innerTrackRadius + GAME_CONSTANTS.ARC_CENTER_X;
            y = Math.sin(angle) * innerTrackRadius;
        } else {
            x = Math.cos(angle) * innerTrackRadius - GAME_CONSTANTS.ARC_CENTER_X;
            y = Math.sin(angle) * innerTrackRadius;
        }
        planet.position.set(x, y, 0);

        gameState.otherPlanets.push({
            mesh: planet,
            speed,
            clockwise,
            angle
        });
    }

    animate = (timestamp) => {
        if (!gameState.lastTimestamp) {
            gameState.lastTimestamp = timestamp;
            requestAnimationFrame(this.animate);
            return;
        }

        const timeDelta = timestamp - gameState.lastTimestamp;

        if (!gameState.started) {
            gameState.started = true;
            gameState.lastTimestamp = timestamp;
        }

        // Update game state
        this.updateGame(timeDelta);

        // Render
        this.scene.renderer.render(this.scene.scene, this.scene.camera);
        this.scene.controls.update();

        gameState.lastTimestamp = timestamp;
        requestAnimationFrame(this.animate);
    }

    updateGame(timeDelta) {
        this.movePlayerPlanet(timeDelta);
        this.moveOtherPlanets(timeDelta);
        this.checkCollisions();
    }

    movePlayerPlanet(timeDelta) {
        const playerSpeed = this.getPlayerSpeed();
        gameState.playerAngleMoved -= playerSpeed * timeDelta;

        const previousLaps = Math.floor(Math.abs(gameState.playerAngleMoved) / (Math.PI * 4));
        const currentLaps = Math.floor(Math.abs(gameState.playerAngleMoved + (playerSpeed * timeDelta)) / (Math.PI * 4));

        if (currentLaps > previousLaps) {
            gameState.lapsCompleted = currentLaps;
            console.log(`Completed lap ${gameState.lapsCompleted}`);
            if (gameState.lapsCompleted % 2 === 0) {
                this.addOtherPlanet();
                this.addOtherPlanet();
            }
        }

        const totalPlayerAngle = gameState.playerAngleInitial + gameState.playerAngleMoved;
        let playerX, playerY;

        if (totalPlayerAngle % (Math.PI * 2) < Math.PI) {
            playerX = Math.cos(totalPlayerAngle) * (GAME_CONSTANTS.TRACK_RADIUS + GAME_CONSTANTS.TRACK_WIDTH) + GAME_CONSTANTS.ARC_CENTER_X;
            playerY = Math.sin(totalPlayerAngle) * (GAME_CONSTANTS.TRACK_RADIUS + GAME_CONSTANTS.TRACK_WIDTH);
        } else {
            playerX = Math.cos(totalPlayerAngle) * (GAME_CONSTANTS.TRACK_RADIUS + GAME_CONSTANTS.TRACK_WIDTH) - GAME_CONSTANTS.ARC_CENTER_X;
            playerY = Math.sin(totalPlayerAngle) * (GAME_CONSTANTS.TRACK_RADIUS + GAME_CONSTANTS.TRACK_WIDTH);
        }

        this.scene.playerPlanet.position.x = playerX;
        this.scene.playerPlanet.position.y = playerY;
        this.scene.playerPlanet.rotation.z = totalPlayerAngle - Math.PI / 2;
        this.scene.playerPlanet.rotation.y += 0.01;
    }

    moveOtherPlanets(timeDelta) {
        gameState.otherPlanets.forEach((planetInfo) => {
            planetInfo.angle += planetInfo.speed * timeDelta * (planetInfo.clockwise ? 1 : -1);
            
            let x, y;
            const innerTrackRadius = GAME_CONSTANTS.TRACK_RADIUS - GAME_CONSTANTS.TRACK_WIDTH;
            
            if (planetInfo.angle % (Math.PI * 2) < Math.PI) {
                x = Math.cos(planetInfo.angle) * innerTrackRadius + GAME_CONSTANTS.ARC_CENTER_X;
                y = Math.sin(planetInfo.angle) * innerTrackRadius;
            } else {
                x = Math.cos(planetInfo.angle) * innerTrackRadius - GAME_CONSTANTS.ARC_CENTER_X;
                y = Math.sin(planetInfo.angle) * innerTrackRadius;
            }
            
            planetInfo.mesh.position.x = x;
            planetInfo.mesh.position.y = y;
            planetInfo.mesh.rotation.y += 0.01;
        });
    }

    checkCollisions() {
        const playerPosition = new THREE.Vector3();
        this.scene.playerPlanet.getWorldPosition(playerPosition);

        for (const planet of gameState.otherPlanets) {
            const planetPosition = new THREE.Vector3();
            planet.mesh.getWorldPosition(planetPosition);

            const distance = playerPosition.distanceTo(planetPosition);
            if (distance < GAME_CONSTANTS.MIN_COLLISION_DISTANCE) {
                console.log('Game Over! Planet collision!');
                gameState.started = false;
                return true;
            }
        }
        return false;
    }

    getPlayerSpeed() {
        if (gameState.controls.accelerate) return GAME_CONSTANTS.PLAYER_SPEED * 2;
        if (gameState.controls.decelerate) return GAME_CONSTANTS.PLAYER_SPEED * 0.5;
        return GAME_CONSTANTS.PLAYER_SPEED;
    }
}

// Initialize the game
const gameScene = new GameScene();
const game = new GameManager(gameScene);
