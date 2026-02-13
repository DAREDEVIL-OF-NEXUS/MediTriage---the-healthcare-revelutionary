function toTitleCase(text) {
    return String(text)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getSeverityClass(severity) {
    const s = String(severity || "").toLowerCase();
    if (s === "mild") return "badge-mild";
    if (s === "moderate") return "badge-moderate";
    return "badge-serious";
}

function getRecommendations(severity, disease) {
    const cards = [];
    const normalizedSeverity = String(severity || "").toLowerCase();
    const normalizedDisease = String(disease || "").toLowerCase();

    cards.push({
        title: "Hydration",
        text: "Drink fluids regularly and avoid dehydration throughout the day."
    });

    cards.push({
        title: "Rest",
        text: "Take adequate rest and avoid heavy exertion until symptoms improve."
    });

    if (normalizedSeverity === "mild") {
        cards.push({
            title: "Home Monitoring",
            text: "Track symptoms for 24-48 hours and seek care if they worsen."
        });
    } else if (normalizedSeverity === "moderate") {
        cards.push({
            title: "Doctor Consultation",
            text: "Book a doctor visit soon for clinical evaluation and guidance."
        });
    } else {
        cards.push({
            title: "Urgent Attention",
            text: "Seek urgent medical care promptly, especially if symptoms are increasing."
        });
    }

    if (normalizedDisease.includes("asthma")) {
        cards.push({
            title: "Breathing Care",
            text: "Avoid smoke, dust, and known triggers. Keep rescue inhaler available if prescribed."
        });
    } else if (normalizedDisease.includes("hypertension")) {
        cards.push({
            title: "Blood Pressure Care",
            text: "Limit salt intake, avoid stress spikes, and monitor blood pressure if possible."
        });
    } else if (normalizedDisease.includes("cold") || normalizedDisease.includes("flu")) {
        cards.push({
            title: "Infection Care",
            text: "Maintain hygiene, isolate when needed, and monitor fever and breathing."
        });
    }

    cards.push({
        title: "Emergency Red Flags",
        text: "Get immediate help for chest pain, severe breathlessness, confusion, or fainting."
    });

    return cards.slice(0, 6);
}

function getCardColor(index) {
    const hue = (index * 57 + 18) % 360;
    return {
        bg: `hsl(${hue} 95% 92%)`,
        border: `hsl(${hue} 65% 70%)`
    };
}

function renderReport() {
    const diseaseName = document.getElementById("diseaseName");
    const severityText = document.getElementById("severityText");
    const severityBadge = document.getElementById("severityBadge");
    const symptomChips = document.getElementById("symptomChips");
    const recommendationGrid = document.getElementById("recommendationGrid");

    const raw = sessionStorage.getItem("meditriage_result");
    if (!raw) {
        diseaseName.textContent = "No Result Data";
        severityText.textContent = "Unavailable";
        severityBadge.textContent = "Missing";
        severityBadge.classList.add("badge-serious");
        recommendationGrid.innerHTML = "<p>Please go back and run symptom analysis again.</p>";
        return;
    }

    const data = JSON.parse(raw);
    const disease = data.predicted_disease || "Unknown";
    const severity = data.severity || "Serious";
    const symptoms = Array.isArray(data.symptoms) ? data.symptoms : [];

    diseaseName.textContent = toTitleCase(disease);
    severityText.textContent = toTitleCase(severity);
    severityBadge.textContent = toTitleCase(severity);
    severityBadge.classList.add(getSeverityClass(severity));

    if (symptoms.length === 0) {
        symptomChips.innerHTML = "<span class='chip'>No symptoms recorded</span>";
    } else {
        symptoms.forEach((symptom) => {
            const chip = document.createElement("span");
            chip.className = "chip";
            chip.textContent = toTitleCase(symptom);
            symptomChips.appendChild(chip);
        });
    }

    const recommendationCards = getRecommendations(severity, disease);
    recommendationCards.forEach((item, index) => {
        const card = document.createElement("article");
        card.className = "recommendation-card";
        const color = getCardColor(index);
        card.style.background = color.bg;
        card.style.borderColor = color.border;
        card.innerHTML = `<h4>${item.title}</h4><p>${item.text}</p>`;
        recommendationGrid.appendChild(card);
    });
}

renderReport();
