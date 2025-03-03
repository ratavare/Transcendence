
// *** DOM UPDATES

async function addAcceptedFriendToFriendsList(dest) {
	const imageURL = await getProfileImage(dest);
	const friendsList = document.getElementById("friends-list");
	const card = document.createElement("div");
	card.setAttribute("data-username", dest);
	card.className = "col-sm-6 col-lg-4";
	card.innerHTML = `
		<div class="card hover-img">
			<div class="card-body p-4 text-center border-bottom">
				<img src="${imageURL}" class="profile-image" width="80" height="80">
				<h5 class="fw-semibold mb-0" style="color: white">@${dest}</h5>
			</div>
			<div class="px-2 py-2 text-center" style="background-color: #222222b1; border-bottom-left-radius: 1.1rem; border-bottom-right-radius: 1.1rem;">
				<button class="btn btn-outline-danger me-2 remove-friend" type="submit" data-dest="${dest}">Remove Friend</button>
			</div>
		</div>
	`;
	card.querySelector('img').addEventListener('click', () => {
		seturl(`/profile?username=${dest}`);
	})
	addBtnEventListener(
		card.querySelector("button"),
		deleteFriend,
		document.getElementById("friends-count")
	);
	friendsList.appendChild(card);
	increaseCounter(document.getElementById("friends-count"));
}

async function addPossibleFriendToSentFriendRequests(dest) {
	const imageURL = await getProfileImage(dest);
	const sentRequestsList = document.getElementById("sent-requests-list");
	const card = document.createElement("div");
	card.setAttribute("data-username", dest);
	card.className = "col-sm-6 col-lg-4";
	card.innerHTML = `
		<div class="card hover-img">
			<div class="card-body p-4 text-center border-bottom">
				<img src="${imageURL}" class="profile-image" width="80" height="80">
				<h5 class="fw-semibold mb-0" style="color: white">@${dest}</h5>
			</div>
			<div class="px-2 py-2 text-center" style="background-color: #222222b1; border-bottom-left-radius: 1.1rem; border-bottom-right-radius: 1.1rem;">
				<button class="btn btn-outline-danger me-2 delete-request" type="submit" data-dest="${dest}">Delete request</button>
			</div>
		</div>
	`;
	card.querySelector('img').addEventListener('click', () => {
		seturl(`/profile?username=${dest}`);
	})
	addBtnEventListener(
		card.querySelector("button"),
		deleteFriendRequest,
		document.getElementById("sent-requests-count")
	);
	sentRequestsList.appendChild(card);
	increaseCounter(document.getElementById("sent-requests-count"));
}

function decreaseCounter(counterElem) {
	if (counterElem) {
		const currCount = parseInt(counterElem.textContent);
		if (currCount > 0) counterElem.textContent = currCount - 1;
	}
}

function increaseCounter(counterElem) {
	if (counterElem) {
		const currCount = parseInt(counterElem.textContent);
		counterElem.textContent = currCount + 1;
	}
}

// *** UTILS ***

function addBtnEventListener(button, f, counterElem, ...arg) {
	button.addEventListener("click", () => {
		const dest = button.getAttribute("data-dest");
		f(dest, window.user.username, ...arg);
		const card = document.querySelector(`[data-username="${dest}"]`);
		card.classList.add("opacity-0", "transition-opacity");
		card.style.transition = "opacity 0.5s"; // Fade out fdddddd
		setTimeout(() => {
			card?.remove();
			if (button.classList.contains("accept-friend-request"))
				addAcceptedFriendToFriendsList(dest);
			if (button.classList.contains("send-friend-request"))
				addPossibleFriendToSentFriendRequests(dest);
			decreaseCounter(counterElem);
		}, 500); // se mexerem neste valor tem que por o mesmo valor no card.style.transition, 500ms = 0.5s
	});
}

// *** USER SEARCH ***

