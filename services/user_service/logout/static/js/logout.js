
function seturl() {
	PageElement.go('logout')
}

window.onhashchange = logoutFunc()

async function logoutFunc() {
	
	console.log("EnRZOTRI")
	try {
		const response = await fetch('logout/', {
			method: 'POST',
			headers: {
				"X-CSRFToken": getCookie('csrftoken'),
				"Accept": "application/json",
			},
		})
		
		const data = await response.json();
		console.log("Response data: ", data);
		if (data.status == "success") {
			window.location.href = '/#/index/'
		}
	} catch (error) {
		console.error("Error:", error);
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