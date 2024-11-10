{
    const formRegister = document.getElementById("form-register");

    formRegister?.addEventListener('submit', function(event) {
        event.preventDefault();
        let formData = new FormData(event.target);
        for (const [key, value] of formData)
            console.log('key: ', key, ' | value: ', value);

        myFetch('register/', formData).then(data => {
            if (data.status === "success") {
                console.log("Registration successful");
                seturl('/home');
                updateNavBarLogin();
            } else {
                const messages = Object.values(data.errors)
                console.log("Registration Failed. Reasons: ", messages);
                messages.forEach(alert);
            }
        })
    });
}
