
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

function sendButtonConfigure()
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

function putPossibleFriends(users)
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

	sendButtonConfigure();
}

function getFriends() {
	return fetch('https://localhost:8443/user_friends/get-friends/', {
		method: 'POST',
		headers: {
			"X-CSRFToken": getCookie('csrftoken'),
			"Accept": "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ user: window.user.username })
	})
	.then(response => {
		return response.json();
	})
	.catch(error => {
		console.error("Error fetching friends:", error);
	});
}

// * MAIN SCRIPT *

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
		});
	} else {
		friendsListDiv.innerHTML = "<p>No friends found.</p>";
	}
}).catch(error => {
		console.error("Error fetching friends:", error);
		friendsListDiv.innerHTML = "<p>Error loading friends list.</p>";
});

const userListDiv = document.getElementById('user-search-result');

{
	const formUsers = document.getElementById('form-users');

	formUsers?.addEventListener('submit', function(event) {
		event.preventDefault();

		const formData = new FormData(event.target);

		const fetch_url = 'https://localhost:8443/user_auth/user_search/';
		myFetch(fetch_url, formData)
		.then(data => {
			if (data.users)
				putPossibleFriends(data.users);
			
		}).catch(error => {
			console.log(error);
		})
	});
}