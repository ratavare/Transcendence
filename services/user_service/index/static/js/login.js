
const formLogin = document.getElementById('form-login');

console.log(formLogin);
formLogin?.addEventListener('submit', function(event) {

	event.preventDefault();

	let formData = new FormData(event.target);
	for (const [key, value] of formData)
		console.log('key: ', key, ' | value: ', value);

	myFetch('login/', formData).then(data => {
		seturl('/home');
	})
});
