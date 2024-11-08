if (typeof formLogin === "undefined") {
	const formLogin = document.getElementById('form-login');
	
	formLogin?.addEventListener('submit', async function(event) {
	
		event.preventDefault();
	
		const formData = new FormData(event.target);
		for await (const [key, value] of formData)
			console.log('key: ', key, ' | value: ', value);
	
		myFetch('login/', formData).then(data => {
			if (data === undefined)
				console.log("Login failed");
			else
				console.log("Login successful");
			seturl('/home');
			updateNavBarLogin();
		})
	});
}