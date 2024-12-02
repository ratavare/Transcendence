{
    const formRegister = document.getElementById("form-register");

	formRegister?.addEventListener('submit', async function(event) {
		event.preventDefault();
		let formData = new FormData(event.target);
	
		try {
			const data = await myFetch('https://localhost:8443/user_auth/register/', formData)
			console.log("Registration successful", data);
			seturl('/home');
	
		} catch(error) {
			console.log('register.js: ', error);
			const messages = Object.values(error)
			console.log("Registration Failed. Reasons: ", messages);
			messages.forEach(alert);
		}
	});
}
