
async function fillProfile(){
	try {
		const form = document.getElementById('form-center');
		const inputs = form.querySelectorAll('input');
		inputs[0].value = window.user.username;
		inputs[1].value = window.user.email;
		inputs[2].value = window.user.bio;
		inputs[3].value = window.user.birth_date;
	} catch (error) {
		console.error("Fetch error: ", error);
	}
}

{
	const formProfile = document.getElementById('form-profile');
	const saveChangesButton = document.getElementById('saveChangesButton');
	
	formProfile?.addEventListener('input', function() {
		saveChangesButton.classList.remove('hidden');
	});
	
	formProfile?.addEventListener('submit', async function(event) {
		event.preventDefault();
	
		const formData = new FormData(event.target);
		const fetch_url = 'https://localhost:8443/user_profile/profile/';
		myFetch(fetch_url, formData).then(data => {
			console.log("Profile: ", data);
			if (data.status === "success") {
				console.log("Profile change successful");
				seturl('/home');
			} else {
				console.log("Profile change failed. Reason:", data.errors);
				alert("Profile change failed. Reason:", data.errors);
			}
		})
	});
}

fillProfile();