function displaySearchResults(users) {
	const results = document.getElementById("search-results");
	const membersCount = document.getElementById("members-count");
	if (membersCount) {
		membersCount.textContent = users.length;
	}

	const membersContainer = document.createElement("div");
	membersContainer.classList.add("row");
	membersContainer.id = "friends-search-list";

	users.forEach( async (user) => {
		if (document.querySelector(`[data-username="${user.username}"]`))
			return;
		const imageURL = await getProfileImage(user.username);
		const card = document.createElement("div");
		card.className = "col-sm-6 col-lg-4";
		card.setAttribute("data-username", user.username);
		card.innerHTML = `
		<div class="card hover-img">
			<div class="card-body p-4 text-center border-bottom">
				<img src="${imageURL}" class="profile-image" width="80" height="80">
				<h5 class="fw-semibold mb-0" style="color: white">@${user.username}</h5>
			</div>
			<div class="px-2 py-2 text-center" style="background-color: #222222b1; border-bottom-left-radius: 1.1rem; border-bottom-right-radius: 1.1rem;">
				<button class="btn btn-outline-success me-2 send-friend-request" data-dest="${user.username}" >Send Friend Request</button>
			</div>
		</div>
		`;
		card.querySelector('img').addEventListener('click', () => {
			seturl(`/profile?username=${user.username}`);
		})
		membersContainer.appendChild(card);
		addBtnEventListener(
			card.querySelector("button"),
			sendFriendRequest,
			membersCount
		);
	});
	results.appendChild(membersContainer);
}

function clearPreviousResults() {
	document.getElementById("friends-search-list")?.remove();
	document.getElementById("no-users")?.remove();
}

function displayNoUsersMessage() {
	const membersCount = document.getElementById("members-count");
	if (membersCount) {
		membersCount.textContent = "0";
	}
	const results = document.getElementById("search-results");
	const nousers = document.createElement("h4");
	nousers.id = "no-users";
	nousers.innerHTML = "No users found";
	results.appendChild(nousers);
}

async function handleSearchForm(event) {
	event.preventDefault();
	clearPreviousResults();

	const formData = new FormData(event.target);
	const data = await friendsSearchUser(formData);
	if (data) displaySearchResults(data.users);
	else displayNoUsersMessage();
}

// *** RENDER FUNCTIONS ***

function renderUserSearch() {
	const formUsers = document.getElementById("form-users");
	if (formUsers) {
		formUsers.addEventListener("submit", handleSearchForm);
	}
}

function renderFriends(friends) {
	const results = document.getElementById("friends");
	const friendsCount = document.getElementById("friends-count");
	if (friendsCount) friendsCount.textContent = friends.length;
	const membersContainer = document.createElement("div");
	membersContainer.classList.add("row");
	membersContainer.id = "friends-list";
	friends.forEach( async (friend) => {
		const imageURL = await getProfileImage(friend.username);
		const card = document.createElement("div");
		card.setAttribute("data-username", friend.username);
		card.className = "col-sm-6 col-lg-4";
		card.innerHTML = `
			<div class="card hover-img">
				<div class="card-body p-4 text-center border-bottom">
					<img src="${imageURL}" class="profile-image" width="80" height="80">
					<h5 class="fw-semibold mb-0" style="color: white">
						@${friend.username}
						<span class="status-text" data-username="${friend.username}">Offline</span>
					</h5>
				</div>
				<div class="px-2 py-2 text-center" style="background-color: #222222b1; border-bottom-left-radius: 1.1rem; border-bottom-right-radius: 1.1rem;">
					<button class="btn btn-outline-danger me-2 remove-friend" type="submit" data-dest="${friend.username}">Remove Friend</button>
				</div>
			</div>
		`;
		card.querySelector('img').addEventListener('click', () => {
			seturl(`/profile?username=${friend.username}`);
		})
		membersContainer.appendChild(card);
		addBtnEventListener(
			card.querySelector("button"),
			deleteFriend,
			friendsCount
		);
	});
	results.appendChild(membersContainer);
}

