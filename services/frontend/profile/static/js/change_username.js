
/* const formChangeUsername = document.getElementById('change_username');

formChangeUsername?.addEventListener('submit', async function(event) {
	
	event.preventDefault();

	const formData = new FormData(event.target);
	for await (const [key, value] of formData)
		console.log('key: ', key, ' | value: ', value);

	myFetch('account/change_username/', formData).then(data => {
		if (data === undefined)
			console.log("Change username failed");
		else
			console.log("Change username successful");
		seturl('/profile');
	})
}) */

window.addEventListener('hashchange', function() {
	const hash = window.location.hash;

	if (hash === '#/profile/account/change_username/')
		myFetch('profile/account/change_username/').then(() => {
			console.log("Change username page redirection successful");
			seturl('/profile/account/change_username');
	})
})