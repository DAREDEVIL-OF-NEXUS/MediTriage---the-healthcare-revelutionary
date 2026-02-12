const form = document.getElementById("symptomForm");
const resultBox = document.getElementById("result");
const severityText = document.getElementById("severity");
const diseaseText = document.getElementById("disease");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const symptoms = [];
    document.querySelectorAll("input:checked").forEach(input => {
        symptoms.push(input.value);
    });

    if (symptoms.length === 0) {
        alert("Please select at least one symptom.");
        return;
    }

    try {
        // Determine URL based on environment (Local vs Vercel)
        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:";
        const API_URL = isLocal ? "http://127.0.0.1:5000/predict" : "/api/predict";

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ symptoms })
        });

        const data = await response.json();

        resultBox.classList.remove("hidden", "mild", "moderate", "serious");

        if (data.severity === "Mild") {
            resultBox.classList.add("mild");
        } else if (data.severity === "Moderate") {
            resultBox.classList.add("moderate");
        } else {
            resultBox.classList.add("serious");
        }

        severityText.innerText = `Severity: ${data.severity}`;
        diseaseText.innerText = `Possible Disease: ${data.predicted_disease}`;

    } catch (error) {
        alert("Backend not running or error occurred.");
        console.error(error);
    }
});
