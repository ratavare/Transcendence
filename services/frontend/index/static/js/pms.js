
const chatSocket = new WebSocket(`wss://localhost:8443/chat/${window.user.username}/`);

chatSocket.onmessage = function (event) {
    console.log(JSON.parse(event.data).message);
}

// chatSocket.onclose = function (e) {
//     console.log(e);
// }

// chatSocket.onopen = function (e) {
//     console.log(e.data.message);
// }
