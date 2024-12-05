
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
    const refreshToken = localStorage.getItem('refresh');
    
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
        localStorage.setItem('access', access);
        return access;
    } else {
        console.error('Failed to refresh access token');
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        return null;
    }
}

async function myFetch(viewUrl, myData) {
    const accessToken = localStorage.getItem('access_token');

    const headers = {
        "X-CSRFToken": getCookie('csrftoken'),
        "Accept": "application/json",
    };

    if (accessToken) {
		console.log("BUT WHYYY");
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(viewUrl, {
        method: 'POST',
        headers: headers,
        body: myData,
    });

    const data = await response.json();

    if (response.status === 401 && accessToken) {
        const newAccessToken = await refreshAccessToken();
        
        if (newAccessToken) {
            headers['Authorization'] = `Bearer ${newAccessToken}`;
            const retryResponse = await fetch(viewUrl, {
                method: 'POST',
                headers,
                body: myData,
            });
            const retryData = await retryResponse.json();

            if (!retryResponse.ok) {
                throw retryData.error || 'Unknown error during retry';
            }
            return retryData;
        } else
            throw data.error || 'Unable to refresh token';
    }

    if (!response.ok) {
        throw data.error || 'Unknown error';
    }

    return data;
}
