let pageActive = undefined;
let pageName = undefined;
let propsException = false;
const pages = document.querySelectorAll("page-element");
const l = new Map();
for (const page of pages) {
	document.body.removeChild(page);
	l.set(page.getAttribute("name"), page);
}

function setPageUrl() {
	const canvas = document.getElementById("canvas");
	canvas?.remove();
	const url = window.location.href.split("/");
	const x = url.length - 1;
	const hash = window.location.hash;
	window.props = new URLSearchParams();
	if (hash.includes("?")) {
		const queryString = hash.split("?")[1];
		const urlParams = new URLSearchParams(queryString);
		window.props = urlParams;
		url[x] = url[x].replaceAll(`?${queryString}`, "");
	} else {
		// console.log('Nenhum parâmetro encontrado no hash.');
	}
	setPage(url[x]);
	logoutFunc();
}

window.addEventListener("load", () => {
	setPageUrl();
});

window.addEventListener("popstate", () => {
	setPageUrl();
});

// Fetches current user's profile from backend and redirects (or not) based on the page and on the success of the fetch
async function checkRedirection(page) {
	const authenticated = page.getAttribute("authenticated") || "true";
	const result = await getProfile();
	if (authenticated == "true") {
		if (!result) {
			pageActive = undefined;
			seturl("/login");
			return true;
		}
	} else {
		if (result) {
			// pageActive = undefined;
			seturl("/home");
			return true;
		}
	}
	return false;
}

async function setPage(name) {
	PageElement.onUnload();
	if (name == "" || name == "#" || name == "?#") {
		name = "home";
		seturl("/home");
	}
	if (pageName == name && !propsException)
		return; 
	pageName = name;
	if (pageActive && pageActive.getAttribute("name") == name && !propsException)
		return;
	propsException = false;
	if (pageActive) {
		const scripts = pageActive.querySelectorAll("script");
		for (const script of Array.from(scripts)) {
			// console.log(`removed script of page ${pageName}`, script);
			script.remove();
		}
		pageActive.remove();
	}
	const page =
		l.get(name) ||
		Array.from(pages).find((page) => page.getAttribute("default"));
	if (page) {
		name = page.getAttribute("name") || name;
		
		const redirection = await checkRedirection(page);
		if (redirection) return;

		const newPage = document.createElement("page-element");
		newPage.innerHTML = page.innerHTML;
		newPage.setAttribute("name", name);
		const newScript = document.createElement("script");
		newScript.setAttribute("controller", "true");
		newScript.src = "static/js/" + name + ".js";
		if (
			name == "pong" ||
			name == "singleplayerpong" ||
			name == "multiplayer_pong"
		)
			newScript.type = "module";
		newScript.onload = function () {
			// console.log(`${name}.js loaded successfully`);
		};
		newPage.appendChild(newScript);
		document.body.appendChild(newPage);
		newPage.style.display = page.display;
		pageActive = newPage;
		if (
			"pong" == name ||
			"singleplayerpong" == name ||
			"multiplayer_pong" == name ||
			"tournament" == name
		) {
			setTimeout(() => {
				PageElement.onLoad(newPage);
			}, 200);
		}
	} else {
		let errorPage = l.get('404error') || Array.from(pages).find((page) => page.getAttribute("name") === '404');
        if (errorPage) {
            name = '404error';
			console.log("404 Page not found: ", name);
            const newPage = document.createElement("page-element");
            newPage.innerHTML = errorPage.innerHTML;
            newPage.setAttribute("name", name);
            document.body.appendChild(newPage);
            newPage.style.display = errorPage.display;
            pageActive = newPage;
        }
	}
}

async function getProfile() {
	try {
		if (localStorage.key("access_token") == null) return false;
		const response = await myFetch(
			`https://${MAIN_HOST}:8443/user_profile/profile/`,
			null,
			"GET"
		);
		if (response == null) {
			throw new Error("Failed to fetch profile");
		}
		window.user = response;
		if (!window.statusSocket)
			onlineStatus();
		return true;
	} catch {
		window.user = null;
		return false;
	}
}
window.getProfile = getProfile;