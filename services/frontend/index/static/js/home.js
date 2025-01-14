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

function putList(jsonArray, htmlId, type) {
	const listDiv = document.getElementById(htmlId);

	const previousList = listDiv.querySelector("ul");
	previousList?.remove();
	const list = document.createElement("ul");
	list.classList.add("list-group");
	let i = 0;
	console.log("JSON ARRAY: ", jsonArray);
	jsonArray.forEach((element) => {
		console.log("ELEMENT: ", element);
		Object.keys(element).forEach((id) => {
			console.log("ELEMENT[ID]: ", element[id]);
			const roomId = element[id];
			list.innerHTML += `
				<li id="item${i++}" class="list-group-item" style="display: flex;align-items: center;justify-content: space-around">
					<p>${roomId}</p>
					<button type="submit" class="btn col pull-right btn-success btn-xs" style="display: flex;" data-bs-dismiss="modal">Join ${type}</button>
				</li>
			`;
		});
	});
	listDiv.appendChild(list);
	listDiv.style.display = "block";

	buttonConfigure(htmlId, type);
}

function buttonConfigure(htmlId, type) {
	const listDiv = document.getElementById(htmlId);
	const listItems = listDiv.querySelectorAll("li");
	listItems?.forEach((item) => {
		const button = item.querySelector("button");
		const id = item.querySelector("p").textContent;
		button.addEventListener("click", () => {
			if (type == "Lobby") joinLobby(id);
			else if (type == "Tournament") joinTournament(id);
		});
	});
}

// **************************************** LOBBY **************************************************

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

async function getLobbies() {
	try {
		const data = await myFetch(
			"https://localhost:8443/lobby/lobbies/",
			null,
			"GET",
			true
		);
		putList(data.lobbies, "lobby-list", "Lobby");
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
	const joinModalBtn = document.getElementById("join-modal-btn");
	const lobbyListDiv = document.getElementById("lobby-list");

	joinModalBtn?.addEventListener("click", async function (event) {
		lobbyListDiv.style.display = "none";
		getLobbies();
		getTournaments();
	});
}

// **************************************** TOURNAMENT **************************************************

async function joinTournament(tournament_id) {
	const body = JSON.stringify(window.user);
	try {
		const data = await myFetch(
			`https://localhost:8443/tournament/$${tournament_id}/`,
			body,
			"POST",
			true
		);
		seturl(`/tournament?id=${tournament_id}`);
	} catch (error) {
		alert(error);
	}
}

async function getTournaments() {
	try {
		const data = await myFetch(
			"https://localhost:8443/tournament/tournaments/",
			null,
			"GET",
			true
		);
		putList(data.tournaments, "tournament-list", "Tournament");
	} catch (error) {
		console.log(error);
	}
}

{
	const createTournamentForm = document.getElementById(
		"create-tournament-form"
	);
	createTournamentForm?.addEventListener("submit", async function (event) {
		event.preventDefault();
		const formData = new FormData(event.target);
		try {
			const data = await myFetch(
				"https://localhost:8443/tournament/",
				formData,
				"POST",
				true
			);
			joinTournament(data.tournament_id);
		} catch (error) {
			console.log(error);
			// seturl("/home");
		}
	});
}
