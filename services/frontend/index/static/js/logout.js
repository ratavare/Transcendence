async function logoutFunc() {
	if (location.hash === "#/logout") {
		try {
			await myFetch(
				`https://${MAIN_HOST}:8443/user_auth/logout/`,
				null,
				"POST",
				true
			);
			localStorage.removeItem("access_token");
			localStorage.removeItem("refresh_token");
			localStorage.removeItem("is_2fa_enabled");
			localStorage.removeItem("otp_secret");
			// alert('Successfully Logged Out');
			window.statusSocket?.close();
			seturl("/login");
		} catch (error) {
			console.log(error);
		}
	}
}
