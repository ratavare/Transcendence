
async function getFriends() {
	try {
		const data = await getFriendsData();
		return data.friends;
	}
	catch (error) {
		console.error("Error: ", error);
	}
}

async function filterFriends() {
	const input = document.getElementById('friend-search');
	const filter = input.value.toLowerCase();
	const resultsDropdown = document.getElementById('search-results');
	const friends = await getFriends();

	resultsDropdown.innerHTML = '';
	
	if (filter === '') {
		resultsDropdown.style.display = 'none';
		return;
	}

	let matches = 0;
	friends.forEach(friend => {
		const friendName = friend.username.toLowerCase();
		if (friendName.includes(filter)) {
			const resultItem = document.createElement('li');
			resultItem.className = 'dropdown-item';
			resultItem.textContent = friend.username;
			resultItem.onclick = () => {
				// Needs implementation
				
			};
			resultsDropdown.appendChild(resultItem);
			matches++;
		}
	});

	// Show or hide the dropdown based on matches
	resultsDropdown.style.display = matches > 0 ? 'block' : 'none';
}

async function getConversations() {
	try {
		return await myFetch(
			"https://localhost:8443/user_messages/conversations/",
			null,
			"GET",
			true
		);
	} catch (error) {
		console.error(error);
	}
}

function renderActiveConversations(conversations) {
	const users_sidebar = document.getElementById('users-sidebar');
	conversations.forEach( (conversation) => {
		const list_element = document.createElement('li');
		list_element.classList.add("list-group-item", "list-group-item-action");
		list_element.innerHTML = conversation.participants[0].username;
		list_element.addEventListener('click', () => {
			// renderMessages(conversation); // Missing implementation
		})
		users_sidebar.appendChild(list_element)
	})
}

async function loadPmsPage() {
	const conversations = await getConversations();
	renderActiveConversations(conversations);
}

loadPmsPage();




























const chatSocket = new WebSocket(`wss://localhost:8443/chat/${window.user.username}/`);

chatSocket.onmessage = function (event) {
	console.log(JSON.parse(event.data).message);
}

// chatSocket.onclose = function (e) {
//     console.log(e);
// }

// chatSocket.onopen = function (e) {
//     console.log(e.data.message);
// }
