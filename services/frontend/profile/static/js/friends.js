
function putUsers(users)
{
	users.forEach(user => {
		console.log("User:", user);
	});
}

const userListDiv = document.getElementById('user-search-result');
userListDiv.style.display = 'none';

{
	const formUsers = document.getElementById('form-users');

	formUsers?.addEventListener('submit', function(event) {
		event.preventDefault();

		console.log("TARGET:", event.target);
		const formData = new FormData(event.target);

		const fetch_url = 'https://localhost:8443/user_auth/user_search/';
		myFetch(fetch_url, formData)
		.then(data => {
			putUsers(data.users);
		}).catch(error => {
			console.log('Error:', error);
		})
	});
}