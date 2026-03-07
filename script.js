const CLIENT_ID = "d46489fc111b45aea775339b985ebf31";
const REDIRECT_URI = window.location.origin + window.location.pathname;

let accessToken = null;

const loginBtn = document.getElementById("loginBtn");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");
const voiceBtn = document.getElementById("voiceBtn");

/* Logowanie do Spotify */
loginBtn.onclick = () => {
const authUrl =
"https://accounts.spotify.com/authorize" +
"?client_id=" + CLIENT_ID +
"&response_type=token" +
"&redirect_uri=" + encodeURIComponent(REDIRECT_URI);
window.location = authUrl;
}

/* Pobranie tokenu z URL */
function getToken(){
if(window.location.hash){
const hash = window.location.hash.substring(1);
const params = new URLSearchParams(hash);
accessToken = params.get("access_token");
window.location.hash = "";
}
}

getToken();

/* Wyszukiwanie */
searchBtn.onclick = search;

async function search(){
const query = searchInput.value;
if(!query || !accessToken) return;

const url =
"https://api.spotify.com/v1/search?q="+
encodeURIComponent(query)+
"&type=track&limit=12";

const res = await fetch(url,{
headers:{
Authorization:"Bearer "+accessToken
}
});

const data = await res.json();

showResults(data.tracks.items);
searchYoutube(query);
}

/* Wyświetlanie wyników */
function showResults(tracks){
resultsDiv.innerHTML="";

tracks.forEach(track=>{
const card = document.createElement("div");
card.className="card";

const img = track.album.images[0]?.url;
const preview = track.preview_url;

card.innerHTML=` <img src="${img}">

<div class="title">${track.name}</div>
<div class="artist">${track.artists[0].name}</div>
${preview ? `<audio controls class="preview" src="${preview}"></audio>` : ""}
`;

resultsDiv.appendChild(card);
});
}

/* Teledyski YouTube */
function searchYoutube(query){
const videoDiv=document.getElementById("videoSection");
videoDiv.innerHTML=
`<h2>Teledysk</h2>

<iframe src="https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}"></iframe>`;
}

/* Wyszukiwanie głosowe */
if("webkitSpeechRecognition" in window){
const recognition=new webkitSpeechRecognition();
recognition.lang="pl-PL";

voiceBtn.onclick=()=>{ recognition.start(); };

recognition.onresult=e=>{
searchInput.value=e.results[0][0].transcript;
search();
};
}
