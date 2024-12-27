class PageElement extends HTMLElement {
	display = undefined;

	connectedCallback() {
		this.display = this.style.display;
		this.style.display = "none";
	}

	static go(url) {
		window.location.href = "#" + url;
	}

	static onLoad = (page) => {
		console.log("PageElement.onLoad");
	};

	static onUnload = (page) => {
		// console.log("PageElement.onLoad");
	};
}

customElements.define("page-element", PageElement);
