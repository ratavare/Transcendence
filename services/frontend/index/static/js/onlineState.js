window.getProfile().then(() => {
    const socket = new WebSocket(`wss://localhost:8443/online-status/${window.user.username}/`);

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log(data);
        updateOnlineStatus(data.online_users);
    };    
})

// function updateOnlineStatus(onlineUsers) {
//     document.querySelectorAll("[data-username]").forEach(card => {
//         const username = card.getAttribute("data-username");
//         const nameElement = card.querySelector("h5");
//         if (onlineUsers.includes(username)) {
//             nameElement.innerHTML = `<span style="color: green;">●</span> @${username}`;
//         } else {
//             nameElement.innerHTML = `<span style="color: gray;">●</span> @${username}`;
//         }
//     });
// }
