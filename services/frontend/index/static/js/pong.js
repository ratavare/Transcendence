import * as THREE from '../three.js-master/build/three.module.js';
import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';

// Constants
const PADDLE_SPEED = 15;
const AIPADDLE_SPEED = 15;
const CUBE_INITIAL_SPEED = 15;
const SHAKE_INTENSITY = 10;
const SHAKE_DURATION = 10;
const PADDLE_COLOR = 0x008000;
const TABLE_COLOR = 0x800080;
const PLANE_COLOR = 0x000000;
const CUBE_COLOR = 0x00ff00;
const POINT_LIGHT_INTENSITY = 1000000;
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
let sphereData = [];
let sphereMsg = [];
let startTime = Date.now();

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

// Helpers
const gridHelper = new THREE.GridHelper(10000, 100, 0x808080);
scene.add(gridHelper);

// Plane
const planeGeometry = new THREE.PlaneGeometry(3000, 2000);
const planeMaterial = new THREE.MeshStandardMaterial({ color: PLANE_COLOR });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -100;
plane.receiveShadow = true;
scene.add(plane);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, AMBIENT_LIGHT_INTENSITY);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, POINT_LIGHT_INTENSITY, POINT_LIGHT_DISTANCE);
scene.add(pointLight);

// Cube
const sphereGeometry = new THREE.SphereGeometry(10, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: CUBE_COLOR });
const cube = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(cube);
const cubeBoundingBox = new THREE.Box3().setFromObject(cube);

// Paddles and Table
const table1 = makeParalellepiped(-1300, 0, 500, 2700, 100, 100, TABLE_COLOR);
const table2 = makeParalellepiped(-1300, 0, -600, 2700, 100, 100, TABLE_COLOR);
const paddle1 = makeParalellepiped(-800, 0, -50, 10, 30, 100, PADDLE_COLOR);
const paddle2 = makeParalellepiped(800, 0, -50, 10, 30, 100, PADDLE_COLOR);

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

function handlePaddleControls() 
{
<<<<<<< HEAD
	document.addEventListener('keydown', (event) => 
	{
		let payload = null;
		switch (event.key) 
		{
			case 'w':
				payload = { paddle: 1, speed: -PADDLE_SPEED };
				beginGame = true;
				break;
			case 's':
				payload = { paddle: 1, speed: PADDLE_SPEED };
				beginGame = true;
				break;
			case 'ArrowUp':
				payload = { paddle: 2, speed: -PADDLE_SPEED };
				beginGame = true;
				break;
			case 'ArrowDown':
				payload = { paddle: 2, speed: PADDLE_SPEED };
				beginGame = true;
				break;
			case 'p':
				gamePaused = !gamePaused;
				break;
		}
		if (payload) 
		{
			sendPayload('move', payload);
		}
	});

	document.addEventListener('keyup', (event) => 
	{
		let payload = null;
		switch (event.key) 
		{
			case 'w':
			case 's':
				payload = { paddle: 1, speed: 0 };
				break;
			case 'ArrowUp':
			case 'ArrowDown':
				payload = { paddle: 2, speed: 0 };
				break;
		}
		if (payload) 
		{
			sendPayload('move', payload);
		}
	});
=======
    document.addEventListener('keydown', (event) => 
    {
        let message = null;
        switch (event.key) 
        {
            case 'w':
                message = { type: 'move', paddle: 1, speed: -PADDLE_SPEED };
                break;
            case 's':
                message = { type: 'move', paddle: 1, speed: PADDLE_SPEED };
                break;
            case 'ArrowUp':
                message = { type: 'move', paddle: 2, speed: -PADDLE_SPEED };
                break;
            case 'ArrowDown':
                message = { type: 'move', paddle: 2, speed: PADDLE_SPEED };
                break;
            case 'p':
                gamePaused = !gamePaused;
                break;
			case 'ArrowLeft':
				beginGame = true;
				message = { type: 'begin', game: true };
				break;
			case 'd':
				beginGame = true;
				message = { type: 'begin', game: true };
				break;
        }
        if (message.type === 'move') 
        {
            sendMessage('paddleMove', message);
        }
		else if (message.type === 'begin')
		{
			sendMessage('beginGame', message);
		}
    });

    document.addEventListener('keyup', (event) => 
    {
        let message = null;
        switch (event.key) 
        {
            case 'w':
            case 's':
                message = { type: 'move', paddle: 1, speed: 0 };
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                message = { type: 'move', paddle: 2, speed: 0 };
                break;
        }
        if (message)
        {
            sendMessage('paddleMove', message);
        }
    });
>>>>>>> d3510d08ba8ee2157a3d86c76e38882498950d45
}

