document.addEventListener('DOMContentLoaded', function () {
    var modal = document.getElementById('errorModal');
    var okButton = document.getElementById('errorOkBtn');

    // OK button click handler
    okButton.onclick = function () {
        modal.style.display = 'none';
    };

    // Click outside the modal to close
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Function to show the error modal
    window.showErrorModal = function (message) {
        let messages = '';

        if (typeof message === 'string' || (Array.isArray(message) && message.length === 1)) {
            // Split the message by commas and create a list
            //messages = message.split(',').map(msg => `<li>${msg.trim()}</li>`).join('');
            messages = `<p>${message}</p>`;
        } else if (Array.isArray(message)) {
            // If message is an array, create a list
            messages = message.map(msg => `<li>${msg.trim()}</li>`).join('');
        } else if (typeof message === 'object') {
            // If message is an object, create a list from its values
            messages = Object.values(message).map(msg => `<li>${msg.trim()}</li>`).join('');
        }

        document.getElementById('errorMessage').innerHTML = `<ul>${messages}</ul>`;
        modal.style.display = 'flex';
    };
});