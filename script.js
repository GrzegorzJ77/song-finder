const CLIENT_ID = "d46489fc111b45aea775339b985ebf31";
const CLIENT_SECRET = "ac1c35a25a5648af9c486106791822d0";

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");
const voiceBtn = document.getElementById("voiceBtn");

let token = null;

/* pobranie tokenu - frontend-only (tylko do testów!) */
async function getToken(){

if(token) return token;

const auth = btoa(CLIENT_ID + ":" + CLIENT_SECRET);

const res = await fetch(
"https://accounts.spotify.com/api/token",
{
method:"POST",
headers:{
"Authorization":"Basic "+auth,
"Content-Type":"application/x-www-form-urlencoded"
},
body:"grant_type=client_credentials"
}
);

const data = await res.json();

token = data.access_token;

return token;
}

/* wyszukiwanie */
searchBtn.onclick = search;

async function search(){

const query = searchInput.value;
if(!query) return;

const accessToken = await getToken();

const url = "https://api.spotify.com/v1/search?q="+
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

/* pokazanie wyników */
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

/* YouTube teledyski */
function searchYoutube(query){
const videoDiv=document.getElementById("videoSection");
videoDiv.innerHTML=
`<h2>Teledysk</h2>

<iframe src="https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}"></iframe>`;
}

/* wyszukiwanie głosowe */
if("webkitSpeechRecognition" in window){
const recognition=new webkitSpeechRecognition();
recognition.lang="pl-PL";

voiceBtn.onclick=()=>{ recognition.start(); };

recognition.onresult=e=>{
searchInput.value=e.results[0][0].transcript;
search();
};
}
