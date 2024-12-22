document
	.getElementById("form-login")
	?.addEventListener("submit", async function (event) {
		event.preventDefault();
		const formData = new FormData(event.target);

		try {
			// Step 1: Attempt login
			const data = await myFetch(
				"https://localhost:8443/user_auth/login/",
				formData,
				"POST",
				false
			);

			if (data.status === "2fa_required") {
				// Show OTP modal if 2FA is required
				const otpModal = new bootstrap.Modal(
					document.getElementById("otp-modal"),
					{
						backdrop: "static", // Prevent closing on backdrop click
						keyboard: false, // Prevent closing with the Escape key
					}
				);
				otpModal.show();

				// Handle OTP submission
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
								"https://localhost:8443/user_auth/login/",
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
				// Successful login without 2FA
				localStorage.setItem("access_token", data.access);
				localStorage.setItem("refresh_token", data.refresh);
				seturl("/home");
			}
		} catch (error) {
			alert("Login failed. Please check your credentials.");
		}
	});
