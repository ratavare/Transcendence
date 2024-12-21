import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

PageElement.onLoad = () => {
	console.log("singleplayerpong.js loaded fawfawfwafaw");

	// Constants
	const PADDLE_SPEED = 10;
	const AIPADDLE_SPEED = 10;
	const CUBE_INITIAL_SPEED = 10;
	const SHAKE_INTENSITY = 10;
	const SHAKE_DURATION = 10;
	const PADDLE_COLOR = 0x008000;
	const TABLE_COLOR = 0x800080;
	const PLANE_COLOR = 0x000000;
	const CUBE_COLOR = 0x00ff00;
	const POINT_LIGHT_INTENSITY = 5000000;
	const POINT_LIGHT_DISTANCE = 1000;
	const AMBIENT_LIGHT_INTENSITY = 3;

	// Variables
	let player1Score = 0;
	let player2Score = 0;
	let cubeSpeedx = CUBE_INITIAL_SPEED;
	let cubeSpeedz = 0;
	let shakeDuration = 0;
	let paddle1Speed = 0;
	let paddle2Speed = 0;
	let gamePaused = false;
	let beginGame = false;


	// get Overlay

	const overlay = document.getElementById('overlay');
	const overlayContainer = document.getElementById('overlay-container');


	// Scene Setup
	const canvas = document.getElementById('canvas');
	const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
	renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
	document.body.appendChild(renderer.domElement);

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 10000);
	const controls = new OrbitControls(camera, renderer.domElement);
	camera.position.set(0, 500, 0);
	controls.update();

	// Make skybox
	const loader = new THREE.CubeTextureLoader();
	const skybox = loader.load([
		'media/skybox/right.png', // Right
		'media/skybox/left.png', // Left
		'media/skybox/top.png', // Top
		'media/skybox/bottom.png', // Bottom
		'media/skybox/front.png', // Front
		'media/skybox/back.png'  // Back
	]);
	scene.background = skybox;

	// Lights
	const ambientLight = new THREE.AmbientLight(0xffffff, AMBIENT_LIGHT_INTENSITY);
	scene.add(ambientLight);

	const pointLight = new THREE.PointLight(0x33e3ff, POINT_LIGHT_INTENSITY, POINT_LIGHT_DISTANCE);
	scene.add(pointLight);

	// Cube
	const ballLoader = new THREE.TextureLoader();
	const ballTexture = ballLoader.load('media/skybox/grey-scale-sun.jpg');
	const sphereMaterial = new THREE.MeshStandardMaterial({
		map: ballTexture,
		color: 0x33e3ff,
		emissive: 0x33e3ff,
		emissiveIntensity: 1.0,
	  });
	const sphereGeometry = new THREE.SphereGeometry(10, 32, 32);
	const cube = new THREE.Mesh(sphereGeometry, sphereMaterial);
	scene.add(cube);
	// create cube bounding box
	const cubeBoundingBox = new THREE.Box3().setFromObject(cube);

	// Paddles and Table
	const table1 = makeWall(-1300, -50, 500, 2500, 100, 100);
	const table2 = makeWall(-1300, -50, -600, 2500, 100, 100);
	const paddle1 = makeParalellepiped(-810, -15, -50, 10, 30, 100, PADDLE_COLOR);
	const paddle2 = makeParalellepiped(800, -15, -50, 10, 30, 100, PADDLE_COLOR);

	scene.add(table1);
	scene.add(table2);
	scene.add(paddle1);
	scene.add(paddle2);

	const table1BoundingBox = new THREE.Box3().setFromObject(table1);
	const table2BoundingBox = new THREE.Box3().setFromObject(table2);
	const paddle1BoundingBox = new THREE.Box3().setFromObject(paddle1);
	const paddle2BoundingBox = new THREE.Box3().setFromObject(paddle2);

	// Functions
	function makeParalellepiped(x, y, z, dx, dy, dz, color) 
	{
		const material = new THREE.MeshStandardMaterial({ color: color });
		const box = new THREE.Mesh(new THREE.BoxGeometry(dx, dy, dz), material);
		box.position.set(x + dx / 2, y + dy / 2, z + dz / 2);
		return box;
	}

	function makeWall(x, y, z, dx, dy, dz)
	{
		const textureLoader = new THREE.TextureLoader();

		const colorMap = textureLoader.load('media/walls/colorMap.png');
		const normalMap = textureLoader.load('media/walls/normalMap.png');
		const aoMap = textureLoader.load('media/walls/aoMap.png');
		const metallicMap = textureLoader.load('media/walls/metallicMap.png');
		const roughnessMap = textureLoader.load('media/walls/roughnessMap.png');
		const heightMap = textureLoader.load('media/walls/heightMap.png');

		const scaleX = dx / 100;
		const scaleZ = dz / 100;

		const textures = [colorMap, normalMap, aoMap, metallicMap, roughnessMap, heightMap];
		textures.forEach(texture => {
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set(scaleX, scaleZ);
		});

		const material = new THREE.MeshStandardMaterial({
			color: TABLE_COLOR,
			map: colorMap,
			normalMap: normalMap,
			aoMap: aoMap,
			metalnessMap: metallicMap,
			roughnessMap: roughnessMap,
			displacementMap: heightMap,
			displacementScale: 0.1
		});
		material.aoMapIntensity = 1.0;
		material.displacementBias = 0;

		const box = new THREE.BoxGeometry(dx, dy, dz);
		const mesh = new THREE.Mesh(box, material);
		mesh.position.set(x + dx / 2, y + dy / 2, z + dz / 2);
		return (mesh)
	}

	function handlePaddleControls() 
	{
		document.addEventListener('keydown', (event) => 
		{
			switch (event.key) 
			{
			case 'w':
				beginGame = true;
				paddle2Speed = -PADDLE_SPEED;
				overlayContainer.style.display = 'none';
				break;
			case 's':
				beginGame = true;
				paddle2Speed = PADDLE_SPEED;
				overlayContainer.style.display = 'none';
				break;
			case 'ArrowUp':
				beginGame = true;
				paddle2Speed = -PADDLE_SPEED;
				overlayContainer.style.display = 'none';
				break;
			case 'ArrowDown':
				beginGame = true;
				paddle2Speed = PADDLE_SPEED;
				overlayContainer.style.display = 'none'; 	
				break;
			case 'p':
				gamePaused = !gamePaused;
				break;
			}
		});

		document.addEventListener('keyup', (event) => 
		{
			switch (event.key) 
			{
			case 'w':
			case 's':
				paddle2Speed = 0;
				break;
			case 'ArrowUp':
			case 'ArrowDown':
				paddle2Speed = 0;
				break;
			}
		});
	}

	function movePaddles() 
	{
		paddle1.position.z += paddle1Speed;
		paddle2.position.z += paddle2Speed;
		paddle1BoundingBox.setFromObject(paddle1);
		paddle2BoundingBox.setFromObject(paddle2);
	}

	function applyCameraShake() 
	{
		if (shakeDuration > 0) 
		{
			const shakeX = (Math.random() - 0.5) * SHAKE_INTENSITY;
			const shakeY = (Math.random() - 0.5) * SHAKE_INTENSITY;
			const shakeZ = (Math.random() - 0.5) * SHAKE_INTENSITY;
			camera.position.x += shakeX;
			camera.position.y += shakeY;
			camera.position.z += shakeZ;
			shakeDuration--;
		}
		if (shakeDuration == 0)   
		{
			camera.position.set(0, 500, 0);
		}
	}

	function increaseSpeed()
	{
		if (cubeSpeedx < 20 && cubeSpeedx > -20)
			cubeSpeedx += (cubeSpeedx > 0) ? 0.4 : -0.4;
	}

	function checkIntersections() 
	{
		cubeBoundingBox.setFromObject(cube);

		if (cubeBoundingBox.intersectsBox(table1BoundingBox) || cubeBoundingBox.intersectsBox(table2BoundingBox)) 
		{
			cubeSpeedz *= -1;
		}

		if (cubeBoundingBox.intersectsBox(paddle1BoundingBox)) 
		{
			cubeSpeedx *= -1;
			shakeDuration = SHAKE_DURATION;
			increaseSpeed();
			adjustCubeDirection(paddle1);
		}

		if (cubeBoundingBox.intersectsBox(paddle2BoundingBox)) 
		{
			cubeSpeedx *= -1;
			shakeDuration = SHAKE_DURATION;
			increaseSpeed();
			adjustCubeDirection(paddle2);
		}

		if (paddle1BoundingBox.intersectsBox(table1BoundingBox)) 
		{
			paddle1.position.z = 450;
		}
		else if(paddle1BoundingBox.intersectsBox(table2BoundingBox))
		{
			paddle1.position.z = -450;
		}
		if (paddle2BoundingBox.intersectsBox(table1BoundingBox)) 
		{
			paddle2.position.z = 450;
		}
		else if(paddle2BoundingBox.intersectsBox(table2BoundingBox))
		{
			paddle2.position.z = -450;
		}
	}

	function adjustCubeDirection(paddle) 
	{
		const relativeIntersectZ = (paddle.position.z + (paddle.geometry.parameters.depth / 2)) - cube.position.z;
		const normalizedIntersectZ = (relativeIntersectZ / (paddle.geometry.parameters.depth / 2)) - 1;
		cubeSpeedz = normalizedIntersectZ * 10; // Adjust the multiplier as needed
	}

	function respawnCube(player) 
	{
		if (player == 1)
		{
			cube.position.set(200, 0, 0);
			cubeSpeedx = CUBE_INITIAL_SPEED;
			cubeSpeedz = 0;
			beginGame = false;
			pointLight.position.copy(cube.position);
		}
		else if (player == 2)
		{
			cube.position.set(-200, 0, 0);
			cubeSpeedx = -CUBE_INITIAL_SPEED;
			cubeSpeedz = 0;
			beginGame = false;
			pointLight.position.copy(cube.position);
		}
	}

	function cubeOutofBounds()
	{
		if (cube.position.x > 1000)
		{
			console.log('z is ' + cube.position.z + ' x is ' + cube.position.x);
			respawnCube(1);
			player1Score++;
			document.getElementById('player1score').innerHTML = player1Score;
		} 
		else if (cube.position.x < -1000)
		{
			console.log('z is ' + cube.position.z + ' x is ' + cube.position.x); 
			respawnCube(2);
			player2Score++;
			document.getElementById('player2score').innerHTML = player2Score;
		}
	}

	function moveCube()
	{
		cube.rotation.x += 0.01;
		cube.rotation.y += 0.01;
		cube.position.x += cubeSpeedx;
		cube.position.z += cubeSpeedz;
		pointLight.position.copy(cube.position);

		cubeOutofBounds();

		cubeBoundingBox.setFromObject(cube);
	}

	let sphereData = [];

	let startTime = Date.now();

	function saveSphereData() 
	{
		let time = 0;
		let position = { x: cube.position.x, z: cube.position.z };
		let speed = { x: cubeSpeedx, z: cubeSpeedz };
		time = Date.now() - startTime;

		if (sphereData.length == 0) 
		{
			sphereData.push({ time: time, position: position, speed: speed });
		}
		else
		{
			sphereData[0] = { time: time, position: position, speed: speed };
		}
		console.log('Time: ' + time + ' Position: ' + position.x + ', ' + position.z + ' Speed: ' + speed.x + ', ' + speed.z);
	}

	saveSphereData();
	setInterval(saveSphereData, 1000);

	function calculateTrajectory()  
	{
		let data = sphereData[0];

		let finalAngle = Math.atan2(data.speed['z'], data.speed['x']);
		finalAngle = finalAngle * (180 / Math.PI);

		let distance = 0;
		let finalPosition = { x: 0, z: 0 };

		if (data.speed['x'] > 0) 
		{
			distance = 800 - data.position['x'];
			finalPosition['x'] = 800;
		} 
		else if (data.speed['x'] < 0) 
		{
			distance = -800 - data.position['x'];
			finalPosition['x'] = -800;
		}

		// Calculate the distance along the z axis using trigonometric functions
		let angleRadians = Math.atan2(data.speed['z'], data.speed['x']);
		let zDistance = distance * Math.tan(angleRadians);
		finalPosition['z'] = data.position['z'] + zDistance;

		// Handle wall bounces
		const topWallZ = -500;
		const bottomWallZ = 500;

		while (finalPosition['z'] < topWallZ || finalPosition['z'] > bottomWallZ) 
		{
			if (finalPosition['z'] < topWallZ) 
			{
				finalPosition['z'] = topWallZ + (topWallZ - finalPosition['z']);
			} 
			else if (finalPosition['z'] > bottomWallZ) 
			{
				finalPosition['z'] = bottomWallZ - (finalPosition['z'] - bottomWallZ);
			}
		}

		return finalPosition;
	}

	function paddle1AI(paddle) 
	{
		const topWallZ = -449;
		const bottomWallZ = 449;

		// Calculate the final position of the cube using the calculateTrajectory function
		let finalPosition = calculateTrajectory();

		// Ensure the paddle moves towards the final position of the cube
		if (cubeSpeedx < 0) 
		{
			if (paddle.position.z > finalPosition['z'])
			{
				// Move paddle up
				if (paddle.position.z - AIPADDLE_SPEED < topWallZ) 
				{
					paddle.position.z = topWallZ;
				}
				else if (paddle.position.z - AIPADDLE_SPEED >= finalPosition['z'])
				{
					paddle.position.z -= AIPADDLE_SPEED;
				}
			} 
			else if (paddle.position.z < finalPosition['z']) 
			{
				// Move paddle down
				if (paddle.position.z + AIPADDLE_SPEED > bottomWallZ)
				{
					paddle.position.z = bottomWallZ;
				} 
				else if (paddle.position.z + AIPADDLE_SPEED <= finalPosition['z']) 
				{
					paddle.position.z += AIPADDLE_SPEED;
				}
			}
		}
	}

	function animate()
	{
		if (player1Score < 7 && player2Score < 7)
		{
			renderer.render(scene, camera);
			if (!gamePaused && beginGame)
			{
				movePaddles();
				paddle1AI(paddle1);
				checkIntersections();
				moveCube();
				applyCameraShake();
			}
			console.log('Player 1: ' + player1Score + ' Player 2: ' + player2Score);
		}
		else if (player1Score == 7)
		{
			document.getElementById('winner').innerHTML = 'Player 1 wins!';
		}
		else if (player2Score == 7)
		{
			document.getElementById('winner').innerHTML = 'Player 2 wins!';
		}
	}

	handlePaddleControls();
	renderer.setAnimationLoop(animate);

	// ************************************* WEBSOCKET FUCNTIONS ************************************************

	PageElement.onUnLoad = () => {
		console.log("onUnLoad:pong");
		sendPayload('message', `[${window.user.username}] disconnected.`);
		renderer.dispose();
		PageElement.onUnLoad = () => {};
	}
}