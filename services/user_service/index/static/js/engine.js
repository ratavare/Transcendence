
let pageActive = undefined;
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
	setNav(window.location.href.split('#/')[1]);
	logoutFunc();
	if(window.location.hash == '#/profile')
		getProfile();

});

window.addEventListener('popstate', () => {
	const url = window.location.href.split('/');
	const x = (url.length) - 1;
	setPage(url[x]);
	setNav(window.location.href.split('#/')[1]);
	logoutFunc();
});

// chage the nav bar to show or not depending on the url (the navar to show will have the same name as the url)
function setNav(name)
{
	const navs = document.querySelectorAll('nav-element');
	for (const nav of navs) {
		console.log("nav: ", nav.getAttribute('name'), ". name: ", name);
		if (nav.getAttribute('name') == name)
			nav.style.display = 'block';
		else
			nav.style.display = 'none';
	}
}

function setPage(name)
{
	if (pageActive && pageActive.getAttribute("name") == name) {
		return ;
	}
	pageActive?.remove();
	const page = l.get(name) || Array.from(pages).find(page => page.getAttribute('default'));
	if (page)
	{
		name = page.getAttribute("name") || name;
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