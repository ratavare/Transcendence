console.log("2FA enabled status: " + (localStorage.getItem('is_2fa_enabled') === 'true'));
if (localStorage.getItem('is_2fa_enabled') === 'true') {
    document.getElementById('2fa-setup').style.display = 'none';
    document.getElementById('2fa-status').style.display = 'block';
} else {
    document.getElementById('2fa-setup').style.display = 'block';
    document.getElementById('2fa-status').style.display = 'none';
}

document.getElementById('enable-2fa-button').addEventListener('click', async function() {
    try {
        const data = await myFetch('https://localhost:8443/user_auth/enable_2fa/', null, 'POST', true);
        if (data.qr_code) {
            document.getElementById('qr-container').innerHTML = `<img src="data:image/png;base64,${data.qr_code}" />`;
            document.getElementById('setup-key').textContent = data.otp_secret;
            document.getElementById('setup-key-container').style.display = 'block';
            document.getElementById('otp-container').style.display = 'block';
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
            document.getElementById('qr-container').style.display = 'none';
            document.getElementById('setup-key-container').style.display = 'none';
            document.getElementById('otp-container').style.display = 'none';
            document.getElementById('2fa-setup').style.display = 'none';
            document.getElementById('2fa-status').style.display = 'block';
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

document.getElementById('disable-2fa-button').addEventListener('click', async function() {
    try {
        const data = await myFetch('https://localhost:8443/user_auth/disable_2fa/', null, 'POST', true);
        if (data.status === 'success') {
            alert('2FA has been disabled.');
            document.getElementById('2fa-status').style.display = 'none';
            document.getElementById('2fa-setup').style.display = 'block';
            localStorage.setItem('is_2fa_enabled', 'false');
        } else {
            alert('Failed to disable 2FA.');
        }
    } catch (error) {
        console.error('Error disabling 2FA:', error);
    }
});