document
	.getElementById("createSingleplayerMatch")
	.addEventListener("click", function () {
		seturl("/singleplayerpong");
	});

document
	.getElementById("createLocalMultiplayerMatch")
	.addEventListener("click", function () {
		seturl("/multiplayer_pong");
	});

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
		showErrorModal(error);
	}
}

function buttonConfigure() {
	const lobbies = lobbyListDiv.querySelectorAll("li");
	lobbies?.forEach((item) => {
		const button = item.querySelector("button");
		const lobby_id = item.querySelector("p").textContent;
		button.addEventListener("click", () => {
			joinLobby(lobby_id);
		});
	});
}

function putLobbylist(lobbies) {
	const previousList = lobbyListDiv.querySelector("ul");
	previousList?.remove();
	const lobbyList = document.createElement("ul");
	lobbyList.classList.add("list-group");
	let i = 0;
	lobbies.forEach((lobby) => {
		const lobbyItemList = document.createElement("li");
		lobbyItemList.id = "item" + i++;
		lobbyItemList.classList.add("list-group-item");
		lobbyItemList.style =
			"display: flex;align-items: center;justify-content: space-around";

		const lobbyId = document.createElement("p");
		lobbyId.textContent = lobby.lobby_id;

		const joinLobbyBtn = document.createElement("button");
		joinLobbyBtn.classList.add(
			"btn",
			"col",
			"pull-right",
			"btn-success",
			"btn-xs"
		);
		joinLobbyBtn.textContent = "Join Lobby";
		joinLobbyBtn.type = "submit";
		joinLobbyBtn.style.display = "flex";

		lobbyItemList.appendChild(lobbyId);
		lobbyItemList.appendChild(joinLobbyBtn);
		lobbyList.appendChild(lobbyItemList);
	});
	lobbyListDiv.appendChild(lobbyList);
	lobbyListDiv.style.display = "block";

	buttonConfigure();
}

async function getLobbies() {
	try {
		const data = await myFetch(
			"https://localhost:8443/lobby/lobbies/",
			null,
			"GET",
			true
		);
		// console.log(data.lobbies);
		putLobbylist(data.lobbies);
	} catch (error) {
		console.log(error);
	}
}

{
	const createLobbyForm = document.getElementById("create-lobby-form");

	createLobbyForm?.addEventListener("submit", async function (event) {
		event.preventDefault();
		const formData = new FormData(event.target);
		try {
			const data = await myFetch(
				"https://localhost:8443/lobby/lobbies/",
				formData,
				"POST",
				true
			);
			joinLobby(data.lobby_id);
		} catch (error) {
			console.log(error);
			seturl("/home");
		}
	});
}

{
	const joinLobbyBtn = document.getElementById("join-modal-btn");

	joinLobbyBtn?.addEventListener("click", async function (event) {
		var lobbyListDiv = document.getElementById("lobby-list");
		lobbyListDiv.style.display = "none";
		getLobbies();
	});
}

{
	const tournamentBtn = document.getElementById("tournament-btn");
	tournamentBtn.addEventListener("click", (event) => {
		console.log('HELLO!')
		seturl("/tournaments");
	})
}