function updatePaddlePositions(paddleData) 
{
	console.log('updatePaddlePositions');
	if (paddleData.payload.paddle == 1)
	{
		paddle1Speed = paddleData.payload.speed;
	}
	else if (paddleData.payload.paddle == 2)
	{
		paddle2Speed = paddleData.payload.speed;
	}
<<<<<<< HEAD
	paddle1BoundingBox.setFromObject(paddle1);
	paddle2BoundingBox.setFromObject(paddle2);
=======
    paddle1BoundingBox.setFromObject(paddle1);
    paddle2BoundingBox.setFromObject(paddle2);
}

function updateCubePosition(cubeData) 
{
	console.log('updateCubePosition');
	cube.position.x = cubeData.message.position.x;
	cube.position.z = cubeData.message.position.z;
	cubeSpeedx = cubeData.message.speed.x;
	cubeSpeedz = cubeData.message.speed.z;
}

socket.onmessage = function(event) 
{
    // console.log('Received message:', event.data);
    const data = JSON.parse(event.data);
    console.log("Parsed data:", data);
	if (data.message.type === 'move')
    {
        updatePaddlePositions(data);
    }
	else if (data.message.type === 'cube')
	{
		updateCubePosition(data);
	}
	else if (data.message.type === 'begin')
	{
		beginGame = data.message.game;
	}
}

function sendMessage(type, message) 
{
    console.log(`Sending message: type=${type}, message=${JSON.stringify(message)}`);
    socket.send(JSON.stringify(
    {
        'type': type,
        'message': message
    }));
>>>>>>> d3510d08ba8ee2157a3d86c76e38882498950d45
}

