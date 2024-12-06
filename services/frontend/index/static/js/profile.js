async function fillProfile(){
	try {
		const form = document.getElementById('form-center');
		document.getElementById('username').innerText = window.user.username;
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

function editProfile() {
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('profile-edit').style.display = 'block';

    document.getElementById('username-edit').value = window.user.username;
	document.getElementById('id-email').value = window.user.email;
	document.querySelector('input[name="bio"]').value = window.user.bio || "";
	document.querySelector('input[name="city"]').value = window.user.city || "";
	document.getElementById('id-date').value = window.user.birth_date;
}

{
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

		try {
			await myFetch('https://localhost:8443/user_profile/profile/', formData, 'POST', true)
			console.log("Profile change successful");
			seturl('/home');
		} catch(error) {
			console.log("Profile change failed. Reason:", error);
			alert("Profile change failed. Reason:", error);
		}
	});

}

fillProfile();