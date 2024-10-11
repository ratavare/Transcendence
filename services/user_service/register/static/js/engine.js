

class PageElement extends HTMLElement {
	constructor() {
		super();
		this.style.display = "none";
	}

	static go(url)
	{
		window.location.href = "#/" + url;
	}
}

customElements.define('page-element', PageElement);
let pageActive = undefined;
const pages = document.querySelectorAll('[page]');
const l = new Map();
for (const page of pages) {
	l.set(page.getAttribute('page'), page);
}

window.addEventListener('load', function(event) {
	const url = window.location.href.split('#/')[1];
	setPage(url);
});

window.addEventListener('popstate', function(event) {
	const url = window.location.href.split('#/')[1];
	setPage(url);
});


function setPage(name)
{
	pageActive?.remove();
	const page = l.get(name) || Array.from(pages).find(page => page.getAttribute('default'));
	if (page)
	{
		const newPage = document.createElement('page-element');
		newPage.innerHTML = page.innerHTML;

		const newScript = document.createElement('script');
		newScript.src = "static/js/" + name + ".js";
		newScript.onload = function(){
			console.log(`${name}.js loaded successfully`);
		};
		newPage.appendChild(newScript);
		console.log(newScript);
		console.log(newPage);
		document.body.appendChild(newPage);
		console.log('setPage: ', name);
		pageActive = newPage;
	}
}

// window.addEventListener('hashchange', function(event) {
	//     console.log('hashchange', event);
	// });
	
	// const html = pageOi.innerHTML;
	
	// const newPage = document.createElement('div');
	// newPage.innerHTML = html;
	// const newScript = document.createElement('script');
	// newScript.src = pageOi.querySelector('script').src;
	// newPage.appendChild(newScript);
	// document.body.appendChild(newPage);
	// console.log('engine.js ', pageOi);