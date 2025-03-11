// ************************************* WEBSOCKET ************************************************

PageElement.onLoad = async () => {
	let tournament_id;

	if (window.location.hash.includes("/tournament?id")) {
		tournament_id = window.props.get("id");
	}
	else
		return;

	let socket = new WebSocket(
		`wss://${MAIN_HOST}:8443/pong/t/${encodeURIComponent(
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
				updateBracket(data.payload);
				break;
			case "log":
				// console.log(data.payload);
				break;
			case "message":
				receiveChatMessage(data.payload);
		}
	};

	socket.onopen = async () => {
	};

	socket.onclose = (e) => {
		// console.log(`Socket closed unexpectedly: ${e.reason}`);
		seturl("/home");
	};

	socket.onerror = (e) => {
		console.error(e.reason);
		seturl("/home");
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

	function readyBtnDisplay(payload, fakeNameDiv) {
		const username = window.user.username;
		const { winner1, winner2, winner3, is_ready, stage, players } = payload;
		const fakeNameInput = document.getElementById("fake-name-input");
		if (stage == "final") {
			if (players[username] == winner1 || players[username] == winner2)
				fakeNameDiv.style.display = "block";
			fakeNameInput.style.display = "none";
		} else if (is_ready || winner3 || username != players[username] || stage == "winner")
			fakeNameDiv.style.display = "none";
		else fakeNameDiv.style.display = "block";
	}

	function readyBtnInit(payload) {
		const readyBtn = document.getElementById("tournament-ready-btn");
		const fakeNameDiv = document.getElementById("fake-name-div");
		
		readyBtnDisplay(payload, fakeNameDiv);
		readyBtn.addEventListener("click", () => {
			fakeNameDiv.style.display = "none";
			sendPayload("ready", { stage: payload.stage });
		})
	}

	function getPlayerColor(index) {
		const pClass = document.querySelector(".tournament-p" + (parseInt(index) + 1));
		if (!pClass) {
			return undefined;
		}
		const pStyle = getComputedStyle(pClass);
		return (pStyle.getPropertyValue('--border-color').trim());
	}
	
	async function updateBracket(payload) {
		try {
			const { winner1, winner2, winner3, state, stage, fake_names } = payload;
			const fakers = Object.values(fake_names);

			if (state == "disconnect" && stage == "winner") {
				updateWinner(winner1, winner2, winner3, fakers);
				return ;
			}
			if (stage == "semifinals")
				fakeNameFormInit(fake_names);
	
			updateColorMap(Object.values(fake_names));
			messageForm(fake_names);

			if ((stage == "final" && payload.state == "connect") || stage != "final")
				updateSemifinals(fakers);
			if (winner1 || winner2)
				updateFinal(winner1, winner2, fakers);
			if (winner3)
				updateWinner(winner1, winner2, winner3, fakers);
		} catch (e) {
			console.error("Update Bracket Error: ", e);
		}
	}

	function getWinnerIndex(nameList, winner3) {
		let index = undefined;
		for (index in nameList) {
			if (winner3 == nameList[index])
				return index;
		}
		return index;
	}

	function getPlayerIndex(playerList)
	{
		let index = 0;
		const username = window.user.username;
		for (const player in playerList)
		{
			if (username == player)
				return index
			index++;
		}
		return undefined
	}

	function updateWinner(winner1, winner2, winner3, nameList) {
		winnerIdx = getWinnerIndex(nameList, winner3)
		if (winnerIdx === undefined) return;
		let playerLiProperty;
		if (parseInt(winnerIdx / 2) + 1 == 1) playerLiProperty = "--li-after";
		else playerLiProperty = "--li-last";
		
		const pColor = getPlayerColor(parseInt(winnerIdx));
		const finalLi = document.getElementById("li-final" + (parseInt(winnerIdx / 2) + 1));
		const winnerUl = document.getElementById("ul-winner");
		const winnerDiv = document.getElementById("tournament-winner");
		if (!winnerDiv || !winnerUl || !finalLi) return;
		const winnerName = winnerDiv.querySelector("span");

		// Change background of finalist brackets
		if (winner3 == winner1)
			document.getElementById("div-final1").style.background = getPlayerColor(parseInt(winnerIdx));
		if (winner3 == winner2)
			document.getElementById("div-final2").style.background = getPlayerColor(parseInt(winnerIdx));
	
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

	function putFinals(winner, index, nameList) {
		for (let i = index - 2; i < index; i++) {
			const finalsDiv = document.getElementById("div-final" + index / 2);
			const semifinalsUl = document.getElementById("ul-semi" + index / 2);
			const pLi = document.getElementById("li-p" + (parseInt(i) + 1));
			const pDiv = document.getElementById("div-p" + (parseInt(i) + 1));
			if (!finalsDiv || !semifinalsUl || !pLi || !pDiv) return;
			const pName = pDiv.querySelector("span");
			if (!pName) return;
			const pColor = getPlayerColor(parseInt(i));

			let playerLiProperty;
			if (i % 2 == 0) playerLiProperty = "--li-after";
			else playerLiProperty = "--li-last";

			if (!winner) pName.textContent = nameList[i];
			else if (winner == nameList[i]) {
				// Change bracket lines' color
				finalsDiv.classList.add("tournament-p" + (parseInt(i) + 1));
				const pFinalName = finalsDiv.querySelector("span");
				pLi.style.setProperty(playerLiProperty + "-bc", pColor);
				pLi.style.setProperty(playerLiProperty + "-bw", "5px");
				semifinalsUl.style.setProperty("--ul-after-bc", pColor);
				semifinalsUl.style.setProperty("--ul-after-bw", "5px");
				pDiv.style.background = pColor;
				finalsDiv.style.background = pColor;

				//Add name
				pFinalName.textContent = nameList[i];
				pDiv.textContent = nameList[i];
			}
		}
	}

	async function updateFinal(winner1, winner2, nameList) {
		putFinals(winner1, 2, nameList);
		putFinals(winner2, 4, nameList);
	}

	function updateSemifinals(nameList) {
		for (let index = 0; index < 4; index++) {
			const playerDiv = document.getElementById("div-p" + (parseInt(index) + 1));
			if (!playerDiv) return;
			const playerName = playerDiv.querySelector("span");
			if (!playerName) return
			playerName.textContent = nameList[index] || "Player " + (index + 1);
		}
	}

	// **************************************** LOBBY *************************************************

	async function joinTournamentLobby(tournament_id, game, fakeUsername) {
		const lobby_id = `tournament_${tournament_id}_${game}`;
		const body = {
			username: window.user.username,
			lobby_id: lobby_id
		};
		try {
			const data = await myFetch(
				`https://${MAIN_HOST}:8443/tournament/joinTournamentLobby/`,
				body,
				"POST",
				true
			);
			seturl(`/pong?id=${lobby_id}&username=${fakeUsername}`);
		} catch (error) {
			console.log("Tried to join: ", lobby_id);
		}
	}

	async function finalsRedirect(payload) {
		const playerMap = payload.players;
		const username = window.user.username;
		if (playerMap[username] == payload.winner1 || playerMap[username] == payload.winner2)
			joinTournamentLobby(payload.tournament_id, 3, playerMap[username]);
	}

	async function semifinalsRedirect(payload) {
		let index = 0;
		const playerMap = payload.players;
		const username = window.user.username;
		for (const name in playerMap) {
			if (username == name && (index == 0 || index == 1))
				joinTournamentLobby(payload.tournament_id, 1, playerMap[name]);
			else if (username == name && (index == 2 || index == 3))
				joinTournamentLobby(payload.tournament_id, 2, playerMap[name]);
			index++;
		}
	}

	// **************************************** CHAT **************************************************

	let colorMap = new Map([
		["connect", "limegreen"],
		["disconnect", "red"],
		["spectator", "grey"],
		["countdown", "purple"]
	]);

	function updateColorMap(playerList) {
		for (const index in playerList) {
			pColor = getPlayerColor(index);
			pColor = pColor?.replace(/, *[\d.]+\)$/, ")");
			colorMap.set(playerList[index], pColor);
		}
	}

	function lightenRGB(rgb, percent) {
		let [r, g, b] = rgb.match(/\d+/g).map(Number);
		r = Math.min(255, r + (255 - r) * (percent / 100));
		g = Math.min(255, g + (255 - g) * (percent / 100));
		b = Math.min(255, b + (255 - b) * (percent / 100));
		return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
	}

	function receiveChatMessage(payload) {
		const messageList = document.getElementById("chat-message-list-tournament");
		const messageListItem = document.createElement("li");
		const chatContentElement = document.getElementById("chat-content-tournament");

		if (!messageList || !messageListItem || !chatContentElement)
			return;

		color = payload.color || colorMap.get(payload.sender) || "white"
		if (!color || color == "transparent")
			return;

		if (payload.sender == "connect" || payload.sender == "disconnect" || payload.sender == "countdown" || payload.sender == "spectator")
		{
			messageListItem.innerHTML = `<i style="color: ${color}">${payload.content}</i>`;
		}
		else if (payload.sender == "changeName")
		{
			color = colorMap.get(payload.content.oldName)
			messageListItem.innerHTML = `
				<i style="color: ${lightenRGB(color, 20)}">${payload.content.oldName}</i>
				<i style="color: white"> changed their name to </i>
				<i style="color: ${lightenRGB(color, 20)}">${payload.content.newName}</i>
			`;
		} else
			messageListItem.innerHTML = `<b style="color: ${lightenRGB(color, 20)}">${payload.sender}: </b><span>${payload.content}</span>`;

		if (messageListItem) messageList.appendChild(messageListItem);
		if (chatContentElement) {
			chatContentElement.scrollTop = chatContentElement.scrollHeight;
		}
	}

	function sendMessage(sender, content, color) {
		sendPayload("message", {
			sender: sender,
			content: content,
			color: color
		});
	}

	async function getChat(tournament_id) {
		try {
			const data = await myFetch(
				`https://${MAIN_HOST}:8443/tournament/getJoin/${tournament_id}/`,
				null,
				"GET",
				true
			);
			for (const message of data.tournament.chat) {
				receiveChatMessage(message);
			}
		} catch (error) {
			console.log(error);
		}
	}

	// function putChat(state, players)
	// {
	// 	if (state != "")
	// 	for (const player in players)
	// 	{
	// 		if (player == window.user.username)
	// 			getChat(tournament_id);
	// 	}
	// }

	function messageForm(playerList) {
		let color = getPlayerColor(getPlayerIndex(playerList))
		if (!color)
			color = "grey";
		const chatInputForm = document.getElementById(
			"chat-input-form-tournament"
		);
		if (!chatInputForm)
			return;
		chatInputForm.addEventListener("submit", (event) => {
			event.preventDefault();
			const chatInput = event.target.querySelector(
				"#chat-input-tournament"
			);
			if (color == 'grey')
				sendMessage("spectator", `${window.user.username}: ${chatInput.value}`, color);
			else if (chatInput.value)
				sendMessage(window.user.username, chatInput.value, color);
			chatInput.value = "";
		});
	}

	function fakeNameFormInit(names) {
		const fakeNameForm = document.getElementById("fake-name-form");
		if (!fakeNameForm || !names) return;
		fakeNameForm.addEventListener("submit", (event) => {
			event.preventDefault();
			const fakeNameInput = event.target.querySelector("#fake-name-input");
			const fakeName = fakeNameInput.value
			if (!fakeName || fakeName == "")
				return;
			const keys =  Object.keys(names);
			const values = Object.values(names);
			if (fakeName && !keys.includes(fakeName) && !values.includes(fakeName) && fakeName.length < 25) {
				sendPayload("fakeName", fakeName)
			} else {
				sendPayload("fakeName", window.user.username)
				showErrorModal("Invalid name");
			}
			fakeNameInput.value = "";
		})
	}

	getChat(tournament_id);

	window.addEventListener("popstate", () => {
		if (
			window.location.hash.includes("/tournament?id") ||
			window.location.hash.includes("/pong?id")
		)
			return;
		if (socket) socket.close();
	})

	window.onbeforeunload = () => {
		if (
			window.location.hash.includes("/tournament?id") ||
			window.location.hash.includes("/pong?id")
		)
			return;
		if (socket) socket.close();
	};

	PageElement.onUnload = () => {

		PageElement.onUnload = () => {};
	};
};

function toggleChat() {
    document.getElementById("chat-container").classList.toggle("hidden");
}