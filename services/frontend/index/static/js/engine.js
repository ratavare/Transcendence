let pageActive = undefined;
let pageName = undefined;
const pages = document.querySelectorAll('page-element');
const l = new Map();
for (const page of pages) {
	document.body.removeChild(page);
	console.log("removeChild: ", page);
	l.set(page.getAttribute('name'), page);
}

function setPageUrl()
{
	const canvas = document.getElementById('canvas');
	canvas?.remove();
	const url = window.location.href.split('/');
	const x = (url.length) - 1;
	const hash = window.location.hash;
	window.props = new URLSearchParams();
	if (hash.includes('?')) {
		const queryString = hash.split('?')[1];
		const urlParams = new URLSearchParams(queryString);
		window.props = urlParams;
		url[x] = url[x].replaceAll(`?${queryString}`, "");
	} else {
		// console.log('Nenhum parâmetro encontrado no hash.');
	}
	setPage(url[x]);
	logoutFunc();
}

window.addEventListener('load', () => {
	setPageUrl();
});

window.addEventListener('popstate', () => {
	setPageUrl();
});

// Fetches current user's profile from backend and redirects (or not) based on the page and on the success of the fetch
async function checkRedirection(page)
{
	const authenticated =  page.getAttribute("authenticated") || "true";
	const result = await getProfile();
	// console.log("checkRedirection: authenticated: ", authenticated, " result: ", result);
	if (authenticated == "true")
	{
		if (!result)
		{	
			pageActive = undefined;
			seturl('/login')
			return true;
		}
	}
	else {
		if (result) {
			// pageActive = undefined;
			seturl('/home');
			return true;
		}
	}
	return false;
}

async function setPage(name)
{
	PageElement.onUnLoad();
	if (name == '' || name == '#') {
		name = 'home'
		seturl('/home')
	}
	if (pageName == name)
		return;
	pageName = name;
	if (pageActive && pageActive.getAttribute("name") == name)
		return ;
	if (pageActive)
	{
		const scripts = pageActive.querySelectorAll("script");
		for (const script of Array.from(scripts))
		{
			script.remove();
		}
		pageActive.remove();

	}
	const page = l.get(name) || Array.from(pages).find(page => page.getAttribute('default'));
	if (page)
	{
		name = page.getAttribute("name") || name;
		// console.log("name:", name);
		
		const redirection = await checkRedirection(page);
		if (redirection)
			return ;
		
		const newPage = document.createElement('page-element');
		newPage.innerHTML = page.innerHTML;
		newPage.setAttribute("name", name);
		const newScript = document.createElement('script');
		newScript.setAttribute("controller", "true")
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
		if ("pong" == name)
		{
			setTimeout(() => {
			PageElement.onLoad(newPage);
			}, 200);
		}
	}
	else
		pageActive = undefined;
}

async function getProfile(){
	try {
		if (localStorage.key('access_token') == null) return (false);
		// console.log("access_token: oh");
		const response = await myFetch('https://localhost:8443/user_profile/profile/', null, "GET"); 
		if (response == null) {
			throw new Error("Failed to fetch profile");
		}
		// console.log("getProfile: ", response);

		window.user = response;
		return true;
	} catch {
		window.user = null;
		return false
	}
}

window.getProfile = getProfile;