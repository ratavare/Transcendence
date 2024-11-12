
const fetch_url = 'https://localhost:8443/user_profile/profile/';

async function getProfile(){
	try {
		console.log("Fetch url:", fetch_url);
		const response = await fetch(fetch_url);
		if(!response.ok) {
			throw new Error("Response not ok: ", response.status);
		}
		const data = await response.json();
		const form = document.getElementById('form-center');
		// console.log("Data.form: ", data.form);
		if (data.form){
			form.innerHTML = data.form
		} else {
			throw new Error("Form error");
		}
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
		// for await (const [key, value] of formData)
		// 	console.log('key', key, '| value: ', value);
	
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

getProfile();