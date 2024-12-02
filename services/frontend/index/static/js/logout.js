async function logoutFunc() {
	if (location.hash === "#/logout")
	{
		try {
			await myFetch('https://localhost:8443/user_auth/logout/');
			seturl('/login');
		} catch(error) {
			console.log(error);
		}
	}
}