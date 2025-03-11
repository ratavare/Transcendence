function updateOnlineStatus(data) {
    const indicators = document.querySelectorAll('.status-text');
    
    indicators.forEach(indicator => {
        const friendUsername = indicator.getAttribute('data-username');
        if (friendUsername === data.user) {
            if (data.status === 'online') {
                indicator.classList.add('status-online');
                indicator.innerHTML = 'ONLINE';
            } else {
                indicator.classList.remove('status-online');
                indicator.innerHTML = 'OFFLINE';
            }
        }
    });
}

function onlineStatus() {
    const socket = new WebSocket(`wss://localhost:8443/online-status/${window.user.username}/`);
    window.statusSocket = socket;

    socket.onopen = () => {
        console.log("WebSocket connection established.");
    };
    socket.onclose = () => {
        console.log("WebSocket connection closed.");
    };
    socket.onerror = () => {
        console.error("Fatal websocket error.");
    };

    window.activeFriends = new Set();
    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log('RECEIVED OBJ:', data);
        if (data.status === 'online' && !window.activeFriends.has(data.user)) {
            window.activeFriends.add(data.user)
            socket.send(1);
        }
        if (data.status === 'offline')
            window.activeFriends.delete(data.user)
        console.log([window.activeFriends])
        updateOnlineStatus(data);
    };
}
