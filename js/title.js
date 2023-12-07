function titleSetup() {

    const title = document.getElementById("title");
    const text = document.getElementById("title-description");

    const oTitle = "TUNEWAVE";
    for(let i = 0; i <= oTitle.length; i++) {
        setTimeout(()=>{
            title.innerHTML = "";
            `${oTitle.substring(0, i)}${i == oTitle.length ? "" : "|"}`.split("").forEach(e => {
                const element = document.createElement("span");
                element.innerText = e;
                title.appendChild(element);
            })
        }, (i * 200));
    }
    //setTimeout(()=>{
    //    title.innerHTML = `${oTitle}`;
    //}, 2800);

    setTimeout(() => {
        title.childNodes.forEach(child => {
            child.classList.add("title-letter");
        })
        title.classList.add("visible");
        text.classList.add("visible");
    }, 3000);

}