
{
	const greenBtn = document.getElementById('greenBtn');
	const redBtn = document.getElementById('redBtn');
	const whiteBtn = document.getElementById('whiteBtn');

	greenBtn.addEventListener('click', () => {
		sendMessage("#4AED87");
	});

	redBtn.addEventListener('click', () => {
		sendMessage("#ED5E4A");
	});

	whiteBtn.addEventListener('click', () => {
		sendMessage("#FFFFFF");
	});

}

const socket = new WebSocket('wss://localhost:8443/ws/');
console.log(socket);

socket.onopen = () => {
	console.log('Websocket is open!');
	sendMessage('Hello Server!')
}

socket.onmessage = function(e) {
	const pageBodyElement = document.querySelector('body');
	const data = JSON.parse(e.data);
	pageBodyElement.style.backgroundColor = data.message;
	console.log('MESSAGE:', data.message);
};

socket.onclose = () => {
	console.error('Socket closed unexpectedly');
};


function sendMessage(message) {
	socket.send(JSON.stringify({
		'message': message
	}));
}