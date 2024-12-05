document.getElementById('form-2fa-setup').addEventListener('submit', async function(event) {
    event.preventDefault();
    try {
        const data = await myFetch('https://localhost:8443/user_auth/enable_2fa/');
        if (data.qr_code) {
            document.getElementById('qr-container').innerHTML = `<img src="data:image/png;base64,${data.qr_code}" />`;
        } else {
            alert('Failed to activate 2FA.');
        }
    } catch (error) {
        console.error('Error activating 2FA:', error);
    }
});