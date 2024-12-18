const is2FAEnabled = localStorage.getItem('is_2fa_enabled') === 'true';
const setupContainer = document.getElementById('2fa-setup');
const statusContainer = document.getElementById('2fa-status');
const qrContainer = document.getElementById('qr-container');
const setupKeyContainer = document.getElementById('setup-key-container');
const otpContainer = document.getElementById('otp-container');

function updateUI() {
	if (is2FAEnabled) {
		setupContainer.style.display = 'none';
		statusContainer.style.display = 'block';
	} else {
		setupContainer.style.display = 'block';
		statusContainer.style.display = 'none';
	}
}

updateUI();

document.getElementById('enable-2fa-button').addEventListener('click', async function() {
	try {
		const data = await myFetch('https://localhost:8443/user_auth/enable_2fa/', null, 'POST', true);
		if (data.qr_code) {
			qrContainer.innerHTML = `<img src="data:image/png;base64,${data.qr_code}" />`;
			document.getElementById('setup-key').textContent = data.otp_secret;
			setupKeyContainer.style.display = 'block';
			otpContainer.style.display = 'block';
			localStorage.setItem('otp_secret', data.otp_secret);
		} else {
			alert('Failed to activate 2FA.');
		}
	} catch (error) {
		console.error('Error activating 2FA:', error);
	}
});

document.getElementById('verify-otp-button').addEventListener('click', async function() {
	const otpCode = document.getElementById('otp-code').value;
	const otpSecret = localStorage.getItem('otp_secret');
	try {
		const data = await myFetch('https://localhost:8443/user_auth/verify_otp/', { otp: otpCode, otp_secret: otpSecret }, 'POST', true);
		if (data.status === 'success') {
			qrContainer.innerHTML = '';
			setupKeyContainer.style.display = 'none';
			otpContainer.style.display = 'none';
			setupContainer.style.display = 'none';
			statusContainer.style.display = 'block';
			localStorage.setItem('is_2fa_enabled', 'true');
			localStorage.removeItem('otp_secret');
			alert('Successfully enabled 2FA');
		} else {
			alert('Invalid OTP code.');
		}
	} catch (error) {
		console.error('Error verifying OTP:', error);
	}
});

document.getElementById('cancel-2fa-button').addEventListener('click', function() {
	qrContainer.innerHTML = '';
	setupKeyContainer.style.display = 'none';
	otpContainer.style.display = 'none';
	localStorage.removeItem('otp_secret');
});

document.getElementById('disable-2fa-button').addEventListener('click', async function() {
	try {
		const data = await myFetch('https://localhost:8443/user_auth/disable_2fa/', null, 'POST', true);
		if (data.status === 'success') {
			alert('2FA has been disabled.');
			statusContainer.style.display = 'none';
			setupContainer.style.display = 'block';
			localStorage.setItem('is_2fa_enabled', 'false');
		} else {
			alert('Failed to disable 2FA.');
		}
	} catch (error) {
		console.error('Error disabling 2FA:', error);
	}
});

document.getElementById('form-password-change').addEventListener('submit', async function(event) {
	event.preventDefault();
	const formData = new FormData(event.target);

	try {
		const data = await myFetch('https://localhost:8443/user_auth/change_password/', formData, 'POST', true);
		if (data.status === 'success') {
			alert(data.message);
			seturl("/home");
		} else {
			alert(data.message);
		}
	} catch (error) {
		alert(error);
	}
});

document.getElementById('delete-account-button').addEventListener('click', async function() {
	if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
		try {
			const data = await myFetch('https://localhost:8443/user_auth/delete_account/', null, 'POST', true);
			if (data.status === 'success') {
				alert('Account deleted successfully');
				localStorage.clear();
				seturl('/login');
			} else {
				alert('Failed to delete account: ' + data.message);
			}
		} catch (error) {
			console.error('Error deleting account:', error);
			alert('Error deleting account');
		}
	}
});