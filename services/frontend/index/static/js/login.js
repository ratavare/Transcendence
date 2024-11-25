document.getElementById('form-login')?.addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value;
    });
    const formJSON = JSON.stringify(formObject);

    const fetch_url = 'https://localhost:8443/user_auth/login/';
    myFetch(fetch_url, formJSON, 'POST', false)
    .then(data => {
        if (data.access && data.refresh) {
            console.log("Login successful");
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            seturl('/home');
        } else {
            console.log("Login failed");
        }
    }).catch(error => {
        console.log('ERROR:', error);
    });
});