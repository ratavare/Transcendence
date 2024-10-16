
function seturl(url){
	PageElement.go(url);
}

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

async function myFetch(viewUrl, myData){
	try {
		const response = await fetch(viewUrl + '/' , {
			method: 'POST',
			headers: {
				"X-CSRFToken": getCookie('csrftoken'),
				"Accept": "application/json",
			},
			body: myData,
		})
		
		const data = await response.json();
		console.log("Response data: ", data);
		if (data.status == "success") {
			window.location.href = ''
		}
	} catch (error) {
		console.error("Error submitting form:", error);
	}
}