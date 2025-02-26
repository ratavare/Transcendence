// ************************************* WEBSOCKET ************************************************

PageElement.onLoad = async () => {
	let tournament_id;
	if (window.location.hash.includes("/tournament?id"))
		tournament_id = window.props.get("id");
	else
		return;

	let socket = new WebSocket(
		`wss://localhost:8443/pong/t/${encodeURIComponent(
			tournament_id
		)}/`
	);
	
	socket.onmessage = function (event) {
		const data = JSON.parse(event.data);
		switch (data.type) {
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

	};

	socket.onclose = (e) => {
		console.log(`Socket closed unexpectedly: ${e.reason}`);
	};

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

	async function semiFinalsInitWS(players)
	{
		for (let i = 0; i < 4; i++) {
			const playerDiv = document.querySelector(
				".tournament-p" + (parseInt(i) + 1)
			);
			if (!playerDiv)
				continue;
			const playerName = playerDiv.querySelector("span");
			// const profileImg = playerDiv.querySelector('img');
			try {
				let username = Object.entries(players)[i][1];
				playerName.textContent = username;
			} catch {
				playerName.textContent = "Player " + (i + 1);
			}
		}
	}

	async function finalsInitWS() {
		return;
	}

	async function updateBracketWS(payload) {
		const players = payload.players;
		semiFinalsInitWS(players);
	}

	function semiFinalsInitDB(playerList) {
		for (let i = 0; i < 4; i++) {
			const playerDiv = document.getElementById("div-semi" + (parseInt(i) + 1));
			if (!playerDiv)
				continue;
			const playerName = playerDiv.querySelector("span");
			// const profileImg = playerDiv.querySelector('img');
			if (playerList && playerList[i]) {
				playerName.textContent = playerList[i].username;
			}
			else playerName.textContent = "Player " + (i + 1);
		}
	}

	function putFinals(winner, index, playerList)
	{
		for (let i = index - 2; i < index; i++) 
		{
			const finalsDiv = document.getElementById('finals' + (index / 2));
			const pLi = document.getElementById("li-semi" + (parseInt(i) + 1))
			const pDiv = document.getElementById("div-semi" + (parseInt(i) + 1));
			const pClass = document.querySelector(".tournament-p" + (parseInt(i) + 1));
			const pName = pDiv.querySelector("span");
			const pStyle = getComputedStyle(pClass);
			const pColor = pStyle.getPropertyValue('--border-color').trim();
			console.log("pColor: ", pColor);

			if (!winner)
				pName.textContent = "???";
			else if (winner == playerList[i].username) {
				finalsDiv.classList.add("tournament-p" + (parseInt(i) + 1));
				pLi.style.setProperty("--after-content", pColor);

				//Add name
				pName.textContent = playerList[i].username;
			} else {
				pDiv.style.background = pColor.replace(/[\d\.]+\)$/g, `${0.25})`);;
				pName.textContent = "";
			}
		}
	}

	async function finalsInitDB(tournament) {
		let winner1, winner2;
		winner1 = tournament.game1.winner;
		winner2 = tournament.game2.winner;
		console.log(winner1);
		const playerList = tournament.players;

		putFinals(winner1, 2, playerList);
		putFinals(winner2, 4, playerList);
	}

	async function updateBracketDB(tournament_id) {
		if (!tournament_id)
			return;
		try {
			const data = await myFetch(
				`https://localhost:8443/tournament/getJoin/${tournament_id}/`,
				null,
				"GET",
				true
			);
			console.log("Players: ", data.tournament.players);
			semiFinalsInitDB(data.tournament.players);
			finalsInitDB(data.tournament);
		} catch (error) {
			console.log("Error: ", error);
		}
	}

	// **************************************** LOBBY *************************************************

	async function joinTouranamentLobby(tournament_id, game) {
		const lobby_id = `tournament_${tournament_id}_${game}`;
		const body = {
			username: window.user.username,
			lobby_id: lobby_id
		};
		try {
			const data = await myFetch(
				`https://localhost:8443/tournament/joinTournamentLobby/`,
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
				let playerUsername = Object.entries(players)[i][1];
				if (window.user.username == playerUsername && (i == 0 || i == 1))
					joinTouranamentLobby(payload.tournament_id, 1);
				// else if (window.user.username == playerUsername && (i == 2 || i == 3))
				// 	joinTouranamentLobby(payload.tournament_id, 2);
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

	updateBracketDB(tournament_id);
	messageForm();

	window.addEventListener("popstate", () => {
		if (window.location.hash.includes("/tournament?id")) return;
		if (socket) socket.close();
	})

	window.onbeforeunload = () => {
		sendMessage("disconnect", `${window.user.username} before unload`);
		if (socket) socket.close();
	};

	PageElement.onUnload = () => {
		sendMessage("disconnect", `${window.user.username} unload`);

		PageElement.onUnload = () => {};
	};
};
