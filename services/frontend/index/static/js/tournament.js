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
		if (payload.is_ready || payload.winner3) readyBtn.style.display = "none";
		else if (payload.stage == "final")
		{
			if ((payload.winner1 || payload.winner2) && (username == payload.winner1 || username == payload.winner2))
				readyBtn.style.display = "block"
		}
		else readyBtn.style.display = "block";

		readyBtn.addEventListener("click", () => {
			readyBtn.style.display = "none";
			sendPayload("ready", { stage: payload.stage });
		})
	}

	function getPlayerColor(index)
	{
		const pClass = document.querySelector(".tournament-p" + parseInt(index));
		if (!pClass) {
			return "transparent";
		}
		const pStyle = getComputedStyle(pClass);
		return (pStyle.getPropertyValue('--border-color').trim());
	}

	// ************** UPDATE BRACKET WEBSOCKET **************

	async function updateBracketWS(payload) {
		console.log("UPDATE BRACKET");

		try {
			let players;
			if (payload.state == "connect")
				players = Object.values(payload.players);
			else if (payload.state == "disconnect")
				players = Object.values(payload.player_names);

			const winner1 = payload.winner1;
			const winner2 = payload.winner2;
			const winner3 = payload.winner3;
			
			console.log(winner1, winner2, winner3, players, players.length);
			if (payload.stage != "final" || payload.state != "disconnect")
				updateSemifinals(players);
			if (winner1 || winner2)
				updateFinal(winner1, winner2, players);
			if (winner3)
				updateWinner(winner1, winner2, winner3, players);
		} catch (e) {
			console.error("Update Bracket Error: ", e);
		}
	}

	// ************** UPDATE BRACKET DATABSE **************

	function getWinnerIndex(playerList, winner3)
	{
		let idx;
		for (let i = 0; i < 4; i++) {
			if (playerList[i] == winner3)
				idx = i;
		}
		if (idx === undefined) return undefined;
		return idx;
	}

	function updateWinner(winner1, winner2, winner3, playerList)
	{
		winnerIdx = getWinnerIndex(playerList, winner3)
		if (winnerIdx === undefined) return;
		let playerLiProperty;
		if (parseInt(winnerIdx / 2) + 1 == 1) playerLiProperty = "--li-after";
		else playerLiProperty = "--li-last";
		
		const pColor = getPlayerColor(parseInt(winnerIdx) + 1);
		const finalLi = document.getElementById("li-final" + (parseInt(winnerIdx / 2) + 1));
		const winnerUl = document.getElementById("ul-winner");
		const winnerDiv = document.getElementById("tournament-winner");
		const winnerName = winnerDiv.querySelector("span");

		// Change background of finalist brackets
		if (winner3 == winner1)
			document.getElementById("div-final1").style.background = getPlayerColor(parseInt(winnerIdx) + 1);
		if (winner3  == winner2)
			document.getElementById("div-final2").style.background = getPlayerColor(parseInt(winnerIdx) + 1);
	
		// Change bracket borders
		finalLi.style.setProperty(playerLiProperty + "-bc", pColor);
		finalLi.style.setProperty(playerLiProperty + "-bw", "5px");
		winnerUl.style.setProperty("--ul-after-bc", pColor);
		winnerUl.style.setProperty("--ul-after-bw", "5px");
		winnerDiv.classList.add("tournament-p" + (parseInt(winnerIdx) + 1));

		// Change winner bracket name and background
		winnerName.innerHTML = winner3;
		winnerDiv.style.backgroundColor = pColor;
		
	}

	function putFinals(winner, index, playerList) {
		
		for (let i = index - 2; i < index; i++) {
			const finalsDiv = document.getElementById('div-final' + (index / 2));
			const semifinalsUl = document.getElementById("ul-semi" + (index / 2));
			const pLi = document.getElementById("li-p" + (parseInt(i) + 1))
			const pDiv = document.getElementById("div-p" + (parseInt(i) + 1));
			if (!pDiv) return ;
			const pName = pDiv.querySelector("span");
			if (!pName) return ;
			const pColor = getPlayerColor(parseInt(i) + 1);
		
			let playerLiProperty;
			if (i % 2 == 0) playerLiProperty = "--li-after";
			else playerLiProperty = "--li-last";
			
			if (!winner) 
				pName.textContent = playerList[i]
			else if (winner == playerList[i]) {
				// Change bracket lines' color
				finalsDiv.classList.add("tournament-p" + (parseInt(i) + 1));
				const pFinalName = finalsDiv.querySelector("span");
				pLi.style.setProperty(playerLiProperty + "-bc", pColor);
				pLi.style.setProperty(playerLiProperty + "-bw", "5px");
				semifinalsUl.style.setProperty("--ul-after-bc", pColor);
				semifinalsUl.style.setProperty("--ul-after-bw", "5px");
				pDiv.style.background = pColor
				finalsDiv.style.background = pColor;
	
				//Add name
				pFinalName.textContent = playerList[i];
				pDiv.textContent = playerList[i];
			}
		}
	}

	async function updateFinal(winner1, winner2,  playerList) {
		putFinals(winner1, 2, playerList);
		putFinals(winner2, 4, playerList);
	}

	function updateSemifinals(players) {
		const playerValues = Object.values(players)
		for (let i = 0; i < 4; i++) {
			const playerDiv = document.getElementById("div-p" + (parseInt(i) + 1));
			if (!playerDiv) return ;
			const playerName = playerDiv.querySelector("span");
			if (!playerName) return
			// const profileImg = playerDiv.querySelector('img');
			playerName.textContent = playerValues[i] || "Player " + (i + 1);
		}
	}

	// async function updateBracketDB(tournament_id) {
	// 	if (!tournament_id)
	// 		return;
	// 	try {
	// 		const data = await myFetch(
	// 			`https://localhost:8443/tournament/getJoin/${tournament_id}/`,
	// 			null,
	// 			"GET",
	// 			true
	// 		);
	// 		let players = data.tournament.player_names;
	// 		if (!players)
	// 			players = data.tournament.players;
			
			
	// 		const winner1 = data.tournament.game1.winner;
	// 		const winner2 = data.tournament.game2.winner;
	// 		const winner3 = data.tournament.game3.winner;
	// 		console.log(players, winner1, winner2, winner3);

	// 		updateSemifinals(players, 1);
	// 		if (winner1 != null || winner2 != null) {
	// 			updateFinal(winner1.username, winner2.username, players);
	// 		}
	// 		if (winner3 != null) {
	// 			updateWinner(winner1.usermame, winner2.username, winner3.username, players);
	// 		}
	// 	} catch (error) {
	// 		console.log("Error: ", error);
	// 	}
	// }

	// **************************************** LOBBY *************************************************

	async function joinTournamentLobby(tournament_id, game) {
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
		const players = payload.players;
		for (let i = 0; i < 2; i++) {
			try {
				let playerUsername = Object.entries(players)[i][1];
				if (window.user.username == playerUsername)
					joinTournamentLobby(payload.tournament_id, 3);
			} catch {
				console.log("Final redirection error");
			}
		}
	}

	async function semifinalsRedirect(payload) {
		const players = payload.players;
		for (let i = 0; i < 4; i++) {
			try {
				let playerUsername = Object.entries(players)[i][1];
				if (window.user.username == playerUsername && (i == 0 || i == 1))
					joinTournamentLobby(payload.tournament_id, 1);
				else if (window.user.username == playerUsername && (i == 2 || i == 3))
					joinTournamentLobby(payload.tournament_id, 2);
			} catch {
				console.log("Semifinal redirection error");
			}
		}
	}

	// **************************************** CHAT **************************************************

	function receiveChatMessage(payload) {
		const messageList = document.getElementById("chat-message-list-tournament");
		const messageListItem = document.createElement("li");
		const chatContentElement = document.getElementById("chat-content-tournament");

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

	// updateBracketDB(tournament_id);
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
