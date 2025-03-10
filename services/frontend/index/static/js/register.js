{
	const formRegister = document.getElementById("form-register");

	formRegister?.addEventListener("submit", async function (event) {
		event.preventDefault();
		let formData = new FormData(event.target);

		try {
			const data = await myFetch(
				`https://${MAIN_HOST}:8443/user_auth/register/`,
				formData,
				"POST",
				false
			);
			if (data.access && data.refresh) {
				console.log("Registration successful", data);

				localStorage.setItem("access_token", data.access);
				localStorage.setItem("refresh_token", data.refresh);
			}
			seturl("/home");
		} catch (error) {
			console.log("register.js: ", error);
			const messages = Object.values(error);
			console.log("Registration Failed. Reasons: ", messages);
			messages.forEach(showErrorModal);
		}
	});
}

document.getElementById("intra-login").addEventListener("click", function () {
	const clientId =
		"u-s4t2ud-790e83da699ea6cd705470f3c9ee6f0162ce72a1a28f1775537fe2415f4f2725";
	const redirectUri = `https://${MAIN_HOST}:8443/user_auth/login/`;
	const responseType = "code";

	const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}`;

	window.location.href = authUrl;
});

const { code, accessToken, refreshToken } = getUrlParams();
if (code && accessToken && refreshToken) {
	localStorage.setItem("access_token", accessToken);
	localStorage.setItem("refresh_token", refreshToken);

	window.location.href = `https://${MAIN_HOST}:8443/#/home`;
}
