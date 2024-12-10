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

function displayResults(users)
{
	const results = document.getElementById("search-results");
	const membersCount = document.getElementById("members-count");
	if (membersCount) {
		membersCount.textContent = users.length;
	}
	
	const membersContainer = document.createElement('div');
	membersContainer.classList.add("row");
	membersContainer.id = 'friends-list';
	console.log("users", users);
	
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
	results.appendChild(membersContainer);
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
	console.log(src, dest, intention);
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
	const results = document.getElementById("friend-requests");
	getFriendRequests().then(response => {
		if (response && response.friendRequests.length > 0) {	
			const requestsCount = document.getElementById("requests-count");
			if (requestsCount) {
				requestsCount.textContent = response.friendRequests.length;
			}
			
			const membersContainer = document.createElement('div');
			membersContainer.classList.add("row");
			membersContainer.id = 'requests-list2';
			response.friendRequests.forEach(friendRequest => {
				const card = document.createElement("div");
				card.className = "col-sm-6 col-lg-4";
				card.innerHTML = `
				<div class="card hover-img">
				<div class="card-body p-4 text-center border-bottom">
				<img src="https://bootdey.com/img/Content/avatar/avatar1.png" alt="" class="rounded-circle mb-3" width="80" height="80">
				<h5 class="fw-semibold mb-0">@${friendRequest.username}</h5>
				</div>
				<div class="px-2 py-2 bg-light text-center">
				<button class="btn btn-success me-2 accept-friend-request" type="submit" data-dest="${friendRequest.username}">Accept</button>
				<button class="btn btn-danger me-2 decline-friend-request" type="submit" data-dest="${friendRequest.username}">Decline</button>
				</div>
				</div>
				`;
				membersContainer.appendChild(card);
			});
			results.appendChild(membersContainer);
			document.querySelectorAll('.accept-friend-request').forEach(button => {
				button.addEventListener('click', () => {
					const dest = button.getAttribute('data-dest');
					handleFriendRequestButton(window.user.username, dest, 'accept')
				});
			});
			document.querySelectorAll('.decline-friend-request').forEach(button => {
				button.addEventListener('click', () => {
					const dest = button.getAttribute('data-dest');
					handleFriendRequestButton(dest, window.user.username, 'decline')
				});
			});
		}
	}).catch(error => {
			console.error("Error fetching friends:", error);
			results.innerHTML = "<p>Error loading friends list.</p>";
	}); 
}
{
	const results = document.getElementById("friends");
	getFriends().then(response => {
		if (response && response.friends.length > 0) {	
			const friendsCount = document.getElementById("friends-count");
			if (friendsCount) {
				friendsCount.textContent = response.friends.length;
			}
			const membersContainer = document.createElement('div');
			membersContainer.classList.add("row");
			membersContainer.id = 'friends-list';
			response.friends.forEach(friend => {
				const card = document.createElement("div");
				card.className = "col-sm-6 col-lg-4";
				card.innerHTML = `
				<div class="card hover-img">
				<div class="card-body p-4 text-center border-bottom">
				<img src="https://bootdey.com/img/Content/avatar/avatar1.png" alt="" class="rounded-circle mb-3" width="80" height="80">
				<h5 class="fw-semibold mb-0">@${friendRequest.username}</h5>
				</div>
				<div class="px-2 py-2 bg-light text-center">
				<button class="btn btn-danger me-2 remove-friend" type="submit" data-dest="${friendRequest.username}">Remove Friend</button>
				</div>
				</div>
				`;
				membersContainer.appendChild(card);
			});
			results.appendChild(membersContainer);	
			document.querySelectorAll('.remove-friend').forEach(button => {
				button.addEventListener('click', () => {
					const dest = button.getAttribute('data-dest');
					deleteFriend(window.user.username, dest);
				});
			});
		}
	}).catch(error => {
			console.error("Error fetching friends:", error);
			results.innerHTML = "<p>Error loading friends list.</p>";
	});
}

{
	const formUsers = document.getElementById('form-users');
	formUsers?.addEventListener('submit', function(event) {
		const previousList = document.getElementById('friends-list');
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
				displayResults(data.users);
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

/* async function getFriendsData() {
	try {
		const response = await fetch('https://localhost:8443/user_friends/api/');
		const data = await response.json();
		if (!response.ok)
			throw data.error
		console.log(data);

		return data;
	} catch (error) {
		console.log(error);
	}
}

getFriendsData(); */