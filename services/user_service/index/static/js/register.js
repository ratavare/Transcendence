
const formRegister = document.getElementById("form-register");

formRegister?.addEventListener('submit', function(event) {

	event.preventDefault();

	let formData = new FormData(event.target);
	for (const [key, value] of formData)
		console.log('key: ', key, ' | value: ', value);

	myFetch('register/', formData).then(data => {
		seturl('/home');
		updateNavBarLogin();
	});
});