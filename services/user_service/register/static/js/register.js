
function seturl()
{
	PageElement.go('register')
}

// async function submitForm(event) {
// 	event.preventDefault();

// 	const form = document.getElementById('registerForm');
// 	const formData = new FormData(form);

// 	const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
//     formData.append('csrfmiddlewaretoken', csrfToken);

// 	try
// 	{
// 		const response = await fetch('register/', {
// 			method: 'POST', 
// 			body: formData,
// 		});

// 		if (!response.ok)
// 		{
// 				const errorData = await response.json();
// 				console.error('Error: ', errorData);
// 				alert('Registration failed ' + errorData.error)
// 				return ;
// 		}

// 		alert('Registration successful!');
// 		window.location.href = 'user/user.html'
// 	} 
// 	catch (error)
// 	{
// 		console.error('Error: ', error);
// 		alert('An error occured during registration.');
// 	}
// }

// const csrftoken = getCookie('csrftoken')

// function getCookie(name)
// {
// 	const cookieValue = null
// 	if (document.cookie && document.cookie !== '')
// 	{
// 		const cookies = document.cookie.split(';');
// 		for (let i = 0; i < cookies.length; i++)
// 		{
// 			const cookie = cookies[i].trim();
// 			if (cookie.substring(0, name.lenght + 1) === (nem + '='))
// 			{
// 				cookieValue = decodeURIComponent(cookie.substring(name.lenght + 1));
// 				break ;
// 			}
// 		}
// 	}
// 	return cookieValue;
// }