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

async function putLobbylist(lobbies) {
    const lobbyListDiv = document.getElementById("lobby-list");
    if (!lobbyListDiv) return;

    lobbies.forEach((lobby) => {
        // Prevent duplicate entries
        // if (document.querySelector(`[data-lobby-id="${lobby.lobby_id}"]`)) return;

        // const card = document.createElement("div");
        // card.className = "col-sm-6 col-lg-4";
        // card.setAttribute("data-lobby-id", lobby.lobby_id);
        // card.innerHTML = `
        //     <div class="card hover-img">
        //         <div class="card-body p-4 text-center border-bottom">
        //             <h5 class="fw-semibold mb-0" style="color: white">Lobby ID: ${lobby.lobby_id}</h5>
        //         </div>
        //         <div class="px-2 py-2 text-center" style="background-color: #222222b1; border-bottom-left-radius: 1.1rem; border-bottom-right-radius: 1.1rem;">
        //             <button class="btn btn-primary mb-2 play-button" data-lobby-id="${lobby.lobby_id}">Join Lobby</button>
        //         </div>
        //     </div>
        // `;

        // Click event for joining lobby using the correct class
        card.querySelector(".play-button").addEventListener("click", () => {
            console.log(`Joining lobby: ${lobby.lobby_id}`);
            // Implement actual join logic here
        });

        lobbyListDiv.appendChild(card);
    });
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

var lobbyListDiv = document.getElementById("lobby-list");
lobbyListDiv.style.display = "none";

getLobbies();
