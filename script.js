// ======== KONFIGURACJA SPOTIFY ========
const clientId = "d46489fc111b45aea775339b985ebf31"; // Twój Client ID z Spotify Dashboard
const redirectUri = "https://grzegorzj77.github.io/song-finder/"; // Twój URL GitHub Pages
const scopes = "user-read-private user-read-email playlist-modify-public";

// ======== ELEMENTY HTML ========
const startBtn = document.getElementById('startRecording');
const loginBtn = document.getElementById('loginBtn');
const userText = document.getElementById('userText');
const resultsList = document.getElementById('results');

// ======== USUNIĘCIE TOKENA NA START ========
let accessToken = null;  // zakładamy nowego użytkownika
window.history.replaceState({}, document.title, redirectUri); // usuń hash z URL na start

// ======== PRZYCISK LOGOWANIA ========
loginBtn.style.display = "block"; // zawsze widoczny
loginBtn.addEventListener('click', () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    window.location = authUrl;
});

// ======== FUNKCJA DO POBRANIA TOKENA Z URL ========
function getTokenFromUrl() {
    const hash = window.location.hash;
    if (!hash) return null;
    const params = new URLSearchParams(hash.replace('#', '?'));
    return params.get('access_token');
}

// ======== SPRAWDZENIE, CZY UŻYTKOWNIK WRÓCIŁ Z SPOTIFY ========
window.addEventListener('load', () => {
    const tokenFromUrl = getTokenFromUrl();
    if (tokenFromUrl && tokenFromUrl !== "") {
        accessToken = tokenFromUrl;
        console.log("Token Spotify pobrany:", accessToken);

        // usuń hash z URL, aby strona była czysta
        window.history.replaceState({}, document.title, redirectUri);
    }
});

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
startBtn.addEventListener('click', () => {
    if (!accessToken) {
        alert("Najpierw zaloguj się do Spotify!");
        return;
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
        alert("Brak tokena – zaloguj się do Spotify!");
        return;
    }

    resultsList.innerHTML = "<li>Ładowanie...</li>";

    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`;
    console.log("Zapytanie do Spotify:", url);

    try {
        const response = await fetch(url, {
            headers: { "Authorization": `Bearer ${accessToken}` }
        });

        if (response.status === 401) {
            // Token wygasł lub nieprawidłowy
            alert("Twój token wygasł lub jest nieprawidłowy. Zaloguj się ponownie do Spotify.");
            accessToken = null;
            resultsList.innerHTML = "";
            return;
        }

        if (!response.ok) {
            resultsList.innerHTML = `<li>Błąd: ${response.status} ${response.statusText}</li>`;
            const errorData = await response.json();
            console.error("Błąd Spotify:", errorData);
            return;
        }

        const data = await response.json();
        console.log("Dane Spotify:", data);

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
