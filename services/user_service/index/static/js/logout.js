
const logoutPage = document.getElementById('id_logout')
logoutPage.onhashchange = logoutFunc()

async function logoutFunc() {
	myFetch('logout/').then(() => {
		seturl('/');
	})
}