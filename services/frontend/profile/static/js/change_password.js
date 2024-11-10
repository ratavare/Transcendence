/* const formChangePassword = document.getElementById('change_password');

formChangePassword?.addEventListener('submit', async function(event) {
	
	event.preventDefault();

	const formData = new FormData(event.target);
	for await (const [key, value] of formData)
		console.log('key: ', key, ' | value: ', value);

	myFetch('account/change_password/', formData).then(data => {
		if (data === undefined)
			console.log("Change Password failed");
		else
			console.log("Change Password successful");
		seturl('/profile');
	})
}) */

window.addEventListener('submit', function() {
	const hash = window.location.hash;

	if (hash === '#/profile/account/change_password/')
		myFetch('profile/account/change_password/').then(() => {
			console.log("Change password page redirection successful");
			seturl('/profile/account/change_password');
	})
})