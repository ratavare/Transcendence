
// ************************************* WEBSOCKET ************************************************
{

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
	`wss://localhost:8443/pong/t/${encodeURIComponent(
		tournament_id
	)}/?token=${token}`
);

socket.onmessage = function (event) {
	const data = JSON.parse(event.data);
	switch (data.type) {
		case "token":
			localStorage.setItem("tournamentPlayerToken", data.payload);
			break;
		case "bracketInitWs":
			bracketInitWs(data.payload);
			break ;
		case "log":
			console.log(data.payload);
			break;
		case "error":
			socket.close();
			seturl("/home");
		case "message":
			receiveChatMessage(data.payload);
	}
}

socket.onopen = async () => {
	sendPayload("message", {
		sender: "connect",
		content: `${window.user.username} joined the tournament as player X!`,
	});
};

socket.onclose = () => {
	console.log("Socket closed unexpectedly");
	// seturl("/home");
};

window.onbeforeunload = () => {
	sendMessage("disconnect", `${window.user.username} left the tournament`);
};

PageElement.onUnload = () => {
	// sendMessage("disconnect", `${window.user.username} left the tournament`);

	// socket.close();

	PageElement.onUnload = () => {};
};


// **************************************** BRACKET **************************************************

function playerInit(playerList)
{
	for (let playerId in playerList) {
		console.log("DB INDEX: ", parseInt(playerId) + 1);
		const playerDiv = document.querySelector(".tournament-p" + (parseInt(playerId) + 1))
		const playerName = playerDiv.querySelector("span");
		playerName.textContent = playerList[playerId].username;
	}
}

async function bracketInitWs(payload) {
	const players = payload.players;
	Object.entries(players).forEach(([userId, username], index) => {
		console.log("PLAYER ", index + 1, ": ", username)
		const playerDiv = document.querySelector(
			".tournament-p" + (index + 1)
		);
		const playerName = playerDiv.querySelector("span");
		if (username)
			playerName.textContent = username;
		else
			playerName.textContent = "Player " + (index + 1);
	});
}

async function bracketInitDb(tournament_id)
{
	try{
		const data = await myFetch(
			`https://localhost:8443/tournament/$${tournament_id}/`,
			null,
			"GET",
			true
		);
		console.log("Players: ", data.tournament.players);
		playerInit(data.tournament.players);
	} catch (error) {
		console.log('Error: ', error);
	}
}

bracketInitDb(tournament_id);

}
// **************************************** CHAT **************************************************

function receiveChatMessage(payload) {
	let color = "white";
	const messageList = document.getElementById("chat-message-list-tournament");
	const messageListItem = document.createElement("li");
	const chatContentElement = document.getElementById("chat-content-tournament");

	if (payload.sender == "connect" || payload.sender == "disconnect") {
		if (payload.sender == "connect") color = "limegreen";
		if (payload.sender == "disconnect") color = "red";
		messageListItem.innerHTML = `<i style="color: ${color}">${payload.content}</i>`;
	} else {
		if (payload.sender == window.user.username) color = "orangered";
		messageListItem.innerHTML = `
			<b style="color: ${color}">${payload.sender}: </b>
			<span>${payload.content}</span>
			`;
	}
	messageList.appendChild(messageListItem);
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

/* async function getChat() {
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
} */

function messageForm() {
	const chatInputForm = document.getElementById("chat-input-form-tournament");
	chatInputForm.addEventListener("submit", (event) => {
		event.preventDefault();

		const chatInput = event.target.querySelector("#chat-input-tournament");
		if (chatInput.value) sendMessage(window.user.username, chatInput.value);
		chatInput.value = "";
	});
}

messageForm();