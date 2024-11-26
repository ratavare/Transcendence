
function joinLobby(lobby_id)
{
	myFetch(`https://localhost:8443/lobby/lobbies/${lobby_id}`, window.user)
	.then(data => {
		console.log(data);
		seturl(`/lobbies/${lobby_id}`)
	})
	.catch(error => console.log(error));

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

function getLobbies()
{
	fetch('https://localhost:8443/lobby/lobbies/')
	.then(async (response) => {
		const data = await response.json();
		putLobbylist(data.lobbies)
	}).catch(error => console.log(error))
}

{
	const createLobbyForm = document.getElementById('create-lobby-form');

	createLobbyForm?.addEventListener('submit', function(event) {
		event.preventDefault();

		const formData = new FormData(event.target);

		myFetch('https://localhost:8443/lobby/lobbies/', formData)
		.then(data => seturl(`/lobbies/${data.lobby_id}`))
		.catch(error => {
			console.log(error);
		})
	});
}

var lobbyListDiv = document.getElementById('lobby-list');
lobbyListDiv.style.display = 'none'

getLobbies();

