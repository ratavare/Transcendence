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

async function myFetch(viewUrl, myData, method = 'POST', requireAuth = true) {
    let accessToken = localStorage.getItem('access_token');
    if (requireAuth && !accessToken) {
        accessToken = await refreshToken();
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

    return fetch(viewUrl, {
        method: method,
        headers: headers,
        body: body,
    })
    .then(async (response) => {
        console.log("status: ", response);
        const data = await response.json();
        console.log("Data:", data);
        return data;
    })
    .catch(error => console.log("Error: ", error));
}