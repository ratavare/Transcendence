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
			case "startFinals":
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
		const readyBtn = document.getElementById("TournamentReadyBtn");
		if (payload == "False") readyBtn.style.display = "block";
		else readyBtn.style.display = "none";

		readyBtn.addEventListener("click", () => {
			readyBtn.style.display = "none";
			sendPayload("ready", { ready: true });
		})
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
			console.log("Bracket update");
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
			
			const pClass = document.querySelector(".tournament-p" + (parseInt(i) + 1));
			const pDiv = document.getElementById("div-p" + (parseInt(i) + 1));
			const pName = pDiv.querySelector("span");
		
			const pStyle = getComputedStyle(pClass);
			const pColor = pStyle.getPropertyValue('--border-color').trim();
			// console.log("pColor: ", pColor);

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

	function putWinner()
	{
		const finalLi = document.getElementById("li-final" + index / 2);
		finalLi.style.setProperty("--li-after", pColor);
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
			console.log("Players: ", data.tournament.players);
			console.log("Spectators: ", data.tournament.spectators);

			if (data.tournament.game1.winner != null || data.tournament.game2.winner != null)
				finalsInitDB(data.tournament);
			else if (data.tournament.game3.winner != null) putWinner();
			else semiFinalsInitDB(data.tournament.players);


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
		
	}

	async function semifinalsRedirect(payload) {
		const players = payload.players;
		for (let i = 0; i < 4; i++) {
			try {
				let playerUsername = Object.entries(players)[i][1];
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

		if (payload.sender == "connect") color = "limegreen";
		if (payload.sender == "disconnect") color = "red";
		if (payload.sender == "spectator") color = "grey";
			messageListItem.innerHTML = `<i style="color: ${color}">${payload.content}</i>`;
		if (payload.sender == window.user.username) {
			color = "orangered";
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
