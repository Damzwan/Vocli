export async function playTTS(text: string, lang: string) {
    if (!text) return;

    try {
        // Call your Cloud Function
        const response = await fetch(import.meta.env.VITE_TTS_API_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({text, lang}),
        });

        if (!response.ok) {
            console.error("TTS request failed:", response.statusText);
            return;
        }

        const data = await response.json();
        const audioBase64 = data.audio;
        const audioData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
        const blob = new Blob([audioData], { type: "audio/wav" }); // or "audio/ogg" if Opus
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();

    } catch (err) {
        console.error("Error playing TTS:", err);
    }
}