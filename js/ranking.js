const APIKEY = "$2a$10$NvxyHzwseaPX9KayU.zUsOwVToxkW8kIUI36Vc3LxxwwRY5lZ/KI6";
function formatName(name) {
	return name.split(" ").map(e => e.split("").map((f,i) => i === 0 ? f.toUpperCase() : f.toLowerCase()).join("")).join(" ");
}

function rankElement(i, name, score) {
	const div = document.createElement("div");
	div.classList.add("rank");
	const spanN = document.createElement("span");
	spanN.classList.add("number");
	spanN.innerText = i;
	const spanName = document.createElement("span");
	spanName.classList.add("name");
	spanName.innerText = formatName(name);
	const spanScore = document.createElement("span");
	spanScore.classList.add("player-score");
	spanScore.innerText = score;

	div.appendChild(spanN);
	div.appendChild(spanName);
	div.appendChild(spanScore);

	return div;
}

async function loadRanking() {

	document.getElementById("loader").classList.add("visible");
	try {
		const url = "https://api.jsonbin.io/v3/b/6570d98112a5d37659a4108c";
		let options = {
			method: "GET",
			headers: {
				'Content-Type': "application/json",
				'X-Access-Key': APIKEY
			}
		}
		let response = await fetch(url, options);
		if (!response.ok) {
			throw new Error();
		}
		let data = await response.json();
		let users = data.record.users;
		const rankContainer = document.getElementById("rank-container");
		users.sort((a, b) => {
			return b.highscore - a.highscore;
		});
		users.forEach((e, i) => {
			rankContainer.appendChild(rankElement(i+1, e.name, e.highscore));
		});
		document.getElementById("loader").classList.remove("visible");

	} catch(err) {
		alert(err);
	}

}

window.onload = loadRanking;