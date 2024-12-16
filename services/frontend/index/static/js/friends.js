
// **** FETCHES ****

async function sendFriendRequest(dest, src) {
	try {
		await myFetch('https://localhost:8443/user_friends/friend-request-send/', {"dest": dest, "src": src}, "POST", true)
		console.log('Friend request sent!')
	} catch(error) {
		console.error("Error:", error);
	}
}

async function handleFriendRequestButton(src, dest, intention) {
	console.log(src, dest, intention);
	try {
		return await myFetch('https://localhost:8443/user_friends/handle-friend-request/', { 'dest': dest, 'src': src, 'intention': intention }, "POST", true);
	} catch (error) {
		console.error('Error: ', error);
	}
}

async function deleteFriend(src, dest) {
	console.log('friend deleted');
	try {
		return await myFetch('https://localhost:8443/user_friends/delete-friend/', { 'dest': dest, 'src': src }, "POST", true)
	} catch (error) {
		console.error('Error: ', error);
	}
}

async function deleteFriendRequest(src, dest) {
	try {
		return myFetch('https://localhost:8443/user_friends/delete-friend-request/', { 'dest': dest, 'src': src }, "POST", true)
	} catch (error) {
		console.error('Error: ', error);
	}
}

async function friendsSearchUser(formData) {
    return myFetch('https://localhost:8443/user_friends/user_search/', formData, 'POST', true)
        .catch(error => {
            displayNoUsersMessage();
            console.error('Error: ', error);
			return null;
        });
}

async function getFriendsData() {
	try {
		return await myFetch('https://localhost:8443/user_friends/api/', null, "GET", true)
	} catch (error) {
		console.log(error);
	}
}

// **** UTILS ****

function addBtnEventListener(btnClass, f, ...arg) {
	document.querySelectorAll(btnClass).forEach(button => {
		button.addEventListener('click', () => {
			const dest = button.getAttribute('data-dest');
			f(dest, window.user.username, ...arg);
		});
	});
}

function displaySearchResults(users)
{
	const results = document.getElementById("search-results");
	const membersCount = document.getElementById("members-count");
	if (membersCount) {
		membersCount.textContent = users.length;
	}
	
	const membersContainer = document.createElement('div');
	membersContainer.classList.add("row");
	membersContainer.id = 'friends-list';
	
	users.forEach(user => {
		if (document.querySelector(`[data-username="${user.username}"]`))
			return ;
		const card = document.createElement("div");
		card.className = "col-sm-6 col-lg-4";
		card.innerHTML = `
		<div class="card hover-img">
		<div class="card-body p-4 text-center border-bottom">
		<img src="https://bootdey.com/img/Content/avatar/avatar1.png" alt="" class="rounded-circle mb-3" width="80" height="80">
		<h5 class="fw-semibold mb-0">@${user.username}</h5>
		</div>
		<div class="px-2 py-2 bg-light text-center">
		<button class="btn btn-success me-2 send-friend-request" data-dest="${user.username}" >Send Friend Request</button>
		</div>
		</div>
		`;
		membersContainer.appendChild(card);
	});
	results.appendChild(membersContainer);
	addBtnEventListener('.send-friend-request', sendFriendRequest);
}

function clearPreviousResults() {
	document.getElementById('friends-list')?.remove();
	document.getElementById('no-users')?.remove();
}

function displayNoUsersMessage() {
	const membersCount = document.getElementById("members-count");
	if (membersCount) {
		membersCount.textContent = "0";
	}
	const results = document.getElementById("search-results");
	const nousers = document.createElement('h4');
	nousers.id = 'no-users';
	nousers.innerHTML = "No users found";
	results.appendChild(nousers);
}

async function handleSearchForm(event) {
	event.preventDefault();
	clearPreviousResults();

	const formData = new FormData(event.target);
	const data = await friendsSearchUser(formData);
	if (data)
		displaySearchResults(data.users);
}

// **** RENDER FUNCTIONS ****

function renderUserSearch() {
	const formUsers = document.getElementById('form-users');
	if (formUsers) {
		formUsers.addEventListener('submit', handleSearchForm);
	}
}

function renderFriends(friends) {
	const results = document.getElementById("friends");
	const friendsCount = document.getElementById("friends-count");
	if (friendsCount)
		friendsCount.textContent = friends.length;
	const membersContainer = document.createElement('div');
	membersContainer.classList.add("row");
	membersContainer.id = 'friends-list';
	friends.forEach(friend => {
		const card = document.createElement("div");
		card.setAttribute("data-username", friend.username);
		card.className = "col-sm-6 col-lg-4";
		card.innerHTML = `
			<div class="card hover-img">
				<div class="card-body p-4 text-center border-bottom">
					<img src="https://bootdey.com/img/Content/avatar/avatar1.png" alt="" class="rounded-circle mb-3" width="80" height="80">
					<h5 class="fw-semibold mb-0">@${friend.username}</h5>
				</div>
				<div class="px-2 py-2 bg-light text-center">
					<button class="btn btn-danger me-2 remove-friend" type="submit" data-dest="${friend.username}">Remove Friend</button>
				</div>
			</div>
		`;
		membersContainer.appendChild(card);
	});
	results.appendChild(membersContainer);
	addBtnEventListener('.remove-friend', deleteFriend)
}

function renderFriendRequests(friendRequests) {
	const results = document.getElementById("friend-requests");
	const requestsCount = document.getElementById("requests-count");
	if (requestsCount)
		requestsCount.textContent = friendRequests.length;
	const membersContainer = document.createElement('div');
	membersContainer.classList.add("row");
	membersContainer.id = 'requests-list2';
	friendRequests.forEach(friendRequest => {
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
		results.appendChild(membersContainer);
		addBtnEventListener('.accept-friend-request', handleFriendRequestButton, 'accept');
		addBtnEventListener('.decline-friend-request', handleFriendRequestButton, 'decline');
	});
}

function renderSentFriendRequests(sentFriendRequests) {
	const results = document.getElementById("sent-friend-requests");
	const requestsCount = document.getElementById("sent-requests-count");
	if (requestsCount)
		requestsCount.innerHTML = sentFriendRequests.length;
	const membersContainer = document.createElement('div');
	membersContainer.classList.add("row");
	membersContainer.id = 'sent-requests-list';
	sentFriendRequests.forEach(request => {
		const card = document.createElement("div");
		card.setAttribute("data-username", request.username);
		card.className = "col-sm-6 col-lg-4";
		card.innerHTML = `
			<div class="card hover-img">
				<div class="card-body p-4 text-center border-bottom">
					<img src="https://bootdey.com/img/Content/avatar/avatar1.png" alt="" class="rounded-circle mb-3" width="80" height="80">
					<h5 class="fw-semibold mb-0">@${request.username}</h5>
				</div>
				<div class="px-2 py-2 bg-light text-center">
					<button class="btn btn-danger me-2 delete-request" type="submit" data-dest="${request.username}">Delete request</button>
				</div>
			</div>
		`;
		membersContainer.appendChild(card);
	});
	results.appendChild(membersContainer);
	addBtnEventListener('.delete-request', deleteFriendRequest);
}

// **** MAIN LOAD FUNCTION ****

async function loadFriendsPage() {
	try {
		const {friends, friendRequests, sentFriendRequests} = await getFriendsData();

		renderUserSearch();
		renderFriends(friends);
		renderFriendRequests(friendRequests);
		renderSentFriendRequests(sentFriendRequests);
	}
	catch (error) {
		console.error("Error loading friends page: ", error);
	}
}

loadFriendsPage();