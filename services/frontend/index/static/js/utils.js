
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

    const response = await fetch('/api/token/refresh/', {
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

async function myFetch(viewUrl, myData, method = 'POST', requireAuth = true) {
    let accessToken = localStorage.getItem('access_token');
    if (requireAuth && !accessToken) {
        accessToken = await refreshAccessToken();
        if (!accessToken) {
            console.error("No access token found. User might not be logged in.");
            return;
        }
    }

    const headers = {
        "X-CSRFToken": getCookie('csrftoken'),
        "Accept": "application/json",
    };

    if (requireAuth) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    let body = null;
    if (myData) {
        if (myData instanceof FormData) {
            body = myData;
            delete headers["Content-Type"];
        } else {
            headers["Content-Type"] = "application/json";
            body = JSON.stringify(myData);
        }
    }

    const response = await fetch(viewUrl, {
        method: method,
        headers: headers,
        body: body,
    });

    const data = await response.json();

    if (response.status === 401 && requireAuth) {
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
