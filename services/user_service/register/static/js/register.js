
document.addEventListener('submit', async function(event) {

	event.preventDefault();
	console.log('Form submitted!');

	console.log(event.target);

	let formData = new FormData(event.target);
	console.log("formData:", formData);
	for (const [key, value] of formData)
		console.log('key: ', key, ' | value: ', value);

	myFetch('register', FormData);
});