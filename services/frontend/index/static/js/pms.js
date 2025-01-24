
// *** FETCHES ***

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

async function getMessages(conversationId) {
	try {
		return await myFetch(
			`https://localhost:8443/user_messages/conversations/${conversationId}/`,
			null,
			"GET",
			true
		);
	} catch (error) {
		console.error(error);
		return null;
	}
}

async function startConversation(friend) {
	try {
		return await myFetch(
			`https://localhost:8443/user_messages/conversations/create/${friend}/`,
			null,
			"POST",
			true
		);
	} catch (error) {
		console.error(error);
	}
}

// *** WEB SOCKET ***

function setUpWS(conversation) {
	const chatSocket = new WebSocket(`wss://localhost:8443/chat/${conversation.id}/`);
	chatSocket.onmessage = function (event) {
		const data = JSON.parse(event.data);
		const messagesDiv = document.getElementById('messages');
		if (data.sender !== window.user.username)
			renderRecievedMessage(messagesDiv, data.message);
		else
			renderSentMessage(messagesDiv, data.message);
	}
	chatSocket.onclose = function (e) {
		console.log(`Closed connection: ${conversation.id}`);
	}
	chatSocket.onopen = function (e) {
		console.log(`Opened connection: ${conversation.id}`);
	}
	document.getElementById('message-form').addEventListener('submit', (event) => {
		event.preventDefault();

		const input = document.getElementById('message-input');
		message_content = input.value.trim();

		if (!message_content)
			return ;
		if (!chatSocket || chatSocket.readyState !== WebSocket.OPEN)
			return ;

		chatSocket.send(JSON.stringify({
			message: message_content,
			sender : window.user.username
		}));

		input.value = '';
	})
	return chatSocket;
}

// *** FILTERING ***

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
			resultItem.onclick = async () => {
				const conversation = await startConversation(friend.username);
				await renderMessages(conversation);
				document.getElementById('chat-header').innerHTML = conversation.participants[1].username;
				activeSocket?.close();
				activeSocket = setUpWS(conversation);
			};
			resultsDropdown.appendChild(resultItem);
			matches++;
		}
	});

	resultsDropdown.style.display = matches > 0 ? 'block' : 'none';
}

// *** DOM UPDATES ***

function renderRecievedMessage(parentElem, content) {
	const messageWrapper = document.createElement('div')
	const messageItem = document.createElement('div');
	messageWrapper.classList.add('text-start', 'mb-3');
	messageItem.classList.add('message', 'received', 'py-2', 'px-3', 'rounded');
	messageItem.innerHTML = content;
	messageWrapper.appendChild(messageItem);
	parentElem.appendChild(messageWrapper);
}

function renderSentMessage(parentElem, content) {
	const messageWrapper = document.createElement('div')
	const messageItem = document.createElement('div');
	messageWrapper.classList.add('text-end', 'mb-3');
	messageItem.classList.add('message', 'text-end', 'mb-3', 'sent', 'py-2', 'px-3', 'rounded');
	messageItem.innerHTML = content;
	messageWrapper.appendChild(messageItem);
	parentElem.appendChild(messageWrapper);
}

async function renderMessages(conversation) {

	document.querySelector('.chat-header').style.display = 'block';
	document.getElementById('chat-input').style.display = 'block';

	const messagesDiv = document.getElementById('messages');
	messagesDiv.style.borderRadius = 0;
	messagesDiv.innerHTML = '';

	messages = await getMessages(conversation.id);
	if (messages) {
		messages.forEach((message) => {
			if (message.sender.username === window.user.username)
				renderSentMessage(messagesDiv, message.content);
			else
				renderRecievedMessage(messagesDiv, message.content);
		})
	}
}

function renderActiveConversations(conversations) {
	const users_sidebar = document.getElementById('users-sidebar');
	conversations.forEach((conversation) => {
		const list_element = document.createElement('li');
		list_element.classList.add("list-group-item", "list-group-item-action");
		const username = conversation.participants[1].username
		list_element.innerHTML = username;
		list_element.addEventListener('click', async () => {
			const chat_header = document.getElementById('chat-header');
			if (chat_header.innerHTML === username)
				return ;
			chat_header.innerHTML = username;
			await renderMessages(conversation);

			activeSocket?.close();
			activeSocket = setUpWS(conversation);
		})
		users_sidebar.appendChild(list_element)
	})
}

async function loadPmsPage() {
	document.getElementById('friend-search').addEventListener('input', filterFriends);

	const conversations = await getConversations();
	renderActiveConversations(conversations);
}

let activeSocket;
loadPmsPage();