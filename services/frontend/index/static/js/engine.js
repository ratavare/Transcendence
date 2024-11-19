let pageActive = undefined;
let pageName = undefined;
const pages = document.querySelectorAll('page-element');
const l = new Map();
for (const page of pages) {
	document.body.removeChild(page);
	console.log("removeChild: ", page);
	l.set(page.getAttribute('name'), page);
}

window.addEventListener('load', () => {
	const url = window.location.href.split('/');
	const x = (url.length) - 1;
	setPage(url[x]);
	logoutFunc();
});

window.addEventListener('popstate', () => {
	const url = window.location.href.split('/');
	const x = (url.length) - 1;
	setPage(url[x]);
	logoutFunc();
});

// Fetches current user's profile from backend and redirects (or not) based on the page and on the success of the fetch
async function checkRedirection(page)
{
	const authenticated =  page.getAttribute("authenticated") || "true";
	const result = await getProfile();
	if (authenticated == "true")
	{
		if (result == false) {
			pageActive = undefined;
			seturl('/login');
			return true;
		}
	}
	else {
		if (result) {
			pageActive = undefined;
			seturl('/home')
			return true;
		}
	}
	return false;
}

async function setPage(name)
{
	if (name == '' || name == '#') {
		name = 'home'
		seturl('/home')
	}
	if (pageName == name)
		return;
	pageName = name;
	if (pageActive && pageActive.getAttribute("name") == name)
		return ;
	pageActive?.remove();
	const page = l.get(name) || Array.from(pages).find(page => page.getAttribute('default'));
	if (page)
	{
		name = page.getAttribute("name") || name;
		
		const redirection = await checkRedirection(page);
		if (redirection)
			return ;
		
		const newPage = document.createElement('page-element');
		newPage.innerHTML = page.innerHTML;
		newPage.setAttribute("name", name);
		const newScript = document.createElement('script');
		newScript.src = "static/js/" + name + ".js";
		if (name == 'pong')
			newScript.type = "module";
		newScript.onload = function(){
			console.log(`${name}.js loaded successfully`);
		};
		newPage.appendChild(newScript);
		document.body.appendChild(newPage);
		newPage.style.display = page.display;
		pageActive = newPage;
	}
	else
		pageActive = undefined;
}

async function getProfile(){
	return await fetch('https://localhost:8443/user_profile/profile/').then(async (response) => {
		if(!response.ok) {
			return false;
		}
		const data = await response.json();
		window.user = data;
		return true;
	}).catch((e) => {
		return false;
	});
}

window.getProfile = getProfile;