function movePaddles()
{
	if (paddle1.position.z + paddle1Speed > -460 && paddle1.position.z + paddle1Speed < 460)
	{
		paddle1.position.z += paddle1Speed;
	}
	if (paddle2.position.z + paddle2Speed > -460 && paddle2.position.z + paddle2Speed < 460)
	{
		paddle2.position.z += paddle2Speed;
	}
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

function sendCubeData()
{
	let message;

	message = { type: 'cube', position: { x: cube.position.x, z: cube.position.z }, speed: { x: cubeSpeedx, z: cubeSpeedz } };
	sendMessage('cube', message);
}

function checkIntersections()
{
  cubeBoundingBox.setFromObject(cube);

  if (cubeBoundingBox.intersectsBox(table1BoundingBox) || cubeBoundingBox.intersectsBox(table2BoundingBox)) 
  {
	cubeSpeedz *= -1;
	cube.position.z += cubeSpeedz;
  }

  if (cubeBoundingBox.intersectsBox(paddle1BoundingBox)) 
  {
<<<<<<< HEAD
	cubeSpeedx *= -1;
	shakeDuration = SHAKE_DURATION;
	increaseSpeed();
	adjustCubeDirection(paddle1);
	cube.position.x += cubeSpeedx;
	cube.position.z += cubeSpeedz;
=======
    cubeSpeedx *= -1;
    shakeDuration = SHAKE_DURATION;
    increaseSpeed();
    adjustCubeDirection(paddle1);
    cube.position.x += cubeSpeedx;
    cube.position.z += cubeSpeedz;
	sendCubeData();
>>>>>>> d3510d08ba8ee2157a3d86c76e38882498950d45
  }

  if (cubeBoundingBox.intersectsBox(paddle2BoundingBox)) 
  {
<<<<<<< HEAD
	cubeSpeedx *= -1;
	shakeDuration = SHAKE_DURATION;
	increaseSpeed();
	adjustCubeDirection(paddle2);
	cube.position.x += cubeSpeedx;
	cube.position.z += cubeSpeedz;
  }

  if (paddle1BoundingBox.intersectsBox(table1BoundingBox) || paddle1BoundingBox.intersectsBox(table2BoundingBox)) 
  {
	paddle1.position.z -= paddle1Speed;
  }
  if (paddle2BoundingBox.intersectsBox(table1BoundingBox) || paddle2BoundingBox.intersectsBox(table2BoundingBox)) 
  {
	paddle2.position.z -= paddle2Speed;
=======
    cubeSpeedx *= -1;
    shakeDuration = SHAKE_DURATION;
    increaseSpeed();
    adjustCubeDirection(paddle2);
    cube.position.x += cubeSpeedx;
    cube.position.z += cubeSpeedz;
	sendCubeData();
>>>>>>> d3510d08ba8ee2157a3d86c76e38882498950d45
  }
}

function adjustCubeDirection(paddle) 
{
  const relativeIntersectZ = (paddle.position.z + (paddle.geometry.parameters.depth / 2)) - cube.position.z;
  const normalizedIntersectZ = (relativeIntersectZ / (paddle.geometry.parameters.depth / 2)) - 1;
  cubeSpeedz = normalizedIntersectZ * 20; // Adjust the multiplier as needed
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
	// console.log('z is ' + cube.position.z + ' x is ' + cube.position.x);
	respawnCube(1);
	player1Score++;
	document.getElementById('player1score').innerHTML = player1Score;
  } else if (cube.position.x < -1000)
  {
	// console.log('z is ' + cube.position.z + ' x is ' + cube.position.x); 
	respawnCube(2);
	player2Score++;
	document.getElementById('player2score').innerHTML = player2Score;
  }
}

function moveCube()
{
	if (beginGame == false)
	{
		return;
	}
	cube.position.x += cubeSpeedx;
	cube.position.z += cubeSpeedz;
	pointLight.position.copy(cube.position);

	cubeOutofBounds();

	cubeBoundingBox.setFromObject(cube);
}

// function saveSphereData() 
// {
//   let time = 0;
//   let position = { x: cube.position.x, z: cube.position.z };
//   let speed = { x: cubeSpeedx, z: cubeSpeedz };
//   time = Date.now() - startTime;

//   if (sphereData.length == 0) 
//   {
// 	sphereData.push({ time: time, position: position, speed: speed });
//   }
//   else
//   {
// 	sphereData[0] = { time: time, position: position, speed: speed };
//   }
// //   console.log('Time: ' + time + ' Position: ' + position.x + ', ' + position.z + ' Speed: ' + speed.x + ', ' + speed.z);
// }

// function calculateTrajectory()  
// {
//   let data = sphereData[0];

//   let finalAngle = Math.atan2(data.speed['z'], data.speed['x']);
//   finalAngle = finalAngle * (180 / Math.PI);

//   let distance = 0;
//   let finalPosition = { x: 0, z: 0 };

// 	if (data.speed['x'] > 0) 
// 	{
// 		distance = 800 - data.position['x'];
// 		finalPosition['x'] = 800;
// 	} 
// 	else if (data.speed['x'] < 0) 
// 	{
// 		distance = -800 - data.position['x'];
// 		finalPosition['x'] = -800;
// 	}

//   // Calculate the distance along the z axis using trigonometric functions
//   let angleRadians = Math.atan2(data.speed['z'], data.speed['x']);
//   let zDistance = distance * Math.tan(angleRadians);
//   finalPosition['z'] = data.position['z'] + zDistance;

