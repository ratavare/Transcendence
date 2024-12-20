document.getElementById('createSingleplayerMatch').addEventListener('click', function() {
    seturl('/singleplayerpong');
});

document.getElementById('createLocalMultiplayerMatch').addEventListener('click', function() {
    seturl('/multiplayer_pong');
});

document.getElementById('createOnlineMultiplayerMatch').addEventListener('click', function() {
    seturl = '/online_multiplayer_pong';
});