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
			case "startSemifinals":
				semifinalsRedirect(data.payload);
				break;
			case "startFinal":
				finalsRedirect(data.payload);
				break;
			case "readyBtnInit":
				readyBtnInit(data.payload);
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

	socket.onerror = (e) => {
		console.error(e);
	}

	function sendPayload(type, payload) {
		socket.send(
			JSON.stringify({
				type: type,
				payload: payload,
			})
		);
	}

	// **************************************** BRACKET **************************************************

	async function readyBtnInit(payload)
	{
		const username = window.user.username;
		const readyBtn = document.getElementById("TournamentReadyBtn");
		console.warn(payload.stage, payload.is_ready, payload.is_ready, payload.stage == "final")
		if (payload.is_ready) readyBtn.style.display = "none";
		else if (payload.stage == "final")
		{
			if (payload.winner1 && payload.winner2 && (username == payload.winner1 || username == payload.winner2))
				readyBtn.style.display = "block"
		}
		else {readyBtn.style.display = "block"; console.log("APPEAR")}

		readyBtn.addEventListener("click", () => {
			readyBtn.style.display = "none";
			sendPayload("ready", { stage: payload.stage });
		})
	}

	function getPlayerColor(index)
	{
		const pClass = document.querySelector(".tournament-p" + parseInt(index));
		const pStyle = getComputedStyle(pClass);
		return (pStyle.getPropertyValue('--border-color').trim());
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
		console.log("WS players: ", players);
		semiFinalsInitWS(players);
	}

	function semiFinalsInitDB(playerList) {
		for (let i = 0; i < 4; i++) {
			const playerDiv = document.getElementById("div-p" + (parseInt(i) + 1));
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

	function putFinals(winner, index, playerList) {
		for (let i = index - 2; i < index; i++) {
			const finalsDiv = document.getElementById('div-final' + (index / 2));
			const semifinalsUl = document.getElementById("ul-semi" + (index / 2));
			const pLi = document.getElementById("li-p" + (parseInt(i) + 1))
			
			const pDiv = document.getElementById("div-p" + (parseInt(i) + 1));
			const pName = pDiv.querySelector("span");
		
			const pColor = getPlayerColor(parseInt(i) + 1);

			let playerLiProperty;
			if (i % 2 == 0) playerLiProperty = "--li-after";
			else playerLiProperty = "--li-last";
			
			if (!winner || playerList[i] == null) {pName.textContent = "???"; console.log("null");}
			else if (winner == playerList[i].username) {
				// Change bracket lines' color
				finalsDiv.classList.add("tournament-p" + (parseInt(i) + 1));
				const pFinalName = finalsDiv.querySelector("span");
				pLi.style.setProperty(playerLiProperty + "-bc", pColor);
				pLi.style.setProperty(playerLiProperty + "-bw", "5px");
				semifinalsUl.style.setProperty("--ul-after-bc", pColor);
				semifinalsUl.style.setProperty("--ul-after-bw", "5px");
				pDiv.style.background = pColor
				pDiv.classList.remove("tournament-p" + (parseInt(i) + 1));
	
				//Add name
				pFinalName.textContent = playerList[i].username;
				pDiv.textContent = playerList[i].username;
			} else {
				pName.textContent = playerList[i].username;
				pDiv.classList.remove("tournament-p" + (parseInt(i) + 1));
				pDiv.style.background = pColor.replace(
					/[\d\.]+\)$/g,
					`${0.25})`
				);
			}
			
		}
	}

	function putWinner(tournament)
	{
		if (tournament.game3.winner == null)
			return;
	
		let winnerIndex;
		const playerList = tournament.players;
		let winner = tournament.game3.winner.username;

		for (let i = 0; i < playerList.length; i++) {
			if (playerList[i].username == winner)
				winnerIndex = i;
		}

		let playerLiProperty;
		if (parseInt(winnerIndex / 2) + 1 == 1) playerLiProperty = "--li-after";
		else playerLiProperty = "--li-last";
		
		const pColor = getPlayerColor(parseInt(winnerIndex) + 1);
		const finalLi = document.getElementById("li-final" + (parseInt(winnerIndex / 2) + 1));
		const winnerUl = document.getElementById("ul-winner");
		const winnerDiv = document.getElementById("tournament-winner");
		const winnerName = winnerDiv.querySelector("span");
	
		finalLi.style.setProperty(playerLiProperty + "-bc", pColor);
		finalLi.style.setProperty(playerLiProperty + "-bw", "5px");
		winnerUl.style.setProperty("--ul-after-bc", pColor);
		winnerUl.style.setProperty("--ul-after-bw", "5px");
		winnerDiv.classList.add("tournament-p" + (parseInt(winnerIndex) + 1));
		winnerName.innerHTML = winner;
	}

	async function finalsInitDB(tournament) {
		let winner1, winner2;
		const playerList = tournament.players;
		if (tournament.game1.winner == null || tournament.game2.winner == null)
			return

		winner1 = tournament.game1.winner.username;
		winner2 = tournament.game2.winner.username;

		putFinals(winner1, 2, playerList);
		putFinals(winner2, 4, playerList);
	}

	// function buttonsInit(tournament)
	// {
	// 	const playerList = tournament.players;
	// 	const spectatorList = tournament.spectators;

	// 	for (let key in spectatorList)
	// 	{
	// 		if (window.user.username == playerList[key].username) {
	// 			const finalsSpectateBtn = document.getElementById("final-spcetateBtn");
	// 			finalsSpectateBtn.style.display = "block";
	// 		}
	// 	}
	// 	for (let key in playerList)
	// 	{
	// 		if (window.user.username == playerList[key].username)
	// 		{
	// 			const semifinalsSpectateBtn = document.getElementById("semi-spectateBtn-" + parseInt((key / 2) + 1));
	// 			semifinalsSpectateBtn.style.display = "none";
	// 		}
	// 	}
	// }

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
			console.log("DB Players: ", data.tournament.players);
			console.log("DB Spectators: ", data.tournament.spectators);

			if (data.tournament.game1.winner != null || data.tournament.game2.winner != null)
				finalsInitDB(data.tournament);
			else semiFinalsInitDB(data.tournament.players);
			if (data.tournament.game3.winner != null)
				putWinner(data.tournament);


			// buttonsInit(data.tournament);
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

	async function finalsRedirect(payload) {
		console.log("START FINAL GAME");
		const players = payload.players;
		console.log("FINALS PLAYERS: ", players);
		for (let i = 0; i < 2; i++) {
			try {
				let playerUsername = Object.entries(players)[i][1];
				if (window.user.username == playerUsername)
					joinTouranamentLobby(payload.tournament_id, 3);
			} catch {
				console.log("Final redirection error");
			}
		}
	}

	async function semifinalsRedirect(payload) {
		const players = payload.players;
		console.log("SEMIFINALS PLAYERS: ", players);
		for (let i = 0; i < 4; i++) {
			try {
				let playerUsername = Object.entries(players)[i][1];
				if (window.user.username == playerUsername && (i == 0 || i == 1))
					joinTouranamentLobby(payload.tournament_id, 1);
				else if (window.user.username == playerUsername && (i == 2 || i == 3))
					joinTouranamentLobby(payload.tournament_id, 2);
			} catch {
				console.log("Semifinal redirection error");
			}
		}
	}

	// **************************************** CHAT **************************************************

	function receiveChatMessage(payload) {
		const messageList = document.getElementById(
			"chat-message-list-tournament"
		);
		const messageListItem = document.createElement("li");
		const chatContentElement = document.getElementById(
			"chat-content-tournament"
		);

		if (!messageList || !messageListItem || !chatContentElement)
			return;

		const colorMap = {
			[window.user.username]: "orangered",
			"connect": "limegreen",
			"disconnect": "red",
			"spectator": "grey"
		};
		
		let color = colorMap[payload.sender] || "white";

		if (payload.sender === window.user.username || color == "white")
			messageListItem.innerHTML = `<b style="color: ${color}">${payload.sender}: </b><span>${payload.content}</span>`
		else
			messageListItem.innerHTML =  `<i style="color: ${color}">${payload.content}</i>`;

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
		if (
			window.location.hash.includes("/tournament?id") ||
			window.location.hash.includes("/pong?id")
		)
			return;
		if (socket) socket.close();
	})

	window.onbeforeunload = () => {
		if (socket) socket.close();
	};

	PageElement.onUnload = () => {

		PageElement.onUnload = () => {};
	};
};
