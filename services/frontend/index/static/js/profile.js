async function updateProfile(formData) {
	try {
		await myFetch('https://localhost:8443/user_profile/profile/', formData, 'POST', true)
		console.log("Profile change successful");
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

		await myFetch('https://localhost:8443/user_profile/profile/picture/', formData, 'POST', true);

		alert('Profile picture updated successfully!');
		window.location.reload(); // Refresh might not be the best way
	} catch (error) {
		console.error("Error uploading profile picture:", error);
		alert('Failed to upload profile picture. Please try again.');
	}
}

async function fillProfile(){
	try {
		const form = document.getElementById('form-center');
		document.getElementById('profile-username').innerText = window.user.username; // MUDAR ID'S OU PEGAR DO PAGE ELEMENT EM VEZ DE DOCUMENT
        document.getElementById('fullname').innerText = window.user.full_name || "";
        document.getElementById('email').innerText = window.user.email;
        document.getElementById('bio').innerText = window.user.bio || "";
        document.getElementById('city').innerText = window.user.city || "";
        document.getElementById('birth-date').innerText = window.user.birth_date;
        document.getElementById('username-edit').value = window.user.username;
        document.getElementById('id-email').value = window.user.email;
        document.querySelector('input[name="bio"]').value = window.user.bio || "";
        document.querySelector('input[name="city"]').value = window.user.city || "";
        document.getElementById('id-date').value = window.user.birth_date;
	} catch (error) {
		console.error("Fetch error: ", error);
	}
}

async function getProfileImage() {
    try {
		const response = await myImageFetch('https://localhost:8443/user_profile/profile/picture/', null, 'GET', true);
        if (response.ok) {
            const contentType = response.headers.get('Content-Type');
            
            if (contentType && contentType.startsWith('image/')) {
                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);
                document.getElementById('profile-pic').src = imageUrl;
            } else {
                console.error("Expected image but received:", contentType);
            }
        } else {
            const errorText = await response.text();
            console.error("Error fetching profile image:", errorText);
			document.getElementById('profile-pic').src = '/static/assets/melhor_icone.png';
        }
    } catch (error) {
        console.error("Fetch error: ", error);
    }
}

function editProfile() {
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('profile-edit').style.display = 'block';
    document.getElementById('username-edit').value = window.user.username;
	document.getElementById('id-email').value = window.user.email;
	document.querySelector('input[name="bio"]').value = window.user.bio || "";
	document.querySelector('input[name="city"]').value = window.user.city || "";
	document.getElementById('id-date').value = window.user.birth_date;
}

async function run() {
	document.getElementById('change-photo-button').addEventListener('click', function () {
		document.getElementById('file-input').click();
	});
	
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

	await getProfileImage();
	fillProfile();

	const formProfile = document.getElementById('form-profile');
	const saveChangesButton = document.getElementById('saveChangesButton');
	
	if (formProfile && saveChangesButton) {
        saveChangesButton.classList.add('hidden');

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