
window.addEventListener('hashchange', function() {
	const hash = window.location.hash;

	console.log('hash: ', hash);
	if (hash === '#/profile/friends')
		myFetch('profile/friends/').then(() => {
			console.log("Friend page redirection successful");
			seturl('/profile/friends');
	})
});