//   // Handle wall bounces
//   const topWallZ = -500;
//   const bottomWallZ = 500;

// 	while (finalPosition['z'] < topWallZ || finalPosition['z'] > bottomWallZ) 
// 	{
// 		if (finalPosition['z'] < topWallZ) 
// 		{
// 			finalPosition['z'] = topWallZ + (topWallZ - finalPosition['z']);
// 		} 
// 		else if (finalPosition['z'] > bottomWallZ) 
// 		{
// 			finalPosition['z'] = bottomWallZ - (finalPosition['z'] - bottomWallZ);
// 		}
// 	}

//   return finalPosition;
// }

// function paddle1AI(paddle) 
// {
//   const topWallZ = -440;
//   const bottomWallZ = 440;

//   // Calculate the final position of the cube using the calculateTrajectory function
//   let finalPosition = calculateTrajectory();

//   // Ensure the paddle moves towards the final position of the cube
//   if (cubeSpeedx < 0) 
//   {
// 	if (paddle.position.z > finalPosition['z'])
//   {
// 	  // Move paddle up
// 	  if (paddle.position.z - AIPADDLE_SPEED < topWallZ) 
// 	  {
// 		paddle.position.z = topWallZ;
// 	  }
// 	  else if (paddle.position.z - AIPADDLE_SPEED >= finalPosition['z'])
// 	  {
// 		paddle.position.z -= AIPADDLE_SPEED;
// 	  }
// 	} 
// 	else if (paddle.position.z < finalPosition['z']) 
// 	{
// 	  // Move paddle down
// 	  if (paddle.position.z + AIPADDLE_SPEED > bottomWallZ)
// 	  {
// 		paddle.position.z = bottomWallZ;
// 	  } 
// 	  else if (paddle.position.z + AIPADDLE_SPEED <= finalPosition['z']) 
// 	  {
// 		paddle.position.z += AIPADDLE_SPEED;
// 	  }
// 	}
//   }
// }

// Modify the animate function to include swatting animation logic
function animate() 
{
	if (player1Score <= 7 && player2Score <= 7) 
	{
		renderer.render(scene, camera);
		if (!gamePaused && player1Score < 7 && player2Score < 7) 
		{
			movePaddles();
			paddle1AI(paddle1);
			checkIntersections();
			moveCube();
			// applyCameraShake();
		}
		else if (player1Score == 7)
		{
			document.getElementById('winner').innerHTML = 'Player 1 wins!';
			startBtn.style.display = 'block';
		}
		else if (player2Score == 7) 
		{
			document.getElementById('winner').innerHTML = 'Player 2 wins!';
			startBtn.style.display = 'block';
		}
	}
}

// saveSphereData();
// setInterval(saveSphereData, 1000);
handlePaddleControls();
renderer.setAnimationLoop(animate);

// ************************************* WEBSOCKET FUCNTIONS ************************************************

const url = window.location.href.split('/');
const lobby_id = url[url.length - 1];

const socket = new WebSocket(`wss://localhost:8443/ws/${lobby_id}/`);

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
	console.log("Parsed data:", data);
	switch(data.type)
	{
		case 'move':
			updatePaddlePositions(data);
			break;
		case 'connect':
			console.log(`User ID: ${data.payload.id} | `, data.payload.connectMessage);
			break;
		case 'beginGame':
			beginGame = data.payload
			break;
		case 'message':
			console.log(data.payload);
			break;
	}
}

const startBtn = document.getElementById('startBtn');
startBtn.onclick = () => {
	beginGame = true;
	sendPayload('beginGame', {
		beginGame: true
	});
	startBtn.style.display = 'none';
}

socket.onopen = () => 
{
	console.log(window.user.id);
	sendPayload('connect', {
		id: window.user.id,
		connectMessage: `Welcome to the ${lobby_id} lobby ${window.user.username}!!`,
	});
}

socket.onclose = () => 
{
	console.error('Socket closed unexpectedly');
};
