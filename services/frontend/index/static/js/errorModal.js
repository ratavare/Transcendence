document.addEventListener('DOMContentLoaded', function () {
    var modal = document.getElementById('errorModal');
    var okButton = document.getElementById('errorOkBtn');

    okButton.onclick = function () {
        modal.style.display = 'none';
    };

    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    window.showErrorModal = function (message, isError = true) {
        let messages = '';

        if (typeof message === 'string' || (Array.isArray(message) && message.length === 1)) {
            messages = `<p>${message}</p>`;
        } else if (Array.isArray(message)) { // message is an array
            messages = message.map(msg => `<li>${msg.trim()}</li>`).join('');
        } else if (typeof message === 'object') { // message is an object
            messages = Object.values(message).map(msg => `<li>${msg.trim()}</li>`).join('');
        }

        document.querySelector('.error-modal-header').innerText = isError ? 'Warning' : 'Error';
        document.getElementById('errorMessage').innerHTML = `<ul>${messages}</ul>`;
        modal.style.display = 'flex';
    };
});