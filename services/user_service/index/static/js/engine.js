
let pageActive = undefined;
const pages = document.querySelectorAll('page-element');
const l = new Map();
for (const page of pages) {
	document.body.removeChild(page);
	console.log("removeChild: ", page);
	l.set(page.getAttribute('name'), page);
}

window.addEventListener('load', function(event) {
	const url = window.location.href.split('#/')[1];
	setPage(url);
});

window.addEventListener('popstate', function(event) {
	const url = window.location.href.split('#/')[1];
	setPage(url);
	setNav()
});

function setPage(name)
{
	if (pageActive && pageActive.getAttribute("name") == name) {
		console.log(" ta foda!!");
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
			console.log('setPage: ', name);
			pageActive = newPage;
	}
	else
		pageActive = undefined;
}