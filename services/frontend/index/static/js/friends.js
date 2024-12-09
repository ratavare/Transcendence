async function sendFriendRequest(dest, src) {
	fetch('https://localhost:8443/user_friends/friend-request-send/', {
		method: 'POST',
		headers: {
			"X-CSRFToken": getCookie('csrftoken'),
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			"dest":dest,
			"src":src
		})
	})
	.then(response => response.json())
	.then(data => {
		console.log(data);
	})
	.catch(error => {
		console.error("Error:", error);
	});
}

function sendButtonConfigure(userListDiv)
{
	const friends = userListDiv.querySelectorAll('li');
	friends?.forEach(item => {
		const button = item.querySelector('button')
		const dest = item.querySelector('p').textContent;
		button.addEventListener('click', () => {
			sendFriendRequest(dest, window.user.username);
		});
	});
}

function putPossibleFriends(users, userListDiv)
{
	const previousList = userListDiv.querySelector('ul');
	previousList?.remove();
	const userList = document.createElement('ul');
	userList.classList.add("list-group");
	users.forEach(user => {
		const userItemList = document.createElement('li');
		userItemList.classList.add("list-group-item");
		userItemList.style = 'display: flex;align-items: center;justify-content: space-around';
	
		const usernameP = document.createElement('p');
		usernameP.textContent = user.username;

		const friendRequestButton = document.createElement('button');
		friendRequestButton.classList.add("btn", "col", "pull-right", "btn-success", "btn-xs");
		friendRequestButton.textContent = "Send Friend Request";
		friendRequestButton.type = 'submit';
		friendRequestButton.style.display = 'flex';

		userItemList.appendChild(usernameP);
		userItemList.appendChild(friendRequestButton);
		userList.appendChild(userItemList);

	});
	userListDiv.appendChild(userList);
	userListDiv.style.display = 'block';

	sendButtonConfigure(userListDiv);
}

function getFriends() {
	return fetch('https://localhost:8443/user_friends/get-friends/')
	.then(response => {
		return response.json();
	})
	.catch(error => {
		console.error("Error fetching friends:", error);
	});
}

function getFriendRequests() {
	return fetch('https://localhost:8443/user_friends/get-friend-requests/')
	.then(response => {
		return response.json();
	})
	.catch(error => {
		console.error('Error fetching friend requests: ', error)
	});
}

function getSentFriendRequests() {
	return fetch('https://localhost:8443/user_friends/get-sent-friend-requests/')
	.then(response => {
		return response.json();
	})
	.catch(error => {
		console.error('Error fetching friend requests: ', error)
	});
}

function handleFriendRequestButton(src, dest, intention) {
	return fetch('https://localhost:8443/user_friends/handle-friend-request/' , {
		method: 'POST',
		headers: {
			"X-CSRFToken": getCookie('csrftoken'),
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			'dest':dest,
			'src':src,
			'intention':intention
		})
	})
	.then(async response => {
		const data = await response.json();
		console.log(data);
		return data;
	})
	.catch(error => {
		console.error('Error: ', error.error);
	})
}

function deleteFriend(src, dest) {
	return fetch('https://localhost:8443/user_friends/delete-friend/' , {
		method: 'POST',
		headers: {
			"X-CSRFToken": getCookie('csrftoken'),
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			'dest':dest,
			'src':src,
		})
	})
	.then(async response => {
		const data = await response.json();
		console.log(data);
		return data;
	})
	.catch(error => {
		console.error('Error: ', error.error);
	})
}

function deleteFriendRequest(src, dest) {
	return fetch('https://localhost:8443/user_friends/delete-friend-request/' , {
		method: 'POST',
		headers: {
			"X-CSRFToken": getCookie('csrftoken'),
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			'dest':dest,
			'src':src,
		})
	})
	.then(async response => {
		const data = await response.json();
		console.log(data);
		return data;
	})
	.catch(error => {
		console.error('Error: ', error.error);
	})
}

