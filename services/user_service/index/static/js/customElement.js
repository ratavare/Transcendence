
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

customElements.define('page-element', PageElement);