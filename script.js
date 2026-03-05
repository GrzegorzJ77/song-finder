// ======== KONFIGURACJA SPOTIFY ========
const clientId = "d46489fc111b45aea775339b985ebf31"; // Twój Client ID
const clientSecret = "ac1c35a25a5648af9c486106791822d0"; // Twój Client Secret

// ======== ELEMENTY HTML ========
const startBtn = document.getElementById('startRecording');
const userText = document.getElementById('userText');
const resultsList = document.getElementById('results');

let accessToken = null;

// ======== FUNKCJA POBIERANIA TOKENA (Client Credentials Flow) ========
async function getSpotifyToken() {
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const creds = btoa(`${clientId}:${clientSecret}`);

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${creds}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        const data = await response.json();
        accessToken = data.access_token;
        console.log("Token Spotify pobrany:", accessToken);
    } catch (error) {
        console.error("Błąd pobierania tokena:", error);
        alert("Nie udało się pobrać tokena Spotify");
    }
}

// ======== SPRAWDZENIE OBSŁUGI SPEECH RECOGNITION ========
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    alert("Twoja przeglądarka nie obsługuje rozpoznawania mowy!");
}

const recognition = new SpeechRecognition();
recognition.lang = 'pl-PL';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

// ======== PRZYCISK NAGRYWANIA ========
startBtn.addEventListener('click', async () => {
    // pobierz token jeśli jeszcze go nie ma
    if (!accessToken) {
        await getSpotifyToken();
    }

    userText.textContent = "Słucham...";
    recognition.start();
});

// ======== OBSŁUGA WYNIKÓW NAGRANIA ========
recognition.addEventListener('result', (event) => {
    const transcript = event.results[0][0].transcript;
    userText.textContent = `Powiedziałeś: "${transcript}"`;
    console.log("Rozpoznany tekst:", transcript);
    searchSpotify(transcript);
});

recognition.addEventListener('speechend', () => recognition.stop());
recognition.addEventListener('error', (event) => {
    userText.textContent = 'Błąd rozpoznawania mowy: ' + event.error;
    console.error("Błąd SpeechRecognition:", event.error);
});

// ======== FUNKCJA WYSZUKIWANIA PIOSENEK W SPOTIFY ========
async function searchSpotify(query) {
    if (!accessToken) {
        alert("Brak tokena Spotify");
        return;
    }

    resultsList.innerHTML = "<li>Ładowanie...</li>";

    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`;

    try {
        const response = await fetch(url, {
            headers: { "Authorization": `Bearer ${accessToken}` }
        });

        if (!response.ok) {
            resultsList.innerHTML = `<li>Błąd: ${response.status} ${response.statusText}</li>`;
            const errorData = await response.json();
            console.error("Błąd Spotify:", errorData);
            return;
        }

        const data = await response.json();
        resultsList.innerHTML = "";

        if (data.tracks && data.tracks.items.length > 0) {
            data.tracks.items.forEach(track => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <strong>${track.name}</strong> – ${track.artists[0].name} 
                    <a href="${track.external_urls.spotify}" target="_blank">Odtwórz</a>
                `;
                resultsList.appendChild(li);
            });
        } else {
            resultsList.innerHTML = "<li>Nie znaleziono żadnych piosenek.</li>";
        }

    } catch (error) {
        resultsList.innerHTML = "<li>Błąd połączenia z API</li>";
        console.error("Błąd fetch:", error);
    }
}
