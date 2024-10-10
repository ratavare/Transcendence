
function seturl()
{
	PageElement.go('register')
}

async function sendForm() {
	let form = document.querySelector("#registerForm");
	let	formData = new FormData(form);
	console.log("TEST1");
	try {
		const response = await fetch('register/', {
			method: 'POST',
			headers:{
				"X-CSRFToken": getCookie('csrftoken'),
			},
			body: formData,
		})

		const data = await response.json();
		console.log("Response data: ", data);
	} catch (error){
		console.error("Error submitting form:", error);
	}
}

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