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

function updateUI() {
	if (get2fa()) {
		getSetupContainer().style.display = "none";
		getStatusContainer().style.display = "block";
	} else {
		getSetupContainer().style.display = "block";
		getStatusContainer().style.display = "none";
	}
}

updateUI();

document
	.getElementById("enable-2fa-button")
	.addEventListener("click", async function () {
		try {
			const data = await myFetch(
				"https://localhost:8443/user_auth/enable_2fa/",
				null,
				"POST",
				true
			);
			if (data.qr_code) {
				getQrContainer().innerHTML = `<img src="data:image/png;base64,${data.qr_code}" />`;
				document.getElementById("setup-key").textContent =
					data.otp_secret;
				getSetupKeyContainer().style.display = "block";
				getOtpContainer().style.display = "block";
				localStorage.setItem("otp_secret", data.otp_secret);
			} else {
				alert("Failed to activate 2FA.");
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
				"https://localhost:8443/user_auth/verify_otp/",
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
				alert("Successfully enabled 2FA");
			} else {
				alert("Invalid OTP code.");
			}
		} catch (error) {
			console.error("Error verifying OTP:", error);
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
				"https://localhost:8443/user_auth/disable_2fa/",
				null,
				"POST",
				true
			);
			if (data.status === "success") {
				alert("2FA has been disabled.");
				getStatusContainer().style.display = "none";
				getSetupContainer().style.display = "block";
				localStorage.setItem("is_2fa_enabled", "false");
			} else {
				alert("Failed to disable 2FA.");
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
				"https://localhost:8443/user_auth/change_password/",
				formData,
				"POST",
				true
			);
			if (data.status === "success") {
				alert(data.message);
				seturl("/home");
			} else {
				alert(data.message);
			}
		} catch (error) {
			alert(error);
		}
	});

document
	.getElementById("delete-account-button")
	.addEventListener("click", async function () {
		if (
			confirm(
				"Are you sure you want to delete your account? This action cannot be undone."
			)
		) {
			try {
				const data = await myFetch(
					"https://localhost:8443/user_auth/delete_account/",
					null,
					"POST",
					true
				);
				if (data.status === "success") {
					alert("Account deleted successfully");
					localStorage.clear();
					seturl("/login");
				} else {
					alert("Failed to delete account: " + data.message);
				}
			} catch (error) {
				console.error("Error deleting account:", error);
				alert("Error deleting account");
			}
		}
	});
