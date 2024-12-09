async function sendFriendRequest(dest, src) {
	fetch('https://localhost:8443/user_friends/friend-request-send/', { // TODO: Add Authorization header
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
	document.querySelectorAll('.send-friend-request').forEach(button => {
        button.addEventListener('click', () => {
            const dest = button.getAttribute('data-dest');
            sendFriendRequest(dest, window.user.username);
        });
    });
}

function putPossibleFriends(users)
{
	/* const previousList = userListDiv.querySelector('ul');
	console.log("check", previousList);
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
	userListDiv.style.display = 'block'; */

	
	const membersCount = document.getElementById("members-count");
	if (membersCount) {
		membersCount.textContent = users.length;
	}
	
	const membersContainer = document.createElement('div');
	membersContainer.classList.add("row");
	membersContainer.id = 'friends-list2';
	
	users.forEach(user => {
		const card = document.createElement("div");
		card.className = "col-sm-6 col-lg-4";
		card.innerHTML = `
		<div class="card hover-img">
		<div class="card-body p-4 text-center border-bottom">
		<img src="https://bootdey.com/img/Content/avatar/avatar1.png" alt="" class="rounded-circle mb-3" width="80" height="80">
		<h5 class="fw-semibold mb-0">@${user.username}</h5>
		</div>
		<div class="px-2 py-2 bg-light text-center">
		<button class="btn btn-success me-2 send-friend-request" data-dest="${user.username}" >Send Request</button>
		</div>
		</div>
		`;
		membersContainer.appendChild(card);
		
	});
	//userListDiv2.appendChild(membersContainer);

	sendButtonConfigure();
}

function getFriends() {
	return fetch('https://localhost:8443/user_friends/get-friends/') // TODO: Add Authorization header
	.then(response => {
		return response.json();
	})
	.catch(error => {
		console.error("Error fetching friends:", error);
	});
}

function getFriendRequests() {
	return fetch('https://localhost:8443/user_friends/get-friend-requests/') // TODO: Add Authorization header
	.then(response => {
		return response.json();
	})
	.catch(error => {
		console.error('Error fetching friend requests: ', error)
	});
}

function handleFriendRequestButton(src, dest, intention) {
	return fetch('https://localhost:8443/user_friends/handle-friend-request/' , { // TODO: Add Authorization header
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
	return fetch('https://localhost:8443/user_friends/delete-friend/' , { // TODO: Add Authorization header
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
		const previousList = document.getElementById('friends-list2');
		if (previousList) {
			previousList.remove();
		}

		const nousers = document.getElementById('no-users');
		if (nousers) {
			nousers.remove();
		}
		
		event.preventDefault();

		const formData = new FormData(event.target);
		console.log("formData", formData);

		const fetch_url = 'https://localhost:8443/user_auth/user_search/';
		myFetch(fetch_url, formData, 'POST', true)
		.then(data => {
			if (data.users)
				putPossibleFriends(data.users);
		}).catch(error => {
			console.log(error);
			const membersCount = document.getElementById("members-count");
			if (membersCount) {
				membersCount.textContent = "0";
			}
			const results = document.getElementById("search-results");
			const nousers = document.createElement('p');
			nousers.id = 'no-users';
			nousers.innerHTML = "No users found";
			results.appendChild(nousers);
		})
	});
}