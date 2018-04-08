var deleteButton = document.querySelector("#delete");

function sendDelete (event) {
console.log(this.dataset);
// dit is ongeveer hetzelfde als req.params in je server.js
var id = this.dataset.id;
console.log(id);
// fetch = moeiljke api die het heel makkelijk maakt om HTTP requests te doen
// eerste argument is altijd url, haal op wat er op de eerste url staat
// dus /delete/
// fetch is eigenlijk gewoon een HTTP request sturen
// dit is een asynchrone api, dat betekent dat wat je typt,
// niet altijd meteen wordt uitgevoerd
fetch(`/delete/${id}`, {method: "DELETE"})
.then(onDelete)
.then(onSucces, onError);
}

function onDelete (res) {
  // het res objet wordt een json file
  // asynchrone
  return res.json();
}

function onSucces (){
  console.log("Werkt");
  window.location = "/";
}

function onError (){
  throw new Error("Werkt niet pik!");
}

deleteButton.addEventListener("click", sendDelete);
