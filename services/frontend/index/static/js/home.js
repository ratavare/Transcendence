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
	
		// Create and add the title slot
		const titleItem = document.createElement("div");
		titleItem.className = "list-group-item d-flex justify-content-between align-items-center";
		titleItem.innerHTML = `
			<p class="mb-0 flex-grow-1 text-center" style="font-size: 1.5rem; font-weight: bold; color: white;">${type} List</p>
		`;
		titleItem.style.backgroundColor = "#52127cb2"; // Change background color
		list.appendChild(titleItem);
	
		jsonArray.forEach(async (element) => {
			Object.keys(element).forEach((id) => {
				if (document.querySelector(`[data-room-id="${element[id]}"]`)) return;
				
				const roomId = element[id];
		
				const listItem = document.createElement("div");
				listItem.className = "list-group-item d-flex justify-content-between align-items-center";
				listItem.setAttribute("data-room-id", roomId);
		
				listItem.innerHTML = `
					<p class="mb-0 flex-grow-1 text-start" style="font-size: 1.2rem; color: white;">${roomId}</p>
					<button class="btn w-50 px-3 py-2 btn-sm text-truncate" data-bs-dismiss="modal" style="background-color: #6c0f9e; color: white;">
						Join ${type}
					</button>
				`;
		
				listItem.style.backgroundColor = "#52127cb2"; // Change background color 
		
				// Directly attach the event listener to the button when it is created
				const button = listItem.querySelector("button");
				button.addEventListener("click", () => {
					if (type === "Lobby") {
						joinLobby(roomId);
					} else if (type === "Tournament") {
						joinTournament(roomId);
					}
				});
	
				list.appendChild(listItem);
			});
		});
	
		// Append list to the container
		listDiv.appendChild(list);
		listDiv.style.display = "block";
	}
	
	
function buttonConfigure(htmlId, type) {
    const listDiv = document.getElementById(htmlId);
    const listItems = listDiv.querySelectorAll("div");
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
		seturl(`/pong?id=${lobby_id}&username=${window.user.username}`);
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
	const creatTournamentInput = document.getElementById(
		"create-tournament-input"
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
		creatTournamentInput.value = "";
	});
}
