async function logoutFunc() {
    const url = 'https://localhost:8443/user_auth/logout/';
    if (location.hash === "#/logout") {
        myFetch(url, null, 'POST', true)
        .then(data => {
            if (data.status === 'success') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                seturl('/login');
                updateNavBarLogout();
            } else {
                console.log("Logout failed", data);
            }
        }).catch(error => {
            console.log('ERROR:', error);
        });
    } else {
        console.log('Incorrect URL hash');
    }
}

function updateNavBarLogout() {
    const navbarRight = document.querySelector('.navbar-nav.navbar-right');
    if (navbarRight) {
        navbarRight.innerHTML = `
            <li><a href="#/register"><span class="glyphicon glyphicon-user"></span> Sign Up</a></li>
            <li><a href="#/login"><span class="glyphicon glyphicon-log-in"></span> Login</a></li>
        `;
    }
}