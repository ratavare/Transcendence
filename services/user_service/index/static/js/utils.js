
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
	console.log("myData: ", myData);
	return fetch(viewUrl , {
		method: 'POST',
		headers: {
			"X-CSRFToken": getCookie('csrftoken'),
			"Accept": "application/json",
		},
		body: myData,
	}).then(async (response) => {
		console.log("pk: ", response?.ok);
		console.log("status: ", response);
		if (response.ok)
		{
			const data = await response.json();
			return (data);
		}
		return(undefined)
	})
}

function updateNavBarLogin()
{
	// Clear existing navbar items
    const navbarRight = document.querySelector('.navbar-nav.navbar-right');
    navbarRight.innerHTML = '';

    // Create dropdown for logged-in user
    const dropdown = `
        <li class="dropdown">
            <a class="dropdown-toggle" data-toggle="dropdown" href="#" aria-expanded="false">
                <span class="glyphicon glyphicon-user"></span> 
                <span class="caret"></span>
            </a>
            <ul class="dropdown-menu">
                <li><a href="#/profile">Profile</a></li>
                <li><a href="#/profile/friends">Friends</a></li>
                <li><a href="#">Settings</a></li>
                <li><a href="#/logout">Logout</a></li>
            </ul>
        </li>
    `;
    
    // Add the new dropdown to the navbar
    navbarRight.innerHTML += dropdown;

    // Optionally, display a welcome message or username
    const welcomeMessage = document.createElement('li');
    navbarRight.insertBefore(welcomeMessage, navbarRight.firstChild);
}