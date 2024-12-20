
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

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
        console.error('No refresh token available.');
        return null;
    }

    const response = await fetch('https://localhost:8443/user_auth/api/token/refresh/', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
        const { access } = await response.json();
        localStorage.setItem('access_token', access);
        return access;
    } else {
        console.error('Failed to refresh access token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return null;
    }
}

async function myFetch(viewUrl, myData = null, method = 'POST', requireAuth = true) {
	// console.log("myFetch: ", viewUrl);
    const headers = {
        "X-CSRFToken": getCookie('csrftoken'),
        "Accept": "application/json",
    };
	if (localStorage.key('access_token') != null) {
	

		let accessToken = localStorage.getItem('access_token');
		if (requireAuth && !accessToken) {
			accessToken = await refreshAccessToken();
			if (!accessToken) {
				console.error("No access token found. User might not be logged in.");
				return;
			}
		}
		if (requireAuth) {
			headers["Authorization"] = `Bearer ${accessToken}`;
		}
	}
    let body = null;
    if (myData) {
        if (myData instanceof FormData) {
            body = myData;
            // delete headers["Content-Type"];
        } else {
            headers["Content-Type"] = "application/json";
            body = JSON.stringify(myData);
        }
    }
	// console.log("headers: ", headers);
    const response = await fetch(viewUrl, {
        method: method,
        headers: headers,
        body: body,
    });
	// console.log("response: ", response);
    const data = await response.json();

    if (response.status === 401 && requireAuth && localStorage.getItem('refresh_token')) {
        const newAccessToken = await refreshAccessToken();
        
        if (newAccessToken) {
            headers['Authorization'] = `Bearer ${newAccessToken}`;
            const retryResponse = await fetch(viewUrl, {
                method: method,
                headers: headers,
                body: body,
            });
            return retryResponse.json();
        }
    }
    if (!response.ok) {
        throw data.error || 'Unknown error';
    }
    return data;
}
