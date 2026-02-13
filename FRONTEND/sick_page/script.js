const form = document.getElementById("symptomForm");
const API_BASE_URL = getBaseUrl();
const fallbackSymptoms = [
    "fever",
    "cough",
    "headache",
    "chest_pain",
    "shortness_of_breath",
    "nausea",
    "fatigue",
    "sore_throat",
    "runny_nose"
];

function getSymptomCardColor(symptom, index) {
    // Stable hue per symptom so colors are varied and predictable.
    let hash = 0;
    for (let i = 0; i < symptom.length; i++) {
        hash = (hash << 5) - hash + symptom.charCodeAt(i);
        hash |= 0;
    }

    const hue = Math.abs((hash + index * 29) % 360);
    const bg = `hsl(${hue} 88% 90%)`;
    const border = `hsl(${hue} 62% 66%)`;
    const text = `hsl(${hue} 58% 24%)`;

    return { bg, border, text };
}

// Decide API URL based on environment
function getBaseUrl() {
    const { protocol, hostname, port } = window.location;

    if (protocol === "file:") {
        return "http://127.0.0.1:5000";
    }

    const isLocalHost = hostname === "127.0.0.1" || hostname === "localhost";
    const isStaticDevPort = port === "5500" || port === "5501" || port === "3000";

    if (isLocalHost && isStaticDevPort) {
        return "http://127.0.0.1:5000";
    }

    return ""; // deployed environment (same origin)
}

function getApiCandidates(path) {
    if (API_BASE_URL) {
        return [`${API_BASE_URL}${path}`];
    }
    return [path, `/api${path}`];
}

async function fetchFromCandidates(path, options = undefined) {
    const candidates = getApiCandidates(path);
    let lastError = null;

    for (const url of candidates) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            }
            lastError = new Error(`Failed ${url} with status ${response.status}`);
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error(`Request failed for ${path}`);
}

function showBackendWarning(message) {
    let notice = document.getElementById("backend-status");

    if (!notice) {
        notice = document.createElement("p");
        notice.id = "backend-status";
        notice.style.margin = "0 0 12px";
        notice.style.padding = "10px 12px";
        notice.style.borderRadius = "10px";
        notice.style.fontSize = "13px";
        notice.style.background = "#fff3cd";
        notice.style.color = "#856404";
        notice.style.border = "1px solid #f5df98";
        form.insertBefore(notice, document.getElementById("symptomSearch"));
    }

    notice.textContent = message;
}

// Load symptoms dynamically
async function loadSymptoms() {
    const container = document.getElementById("symptom-container");
    container.innerHTML = "";

    function renderSymptoms(symptoms) {
        symptoms.forEach((symptom, index) => {
            const label = document.createElement("label");
            label.classList.add("card");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = symptom;

            const span = document.createElement("span");
            span.textContent = symptom.replace(/_/g, " ");

            const colors = getSymptomCardColor(symptom, index);
            label.style.setProperty("--card-bg", colors.bg);
            label.style.setProperty("--card-border", colors.border);
            label.style.setProperty("--card-text", colors.text);
            label.style.setProperty("--card-delay", `${Math.min(index * 28, 500)}ms`);

            label.appendChild(checkbox);
            label.appendChild(span);
            container.appendChild(label);
        });
    }

    try {
        const response = await fetchFromCandidates("/symptoms");
        const symptoms = await response.json();
        if (!Array.isArray(symptoms) || symptoms.length === 0) {
            throw new Error("Symptoms API returned empty/non-array data");
        }
        renderSymptoms(symptoms);
    } catch (error) {
        renderSymptoms(fallbackSymptoms);
        showBackendWarning("Backend is unreachable. Showing limited symptom list.");
        console.error("Failed to load symptoms:", error);
    }
}

loadSymptoms();


// Search functionality
document.getElementById("symptomSearch").addEventListener("input", function () {
    const search = this.value.toLowerCase();
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(search) ? "" : "none";
    });
});


// Form submission
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
        const response = await fetchFromCandidates("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ symptoms })
        });

        const data = await response.json();
        const payload = {
            severity: data.severity,
            predicted_disease: data.predicted_disease,
            symptoms,
            generated_at: new Date().toISOString()
        };

        sessionStorage.setItem("meditriage_result", JSON.stringify(payload));
        window.location.href = "../result_page/result.html";

    } catch (error) {
        alert("Backend not reachable. Start the server and try again.");
        console.error(error);
    }
});
