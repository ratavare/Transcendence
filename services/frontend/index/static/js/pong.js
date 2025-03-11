import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ************************************* THREEJS ************************************************

PageElement.onLoad = () => {
	// Constants
	const SHAKE_INTENSITY = 10;
	const PADDLE_COLOR = 0x008000;
	const PADDLE_COLOR2 = 0x0000ff;
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
	const canvas = document.getElementById("canvas");
	const canvasContainer = document.getElementById("canvas-item");

	const renderer = new THREE.WebGLRenderer({
		canvas: canvas,
		antialias: true,
	});
	renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
	document.body.appendChild(renderer.domElement);

	if (!canvasContainer.contains(canvas)) {
		canvasContainer.appendChild(canvas);
	}

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(
		100,
		window.innerWidth / window.innerHeight,
		0.1,
		10000
	);
	const controls = new OrbitControls(camera, renderer.domElement);
	camera.position.set(0, 500, 0);
	controls.update();

	// // Skybox
	// const loader = new THREE.CubeTextureLoader();
	// const skybox = loader.load([
	// 	"media/skybox/right.png", // Right
	// 	"media/skybox/left.png", // Left
	// 	"media/skybox/top.png", // Top
	// 	"media/skybox/bottom.png", // Bottom
	// 	"media/skybox/front.png", // Front
	// 	"media/skybox/back.png", // Back
	// ]);
	// scene.background = skybox;

	// Sphere
	const ballLoader = new THREE.TextureLoader();
	const ballTexture = ballLoader.load("media/skybox/grey-scale-sun.jpg");
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
	const ambientLight = new THREE.AmbientLight(
		0xffffff,
		AMBIENT_LIGHT_INTENSITY
	);
	scene.add(ambientLight);

	const pointLight = new THREE.PointLight(
		0x33e3ff,
		POINT_LIGHT_INTENSITY,
		POINT_LIGHT_DISTANCE
	);
	pointLight.position.set(0, 0, 0);
	scene.add(pointLight);

	let paddle1 = {};
	let paddle2 = {};

	// Functions
	function createEnvironment(data) {
		// Paddles and Table
		const table1 = makeWall(
			data.floorPositionX,
			data.floorPositionY,
			data.floorPositionZ,
			data.boundariesWidth,
			data.boundariesDepth,
			data.boundariesHeight
		);
		const table2 = makeWall(
			data.ceilingPositionX,
			data.ceilingPositionY,
			data.ceilingPositionZ,
			data.boundariesWidth,
			data.boundariesDepth,
			data.boundariesHeight
		);
		paddle1 = makePaddle(
			data.paddle1PositionX,
			data.paddlePositionY,
			data.paddle1PositionZ,
			data.paddleWidth,
			data.paddleDepth,
			data.paddleLength,
			PADDLE_COLOR
		);
		paddle2 = makePaddle(
			data.paddle2PositionX,
			data.paddlePositionY,
			data.paddle2PositionZ,
			data.paddleWidth,
			data.paddleDepth,
			data.paddleLength,
			PADDLE_COLOR2
		);

		scene.add(table1);
		scene.add(table2);
		scene.add(paddle1);
		scene.add(paddle2);
	}

	function makeParalellepiped(x, y, z, dx, dy, dz, color) {
		const material = new THREE.MeshStandardMaterial({
			color: color,
		});
		const box = new THREE.Mesh(new THREE.BoxGeometry(dx, dy, dz), material);
		box.position.set(x + dx / 2, y + dy / 2, z + dz / 2);
		return box;
	}


	function makePaddle(x, y, z, dx, dy, dz, color)
	{
		const textureLoader = new THREE.TextureLoader();

		const colorMap = textureLoader.load('static/images/paddles/red-scifi-metal_albedo.png');
		const normalMap = textureLoader.load('static/images/paddles/red-scifi-metal_normal-ogl.png');
		const aoMap = textureLoader.load('static/images/paddles/red-scifi-metal_ao.png');
		const metallicMap = textureLoader.load('static/images/paddles/red-scifi-metal_metallic.png');
		const roughnessMap = textureLoader.load('static/images/paddles/red-scifi-metal_roughness.png');
		const heightMap = textureLoader.load('static/images/paddles/red-scifi-metal_height.png');

		const scaleX = dx / 50;
		const scaleZ = dz / 50;

		const textures = [colorMap, normalMap, aoMap, metallicMap, roughnessMap, heightMap];
		textures.forEach(texture => {
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			// texture.repeat.set(scaleX, scaleZ);
		});

		const material = new THREE.MeshStandardMaterial({
			color: color,
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

	function makeWall(x, y, z, dx, dy, dz) {
		const textureLoader = new THREE.TextureLoader();

		const colorMap = textureLoader.load("media/walls/colorMap.png");
		const normalMap = textureLoader.load("media/walls/normalMap.png");
		const aoMap = textureLoader.load("media/walls/aoMap.png");
		const metallicMap = textureLoader.load("media/walls/metallicMap.png");
		const roughnessMap = textureLoader.load("media/walls/roughnessMap.png");
		const heightMap = textureLoader.load("media/walls/heightMap.png");

		const scaleX = dx / 100;
		const scaleZ = dz / 100;

		const textures = [
			colorMap,
			normalMap,
			aoMap,
			metallicMap,
			roughnessMap,
			heightMap,
		];
		textures.forEach((texture) => {
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
			displacementScale: 0.1,
		});
		material.aoMapIntensity = 1.0;
		material.displacementBias = 0;

		const box = new THREE.BoxGeometry(dx, dy, dz);
		const mesh = new THREE.Mesh(box, material);
		mesh.position.set(x + dx / 2, y + dy / 2, z + dz / 2);
		return mesh;
	}

	function handlePaddleControls(player) {
		document.addEventListener("keydown", (event) => {
			let payload = null;
			let payload2 = null;
			switch (event.key) {
				case "W":
				case "w":
				case "ArrowUp":
					payload = { direction: -1 };
					break;
				case "s":
				case "S":
				case "ArrowDown":
					payload = { direction: 1 };
					break;
				case "p":
					payload2 = { pause: true };
					break;
			}
			if (payload) {
				sendPayload(player, payload);
			}
			if (payload2) {
				sendPayload("pause", payload2);
			}
		});

		document.addEventListener("keyup", (event) => {
			let payload = null;
			switch (event.key) {
				case "w":
				case "s":
				case "W":
				case "S":
				case "ArrowUp":
				case "ArrowDown":
					payload = { direction: 0 };
					break;
			}
			if (payload) {
				sendPayload(player, payload);
			}
		});
	}

	function updatePaddlePositions(payloadData) {
		paddle1.position.z = payloadData.paddle1PositionZ;
		paddle2.position.z = payloadData.paddle2PositionZ;
	}

	function applyCameraShake() {
		if (shakeDuration > 0) {
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

	function updateBall(ballData) {
		ball.position.x = ballData.ballPositionX;
		ball.position.z = ballData.ballPositionZ;
		applyCameraShake();
		pointLight.position.copy(ball.position);
	}

	function win(payload) {
		const modalElement = document.getElementById("quit");
		const modal = new bootstrap.Modal(modalElement, {
			backdrop: "static",
			keyboard: false,
		});
		modal.show();
		const winnerMsg = document.getElementById("winner-msg");
		winnerMsg.innerHTML = `Winner: ${payload.winner}`;
		readyBtn.style.display = "block";
		rendering = false;
	}

	// Modify the animate function to include swatting animation logic
	function animate() {
		if (rendering) renderer.render(scene, camera);
	}

	// saveSphereData();
	// setInterval(saveSphereData, 1000);
	renderer.setAnimationLoop(animate);

	// ************************************* WEBSOCKET ************************************************

	function sendPayload(type, payload) {
		if (socket.readyState === WebSocket.OPEN)
		{
			socket.send(
				JSON.stringify({
					type: type,
					payload: payload,
				})
			);
		}
	}

	async function checkDatabase(url) {
		try {
			const data = await myFetch(url, null, "GET", true);
		} catch {
			seturl("/home");
		}
	}

	let rendering = true;
	const lobby_id = window.props.get("id");
	const playerName = window.props.get("username");

	checkDatabase(`https://localhost:8443/lobby/lobbies/${lobby_id}/`);
	checkDatabase(
		`https://localhost:8443/lobby/lobbies/${lobby_id}/${window.user.username}/`
	);
	const socket = new WebSocket(
		`wss://localhost:8443/pong/${encodeURIComponent(
			lobby_id
		)}/`
	);

	window.addEventListener("popstate", () => {
		const hash = window.location.hash;
		if (hash.includes("pong?id")) {
			const lobbyId = window.props.get("id");
			checkDatabase(`https://localhost:8443/lobby/lobbies/${lobbyId}/`);
			checkDatabase(
				`https://localhost:8443/lobby/lobbies/${lobbyId}/${window.user.username}/`
			);
		}
	});

	const readyBtn = document.getElementById("readyBtn");
	const overlayText = document.getElementById("overlay-text");
	readyBtn.onclick = async () => {
		readyBtn.classList.add("hidden");
		sendPayload("ready", {
			ready: true,
		});
		overlayText.textContent = "Waiting for the other player";
	};

	socket.onmessage = function (event) {
		const data = JSON.parse(event.data);
		switch (data.type) {
			case "readyBtn":
				if (readyBtn.classList.contains("hidden")) {
					readyBtn.classList.remove("hidden");
				}
				if (data.payload == "add") readyBtn.classList.add("hidden");
				break;
			case "message":
				receiveChatMessage(data.payload);
				break;
			case "log":
				console.log(data.payload);
				break;
			case "state":
				updateBall(data.payload);
				updatePaddlePositions(data.payload);
				break;
			case "graphicsInit":
				createEnvironment(data.payload);
				break;
			case "shake":
				break;
			case "point":
				player1Score = data.payload.player1Score;
				document.getElementById("player1score").innerHTML =
					player1Score;
				player2Score = data.payload.player2Score;
				document.getElementById("player2score").innerHTML =
					player2Score;
				break;
			case "gameOver":
				win(data.payload);
				break;
			case "paddleInit":
				if (data.payload.player == "1") {
					handlePaddleControls("p1");
				} else if (data.payload.player == "2") {
					handlePaddleControls("p2");
				}
				break;
			case "error":
				socket.close();
				seturl("/home");
		}
	};

	socket.onopen = async () => {
		sendPayload("message", {
			sender: "connect",
			content: `${playerName} joined the lobby!`,
		});
	};

	socket.onclose = () => {
		console.log("Socket closed unexpectedly");
		if (!fromTournament)
			seturl('/home');
	};

	socket.onerror = () => {
		console.error("Socket error");
	};

	// ************************************* CHAT ************************************************

	function receiveChatMessage(payload) {
		let color = "white";
		const messageList = document.getElementById("chat-message-list");
		const messageListItem = document.createElement("li");
		const chatContentElement = document.querySelector(".chat-content");

		if (payload.sender == "connect" || payload.sender == "disconnect") {
			if (payload.sender == "connect") color = "limegreen";
			if (payload.sender == "disconnect") color = "red";
			messageListItem.innerHTML = `<i style="color: ${color}">${payload.content}</i>`;
		} else {
			if (payload.sender == playerName) color = "orangered";
			messageListItem.innerHTML = `
			<b style="color: ${color}">${payload.sender}: </b>
			<span>${payload.content}</span>
			`;
		}
		if (messageListItem) messageList.appendChild(messageListItem);
		if (chatContentElement) {
			chatContentElement.scrollTop = chatContentElement.scrollHeight;
		}
	}

	function sendMessage(sender, content) {
		sendPayload("message", {
			sender: sender,
			content: content,
		});
	}

	async function getChat() {
		try {
			const data = await myFetch(
				`https://localhost:8443/lobby/lobbies/${lobby_id}/`,
				null,
				"GET",
				true
			);
			for (const message of data.lobby.chat) {
				receiveChatMessage(message);
			}
		} catch (error) {
			console.log(error);
		}
	}

	function messageForm() {
		const chatInputForm = document.getElementById("chat-input-form");
		chatInputForm.addEventListener("submit", (event) => {
			event.preventDefault();

			const chatInput = event.target.querySelector("#chat-input");
			if (chatInput.value)
				sendMessage(playerName, chatInput.value);
			chatInput.value = "";
		});
	}

	messageForm();
	getChat();

	// ************************************* TOURNAMENTS ************************************************

	let fromTournament = false;
	async function isTournamentLobby(lobby_id) {
		const quitBtn = document.getElementById("quit-btn");
		const tournament_id = lobby_id.split('_')[1]
		if (lobby_id.split('_')[0] == 'tournament')
		{
			try {
				const data = await myFetch(`https://localhost:8443/tournament/getTournamentLobby/${tournament_id}/${lobby_id}`, null, "GET", true);
				fromTournament = true;
				quitBtn.addEventListener("click", () => {
					seturl(`/tournament?id=${tournament_id}`);
					setTimeout(() => {
						window.location.reload();
					}, 100);
				});
				return ;
			} catch (error) {
				console.error("Error: ", error);
			}
		}
		quitBtn.addEventListener("click", () => {
			seturl("/home");
		});
	}

	isTournamentLobby(lobby_id)

	window.onbeforeunload = () => {
		sendMessage("disconnect", `${playerName} left the lobby`);
	};

	PageElement.onUnload = () => {
		sendMessage("disconnect", `${playerName} left the lobby`);

		socket.close();

		if (renderer) renderer.dispose();

		document.removeEventListener("keyup", handlePaddleControls);
		document.removeEventListener("keydown", handlePaddleControls);

		PageElement.onUnload = () => {};
	};
};

window.onload = () => {
	console.log("Pong Script loaded");
	PageElement.onLoad();
};