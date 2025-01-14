
// ************************************* WEBSOCKET ************************************************
{

function sendPayload(type, payload) {
	socket.send(
		JSON.stringify({
			type: type,
			payload: payload,
		})
	);
}

const tournament_id = window.props.get("id");
const token = localStorage.getItem("tournamentPlayerToken") || "";
const socket = new WebSocket(
	`wss://localhost:8443/pong/t/${encodeURIComponent(
		tournament_id
	)}/?token=${token}`
);

socket.onmessage = function (event) {
	const data = JSON.parse(event.data);
	switch (data.type) {
		case "token":
			localStorage.setItem("tournamentPlayerToken", data.payload);
			break;
		case "log":
			console.log(data.payload);
			break;
		case "error":
			socket.close();
			seturl("/home");
		case "message":
			receiveChatMessage(data.payload);
	}
}

socket.onopen = async () => {
	sendPayload("message", {
		sender: "connect",
		content: `${window.user.username} joined the lobby!`,
	});
};

socket.onclose = () => {
	console.log("Socket closed unexpectedly");
	// seturl("/home");
};

window.onbeforeunload = () => {
	sendMessage("disconnect", `${window.user.username} left the lobby`);
};

PageElement.onUnload = () => {
	sendMessage("disconnect", `${window.user.username} left the lobby`);

	// socket.close();

	PageElement.onUnload = () => {};
};

}

// **************************************** HTML **************************************************


{
	const playerSpanDivs = document.querySelectorAll(".player-div")
	let i = 1;
	playerSpanDivs.forEach((div) => {
		div.addEventListener('click', (event) => {
			let span = div.querySelector(".player-span");
			span.textContent = window.user.username;
			// let img = div.querySelector("img");
			// img.src = 'path/to/img/'
		})
	})
}

// **************************************** CHAT **************************************************

function receiveChatMessage(payload) {
	let color = "white";
	const messageList = document.getElementById("chat-message-list-tournament");
	const messageListItem = document.createElement("li");
	const chatContentElement = document.getElementById("chat-content-tournament");

	if (payload.sender == "connect" || payload.sender == "disconnect") {
		if (payload.sender == "connect") color = "limegreen";
		if (payload.sender == "disconnect") color = "red";
		messageListItem.innerHTML = `<i style="color: ${color}">${payload.content}</i>`;
	} else {
		if (payload.sender == window.user.username) color = "orangered";
		messageListItem.innerHTML = `
			<b style="color: ${color}">${payload.sender}: </b>
			<span>${payload.content}</span>
			`;
	}
	messageList.appendChild(messageListItem);
	if (chatContentElement) {
		chatContentElement.scrollTop = chatContentElement.scrollHeight;
	}
}

function sendMessage(sender, content) {
	sendPayload("message", {
		sender: sender,
		content: content,
	});
}

/* async function getChat() {
	try {
		const data = await myFetch(
			`https://localhost:8443/lobby/lobbies/${lobby_id}/`,
			null,
			"GET",
			true
		);
		for (const message of data.lobby.chat) {
			receiveChatMessage(message);
		}
	} catch (error) {
		console.log(error);
	}
} */

function messageForm() {
	const chatInputForm = document.getElementById("chat-input-form-tournament");
	chatInputForm.addEventListener("submit", (event) => {
		event.preventDefault();

		const chatInput = event.target.querySelector("#chat-input-tournament");
		if (chatInput.value) sendMessage(window.user.username, chatInput.value);
		chatInput.value = "";
	});
}

messageForm();