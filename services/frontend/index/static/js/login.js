{
	document.getElementById('form-login')?.addEventListener('submit', async function(event) {
	
		event.preventDefault();
		const formData = new FormData(event.target);

		try {
			const response = await fetch('https://localhost:8443/user_auth/login/' , {
				method: 'POST',
				body: formData,
			});
			const data = await response.json();
			if (!response.ok)
				throw data.error;
			console.log(data.message);
			seturl('/home');
		} catch (error) {
			console.log(error);
		}
	});
}