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
	document.querySelectorAll('.send-friend-request').forEach(button => {
        button.addEventListener('click', () => {
            const dest = button.getAttribute('data-dest');
            sendFriendRequest(dest, window.user.username);
        });
    });
}

function putUsers(users)
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

	const nousers = document.getElementById('no-users');
	if (nousers) {
		nousers.remove();
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
	userListDiv2.appendChild(membersContainer);

	sendButtonConfigure();
}

const friendsListDiv = document.getElementById('user-friends');

{
	
}

const userListDiv = document.getElementById('user-search-result');
const userListDiv2 = document.getElementById('search-results');

{
	const formUsers = document.getElementById('form-users');

	formUsers?.addEventListener('submit', function(event) {
		const previousList = document.getElementById('friends-list2');
		if (previousList) {
			previousList.remove();
		}
		
		event.preventDefault();

		const formData = new FormData(event.target);
		console.log("formData", formData);

		const fetch_url = 'https://localhost:8443/user_auth/user_search/';
		myFetch(fetch_url, formData)
		.then(data => {
			if (data.users)
				putUsers(data.users);
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