// * MAIN SCRIPT *
{
	const friendRequestsDiv = document.getElementById('user-friend-requests')

	getFriendRequests().then(response => {
		if (response) {
			console.log(response);
			response.friendRequests.forEach(friendRequest => {
				const friendList = document.createElement('ul');
				const friendsP = document.createElement('p');
				friendsP.textContent = friendRequest.username;
				friendList.appendChild(friendsP);
				friendRequestsDiv.appendChild(friendList);

				const declineButton = document.createElement('button');
				declineButton.classList.add("btn", "col", "pull-right", "btn-danger", "btn-xs");
				declineButton.textContent = "Decline";
				declineButton.type = 'submit';
				declineButton.style.display = 'flex';
				friendRequestsDiv.appendChild(declineButton);

				const acceptButton = document.createElement('button');
				acceptButton.classList.add("btn", "col", "pull-right", "btn-success", "btn-xs");
				acceptButton.textContent = "Accept";
				acceptButton.type = 'submit';
				acceptButton.style.display = 'flex';
				friendRequestsDiv.appendChild(acceptButton);

				const dest = friendList.querySelector('p').textContent;
				declineButton.addEventListener('click', () => {
					handleFriendRequestButton(dest ,window.user.username, 'decline')
					// window.location.reload()
				})
				acceptButton.addEventListener('click', () => {
					handleFriendRequestButton(dest, window.user.username, 'accept')
					// window.location.reload()
				})
			});
		} else {
			friendRequestsDiv.innerHTML = "<p>No friends requests found.</p>";
		}
	}).catch(error => {
			console.error("Error fetching friends:", error);
			friendRequestsDiv.innerHTML = "<p>Error loading friends list.</p>";
	});
}

{
	const sentFriendRequestsDiv = document.getElementById('user-sent-friend-requests')

	getSentFriendRequests().then(response => {
		if (response) {
			console.log(response);
			response.sentFriendRequests.forEach(request => {
				const friendList = document.createElement('ul');
				const friendsP = document.createElement('p');
				friendsP.textContent = request.username;
				friendList.appendChild(friendsP);
				sentFriendRequestsDiv.appendChild(friendList);
				const button = document.createElement('button');
				button.classList.add("btn", "col", "pull-right", "btn-danger", "btn-xs");
				button.textContent = "Cancel";
				button.type = 'submit';
				button.style.display = 'flex';
				sentFriendRequestsDiv.appendChild(button);
				button.addEventListener('click', () => {
					const dest = friendList.querySelector('p').textContent;
					deleteFriendRequest(window.user.username, dest);
					// window.location.reload()
				})
			})
		}
	})
}
{
	const friendsListDiv = document.getElementById('user-friends');

	getFriends().then(response => {
		if (response) {
			console.log(response);
			response.friends.forEach(friend => {
				const friendList = document.createElement('ul');
				const friendsP = document.createElement('p');
				friendsP.textContent = friend.username;
				friendList.appendChild(friendsP);
				friendsListDiv.appendChild(friendList);
				const button = document.createElement('button');
				button.classList.add("btn", "col", "pull-right", "btn-danger", "btn-xs");
				button.textContent = "Remove friend :(";
				button.type = 'submit';
				button.style.display = 'flex';
				friendsListDiv.appendChild(button);
				button.addEventListener('click', () => {
					const dest = friendList.querySelector('p').textContent;
					deleteFriend(window.user.username, dest);
					// window.location.reload()
				})
			});
		} else {
			friendsListDiv.innerHTML = "<p>No friends found.</p>";
		}
	}).catch(error => {
			console.error("Error fetching friends:", error);
			friendsListDiv.innerHTML = "<p>Error loading friends list.</p>";
	});
}

{
	const userListDiv = document.getElementById('user-search-result');
	const formUsers = document.getElementById('form-users');

	formUsers?.addEventListener('submit', function(event) {
		event.preventDefault();

		const formData = new FormData(event.target);

		const fetch_url = 'https://localhost:8443/user_friends/user_search/';
		myFetch(fetch_url, formData)
		.then(data => {
			if (data.users)
				putPossibleFriends(data.users, userListDiv);
			
		}).catch(error => {
			console.log(error);
		})
	});
}


/* 

Tereza, esta e para ti.

Esta vai ser a funcao principal com a qual vais fazer fetch da data dos friends to utilizador.
Ela vai retornar 3 arrays diferentes aka: friends, friendRequests e sentFriendRequests
para que possas depois fazer o display deles na pagina.

Quanto aos post's, ta um bocado salganhada mas im working on it. Provavelmente vai ficar como esta.

exemplo de utilizacao:

const friendsData = await getFriendsData();

friendsData.friends[...]
friendsData.friendRequests[...]
friendsData.sentFriendRequests[...]

Obrigado e volte sempre.

                |
				|
				|
				V
*/

// async function getFriendsData() {
// 	try {
// 		const response = await fetch('https://localhost:8443/user_friends/api/');
// 		const data = await response.json();
// 		if (!response.ok)
// 			throw data.error
// 		console.log(data);      // Depois podes apagar esta linha.
// 		return data;
// 	} catch (error) {
// 		console.log(error);
// 	}
// }


