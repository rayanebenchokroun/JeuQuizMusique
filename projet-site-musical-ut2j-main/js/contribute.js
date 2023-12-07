const APIKEY = "$2a$10$NvxyHzwseaPX9KayU.zUsOwVToxkW8kIUI36Vc3LxxwwRY5lZ/KI6";
let working = false;

function setup() {

    document.getElementById("button-contribute").onclick = async () => {

        if (working) return;
        working = true;
        document.getElementById("button-contribute").disabled = true;
        document.getElementById("loader").classList.add("visible");

        const title = document.getElementById("title").value;
        const artist = document.getElementById("artist").value;
        const genre = document.getElementById("genre").value;
        const lyric = document.getElementById("lyric").value;
    
        try {

            if (!title || !artist || !genre || !lyric) throw new Error("One of the inputs is empty, please check again and retry.");
            const url = "https://api.jsonbin.io/v3/b/6572448c54105e766fdb29e4";
            let options = {
                method: "GET",
                headers: {
                    'Content-Type': "application/json",
                    'X-Access-Key': APIKEY,
                }
            }
            let response = await fetch(url, options);
            if (!response.ok) {
                throw new Error();
            }
            let data = await response.json();
            let contr = data.record;
            contr = [...contr, {title, artist, genre, lyric}];

            options = {
                method: "PUT",
                headers: {
                    'Content-Type': "application/json",
                    'X-Access-Key': APIKEY,
                },
                body: JSON.stringify(contr)
            }
            response = await fetch(url, options);
            if (!response.ok) {
                throw new Error();
            }

            document.getElementById("button-contribute").disabled = true;
            alert("Done! Thanks for your suggestion.");

        }catch(err){
            alert(err.message);
        }

        document.getElementById("loader").classList.remove("visible");
        document.getElementById("button-contribute").disabled = false;
        working = false;

    }

}

window.onload = setup;