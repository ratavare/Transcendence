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
		if (data === undefined)
			console.log("Profile change failed");
		else
			console.log("Profile change successful");
		seturl('/home');
	})
});