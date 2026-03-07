const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");
const voiceBtn = document.getElementById("voiceBtn");

searchBtn.onclick = search;

async function search(){

const query = searchInput.value;

if(!query) return;

const url =
"https://spotify23.p.rapidapi.com/search/?q=" +
encodeURIComponent(query) +
"&type=tracks&limit=12";

const options = {
method: "GET",
headers: {
"X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY",
"X-RapidAPI-Host": "spotify23.p.rapidapi.com"
}
};

try{

const res = await fetch(url, options);
const data = await res.json();

showResults(data.tracks.items);

searchYoutube(query);

}catch(e){

console.error(e);

}

}

function showResults(items){

resultsDiv.innerHTML="";

items.forEach(item=>{

const track = item.data;

const img = track.albumOfTrack.coverArt.sources[0].url;
const title = track.name;
const artist = track.artists.items[0].profile.name;
const preview = track.preview_url;

const card = document.createElement("div");

card.className="card";

card.innerHTML=`

<img src="${img}">

<div class="title">${title}</div>

<div class="artist">${artist}</div>

${preview ? `<audio controls class="preview" src="${preview}"></audio>` : ""}

`;

resultsDiv.appendChild(card);

});

}

function searchYoutube(query){

const videoDiv=document.getElementById("videoSection");

videoDiv.innerHTML=

`<h2>Teledysk</h2>

<iframe src="https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}"></iframe>`;

}

if("webkitSpeechRecognition" in window){

const recognition=new webkitSpeechRecognition();

recognition.lang="pl-PL";

voiceBtn.onclick=()=>{

recognition.start();

};

recognition.onresult=e=>{

searchInput.value=e.results[0][0].transcript;

search();

};

}
