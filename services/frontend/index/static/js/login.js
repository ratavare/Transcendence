{
	document.getElementById('form-login')?.addEventListener('submit', async function(event) {
	
		event.preventDefault();
		const formData = new FormData(event.target);

		try {
			const data = await myFetch('https://localhost:8443/user_auth/login/' , formData);
			if (data.access && data.refresh) {
				console.log("Login successful");

				localStorage.setItem('access_token', data.access);
				localStorage.setItem('refresh_token', data.refresh);
			}
			seturl('/home');
		} catch (error) {
			console.log(error);
		}
	});
}