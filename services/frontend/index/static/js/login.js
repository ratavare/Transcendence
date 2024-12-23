document
	.getElementById("form-login")
	?.addEventListener("submit", async function (event) {
		event.preventDefault();
		const formData = new FormData(event.target);

		try {
			const data = await myFetch(
				"https://localhost:8433/user_auth/login",
				formData,
				"POST",
				false
			);

			if (data.status === "2fa_required") {
				const otpModal = new bootstrap.Modal(
					document.getElementById("otp-modal"),
					{
						backdrop: "static",
						keyboard: false,
					}
				);
				otpModal.show();

				document.getElementById("otp-submit").onclick =
					async function () {
						const otp = document.getElementById("otp-input").value;
						const otpFormData = new FormData();
						otpFormData.append("step", "2");
						otpFormData.append(
							"username",
							formData.get("username")
						);
						otpFormData.append("otp", otp);

						try {
							const otpData = await myFetch(
								"https://localhost:8433/user_auth/login",
								otpFormData,
								"POST",
								false
							);

							if (otpData.access && otpData.refresh) {
								console.log("Login successful");
								localStorage.setItem(
									"access_token",
									otpData.access
								);
								localStorage.setItem(
									"refresh_token",
									otpData.refresh
								);
								localStorage.setItem("is_2fa_enabled", "true");
								otpModal.hide();
								seturl("/home");
							}
						} catch (otpError) {
							alert("Invalid OTP. Please try again.");
						}
					};
			} else if (data.access && data.refresh) {
				localStorage.setItem("access_token", data.access);
				localStorage.setItem("refresh_token", data.refresh);
				seturl("/home");
			}
		} catch (error) {
			alert("Login failed. Please check your credentials.");
		}
	});

document.getElementById("intra-login").addEventListener("click", function () {
	const clientId =
		"u-s4t2ud-790e83da699ea6cd705470f3c9ee6f0162ce72a1a28f1775537fe2415f4f2725";
	const redirectUri = "https://localhost:8443/user_auth/login/";
	const responseType = "code";

	const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}`;

	window.location.href = authUrl;
});

const hash = window.location.hash.substring(1);
const queryParams = new URLSearchParams(hash.split("?")[1]);
const code = queryParams.get("code");
const accessToken = queryParams.get("access_token");
const refreshToken = queryParams.get("refresh_token");
if (code && accessToken && refreshToken) {
	localStorage.setItem("access_token", accessToken);
	localStorage.setItem("refresh_token", refreshToken);

	window.location.href = "https://localhost:8443/#/home";
}
