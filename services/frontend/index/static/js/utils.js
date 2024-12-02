function seturl(url) {
    PageElement.go(url);
}

async function refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
        return fetch('https://localhost:8443/api/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh: refreshToken })
        }).then(response => response.json())
          .then(data => {
              if (data.access) {
                  localStorage.setItem('access_token', data.access);
                  return data.access;
              } else {
                  console.log("Token refresh failed");
                  return null;
              }
          }).catch(error => {
              console.log('ERROR:', error);
              return null;
          });
    }
    return null;
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
	const response = await fetch(viewUrl , {
		method: 'POST',
		headers: {
			"X-CSRFToken": getCookie('csrftoken'),
			"Accept": "application/json",
		},
		body: myData,
	})
	const data = await response.json();
	if (!response.ok)
		throw data.error;
	return data;
}
