
async function getFriends() {
	try {
		const data = await getFriendsData();
		return data.friends;
	}
	catch (error) {
		console.error("Error: ", error);
	}
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

	resultsDropdown.style.display = matches > 0 ? 'block' : 'none';
}

function renderMessages(conversation) {
	const messagesDiv = document.getElementById('messages');
	messagesDiv.innerHTML = '';

	conversation.messages.forEach((message) => {
		const messageWrapper = document.createElement('div')
		const messageItem = document.createElement('div');
		if (message.sender.username === window.user.username) {
			messageWrapper.classList.add('text-end', 'mb-3');
			messageItem.classList.add('message', 'text-end', 'mb-3', 'sent', 'py-2', 'px-3', 'rounded');
			messageItem.innerHTML = message.content;
		}
		else {
			messageWrapper.classList.add('text-start', 'mb-3');
			messageItem.classList.add('message', 'received', 'py-2', 'px-3', 'rounded');
			messageItem.innerHTML = message.content;
		}
		messageWrapper.appendChild(messageItem);
		messagesDiv.appendChild(messageWrapper);
	})
}

function renderActiveConversations(conversations) {
	const users_sidebar = document.getElementById('users-sidebar');
	conversations.forEach((conversation) => {
		const list_element = document.createElement('li');
		list_element.classList.add("list-group-item", "list-group-item-action");
		const username = conversation.participants[0].username
		list_element.innerHTML = username;
		list_element.addEventListener('click', () => {
			const chat_header = document.getElementById('chat-header');
			if (chat_header.innerHTML === username)
				return ;
			chat_header.innerHTML = username;
			renderMessages(conversation);
		})
		users_sidebar.appendChild(list_element)
	})
}

async function loadPmsPage() {
	document.getElementById('friend-search').addEventListener('input', filterFriends);

	const conversations = await getConversations();
	renderActiveConversations(conversations);
}

loadPmsPage();

document.getElementById('message-form').addEventListener('submit', (event) => {
	event.preventDefault();
})




























const chatSocket = new WebSocket(`wss://localhost:8443/chat/${window.user.username}/`);

chatSocket.onmessage = function (event) {
	console.log(JSON.parse(event.data).message);
}

chatSocket.onclose = function (e) {
    console.log(e);
}

// chatSocket.onopen = function (e) {
//     console.log(e.data.message);
// }
