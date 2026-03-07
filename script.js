const clientId="d46489fc111b45aea775339b985ebf31";
const redirectUri=window.location.origin+window.location.pathname;

const loginBtn=document.getElementById("loginBtn");
const searchBtn=document.getElementById("searchBtn");
const searchInput=document.getElementById("searchInput");
const resultsDiv=document.getElementById("results");
const voiceBtn=document.getElementById("voiceBtn");

let accessToken=null;

loginBtn.onclick=()=>{

const scopes="user-read-private";

const url=
"https://accounts.spotify.com/authorize"+
"?response_type=token"+
"&client_id="+clientId+
"&scope="+encodeURIComponent(scopes)+
"&redirect_uri="+encodeURIComponent(redirectUri);

window.location=url;
};

function getTokenFromUrl(){

const hash=window.location.hash;

if(hash){

const params=new URLSearchParams(hash.replace("#",""));

accessToken=params.get("access_token");

window.location.hash="";

}

}

getTokenFromUrl();

searchBtn.onclick=search;

async function search(){

const query=searchInput.value;

if(!accessToken){

alert("Najpierw zaloguj się do Spotify");

return;

}

const url=`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=12`;

const res=await fetch(url,{
headers:{
Authorization:"Bearer "+accessToken
}
});

const data=await res.json();

showResults(data.tracks.items);

searchYoutube(query);

}

function showResults(tracks){

resultsDiv.innerHTML="";

tracks.forEach(track=>{

const card=document.createElement("div");

card.className="card";

const img=track.album.images[0]?.url;

const preview=track.preview_url;

card.innerHTML=`

<img src="${img}">

<div class="title">${track.name}</div>

<div class="artist">${track.artists[0].name}</div>

${preview?`<audio controls class="preview" src="${preview}"></audio>`:""}

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
