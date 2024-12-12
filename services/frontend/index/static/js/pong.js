
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

PageElement.onLoad = () => {
	// Constants
	const PADDLE_SPEED = 15;
	const AIPADDLE_SPEED = 15;
	const BALL_INITIAL_SPEED = -10;
	const SHAKE_INTENSITY = 10;
	const SHAKE_DURATION = 5;
	const PADDLE_COLOR = 0x008000;
	const TABLE_COLOR = 0x800080;
	const PLANE_COLOR = 0x000000;
	const BALL_COLOR = 0x00ff00;
	const POINT_LIGHT_INTENSITY = 1000000;
	const POINT_LIGHT_DISTANCE = 1000;
	const AMBIENT_LIGHT_INTENSITY = 3;

	// Variables
	let player1Score = 0;
	let player2Score = 0;
	let shakeDuration = 0;
	// let sphereData = [];
	// let startTime = Date.now();

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
	// const gridHelper = new THREE.GridHelper(10000, 100, 0x808080);
	// scene.add(gridHelper);

	// Axes
	// const axesHelper = new THREE.AxesHelper(1000);
	// scene.add(axesHelper);


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
	const sphereMaterial = new THREE.MeshStandardMaterial({ color: BALL_COLOR });
	const ball = new THREE.Mesh(sphereGeometry, sphereMaterial);
	scene.add(ball);
	const ballBoundingBox = new THREE.Box3().setFromObject(ball);

	let paddle1 = {};
	let paddle2 = {};


	// Functions
	function  createEnvironment(data)
	{
		// Paddles and Table
		// console.log("DATA: ", data)
		const table1 = makeParalellepiped(
			data.floorPositionX,
			data.floorPositionY,
			data.floorPositionZ,
			data.boundariesWidth,
			data.boundariesDepth, 
			data.boundariesHeight,
			TABLE_COLOR
		);
		const table2 = makeParalellepiped(
			data.ceilingPositionX,
			data.ceilingPositionY,
			data.ceilingPositionZ,
			data.boundariesWidth,
			data.boundariesDepth, 
			data.boundariesHeight,
			TABLE_COLOR
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
	const material = new THREE.MeshStandardMaterial({ color: color });
	const box = new THREE.Mesh(new THREE.BoxGeometry(dx, dy, dz), material);
	box.position.set(x + dx / 2, y + dy / 2, z + dz / 2);
	return box;
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

	// function movePaddles()
	// {
	// 	paddle1.position.z += paddle1Speed;
	// 	paddle2.position.z += paddle2Speed;
	// 	paddle1BoundingBox.setFromObject(paddle1);
	// 	paddle2BoundingBox.setFromObject(paddle2);
	// }

	// 	console.log('updatePaddlePositions');
	// 	if (paddleData.payload.paddle == 1)
	// 	{
	// 		paddle1Speed = paddleData.payload.speed;
	// 	}
	// 	else if (paddleData.payload.paddle == 2)
	// 	{
	// 		paddle2Speed = paddleData.payload.speed;
	// 	}
	// 	paddle1BoundingBox.setFromObject(paddle1);
	// 	paddle2BoundingBox.setFromObject(paddle2);

	// function movePaddles()
	// {
	//   paddle1.position.z += paddle1Speed;
	//   paddle2.position.z += paddle2Speed;
	//   paddle1BoundingBox.setFromObject(paddle1);
	//   paddle2BoundingBox.setFromObject(paddle2);
	// }

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

	// function increaseSpeed()
	// {
	//   if (ballSpeedx < 20 && ballSpeedx > -20)
	// 	ballSpeedx += (ballSpeedx > 0) ? 0.4 : -0.4;
	// }

	// function checkIntersections()
	// {
	//   ballBoundingBox.setFromObject(ball);

	//   if (ballBoundingBox.intersectsBox(table1BoundingBox) || ballBoundingBox.intersectsBox(table2BoundingBox)) 
	//   {
	// 	ballSpeedz *= -1;
	// 	ball.position.z += ballSpeedz;
	//   }

	//   if (ballBoundingBox.intersectsBox(paddle1BoundingBox))
	//   {
	// 	console.log(ballBoundingBox, paddle1BoundingBox)
	// 	ballSpeedx *= -1;
	// 	shakeDuration = SHAKE_DURATION;
	// 	increaseSpeed();
	// 	adjustCubeDirection(paddle1);
	// 	ball.position.x += ballSpeedx;
	// 	ball.position.z += ballSpeedz;
	//   }

	//   if (ballBoundingBox.intersectsBox(paddle2BoundingBox))
	//   {
	// 	ballSpeedx *= -1;
	// 	shakeDuration = SHAKE_DURATION;
	// 	increaseSpeed();
	// 	adjustCubeDirection(paddle2);
	// 	ball.position.x += ballSpeedx;
	// 	ball.position.z += ballSpeedz;
	//   }

	//   if (paddle1BoundingBox.intersectsBox(table1BoundingBox) || paddle1BoundingBox.intersectsBox(table2BoundingBox)) 
	//   {
	// 	paddle1.position.z -= paddle1Speed;
	//   }
	//   if (paddle2BoundingBox.intersectsBox(table1BoundingBox) || paddle2BoundingBox.intersectsBox(table2BoundingBox))
	//   {
	// 	paddle2.position.z -= paddle2Speed;
	//   }
	// }

	// function increaseSpeed()
	// {
	//   if (ballSpeedx < 20 && ballSpeedx > -20)
	// 	ballSpeedx += (ballSpeedx > 0) ? 0.4 : -0.4;
	// }

	// function checkIntersections()
	// {
	//   ballBoundingBox.setFromObject(ball);

	//   if (ballBoundingBox.intersectsBox(table1BoundingBox) || ballBoundingBox.intersectsBox(table2BoundingBox)) 
	//   {
	// 	ballSpeedz *= -1;
	// 	ball.position.z += ballSpeedz;
	//   }

	//   if (ballBoundingBox.intersectsBox(paddle1BoundingBox))
	//   {
	// 	console.log(ballBoundingBox, paddle1BoundingBox)
	// 	ballSpeedx *= -1;
	// 	shakeDuration = SHAKE_DURATION;
	// 	increaseSpeed();
	// 	adjustCubeDirection(paddle1);
	// 	ball.position.x += ballSpeedx;
	// 	ball.position.z += ballSpeedz;
	//   }

	//   if (ballBoundingBox.intersectsBox(paddle2BoundingBox))
	//   {
	// 	ballSpeedx *= -1;
	// 	shakeDuration = SHAKE_DURATION;
	// 	increaseSpeed();
	// 	adjustCubeDirection(paddle2);
	// 	ball.position.x += ballSpeedx;
	// 	ball.position.z += ballSpeedz;
	//   }

	//   if (paddle1BoundingBox.intersectsBox(table1BoundingBox) || paddle1BoundingBox.intersectsBox(table2BoundingBox)) 
	//   {
	// 	paddle1.position.z -= paddle1Speed;
	//   }
	//   if (paddle2BoundingBox.intersectsBox(table1BoundingBox) || paddle2BoundingBox.intersectsBox(table2BoundingBox))
	//   {
	// 	paddle2.position.z -= paddle2Speed;
	//   }
	// }

	// function adjustCubeDirection(paddle)
	// {
	//   const relativeIntersectZ = (paddle.position.z + (paddle.geometry.parameters.depth / 2)) - ball.position.z;
	//   const normalizedIntersectZ = (relativeIntersectZ / (paddle.geometry.parameters.depth / 2)) - 1;
	//   ballSpeedz = normalizedIntersectZ * 20; // Adjust the multiplier as needed
	// }

	// function respawnCube(player)
	// {
	//   if (player == 1)
	//   {
	// 	ball.position.set(200, 0, 0);
	// 	ballSpeedx = BALL_INITIAL_SPEED;
	// 	ballSpeedz = 0;
	// 	beginGame = false;
	// 	pointLight.position.copy(ball.position);
	//   }
	//   else if (player == 2)
	//   {
	// 	ball.position.set(-200, 0, 0);
	// 	ballSpeedx = -BALL_INITIAL_SPEED;
	// 	ballSpeedz = 0;
	// 	beginGame = false;
	// 	pointLight.position.copy(ball.position);
	//   }
	// }

	// function ballOutofBounds()
	// {
	//   if (ball.position.x > 1000)
	//   {
	// 	// console.log('z is ' + ball.position.z + ' x is ' + ball.position.x);
	// 	respawnCube(1);
	// 	player1Score++;
	// 	document.getElementById('player1score').innerHTML = player1Score;
	//   } else if (ball.position.x < -1000)
	//   {
	// 	// console.log('z is ' + ball.position.z + ' x is ' + ball.position.x); 
	// 	respawnCube(2);
	// 	player2Score++;
	// 	document.getElementById('player2score').innerHTML = player2Score;
	//   }
	// }

	// function moveCube()
	// {
	//   ball.position.x += ballSpeedx;
	//   ball.position.z += ballSpeedz;
	//   pointLight.position.copy(ball.position);

	// //   ballOutofBounds();

	// //   ballBoundingBox.setFromObject(ball);	
	// }

	function updateBall(ballData)
	{
		ball.position.x = ballData.ballPositionX;
		ball.position.z = ballData.ballPositionZ;
		applyCameraShake();
		pointLight.position.copy(ball.position);
	}

	// function saveSphereData() 
	// {
	//   let time = 0;
	//   let position = { x: ball.position.x, z: ball.position.z };
	//   let speed = { x: ballSpeedx, z: ballSpeedz };
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

	//   // Calculate the final position of the ball using the calculateTrajectory function
	//   let finalPosition = calculateTrajectory();

	//   // Ensure the paddle moves towards the final position of the ball
	//   if (ballSpeedx < 0) 
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
			if (player1Score == 7)
			{
				document.getElementById('winner').innerHTML = 'Player 1 wins!';
				readyBtn.style.display = 'block';
			}
			else if (player2Score == 7) 
			{
				document.getElementById('winner').innerHTML = 'Player 2 wins!';
				readyBtn.style.display = 'block';
			}
		}
	}

	// saveSphereData();
	// setInterval(saveSphereData, 1000);
	renderer.setAnimationLoop(animate);

	// ************************************* WEBSOCKET FUCNTIONS ************************************************

	const lobby_id = window.props.get("id");

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
		switch(data.type)
		{
			case 'connect':
				console.log(`User ID: ${data.payload.id} | `, data.payload.connectMessage);
				break;
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
			case 'paddleInit':
				if (data.payload.player == '1')
					handlePaddleControls('p1');
				else if (data.payload.player == '2')
					handlePaddleControls('p2');
		}
	}

	const readyBtn = document.getElementById('readyBtn');
	readyBtn.onclick = async () => {
		readyBtn.style.display = 'none';
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
		socket.close();
		PageElement.onUnLoad = () => {};
	}
}