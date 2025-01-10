
// ************************************* WEBSOCKET ************************************************

function sendPayload(type, payload) {
	socket.send(
		JSON.stringify({
			type: type,
			payload: payload,
		})
	);
}

const tournament_id = window.props.get("id");
const token = localStorage.getItem("tournamentPlayerToken") || "";
const socket = new WebSocket(
	`wss://localhost:8443/ws/t/${encodeURIComponent(
		tournament_id
	)}/?token=${token}`
);

socket.onmessage = function (event) {
	const data = JSON.parse(event.data);
	switch (data.type) {
		case "token":
			localStorage.setItem("tournamentPlayerToken", data.payload);
			break;
		case "log":
			console.log(data.payload);
			break;
		case "error":
			socket.close();
			seturl("/home");
	}
}

socket.onopen = async () => {
	sendPayload("log", {
		sender: "connect",
		content: `${window.user.username} joined the lobby!`,
	});
};

socket.onclose = () => {
	console.log("Socket closed unexpectedly");
	// seturl("/home");
};


// **************************************** HTML **************************************************


{
	const playerSpanDivs = document.querySelectorAll(".player-div")
	let i = 1;
	playerSpanDivs.forEach((div) => {
		div.addEventListener('click', (event) => {
			let span = div.querySelector(".player-span");
			span.textContent = window.user.username;
			// let img = div.querySelector("img");
			// img.src = 'path/to/img/'
		})
	})
}