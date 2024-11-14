
async function sendFriendRequest(dest, src) {
	myFetch();
}

function buttonConfigure(users)
{
	const friends = userListDiv.querySelectorAll('li');
	friends?.forEach(item => {
		const button = item.querySelector('button')
		const dest = item.querySelector('p').textContent;
		button.addEventListener('click', () => {
			sendFriendRequest(dest, src);
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
		friendRequestButton.classList.add("btn", "btn-secondary", "col", "pull-right");
		friendRequestButton.textContent = "Send Friend Request";
		friendRequestButton.type = 'submit';
		friendRequestButton.style.display = 'flex';

		userItemList.appendChild(usernameP);
		userItemList.appendChild(friendRequestButton);
		userList.appendChild(userItemList);

	});
	userListDiv.appendChild(userList);
	userListDiv.style.display = 'block';

	buttonConfigure(users);
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
			putUsers(data.users);
			
		}).catch(error => {
			console.log(error);
		})
	});
}