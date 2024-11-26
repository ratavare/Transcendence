{
    const formRegister = document.getElementById("form-register");

    formRegister?.addEventListener('submit', function(event) {
        event.preventDefault();
        let formData = new FormData(event.target);

        const fetch_url = 'https://localhost:8443/user_auth/register/';
        myFetch(fetch_url, formData, 'POST', false)
        .then(data => {
            if (data.status === "success") {
                console.log("Registration successful");
                if (data.access && data.refresh) {
                    localStorage.setItem('access_token', data.access);
                    localStorage.setItem('refresh_token', data.refresh);
                }
                seturl('/home');
            } else {
                const messages = Object.values(data.errors || {});
                console.log("Registration Failed. Reasons: ", messages);
                messages.forEach(alert);
            }
        }).catch(error => {
            console.log('ERROR:', error);
        });
    });
}