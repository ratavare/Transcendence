
function seturl() {
	PageElement.go('register')
}

document.addEventListener('submit', async function(event) {

	event.preventDefault();
	console.log('Form submitted!');

	console.log(event.target);

	let formData = new FormData(event.target);
	console.log("formData:", formData);
	for (const [key, value] of formData)
		console.log('key: ', key, ' | value: ', value);

	try {
		const response = await fetch('#/register/', {
			method: 'POST',
			headers: {
				"X-CSRFToken": getCookie('csrftoken'),
				"Accept": "application/json",
			},
			body: formData,
		})
		
		const data = await response.json();
		console.log("Response data: ", data);
	} catch (error) {
		console.error("Error submitting form:", error);
	}
});

// Function to get CSRF token
function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}