
// ************************************* WEBSOCKET ************************************************
{

let inGame = false;

function sendPayload(type, payload) {
	socket.send(
		JSON.stringify({
			type: type,
			payload: payload,
		})
	);
}

let tournament_id = window.props.get("id");
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
			inGame = true;
			lobbyRedirect(data.payload);
			break ;
		case "startBtnInit":
			startBtnInit();
			break;
		case "updateBracketWS":
			updateBracketWS(data.payload);
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
	// sendPayload("message", {
	// 	sender: "connect",
	// 	content: `${window.user.username} joined the tournament!`,
	// });
};

socket.onclose = () => {
	console.log("Socket closed unexpectedly");
	// seturl("/home");
};

window.addEventListener("popstate", () => {
	const hash = window.location.hash;
	if (hash.includes("tournament?id"))
	{
		checkTournament(tournament_id);
		if (socket.readyState === WebSocket.OPEN && !inGame)
			socket.close();
	}
});

window.onbeforeunload = () => {
	// sendMessage("disconnect", `${window.user.username} left the tournament`);
};

PageElement.onUnload = () => {
	// sendMessage("disconnect", `${window.user.username} left the tournament`);
	if (!inGame)
		socket.close();

	PageElement.onUnload = () => {};
};


// **************************************** BRACKET **************************************************

function startBtnInit()
{
	const startBtn = document.getElementById("tournament-start-btn");
	startBtn.style.display = 'block';
	startBtn.addEventListener("click", async () => {
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

async function updateBracketWS(payload)
{
	// if (payload.fullState)
	// 	return ;

	const players = payload.players;
	for (let i = 0; i < 4; i++) {
		const playerDiv = document.querySelector(".tournament-p" + (parseInt(i) + 1))
		const playerName = playerDiv.querySelector("span");
		try {
			username = Object.entries(players)[i][1];
			if (username == "1v1" || username == 'disconnecting')
				throw {};
			playerName.textContent = username;
		} catch {
			playerName.textContent = "Player " + (i + 1);
		}
	}
}

async function updateBracketDB(tournament_id)
{
	try{
		const data = await myFetch(
			`https://localhost:8443/tournament/$${tournament_id}/`,
			null,
			"GET",
			true
		);
		console.log("Players: ", data.tournament.players);
		playerInitDb(data.tournament.players);
	} catch (error) {
		console.log('Error: ', error);
	}
}

checkTournament(tournament_id);
updateBracketDB(tournament_id);

}

// **************************************** LOBBY *************************************************

async function joinTouranamentLobby(tournament_id, game) {
	const body = {
		'username': window.user.username,
		't_id': tournament_id,
		'game': game
	}
	const lobby_id = `tournament_${tournament_id}_${game}`;
	try {
		const data = await myFetch(
			`https://localhost:8443/tournament/joinTournamentLobby/${lobby_id}/`,
			body,
			"POST",
			true
		);
		seturl(`/pong?id=${lobby_id}`);
	} catch (error) {
		console.log('Tried to join: ', lobby_id);
		alert(error);
	}
}

async function lobbyRedirect(payload)
{
	const players = payload.players;
	for (let i = 0; i < 4; i++) {
		try {
			let username = Object.entries(players)[i][1];
			console.log(`Checking ${username} against ${window.user.username}`);
			if (window.user.username == username && (i == 0 || i == 1))
				joinTouranamentLobby(payload.tournament_id, 1);
			else if (window.user.username == username && (i == 2 || i == 3))
				joinTouranamentLobby(payload.tournament_id, 2);
		} catch {
			console.log("e");
		}
	}
}

async function checkTournament(tournament_id)
{
	try {
		const data = await myFetch(
			`https://localhost:8443/tournament/$${tournament_id}/`,
			null,
			"GET",
			true
		);
	} catch (error) {
		alert(error)
		seturl("/home");
	}
}

// **************************************** CHAT **************************************************

function receiveChatMessage(payload) {
	let color = "white";
	const messageList = document.getElementById("chat-message-list-tournament");
	const messageListItem = document.createElement("li");
	const chatContentElement = document.getElementById("chat-content-tournament");

	if (payload.sender == "connect" || payload.sender == "disconnect" || payload.sender == "spectator") {
		if (payload.sender == "connect") color = "limegreen";
		if (payload.sender == "disconnect") color = "red";
		if (payload.sender == "spectator") color = "grey";
		messageListItem.innerHTML = `<i style="color: ${color}">${payload.content}</i>`;
	} else {
		if (payload.sender == window.user.username) color = "orangered";
		messageListItem.innerHTML = `
			<b style="color: ${color}">${payload.sender}: </b>
			<span>${payload.content}</span>
			`;
	}
	if (messageListItem)
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

