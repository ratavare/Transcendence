// *** friends.js

async function sendFriendRequest(dest, src) {
	try {
		await myFetch(
			`https://${MAIN_HOST}:8443/user_friends/friend-request-send/`,
			{ dest: dest, src: src },
			"POST",
			true
		);
		// console.log("Friend request sent!");
	} catch (error) {
		console.error("Error:", error);
	}
}

async function handleFriendRequestButton(src, dest, intention) {
	// console.log(src, dest, intention);
	try {
		return await myFetch(
			`https://${MAIN_HOST}:8443/user_friends/handle-friend-request/`,
			{ dest: dest, src: src, intention: intention },
			"POST",
			true
		);
	} catch (error) {
		console.error("Error: ", error);
	}
}

async function deleteFriend(src, dest) {
	// console.log("friend deleted");
	try {
		return await myFetch(
			`https://${MAIN_HOST}:8443/user_friends/delete-friend/`,
			{ dest: dest, src: src },
			"POST",
			true
		);
	} catch (error) {
		console.error("Error: ", error);
	}
}

async function deleteFriendRequest(src, dest) {
	try {
		return myFetch(
			`https://${MAIN_HOST}:8443/user_friends/delete-friend-request/`,
			{ dest: dest, src: src },
			"POST",
			true
		);
	} catch (error) {
		console.error("Error: ", error);
	}
}

async function friendsSearchUser(formData) {
	return myFetch(
		`https://${MAIN_HOST}:8443/user_friends/user_search/`,
		formData,
		"POST",
		true
	).catch((error) => {
		console.error("Error: ", error);
		return null;
	});
}

async function getFriendsData() { // Also in pms.js
	try {
		return await myFetch(
			`https://${MAIN_HOST}:8443/user_friends/api/`,
			null,
			"GET",
			true
		);
	} catch (error) {
		console.log(error);
	}
}

// *** profile.js

async function getForeignProfile(username) {
	try {
		return await myFetch(
			`https://${MAIN_HOST}:8443/user_profile/profile/${username}/`,
			null,
			"GET",
			true
		);
	} catch (error) {
		console.log(error);
	}
}
