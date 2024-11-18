{
	document.getElementById('form-login')?.addEventListener('submit', async function(event) {
	
		event.preventDefault();
		const formData = new FormData(event.target);
		return fetch('https://localhost:8443/user_auth/login/' , {
			method: 'POST',
			body: formData,
		}).then(response => {
			if (!response.ok)
				console.log("Login failed");
			else
			{	
				console.log("Login successful");
				seturl('/home');
			}
		})
	});
}