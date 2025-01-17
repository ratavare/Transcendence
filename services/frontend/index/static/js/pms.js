async function getFriendsData() {
	try {
		return await myFetch(
			"https://localhost:8443/user_friends/api/",
			null,
			"GET",
			true
		);
	} catch (error) {
		console.log(error);
	}
}

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
