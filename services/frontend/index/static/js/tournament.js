// ************************************* WEBSOCKET ************************************************

PageElement.onLoad = async () => {
	const tournament_id = window.props.get("id");
	console.warn("A")
	const status1 = await tournamentExists(tournament_id);
	const status2 = await playerExists(tournament_id);

	if (!status1 || !status2)
	{
		seturl("/home");
		return;
	}
	else {
		updateBracketDB(tournament_id);
		messageForm();
	}
	let socket = null;
	const token = localStorage.getItem("tournamentPlayerToken") || "";
	if (socket) socket.close();

	socket = new WebSocket(
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
				break;
			case "startBtnInit":
				startBtnInit();
				break;
			case "updateBracketWS":
				updateBracketWS(data.payload);
				break;
			case "log":
				console.log(data.payload);
				break;
			case "message":
				receiveChatMessage(data.payload);
		}
	};

	socket.onopen = async () => {
		// sendPayload("message", {
		// 	sender: "connect",
		// 	content: `${window.user.username} joined the tournament!`,
		// });
	};

	socket.onclose = (e) => {
		console.log(`Socket closed unexpectedly: ${e.reason}`);
		// seturl("/home");
	};

	async function tournamentExists(t_id) {
		try {
			const data = await myFetch(
				`https://localhost:8443/tournament/getJoin/${t_id}/`,
				null,
				"GET",
				true
			);
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	async function playerExists(t_id) {
		try {
			const data = await myFetch(
				`https://localhost:8443/tournament/checkTournamentPlayer/${t_id}/${window.user.username}/`,
				null,
				"GET",
				true
			);
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	window.addEventListener("popstate", async () => {
		const hash = window.location.hash;
		if (hash.includes("tournament?id")) {
			const tournament_id = window.props.get("id");
			const status1 = await tournamentExists(tournament_id);
			const status2 = await playerExists(tournament_id);
			console.warn("B")
			if (!status1 || !status2) {
				console.warn("C")
				if (socket) socket.close();
				seturl("/home");
			}
		}
	});

	function sendPayload(type, payload) {
		socket.send(
			JSON.stringify({
				type: type,
				payload: payload,
			})
		);
	}

	// **************************************** BRACKET **************************************************

	function startBtnInit() {
		const startBtn = document.getElementById("tournament-start-btn");
		if (!startBtn)
			return;
		startBtn.style.display = "block";
		startBtn.addEventListener("click", async () => {
			sendPayload("startGames", "");
		});
	}

	function playerInitDb(playerList) {
		for (let i = 0; i < 4; i++) {
			const playerDiv = document.querySelector(
				".tournament-p" + (parseInt(i) + 1)
			);
			if (!playerDiv)
				continue;
			const playerName = playerDiv.querySelector("span");
			if (playerList[i]) playerName.textContent = playerList[i].username;
			else playerName.textContent = "Player " + (i + 1);
		}
	}

	async function updateBracketWS(payload) {
		const players = payload.players;
		for (let i = 0; i < 4; i++) {
			const playerDiv = document.querySelector(
				".tournament-p" + (parseInt(i) + 1)
			);
			if (!playerDiv)
				continue;
			const playerName = playerDiv.querySelector("span");
			try {
				let playerData = Object.entries(players)[i][1];
				playerName.textContent = playerData.username;
			} catch {
				playerName.textContent = "Player " + (i + 1);
			}
		}
	}

	async function updateBracketDB(tournament_id) {
		try {
			const data = await myFetch(
				`https://localhost:8443/tournament/getJoin/${tournament_id}/`,
				null,
				"GET",
				true
			);
			console.log("Players: ", data.tournament.players);
			playerInitDb(data.tournament.players);
		} catch (error) {
			console.log("Error: ", error);
		}
	}

	// **************************************** LOBBY *************************************************

	async function joinTouranamentLobby(tournament_id, game) {
		const body = {
			username: window.user.username,
			t_id: tournament_id,
			game: game,
		};
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
			console.log("Tried to join: ", lobby_id);
		}
	}

	async function lobbyRedirect(payload) {
		const players = payload.players;
		for (let i = 0; i < 4; i++) {
			try {
				let playerData = Object.entries(players)[i][1];
				let playerUsername = playerData.username;
				console.log(
					`Checking ${playerUsername} against ${window.user.username}`
				);
				if (window.user.username == playerUsername && (i == 0 || i == 1))
					joinTouranamentLobby(payload.tournament_id, 1);
				else if (window.user.username == playerUsername && (i == 2 || i == 3))
					joinTouranamentLobby(payload.tournament_id, 2);
			} catch {
				console.log("e");
			}
		}
	}

	// **************************************** CHAT **************************************************

	function receiveChatMessage(payload) {
		let color = "white";
		const messageList = document.getElementById(
			"chat-message-list-tournament"
		);
		const messageListItem = document.createElement("li");
		const chatContentElement = document.getElementById(
			"chat-content-tournament"
		);

		if (!messageList || !messageListItem || !chatContentElement)
			return;

		if (
			payload.sender == "connect" ||
			payload.sender == "disconnect" ||
			payload.sender == "spectator"
		) {
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
		const chatInputForm = document.getElementById(
			"chat-input-form-tournament"
		);
		chatInputForm.addEventListener("submit", (event) => {
			event.preventDefault();

			const chatInput = event.target.querySelector(
				"#chat-input-tournament"
			);
			if (chatInput.value)
				sendMessage(window.user.username, chatInput.value);
			chatInput.value = "";
		});
	}

	window.onbeforeunload = () => {
		sendMessage("disconnect", `${window.user.username} before unload`);
		if (socket) socket.close();
	};

	PageElement.onUnload = () => {

		PageElement.onUnload = () => {};
	};
};
