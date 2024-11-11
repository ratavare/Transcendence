{
	document.getElementById('form-login')?.addEventListener('submit', async function(event) {
	
		event.preventDefault();
	
		const formData = new FormData(event.target);
		for await (const [key, value] of formData)
			console.log('key: ', key, ' | value: ', value);
	
		myFetch('user_management:8001/user_auth/login/', formData).then(data => {
			if (data === undefined)
				console.log("Login failed");
			else
				console.log("Login successful");
			seturl('/home');
			updateNavBarLogin();
		})
	});
}