const formProfile = document.getElementById('form-profile');
const saveChangesButton = document.getElementById('saveChangesButton');

formProfile?.addEventListener('input', function() {
	saveChangesButton.classList.remove('hidden');
});

formProfile?.addEventListener('submit', async function(event) {
	event.preventDefault();

	const formData = new FormData(event.target);
	for await (const [key, value] of formData)
		console.log('key', key, '| value: ', value);

	myFetch('profile/', formData).then(data => {
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