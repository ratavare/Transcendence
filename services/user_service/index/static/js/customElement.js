
class PageElement extends HTMLElement {

	display = undefined;

	connectedCallback()
	{
		this.display = this.style.display;
		this.style.display = "none";
	}
	static go(url)
	{
		window.location.href = "#" + url;
	}
}

class NavElement extends HTMLElement {
	display = undefined;

	connectedCallback()
	{
		this.display = this.style.display;
		this.style.display = "none";
	}
}

customElements.define('page-element', PageElement);
customElements.define('nav-element', NavElement);