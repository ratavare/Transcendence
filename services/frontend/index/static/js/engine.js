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

async function setPage(name)
{
	if (name == '')
		name = 'home'
	if (pageName == name)
		return;
	pageName = name;
	if (pageActive && pageActive.getAttribute("name") == name)
		return ;
	pageActive?.remove();
	console.log("setPage: " , name)
	const page = l.get(name) || Array.from(pages).find(page => page.getAttribute('default'));
	if (page)
	{
		name = page.getAttribute("name") || name;
		const authenticated =  page.getAttribute("authenticated") || "true";
		if (authenticated == "true")
		{
			const result = await getProfile();
			if (result == false)
			{
				pageActive = undefined;
				seturl('/login');
				return ;
			}
		}
		else {
			const result = await getProfile();
			if (result)
			{
				pageActive = undefined;
				seturl('/home')
				return ;
			}
		}
		console.log("setPage: ", name);
		const newPage = document.createElement('page-element');
		newPage.innerHTML = page.innerHTML;
		newPage.setAttribute("name", name);
		const newScript = document.createElement('script');
		newScript.src = "static/js/" + name + ".js";
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
	return await fetch('https://localhost:8443/user_profile/profile/').then(async (response) => 
		{
			if(!response.ok) {
				return false;
			}
			const data = await response.json();
			window.user = data;
			return true;
	}).catch((e) => {
		return false;
	}

	);
}

window.getProfile = getProfile;