
async function getMatchHistory(username) {
	try {
		return await myFetch(
			`https://localhost:8443/match_history/${username}/`,
			null,
			"GET",
			true
		);
	} catch (error) {
		console.log(error);
	}
}

async function updateProfile(formData) {
	try {
		console.log(formData);
		await myFetch('https://localhost:8443/user_profile/profile/', formData, 'POST', true)
		window.location.reload();
	} catch(error) {
		console.log("Profile change failed. Reason:", error);
		showErrorModal("Profile change failed. Make sure that the username is unique and that both email and birth date are valid.");
	}
}

async function uploadProfilePicture(file) {
	try {
		const formData = new FormData();
		formData.append('profile_picture', file);

		await myFetch(`https://localhost:8443/user_profile/profile/picture/${window.user.username}/`, formData, 'POST', true);

		//showErrorModal('Profile picture updated successfully!');
		window.location.reload(); // Refresh might not be the best way
	} catch (error) {
		console.error("Error uploading profile picture:", error);
		showErrorModal("Profile picture change failed.");
	}
}

async function fillProfile(user) {
	try {
		document.getElementById('profile-username').innerText = user.username;
		document.getElementById('profile-fullname').innerText = user.full_name || "";
		document.getElementById('profile-email').innerText = user.email;
		document.getElementById('profile-bio').innerText = user.bio || "";
		document.getElementById('profile-city').innerText = user.city || "";
		document.getElementById('profile-birth-date').innerText = user.birth_date || "";
		document.getElementById('profile-wins').innerText = user.wins || 0;
		document.getElementById('profile-losses').innerText = user.losses || 0;
	} catch (error) {
		console.error("Fetch error: ", error);
	}
}

function editProfile() {
	document.getElementById('profile-view').style.display = 'none';
	document.getElementById('profile-edit').style.display = 'block';
	document.getElementById('username-edit').value = window.user.username;
	document.getElementById('full_name-edit').value = window.user.full_name;
	document.getElementById('email-edit').value = window.user.email;
	document.getElementById('bio-edit').value = window.user.bio || "";
	document.getElementById('city-edit').value = window.user.city || "";
	document.getElementById('id-date').value = window.user.birth_date;

	// Disable username input if the user logged in via Intra
	if (window.user.intra_login) {
		document.getElementById("username-edit").disabled = true;
	}
}

function cancelEdit() {
	document.getElementById('profile-view').style.display = 'block';
	document.getElementById('profile-edit').style.display = 'none';
}

async function renderProfile() {
	document.getElementById('change-photo-button').addEventListener('click', () => {
		document.getElementById('file-input').click();
	});

	const username = window.props.get('username');
	let user;
	if (username) {
		user = await getForeignProfile(username);
		if (!user)
			seturl('/home'); // IMPLEMENTAR 404
		document.getElementById('profile-h1').innerHTML = `${username}'s Profile`
		document.getElementById('change-photo-button').classList.add('hidden');
		document.getElementById('edit-profile-btn').classList.add('hidden');
		propsException = true;
	}
	else {
		user = window.user;
		document.getElementById('file-input').addEventListener('change', function (event) {
			const file = event.target.files[0];
			if (file) {
				if (file.size > 2 * 1024 * 1024) {
					showErrorModal('File size must be less than 2MB.');
					return;
				}
				if (!file.type.startsWith('image/')) {
					showErrorModal('Please upload a valid image file.');
					return;
				}
				uploadProfilePicture(file);
			}
		});
	}
	const profilePicURl = await getProfileImage(user.username);
	document.getElementById('profile-pic').src = profilePicURl;
	fillProfile(user);

	const formProfile = document.getElementById('form-profile');
	const saveChangesButton = document.getElementById('saveChangesButton');
	
	if (formProfile && saveChangesButton) {
		document.getElementById('saveChangesButton').disabled = true;
		formProfile.addEventListener('input', function () {
			document.getElementById('saveChangesButton').disabled = false;
		});
	}
	formProfile?.addEventListener('submit', async function(event) {
		event.preventDefault();
		const formData = new FormData(event.target);
		updateProfile(formData);
	});
}

function formatDate(isoString) {
    const date = new Date(isoString);

    const formattedDate = date.toLocaleString("en-EN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "long",  
        year: "numeric"
    });

    return formattedDate; 
}

async function renderMatchHistory() {
	const matchHistoryDiv = document.getElementById('match-history');
	const username = window.props.get('username') || window.user.username
	const matchHistory = await getMatchHistory(username);
	if (matchHistory.length == 0) {
		const noMatchWrapper = document.createElement('div');
		noMatchWrapper.classList.add('no-matches');
		const paragraph = document.createElement('p');
		paragraph.innerHTML = 'No matches played yet.';
		noMatchWrapper.appendChild(paragraph);
		matchHistoryDiv.appendChild(noMatchWrapper);
		return ;
	}
	matchHistory.forEach(match => {
		console.log(match);
		const matchEntry = document.createElement('div');
		matchEntry.classList.add('match-result');

		const dateSpan = document.createElement('span');
		dateSpan.classList.add('match-date');
		dateSpan.innerHTML = formatDate(match.date);

		const matchDetailsDiv = document.createElement('div');
		matchDetailsDiv.classList.add('match-details');

		const playerASpan = document.createElement('span');
		playerASpan.classList.add('match-player');
		playerASpan.innerHTML = username;

		const playerBSpan = document.createElement('span');
		playerBSpan.classList.add('match-player');
		playerBSpan.innerHTML = match.users.filter(user => user !== username)[0];

		const scoreSpan = document.createElement('span');
		scoreSpan.classList.add('match-points');
		const playerAScore = Math.max(match.player1Score, match.player2Score);
		const playerBScore = Math.min(match.player1Score, match.player2Score);

		const matchOutcomeSpan = document.createElement('span');
		if (match.winner === username) {
			scoreSpan.innerHTML = `${playerAScore} - ${playerBScore}`;
			matchOutcomeSpan.classList.add('match-outcome');
			matchOutcomeSpan.classList.add('win');
			matchOutcomeSpan.innerHTML = 'Win';
		}
		else {
			scoreSpan.innerHTML = `${playerBScore} - ${playerAScore}`;
			matchOutcomeSpan.classList.add('match-outcome');
			matchOutcomeSpan.innerHTML = 'Loss';
		}

		matchDetailsDiv.appendChild(playerASpan);
		matchDetailsDiv.appendChild(scoreSpan);
		matchDetailsDiv.appendChild(playerBSpan);

		matchEntry.appendChild(dateSpan);
		matchEntry.appendChild(matchDetailsDiv);
		matchEntry.appendChild(matchOutcomeSpan);

		matchHistoryDiv.appendChild(matchEntry)
	});
}

async function renderProfilePage() {
	renderProfile();
	renderMatchHistory();
}

renderProfilePage();
