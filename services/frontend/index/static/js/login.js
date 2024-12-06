{
    document.getElementById('form-login')?.addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        try {
            const data = await myFetch('https://localhost:8443/user_auth/login/', formData, 'POST', false);
            if (data.access && data.refresh) {
                console.log("Login successful");

                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                localStorage.setItem('is_2fa_enabled', data.is_2fa_enabled);
				// alert('Successfully Logged In');
            }
            seturl('/home');
        } catch (error) {
            console.log('Login failed. Errors: ', error);
			alert(error);
            // const messages = Object.values(error).join(' ');
            // console.log("Login Failed. Reasons: ", messages);
            // alert(messages);
        }
    });
}