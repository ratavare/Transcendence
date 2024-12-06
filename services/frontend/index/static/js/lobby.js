
async function joinLobby(lobby_id)
{
	try {
		const response = await fetch(`https://localhost:8443/lobby/lobbies/${lobby_id}/`, {
			method: 'POST',
			body: JSON.stringify(window.user),
			headers: {
				"X-CSRFToken": getCookie('csrftoken'),
				"Accept": "application/json",
				"Content-Type": "application/json"
			},

		});
		const data = await response.json()
		if (!response.ok)
			throw data.error;
	
		console.log(data);
		seturl(`/lobbies/${lobby_id}`)
	} catch (error) {
		seturl('/lobby');
		console.log(error);
	}
}

function buttonConfigure()
{
	const lobbies = lobbyListDiv.querySelectorAll('li');
	lobbies?.forEach(item => {
		const button = item.querySelector('button')
		const lobby_id = item.querySelector('p').textContent;
		button.addEventListener('click', () => {
			joinLobby(lobby_id);
		});
	});
}


function putLobbylist(lobbies)
{
	const previousList = lobbyListDiv.querySelector('ul');
	previousList?.remove();
	const lobbyList = document.createElement('ul');
	lobbyList.classList.add("list-group");
	lobbies.forEach(lobby => {
		const lobbyItemList = document.createElement('li');
		lobbyItemList.classList.add("list-group-item");
		lobbyItemList.style = 'display: flex;align-items: center;justify-content: space-around';
	
		const lobbyId = document.createElement('p');
		lobbyId.textContent = lobby.lobby_id;

		const joinLobbyBtn = document.createElement('button');
		joinLobbyBtn.classList.add("btn", "col", "pull-right", "btn-success", "btn-xs");
		joinLobbyBtn.textContent = "Join Lobby";
		joinLobbyBtn.type = 'submit';
		joinLobbyBtn.style.display = 'flex';

		lobbyItemList.appendChild(lobbyId);
		lobbyItemList.appendChild(joinLobbyBtn);
		lobbyList.appendChild(lobbyItemList);

	});
	lobbyListDiv.appendChild(lobbyList);
	lobbyListDiv.style.display = 'block';

	buttonConfigure()
}

async function getLobbies()
{
	try {
		const response = await fetch('https://localhost:8443/lobby/lobbies/')
		const data = await response.json();
		if (!response.ok)
			throw data.error;
		putLobbylist(data.lobbies)
	} catch(error) {
		console.log(error)
	}
}

{
	const createLobbyForm = document.getElementById('create-lobby-form');

	createLobbyForm?.addEventListener('submit', async function(event) {
		event.preventDefault();

		const formData = new FormData(event.target);

		try {
			const data = await myFetch('https://localhost:8443/lobby/lobbies/', formData, 'POST', true);
			console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
			console.log(data);
			joinLobby(data.lobby_id);
			// seturl(`/lobbies/${data.lobby_id}`)
		} catch(error) {
			seturl('/lobby');
			console.log(error);
		}
	});
}

var lobbyListDiv = document.getElementById('lobby-list');
lobbyListDiv.style.display = 'none'

getLobbies();

