function updateOnlineStatus(data) {
    const indicators = document.querySelectorAll('.status-text');
    
    let onlineUsers = JSON.parse(sessionStorage.getItem("onlineUsers")) || {};

    indicators.forEach(indicator => {
        const friendUsername = indicator.getAttribute('data-username');
        if (friendUsername === data.user) {
            if (data.status === 'online') {
                indicator.classList.remove('status-offline');
                indicator.classList.add('status-online');
                indicator.innerHTML = 'ONLINE';

                // Store user as online
                onlineUsers[data.user] = true;
            } else {
                indicator.classList.remove('status-online');
                indicator.classList.add('status-offline');
                indicator.innerHTML = 'OFFLINE';

                // Remove user from online list
                delete onlineUsers[data.user];
            }
        }
    });

    // Update sessionStorage
    sessionStorage.setItem("onlineUsers", JSON.stringify(onlineUsers));
}

// Restore online statuses on page load
function restoreOnlineStatus() {
    let onlineUsers = JSON.parse(sessionStorage.getItem("onlineUsers")) || {};
    
    document.querySelectorAll('.status-text').forEach(indicator => {
        const friendUsername = indicator.getAttribute('data-username');
        if (onlineUsers[friendUsername]) {
            indicator.classList.remove('status-offline');
            indicator.classList.add('status-online');
            indicator.innerHTML = 'ONLINE';
        }
    });
}

// Restore statuses before connecting WebSocket
restoreOnlineStatus();

window.getProfile().then(() => {
    const socket = new WebSocket(`wss://localhost:8443/online-status/${window.user.username}/`);

    socket.onopen = () => {
        console.log("WebSocket connection established.");
    };

    socket.onclose = () => {
        console.log("WebSocket connection closed.");
    };

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log('RECEIVED OBJ:', data);
        updateOnlineStatus(data);
    };
});
