window.getProfile().then(() => {
    const socket = new WebSocket(`wss://localhost:8443/online-status/${window.user.username}/`);
    socket.onopen = () => {
        console.log("WebSocket connection established.");
    };

    socket.onmessage = function(event) {
        console.log("check 0\n");
        const data = JSON.parse(event.data);
        console.log(data);
        updateOnlineStatus(data.online_users);
    };
})

function updateOnlineStatus(onlineUsers) {
    const indicators = document.querySelectorAll('.status-indicator');
    indicators.forEach(indicator => {
      const username = indicator.getAttribute('data-username');
      if (onlineUsers.includes(username)) {
        indicator.classList.remove('status-offline');
        indicator.classList.add('status-online');
      } else {
        indicator.classList.remove('status-online');
        indicator.classList.add('status-offline');
      }
    });
}