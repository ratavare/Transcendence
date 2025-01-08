import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


PageElement.onLoad = () => {

	const POINT_LIGHT_INTENSITY = 5000000;
	const POINT_LIGHT_DISTANCE = 1000;
	const AMBIENT_LIGHT_INTENSITY = 3;
	// set the renderer
	const canvas = document.getElementById('canvas_home');
	const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
	renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
	document.body.appendChild(renderer.domElement);

	// set the scene
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 10000); // Field of view, aspect ratio, near clipping plane, far clipping plane
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

	console.log('Loaded home page');
}

document.getElementById('createSingleplayerMatch').addEventListener('click', function() {
    seturl('/singleplayerpong');
});

document.getElementById('createLocalMultiplayerMatch').addEventListener('click', function() {
    seturl('/multiplayer_pong');
});

async function joinLobby(lobby_id)
{
	try {
		const response = await fetch(`https://localhost:8443/lobby/lobbies/${lobby_id}/`, { // TODO: Add Authorization header
			method: 'POST',
			body: JSON.stringify(window.user),
			headers: {
				"X-CSRFToken": getCookie('csrftoken'),
				"Accept": "application/json",
				"Content-Type": "application/json"
			},

		});
		const data = await response.json()
		if (!response.ok)
			throw data.error;
		seturl(`/pong?id=${lobby_id}`)
	} catch (error) {
		alert(error);
	}
}

function buttonConfigure()
{
	const lobbies = lobbyListDiv.querySelectorAll('li');
	lobbies?.forEach(item => {
		const button = item.querySelector('button')
		const lobby_id = item.querySelector('p').textContent;
		button.addEventListener('click', () => {
			joinLobby(lobby_id);
		});
	});
}


function putLobbylist(lobbies)
{
	const previousList = lobbyListDiv.querySelector('ul');
	previousList?.remove();
	const lobbyList = document.createElement('ul');
	lobbyList.classList.add("list-group");
	let i = 0;
	lobbies.forEach(lobby => {
		const lobbyItemList = document.createElement('li');
		lobbyItemList.id = 'item' + i++;
		lobbyItemList.classList.add("list-group-item");
		lobbyItemList.style = 'display: flex;align-items: center;justify-content: space-around';
	
		const lobbyId = document.createElement('p');
		lobbyId.textContent = lobby.lobby_id;

		const joinLobbyBtn = document.createElement('button');
		joinLobbyBtn.classList.add("btn", "col", "pull-right", "btn-success", "btn-xs");
		joinLobbyBtn.textContent = "Join Lobby";
		joinLobbyBtn.type = 'submit';
		joinLobbyBtn.style.display = 'flex';
        joinLobbyBtn.setAttribute('data-bs-dismiss', 'modal');

		lobbyItemList.appendChild(lobbyId);
		lobbyItemList.appendChild(joinLobbyBtn);
		lobbyList.appendChild(lobbyItemList);

	});
	lobbyListDiv.appendChild(lobbyList);
	lobbyListDiv.style.display = 'block';

	buttonConfigure()
}

async function getLobbies()
{
	try {
		const response = await fetch('https://localhost:8443/lobby/lobbies/') // TODO: Add Authorization header
		const data = await response.json();
		if (!response.ok)
			throw data.error;
		putLobbylist(data.lobbies)
	} catch(error) {
		console.log(error)
	}
}

{
	const createLobbyForm = document.getElementById('create-lobby-form');

	createLobbyForm?.addEventListener('submit', async function(event) {
		event.preventDefault();

		const formData = new FormData(event.target);
		// for (const pair of formData.entries())
		// 	console.log(pair[0], " | ", pair[1]);
	
		try {
			const data = await myFetch('https://localhost:8443/lobby/lobbies/', formData)
			joinLobby(data.lobby_id);
		} catch(error) {
			seturl('/lobby');
			console.log(error);
		}
	});
}

var lobbyListDiv = document.getElementById('lobby-list');
lobbyListDiv.style.display = 'none'	

getLobbies();
