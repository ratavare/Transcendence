
{
	const playerSpanDivs = document.querySelectorAll(".player-div")
	console.log("DIVS", playerSpanDivs);
	let i = 1;
	playerSpanDivs.forEach((div) => {
		div.addEventListener('click', (event) => {
			let span = div.querySelector(".player-span");
			span.textContent = window.user.username;
			let img = div.querySelector("img");
		})
	})
}