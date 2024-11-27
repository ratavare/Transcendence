
async function logoutFunc() {
	const url = 'https://localhost:8443/user_auth/logout/';
	if (location.hash === "#/logout")
		myFetch(url).then(() => {
			seturl('/login');
		})
}