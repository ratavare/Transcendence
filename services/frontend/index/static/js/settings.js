function get2fa() {
	return localStorage.getItem("is_2fa_enabled") === "true";
}

function getSetupContainer() {
	return document.getElementById("2fa-setup");
}

function getStatusContainer() {
	return document.getElementById("2fa-status");
}

function getQrContainer() {
	return document.getElementById("qr-container");
}

function getSetupKeyContainer() {
	return document.getElementById("setup-key-container");
}

function getOtpContainer() {
	return document.getElementById("otp-container");
}

function parseJwt(token) {
	try {
		return JSON.parse(atob(token.split(".")[1]));
	} catch (e) {
		return null;
	}
}

function updateUI() {
	if (get2fa()) {
		getSetupContainer().style.display = "none";
		getStatusContainer().style.display = "block";
	} else {
		getSetupContainer().style.display = "block";
		getStatusContainer().style.display = "none";
	}

	// Disable current password input if the user logged in via Intra
	if (window.user.intra_login) {
		document.getElementById("current-password").disabled = true;
	}

	const token = localStorage.getItem("access_token");
	if (token) {
		const userData = parseJwt(token);
		// console.log(userData);

		// Get the user ID from the JWT
		const userId = userData.user_id;

		// Fetch the usable password status from the API using myFetch
		myFetch(
			`https://${MAIN_HOST}:8443/user_auth/has_usable_password/${userId}/`,
			null,
			"GET",
			true
		)
			.then((data) => {
				// Check if the user has a usable password
				if (data.has_password === false) {
					document.getElementById(
						"current-password"
					).style.display = "none";
				}
			})
			.catch((error) =>
				console.error("Error fetching password status:", error)
			);
	}
}

updateUI();

document
	.getElementById("enable-2fa-button")
	.addEventListener("click", async function () {
		try {
			const data = await myFetch(
				`https://${MAIN_HOST}:8443/user_auth/enable_2fa/`,
				null,
				"POST",
				true
			);
			if (data.qr_code) {
				getQrContainer().innerHTML = `<img src="data:image/png;base64,${data.qr_code}" class="qr-code-img"/>`;
				document.getElementById("setup-key").textContent =
					data.otp_secret;
				getSetupKeyContainer().style.display = "block";
				getOtpContainer().style.display = "block";
				localStorage.setItem("otp_secret", data.otp_secret);
			} else {
				showErrorModal("Failed to activate 2FA.");
			}
		} catch (error) {
			console.error("Error activating 2FA:", error);
		}
	});

document
	.getElementById("verify-otp-button")
	.addEventListener("click", async function () {
		const otpCode = document.getElementById("otp-code").value;
		const otpSecret = localStorage.getItem("otp_secret");
		try {
			const data = await myFetch(
				`https://${MAIN_HOST}:8443/user_auth/verify_otp/`,
				{ otp: otpCode, otp_secret: otpSecret },
				"POST",
				true
			);
			if (data.status === "success") {
				getQrContainer().innerHTML = "";
				getSetupKeyContainer().style.display = "none";
				getOtpContainer().style.display = "none";
				getSetupContainer().style.display = "none";
				getStatusContainer().style.display = "block";
				localStorage.setItem("is_2fa_enabled", "true");
				localStorage.removeItem("otp_secret");
				showErrorModal("Successfully enabled 2FA", false);
			} else {
				showErrorModal("Invalid OTP code.");
			}
		} catch (error) {
			showErrorModal("Invalid OTP code.");
		}
	});

document
	.getElementById("cancel-2fa-button")
	.addEventListener("click", function () {
		getQrContainer().innerHTML = "";
		getSetupKeyContainer().style.display = "none";
		getOtpContainer().style.display = "none";
		localStorage.removeItem("otp_secret");
	});

document
	.getElementById("disable-2fa-button")
	.addEventListener("click", async function () {
		try {
			const data = await myFetch(
				`https://${MAIN_HOST}:8443/user_auth/disable_2fa/`,
				null,
				"POST",
				true
			);
			if (data.status === "success") {
				showErrorModal("2FA has been disabled.", false);
				getStatusContainer().style.display = "none";
				getSetupContainer().style.display = "block";
				localStorage.setItem("is_2fa_enabled", "false");
			} else {
				showErrorModal("Failed to disable 2FA.");
			}
		} catch (error) {
			console.error("Error disabling 2FA:", error);
		}
	});

document
	.getElementById("form-password-change")
	.addEventListener("submit", async function (event) {
		event.preventDefault();
		const formData = new FormData(event.target);

		try {
			const data = await myFetch(
				`https://${MAIN_HOST}:8443/user_auth/change_password/`,
				formData,
				"POST",
				true
			);
			if (data.status === "success") {
				showErrorModal(data.message, false);
				seturl("/home");
			} else {
				showErrorModal(data.message);
			}
		} catch (error) {
			showErrorModal(error);
		}
	});

document
	.getElementById("delete-account-button")
	.addEventListener("click", async function () {
		showErrorModal("Your account will be deleted permanently.", false);
		try {
			const data = await myFetch(
				`https://${MAIN_HOST}:8443/user_auth/delete_account/`,
				null,
				"POST",
				true
			);
			if (data.status === "success") {
				showErrorModal("Account deleted successfully");
				localStorage.clear();
				seturl("/login");
			} else {
				showErrorModal("Failed to delete account: " + data.message);
			}
		} catch (error) {
			console.error("Error deleting account:", error);
			showErrorModal("Error deleting account");
		}
	});
