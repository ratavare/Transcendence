
function seturl() {
	PageElement.go('register')
}

// let form = document.getElementById("registerForm");
// console.log('Dom Content Loaded');
// if (form){
// 	console.log("Form found!");
// 	console.log(form);
// 	form.addEventListener("submit", formSubmit());
// } else {
// 	console.log('Form not found');
// }

// o register.js printa tudo ANTES do engine.js
// which means, nao faz muito sentidp
// supostamnete o engine nao da load do register.html com <scrpit>static/js/register.js

formSubmit()

async function formSubmit()
{
	let form = document.getElementById("registerForm");
	console.log('Form submitted!');

	console.log(document.readyState);
	console.log(form);

	let formData = new FormData(form);
	console.log("formData:", formData);
	for (const [key, value] of formData)
		console.log('key: ', key, ' | value: ', value);

	let username = form.querySelector('#id_username');
	let password1 = form.querySelector('#id_password1');
	let password2 = form.querySelector('#id_password2')
	
	console.log("Username Field:", username);
	console.log("Password1 Field:", password1);
	console.log("Password2 Field:", password2);
	
	console.log("Username Value:", username.value);
	console.log("Password1 Value:", password1.value);
	console.log("Password2 Value:", password2.value);

	try {
		const response = await fetch('register/', {
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