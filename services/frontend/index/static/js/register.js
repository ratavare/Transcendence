{
	const formRegister = document.getElementById("form-register");

	formRegister?.addEventListener('submit', async function(event) {
		event.preventDefault();
		let formData = new FormData(event.target);
	
		try {
			const data = await myFetch('https://localhost:8443/user_auth/register/', formData, 'POST', false);
			if (data.access && data.refresh) {
				console.log("Registration successful", data);

				localStorage.setItem('access_token', data.access);
				localStorage.setItem('refresh_token', data.refresh);
				alert('Successfully Registered');
			}
			seturl('/home');
	
		} catch(error) {
			console.log('register.js: ', error);
			const messages = Object.values(error)
			console.log("Registration Failed. Reasons: ", messages);
			messages.forEach(alert);
		}
	});
}
