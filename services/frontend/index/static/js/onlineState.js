function updateOnlineStatus(data) {
    const indicators = document.querySelectorAll('.status-text');
    let onlineUsers = JSON.parse(sessionStorage.getItem("onlineUsers")) || {};

    indicators.forEach(indicator => {
        const friendUsername = indicator.getAttribute('data-username');
        
        if (friendUsername === data.user) {
            if (data.status === 'online') {
                indicator.classList.add('status-online');
                indicator.classList.remove('status-offline');
                indicator.innerHTML = 'ONLINE';
                onlineUsers[data.user] = true;
            } else {
                indicator.classList.remove('status-online');
                indicator.classList.add('status-offline');
                indicator.innerHTML = 'OFFLINE';
                delete onlineUsers[data.user];
            }
        }
    });

    sessionStorage.setItem("onlineUsers", JSON.stringify(onlineUsers));
}

function restoreOnlineStatus() {
    let onlineUsers = JSON.parse(sessionStorage.getItem("onlineUsers")) || {};
    
    document.querySelectorAll('.status-text').forEach(indicator => {
        const friendUsername = indicator.getAttribute('data-username');
        
        if (onlineUsers[friendUsername]) {
            indicator.classList.remove('status-offline');
            indicator.classList.add('status-online');
            indicator.innerHTML = 'ONLINE';
        } else {
            indicator.classList.remove('status-online');
            indicator.classList.add('status-offline');
            indicator.innerHTML = 'OFFLINE';
        }
    });
}

function onlineStatus() {
    // Restore any previously known online statuses
    restoreOnlineStatus();

    window.getProfile().then(() => {
        const socket = new WebSocket(`wss://localhost:8443/online-status/${window.user.username}/`);
        window.statusSocket = socket;

        socket.onopen = () => {
            console.log("WebSocket connection established.");
            // Immediately request current friend statuses
            socket.send(JSON.stringify("FETCH_STATUS"));
        };

        socket.onclose = () => {
            console.log("WebSocket connection closed.");
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        socket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            console.log('RECEIVED OBJ:', data);
            
            // Update online status for the received user
            updateOnlineStatus(data);
        };
    });
}