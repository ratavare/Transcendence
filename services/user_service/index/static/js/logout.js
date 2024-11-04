
async function logoutFunc() {
	if (location.hash === "#/logout")
		myFetch('logout/').then(() => {
			seturl('/');
			updateNavBarLogout();
		})
}

function updateNavBarLogout() {
	const navbarRight = document.querySelector('.navbar-nav.navbar-right');
	navbarRight.innerHTML = `
		<li><a href="#/register"><span class="glyphicon glyphicon-user"></span> Sign Up</a></li>
		<li><a href="#/login"><span class="glyphicon glyphicon-log-in"></span> Login</a></li>
	`;
}