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
	if (!listDiv) return;

	// Remove previous list if it exists
	const previousList = listDiv.querySelector("ul");
	previousList?.remove();


	const list = document.createElement("ul");
	list.classList.add("list-group");

	let i = 0;
	jsonArray.forEach((element) => {
		Object.keys(element).forEach((id) => {
			const roomId = element[id];

			const listItem = document.createElement("li");
			listItem.id = `item${i++}`;
			listItem.className = "list-group-item d-flex align-items-center justify-content-around";

			// Room ID paragraph
			const roomParagraph = document.createElement("p");
			roomParagraph.textContent = roomId;

			// Join button
			const joinButton = document.createElement("button");
			joinButton.type = "submit";
			joinButton.className = "btn col pull-right btn-success btn-xs";
			joinButton.style.display = "flex";
			joinButton.setAttribute("data-bs-dismiss", "modal");
			joinButton.textContent = `Join ${type}`;

			// Add event listener to the button
			joinButton.addEventListener("click", () => {
				console.log(`Joining ${type}: ${roomId}`);
				// Implement actual join logic here
			});

			// Append elements
			listItem.appendChild(roomParagraph);
			listItem.appendChild(joinButton);
			list.appendChild(listItem);
		});
	});

	// Append list to the container
	listDiv.appendChild(list);
	listDiv.style.display = "block";

	// Configure buttons
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
		console.log("BBBBBBBBBBBBBB: ", data);
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
	const tournamentListDiv = document.getElementById("tournament-list")

	joinModalBtn?.addEventListener("click", async function (event) {
		lobbyListDiv.style.display = "none";
		tournamentListDiv.style.display = "none";
		getLobbies();
		getTournaments();
	});
}

// **************************************** TOURNAMENT **************************************************

async function joinTournament(tournament_id) {
	const body = JSON.stringify(window.user);
	try {
		const data = await myFetch(
			`https://localhost:8443/tournament/getJoin/${tournament_id}/`,
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
