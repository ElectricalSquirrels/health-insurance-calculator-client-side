// Azure API base URL
const API_BASE = window.location.hostname.includes('localhost')
  ? 'http://localhost:3000'
  : 'https://risk-calculator-api-d6dea9a7ehcxc2fw.canadacentral-01.azurewebsites.net';

// Ping the server to wake it up
(async function pingServer() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (res.ok) console.log("✅ Server is awake");
  } catch {
    console.warn("⚠️ Server unreachable");
  }
})();

// Cache DOM elements
const form = document.getElementById("riskForm");
const summarySection = document.getElementById("summarySection");
const summaryList = document.getElementById("summaryList");
const resultDiv = document.getElementById("result");
const nextBtn = document.getElementById("nextBtn");
const confirmBtn = document.getElementById("confirmBtn");

// Show summary before final calculation
nextBtn.addEventListener("click", () => {
  const age = document.getElementById("age").value;
  const heightFt = document.getElementById("heightFt").value;
  const heightIn = document.getElementById("heightIn").value;
  const weight = document.getElementById("weight").value;
  const bpSys = document.getElementById("bpSys").value;
  const bpDia = document.getElementById("bpDia").value;
  const familyHistory = document.getElementById("familyHistory").value;

  // Basic validation
  if (!age || !heightFt || !weight || !bpSys || !bpDia) {
    alert("⚠️ Please fill out all required fields before continuing.");
    return;
  }

  summaryList.innerHTML = `
    <li><strong>Age:</strong> ${age}</li>
    <li><strong>Height:</strong> ${heightFt} ft ${heightIn} in</li>
    <li><strong>Weight:</strong> ${weight} lbs</li>
    <li><strong>Blood Pressure:</strong> ${bpSys}/${bpDia}</li>
    <li><strong>Family History:</strong> ${familyHistory || "None"}</li>
  `;

  form.style.display = "none";
  summarySection.style.display = "block";
  resultDiv.style.display = "none";
});

// Confirm → calculate results
confirmBtn.addEventListener("click", async () => {
  const age = Number(document.getElementById("age").value);
  const heightFt = Number(document.getElementById("heightFt").value);
  const heightIn = Number(document.getElementById("heightIn").value);
  const weight = Number(document.getElementById("weight").value);
  const systolic = Number(document.getElementById("bpSys").value);
  const diastolic = Number(document.getElementById("bpDia").value);
  const familyHistoryInput = document.getElementById("familyHistory").value;
  const familyHistory = familyHistoryInput
    ? familyHistoryInput.split(",").map(c => c.trim())
    : [];

  const userData = { age, heightFt, heightIn, weight, systolic, diastolic, familyHistory };

  try {
    const response = await fetch(`${API_BASE}/api/calculate-risk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    let insurableStatus =
      data.riskCategory === "uninsurable" ? "❌ Uninsurable" : "✅ Insurable";

    let bmiColor =
      data.bmiCategory.toLowerCase().includes("obese") ? "red" :
      data.bmiCategory.toLowerCase().includes("overweight") ? "orange" :
      "green";

    resultDiv.innerHTML = `
      <h3>Results:</h3>
      <p><strong>BMI:</strong> ${data.bmi} <span style="color:${bmiColor};">(${data.bmiCategory})</span></p>
      <p><strong>Blood Pressure:</strong> ${data.bloodPressureCategory}</p>
      <p><strong>Total Score:</strong> ${data.totalScore}</p>
      <p><strong>Risk Category:</strong> ${data.riskCategory}</p>
      <p><strong>Status:</strong> ${insurableStatus}</p>
      <button id="startOverBtn">🔄 Start Over</button>
    `;

    summarySection.style.display = "none";
    resultDiv.style.display = "block";

    document.getElementById("startOverBtn").addEventListener("click", () => {
      form.reset();
      resultDiv.style.display = "none";
      form.style.display = "block";
    });

  } catch (err) {
    resultDiv.innerHTML = `<p style="color:red;">Error connecting to server.</p>`;
    summarySection.style.display = "none";
    resultDiv.style.display = "block";
  }
});
