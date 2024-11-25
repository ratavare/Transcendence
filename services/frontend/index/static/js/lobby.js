
{
	const createLobbyForm = document.getElementById('create-lobby-form');

	createLobbyForm?.addEventListener('submit', function(event) {
		event.preventDefault();

		const formData = new FormData(event.target);
		for (var pair of formData.entries()) {
			console.log(pair[0]+ ', ' + pair[1]); 
		}

		myFetch('https://localhost:8443/lobby/create-lobby/', formData)
		.then(data => {
			console.log('Data:', data);
		}).catch(error => {
			console.log(error);
		})
	});
}