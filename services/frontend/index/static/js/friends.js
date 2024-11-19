
async function sendFriendRequest(dest, src) {
	fetch('https://localhost:8443/user_profile/friend-request-send/', {
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

function buttonConfigure()
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

function putUsers(users)
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

	buttonConfigure();
}

const userListDiv = document.getElementById('user-search-result');
userListDiv.style.display = 'none';

{
	const formUsers = document.getElementById('form-users');

	formUsers?.addEventListener('submit', function(event) {
		event.preventDefault();

		const formData = new FormData(event.target);

		const fetch_url = 'https://localhost:8443/user_auth/user_search/';
		myFetch(fetch_url, formData)
		.then(data => {
			if (data.users)
				putUsers(data.users);
			
		}).catch(error => {
			console.log(error);
		})
	});
}