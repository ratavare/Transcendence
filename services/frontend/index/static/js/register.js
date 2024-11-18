{
	const formRegister = document.getElementById("form-register");

	formRegister?.addEventListener('submit', function(event) {
		event.preventDefault();
		let formData = new FormData(event.target);
	
		myFetch('https://localhost:8443/user_auth/register/', formData)
		.then(data => {
			if (data.status === "success") {
				console.log("Registration successful");
				seturl('/home');
			} else {
				const messages = Object.values(data.errors)
				console.log("Registration Failed. Reasons: ", messages);
				messages.forEach(alert);
			}
		}).catch(error => {
			console.log('EERROR:', error);
		})
	});
}
