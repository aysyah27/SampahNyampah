const video = document.getElementById('video');
const hasilDiv = document.getElementById('hasil');
const btn = document.getElementById('btnAnalisis');
const container = document.querySelector('.container');

// Konfigurasi API
const GEMINI_API_KEY = "AIzaSyCBDjmkvxZMl1J0vI3QMXTNe8D-rKtrIeo";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;

// Inisialisasi Kamera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
        });
        video.srcObject = stream;
        hasilDiv.innerText = "Kamera Siap! Arahkan ke objek.";
    } catch (err) {
        hasilDiv.innerText = "❌ Gagal akses kamera: " + err.message;
    }
}

// Logika Deteksi
btn.onclick = async () => {
    hasilDiv.innerHTML = "<span class='loading'>⏳ Gemini 3 sedang berpikir...</span>";
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];

    const payload = {
        contents: [{
            parts: [
                { text: "Apakah ini sampah ORGANIK atau ANORGANIK? Jawab dalam format: [KATEGORI] - Nama Benda." },
                { inline_data: { mime_type: "image/jpeg", data: base64Image } }
            ]
        }]
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (data.error) throw new Error(data.error.message);

        const teksHasil = data.candidates[0].content.parts[0].text;
        hasilDiv.innerHTML = `<h3>Hasil:</h3> ${teksHasil}`;
        
        // Update Warna Container berdasarkan Kategori
        const isAnorganik = teksHasil.toUpperCase().includes("ANORGANIK");
        container.style.borderColor = isAnorganik ? "#007bff" : "#28a745";

    } catch (err) {
        hasilDiv.innerText = "❌ Error: " + err.message;
    }
};

// Jalankan kamera saat halaman dimuat
startCamera();