function renderFriendRequests(friendRequests) {
	const results = document.getElementById("friend-requests");
	const requestsCount = document.getElementById("requests-count");
	if (requestsCount) requestsCount.textContent = friendRequests.length;
	const membersContainer = document.createElement("div");
	membersContainer.classList.add("row");
	membersContainer.id = "requests-list2";
	friendRequests.forEach( async (friendRequest) => {
		const imageURL = await getProfileImage(friendRequest.username);
		const card = document.createElement("div");
		card.setAttribute("data-username", friendRequest.username);
		card.className = "col-sm-6 col-lg-4";
		card.innerHTML = `
		<div class="card hover-img">
			<div class="card-body p-4 text-center border-bottom">
				<img src="${imageURL}" class="profile-image" width="80" height="80">
				<h5 class="fw-semibold mb-0" style="color: white">@${friendRequest.username}</h5>
			</div>
			<div class="px-2 py-2 text-center" style="background-color: #222222b1; border-bottom-left-radius: 1.1rem; border-bottom-right-radius: 1.1rem;">
				<button class="btn btn-outline-success me-2 accept-friend-request" type="submit" data-dest="${friendRequest.username}">Accept</button>
				<button class="btn btn-outline-danger me-2 decline-friend-request" type="submit" data-dest="${friendRequest.username}">Decline</button>
			</div>
		</div>
		`;
		card.querySelector('img').addEventListener('click', () => {
			seturl(`/profile?username=${friendRequest.username}`);
		})
		membersContainer.appendChild(card);
		addBtnEventListener(
			card.querySelector(".accept-friend-request"),
			handleFriendRequestButton,
			requestsCount,
			"accept"
		);
		addBtnEventListener(
			card.querySelector(".decline-friend-request"),
			handleFriendRequestButton,
			requestsCount,
			"decline"
		);
	});
	results.appendChild(membersContainer);
}

function renderSentFriendRequests(sentFriendRequests) {
	const results = document.getElementById("sent-friend-requests");
	const requestsCount = document.getElementById("sent-requests-count");
	if (requestsCount) requestsCount.innerHTML = sentFriendRequests.length;
	const membersContainer = document.createElement("div");
	membersContainer.classList.add("row");
	membersContainer.id = "sent-requests-list";
	sentFriendRequests.forEach( async (request) => {
		const imageURL = await getProfileImage(request.username);
		const card = document.createElement("div");
		card.setAttribute("data-username", request.username);
		card.className = "col-sm-6 col-lg-4";
		card.innerHTML = `
			<div class="card hover-img">
				<div class="card-body p-4 text-center border-bottom">
					<img src="${imageURL}" class="profile-image" width="80" height="80">
					<h5 class="fw-semibold mb-0" style="color: white">@${request.username}</h5>
				</div>
				<div class="px-2 py-2 text-center" style="background-color: #222222b1; border-bottom-left-radius: 1.1rem; border-bottom-right-radius: 1.1rem;">
					<button class="btn btn-outline-danger me-2 delete-request" type="submit" data-dest="${request.username}">Delete request</button>
				</div>
			</div>
		`;
		card.querySelector('img').addEventListener('click', () => {
			seturl(`/profile?username=${request.username}`);
		})
		membersContainer.appendChild(card);
		addBtnEventListener(
			card.querySelector("button"),
			deleteFriendRequest,
			requestsCount
		);
	});
	results.appendChild(membersContainer);
}

// *** MAIN LOAD FUNCTION ***

async function loadFriendsPage() {
	try {
		const { friends, friendRequests, sentFriendRequests } =
			await getFriendsData();

		renderUserSearch();
		renderFriends(friends);
		renderFriendRequests(friendRequests);
		renderSentFriendRequests(sentFriendRequests);
	} catch (error) {
		console.error("Error loading friends page: ", error);
	}
}

loadFriendsPage();
console.log(JSON.parse(sessionStorage.getItem("onlineUsers")) || 'Undefined')
