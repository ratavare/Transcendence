
window.onhashchange = logoutFunc()

async function logoutFunc() {
	myFetch('logout')
}