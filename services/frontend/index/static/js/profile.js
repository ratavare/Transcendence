async function updateProfile(formData) {
	try {
		console.log(formData);
		await myFetch('https://localhost:8443/user_profile/profile/', formData, 'POST', true)
		window.location.reload();
	} catch(error) {
		console.log("Profile change failed. Reason:", error);
		alert("Profile change failed. Reason:", error);
	}
}

async function uploadProfilePicture(file) {
	try {
		const formData = new FormData();
		formData.append('profile_picture', file);

		await myFetch(`https://localhost:8443/user_profile/profile/picture/${window.user.username}/`, formData, 'POST', true);

		alert('Profile picture updated successfully!');
		window.location.reload(); // Refresh might not be the best way
	} catch (error) {
		console.error("Error uploading profile picture:", error);
		alert('Failed to upload profile picture. Please try again.');
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
	} catch (error) {
		console.error("Fetch error: ", error);
	}
}

async function getForeignProfile(username) {
	try {
		return await myFetch(
			`https://localhost:8443/user_profile/profile/${username}/`,
			null,
			"GET",
			true
		);
	} catch (error) {
		console.log(error);
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

async function run() {
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
	}
	else {
		user = window.user;
		document.getElementById('file-input').addEventListener('change', function (event) {
			const file = event.target.files[0];
			if (file) {
				if (file.size > 2 * 1024 * 1024) {
					alert('File size must be less than 2MB.');
					return;
				}
				if (!file.type.startsWith('image/')) {
					alert('Please upload a valid image file.');
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
		saveChangesButton.classList.add("hidden");

        formProfile.addEventListener('input', function () {
            saveChangesButton.classList.remove('hidden');
        });
    }
	formProfile?.addEventListener('submit', async function(event) {
		event.preventDefault();
		const formData = new FormData(event.target);
		updateProfile(formData);
	});
}

run();
