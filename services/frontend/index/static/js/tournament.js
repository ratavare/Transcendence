
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
		case "startGame":
			lobbyRedirect(data.payload);
			break ;
		case "startBtnInit":
			startBtnInit();
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
		content: `${window.user.username} joined the tournament!`,
	});
};

socket.onclose = () => {
	console.log("Socket closed unexpectedly");
	// seturl("/home");
};

window.addEventListener("popstate", () => {
	const hash = window.location.hash;
	if (hash.includes("tournament?id") && socket.readyState === WebSocket.OPEN)
		socket.close();
});

window.onbeforeunload = () => {
	sendMessage("disconnect", `${window.user.username} left the tournament`);
};

PageElement.onUnload = () => {
	sendMessage("disconnect", `${window.user.username} left the tournament`);

	socket.close();

	PageElement.onUnload = () => {};
};


// **************************************** BRACKET **************************************************

function startBtnInit()
{
	const startBtn = document.getElementById("tournament-start-btn");
	startBtn.style.display = 'block';
	startBtn.addEventListener("click", async () => {
		console.log("CLICK!");
		sendPayload("startGames", "");
	})
}

function playerInitDb(playerList)
{
	for (let i = 0; i < 4; i++) {
		const playerDiv = document.querySelector(".tournament-p" + (parseInt(i) + 1))
		const playerName = playerDiv.querySelector("span");
		if (playerList[i])
			playerName.textContent = playerList[i].username;
		else
			playerName.textContent = "Player " + (i + 1);
	}
}

async function bracketInitWs(payload) {
	const players = payload.players;

	for (let i = 0; i < 4; i++) {
		const playerDiv = document.querySelector(".tournament-p" + (parseInt(i) + 1))
		const playerName = playerDiv.querySelector("span");
		try {
			username = Object.entries(players)[i][1];
			playerName.textContent = username;
		} catch {
			playerName.textContent = "Player " + (i + 1);
		}
	}
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
		// console.log("Players: ", data.tournament.players);
		playerInitDb(data.tournament.players);
	} catch (error) {
		console.log('Error: ', error);
	}
}

bracketInitDb(tournament_id);

// **************************************** LOBBY *************************************************

async function createLobby(lobby_id)
{
	try {
		const data = await myFetch(
			"https://localhost:8443/lobby/lobbies/",
			{"lobby_id": lobby_id},
			"POST",
			true
		);
		joinLobby(lobby_id);
	} catch (error) {
		console.log(error);
	}
}

async function joinLobby(lobby_id) {
	const body = JSON.stringify(window.user);
	try {
		const data = await myFetch(
			`https://localhost:8443/lobby/lobbies/${lobby_id}/`,
			body,
			"POST",
			true
		);
		seturl(`/pong?id=${lobby_id}`);
	} catch (error) {
		alert(error);
	}
}

async function lobbyRedirect(payload)
{
	const lobby_id = payload.lobby_id;
	createLobby(lobby_id);
	seturl(`/pong?id=${lobby_id}`);
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

