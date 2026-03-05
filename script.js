// Sprawdzenie, czy przeglądarka obsługuje SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    alert("Twoja przeglądarka nie obsługuje rozpoznawania mowy!");
}

const recognition = new SpeechRecognition();
recognition.lang = 'pl-PL'; // język polski
recognition.interimResults = false; 
recognition.maxAlternatives = 1;

const startBtn = document.getElementById('startRecording');
const userText = document.getElementById('userText');
const resultsList = document.getElementById('results');

startBtn.addEventListener('click', () => {
    userText.textContent = "Słucham...";
    recognition.start();
});

recognition.addEventListener('result', (event) => {
    const transcript = event.results[0][0].transcript;
    userText.textContent = `Powiedziałeś: "${transcript}"`;
    console.log("Rozpoznany tekst:", transcript);
    
    // wywołaj funkcję wyszukiwania piosenek
    searchSpotify(transcript);
});

recognition.addEventListener('speechend', () => {
    recognition.stop();
});

recognition.addEventListener('error', (event) => {
    userText.textContent = 'Błąd rozpoznawania mowy: ' + event.error;
});

// ... Twój wcześniejszy kod z SpeechRecognition

async function searchSpotify(query) {
    resultsList.innerHTML = "<li>Ładowanie...</li>";

    // Tymczasowo: demo token
    const accessToken = "TU_WKLEJ_SWÓJ_ACCESS_TOKEN";
    
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });

    const data = await response.json();
    resultsList.innerHTML = "";

    if (data.tracks && data.tracks.items.length > 0) {
        data.tracks.items.forEach(track => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${track.name}</strong> – ${track.artists[0].name} <a href="${track.external_urls.spotify}" target="_blank">Odtwórz</a>`;
            resultsList.appendChild(li);
        });
    } else {
        resultsList.innerHTML = "<li>Nie znaleziono żadnych piosenek.</li>";
    }
}
