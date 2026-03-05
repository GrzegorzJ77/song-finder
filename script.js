// ======== SPRAWDZENIE OBSŁUGI SPEECH RECOGNITION ========
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    alert("Twoja przeglądarka nie obsługuje rozpoznawania mowy!");
}

const recognition = new SpeechRecognition();
recognition.lang = 'pl-PL'; // język polski
recognition.interimResults = false;
recognition.maxAlternatives = 1;

// ======== ELEMENTY HTML ========
const startBtn = document.getElementById('startRecording');
const userText = document.getElementById('userText');
const resultsList = document.getElementById('results');

// ======== TWÓJ TOKEN SPOTIFY ========
const accessToken = "TU_WKLEJ_SWÓJ_TOKEN"; // wklej tutaj swój token

// ======== PRZYCISK NAGRYWANIA ========
startBtn.addEventListener('click', () => {
    userText.textContent = "Słucham...";
    recognition.start();
});

// ======== OBSŁUGA WYNIKÓW NAGRANIA ========
recognition.addEventListener('result', (event) => {
    const transcript = event.results[0][0].transcript;
    userText.textContent = `Powiedziałeś: "${transcript}"`;
    console.log("Rozpoznany tekst:", transcript);

    // Wywołanie funkcji wyszukiwania w Spotify
    searchSpotify(transcript);
});

recognition.addEventListener('speechend', () => {
    recognition.stop();
});

recognition.addEventListener('error', (event) => {
    userText.textContent = 'Błąd rozpoznawania mowy: ' + event.error;
    console.error("Błąd SpeechRecognition:", event.error);
});

// ======== FUNKCJA WYSZUKIWANIA W SPOTIFY ========
async function searchSpotify(query) {
    resultsList.innerHTML = "<li>Ładowanie...</li>";
    
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`;
    console.log("Zapytanie do Spotify:", url);

    try {
        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });

        console.log("Odpowiedź Spotify:", response);

        if (!response.ok) {
            resultsList.innerHTML = `<li>Błąd: ${response.status} ${response.statusText}</li>`;
            const errorData = await response.json();
            console.error("Szczegóły błędu Spotify:", errorData);
            return;
        }

        const data = await response.json();
        console.log("Dane Spotify:", data);

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

    } catch (error) {
        resultsList.innerHTML = "<li>Błąd połączenia z API</li>";
        console.error("Błąd fetch Spotify:", error);
    }
}
