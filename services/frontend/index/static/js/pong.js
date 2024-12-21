
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

PageElement.onLoad = () => {
	// Constants
	const SHAKE_INTENSITY = 10;
	const PADDLE_COLOR = 0x008000;
	const TABLE_COLOR = 0x800080;
	const PLANE_COLOR = 0x000000;
	const POINT_LIGHT_INTENSITY = 5000000;
	const POINT_LIGHT_DISTANCE = 1000;
	const AMBIENT_LIGHT_INTENSITY = 3;

	// Variables
	let player1Score = 0;
	let player2Score = 0;
	let shakeDuration = 0;

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

	// Skybox
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
	
	// Sphere
	const ballLoader = new THREE.TextureLoader();
	const ballTexture = ballLoader.load('media/skybox/grey-scale-sun.jpg');
	const sphereMaterial = new THREE.MeshStandardMaterial({
		map: ballTexture,
		color: 0x33e3ff,
		emissive: 0x33e3ff,
		emissiveIntensity: 1.0,
	  });
	const sphereGeometry = new THREE.SphereGeometry(10, 32, 32);
	const ball = new THREE.Mesh(sphereGeometry, sphereMaterial);
	scene.add(ball);

	// Lights
	const ambientLight = new THREE.AmbientLight(0xffffff, AMBIENT_LIGHT_INTENSITY);
	scene.add(ambientLight);

	const pointLight = new THREE.PointLight(0x33e3ff, POINT_LIGHT_INTENSITY, POINT_LIGHT_DISTANCE);
	pointLight.position.set(0, 0, 0);
	scene.add(pointLight);
	
	let paddle1 = {};
	let paddle2 = {};

	// Functions
	function  createEnvironment(data)
	{
		// Paddles and Table
		// console.log("DATA: ", data)
		const table1 = makeWall(
			data.floorPositionX,
			data.floorPositionY,
			data.floorPositionZ,
			data.boundariesWidth,
			data.boundariesDepth, 
			data.boundariesHeight,
		);
		const table2 = makeWall(
			data.ceilingPositionX,
			data.ceilingPositionY,
			data.ceilingPositionZ,
			data.boundariesWidth,
			data.boundariesDepth, 
			data.boundariesHeight,
		);
		paddle1 = makeParalellepiped(
			data.paddle1PositionX,
			data.paddlePositionY,
			data.paddle1PositionZ,
			data.paddleWidth,
			data.paddleDepth, 
			data.paddleLength,
			PADDLE_COLOR
		);
		paddle2 = makeParalellepiped(
			data.paddle2PositionX,
			data.paddlePositionY,
			data.paddle2PositionZ,
			data.paddleWidth,
			data.paddleDepth, 
			data.paddleLength,
			PADDLE_COLOR
		);

		scene.add(table1);
		scene.add(table2);
		scene.add(paddle1);
		scene.add(paddle2);
	}

	function makeParalellepiped(x, y, z, dx, dy, dz, color) 
	{
		const material = new THREE.MeshStandardMaterial({
			color: color,
		});
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

	function handlePaddleControls(player) 
	{
		document.addEventListener('keydown', (event) => 
		{
			let payload = null;
			let payload2 = null;
			switch (event.key) 
			{
				case 'W':
				case 'w':
				case 'ArrowUp':
					payload = { direction: -1 };
					break;
				case 's':
				case 'S':
				case 'ArrowDown':
					payload = { direction: 1 };
					break;
				case 'p':
					payload2 = { pause: true };
					break;
			}
			if (payload) 
			{
				sendPayload(player, payload);
			}
			if (payload2)
			{
				sendPayload('pause', payload2);
			}
		});

		document.addEventListener('keyup', (event) => 
		{
			let payload = null;
			switch (event.key) 
			{
				case 'w':
				case 's':
				case 'W':
				case 'S':
				case 'ArrowUp':
				case 'ArrowDown':
					payload = { direction: 0 };
					break;
			}
			if (payload) 
			{
				sendPayload(player, payload);
			}
		});
	}

	function updatePaddlePositions(payloadData) 
	{
		paddle1.position.z = payloadData.paddle1PositionZ;
		paddle2.position.z = payloadData.paddle2PositionZ;
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
		//if (shakeDuration == 0)   
		//{
		//	camera.position.set(0, 500, 0); 
		//}
	}

	function updateBall(ballData)
	{
		ball.position.x = ballData.ballPositionX;
		ball.position.z = ballData.ballPositionZ;
		applyCameraShake();
		pointLight.position.copy(ball.position);
	}

	const quitBtn = document.getElementById("quit-btn");
	quitBtn.addEventListener('click', () => {
		socket.close();
	})

	function win(message)
	{
		console.log('MESSAGE:', message);
		const modalElement = document.getElementById('quit');
		const modal = new bootstrap.Modal(modalElement, {
			backdrop: 'static',
			keyboard: false,
		});
		modal.show();
		const winnerMsg = document.getElementById("winner-msg");
		winnerMsg.innerHTML = message
		readyBtn.style.display = 'block';
		rendering = False
	}

	// Modify the animate function to include swatting animation logic
	function animate() 
	{
		if (rendering)
			renderer.render(scene, camera);
	}

	// saveSphereData();
	// setInterval(saveSphereData, 1000);
	renderer.setAnimationLoop(animate);

	// ************************************* WEBSOCKET FUCNTIONS ************************************************

	const lobby_id = window.props.get("id");
	const token = localStorage.getItem("playerToken") || ""
	const socket = new WebSocket(`wss://localhost:8443/ws/${lobby_id}/?token=${token}`);
	let rendering = true;

	function sendPayload(type, payload) 
	{
		socket.send(JSON.stringify({
			type: type,
			payload: payload
		}));
	}

	socket.onmessage = function(event) 
	{
		const data = JSON.parse(event.data);
		switch(data.type)
		{
			case 'token':
				localStorage.setItem("playerToken", data.payload)
				break
			case 'connect':
				console.log(`User ID: ${data.payload.id} | `, data.payload.connectMessage);
				break;
			case 'readyBtn':
				console.log("TEST: ", readyBtn.classList.contains('hidden'));
				if (readyBtn.classList.contains('hidden'))
				{
					readyBtn.classList.remove('hidden');
				}
				if (data.payload == 'add')
					readyBtn.classList.add('hidden');
				break ;
			case 'message':
				console.log(data.payload);
				break;
			case 'state':
				updateBall(data.payload);
				updatePaddlePositions(data.payload);
				break;
			case 'graphicsInit':
				console.log('Graphics initialized');
				createEnvironment(data.payload);
				break;
			case 'shake':
				// shakeDuration = SHAKE_DURATION;
				// applyCameraShake();
				console.log('shake');
				break;
			case 'point':
				player1Score = data.payload.player1Score;
				document.getElementById('player1score').innerHTML = player1Score;
				player2Score = data.payload.player2Score;
				document.getElementById('player2score').innerHTML = player2Score;
				console.log('player1Score: ', player1Score, 'player2Score: ', player2Score);
				break;
			case 'gameOver':
				win(data.payload);
			case 'paddleInit':
				if (data.payload.player == '1'){
					handlePaddleControls('p1');}
				else if (data.payload.player == '2'){
					handlePaddleControls('p2');}
		}
	}

	const readyBtn = document.getElementById('readyBtn');
	readyBtn.onclick = async () => {
		readyBtn.classList.add("hidden");
		sendPayload('ready', {
			ready: true,
		});
	}

	socket.onopen = async () => 
	{
		sendPayload('connect', {
			id: window.user.id,
			connectMessage: `Welcome to the [${lobby_id}] lobby [${window.user.username}]!!`,
		});
	}

	socket.onclose = () => 
	{
		console.log('Socket closed unexpectedly');
		seturl('/lobby');
	};

	PageElement.onUnLoad = () => {
		console.log("onUnLoad:pong");
		sendPayload('message', `[${window.user.username}] disconnected.`);
		renderer.dispose();
		socket.close();
		PageElement.onUnLoad = () => {};
	}
}