// Adding API base Azure url
const API_BASE = window.location.hostname.includes('localhost')
  ? 'http://localhost:3000'
  : 'https://risk-calculator-api-d6dea9a7ehcxc2fw.canadacentral-01.azurewebsites.net';

// Health ping to check if server is awake
(async function pingServer() {
  const pingUrl = `${API_BASE}/api/health`;
  const start = performance.now();
  try {
    const res = await fetch(pingUrl, { method: "GET" });
    const end = performance.now();
    console.log(`⏱️ Ping took ${(end - start).toFixed(2)} ms`);
    if (res.ok) {
      console.log("✅ Server is awake and responsive");
    } else {
      console.warn(`⚠️ Server responded with status: ${res.status}`);
    }
  } catch (err) {
    console.error("❌ Failed to ping server:", err);
  }
})();

// Function to validate all inputs before continuing
function validateInputs() {
  const age = Number(document.getElementById("age").value);
  const heightFt = Number(document.getElementById("heightFt").value);
  const heightIn = Number(document.getElementById("heightIn").value);
  const weight = Number(document.getElementById("weight").value);
  const bpSys = Number(document.getElementById("bpSys").value);
  const bpDia = Number(document.getElementById("bpDia").value);

  if (age < 1 || age > 120) return "⚠️ Age must be between 1 and 120.";
  if (heightFt < 2 || heightFt > 8) return "⚠️ Height (feet) must be between 2 and 8.";
  if (heightIn < 0 || heightIn > 11) return "⚠️ Height (inches) must be between 0 and 11.";
  if (weight < 50 || weight > 700) return "⚠️ Weight must be between 50 and 700 lbs.";
  if (bpSys < 70 || bpSys > 250) return "⚠️ Systolic BP must be between 70 and 250.";
  if (bpDia < 40 || bpDia > 150) return "⚠️ Diastolic BP must be between 40 and 150.";
  return null;
}

// Handle form submission
document.getElementById("riskForm").addEventListener("submit", async (e) => {
  e.preventDefault();

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
    const resultDiv = document.getElementById("result");

    if (data.error) {
      resultDiv.innerHTML = `<p style="color:red;">${data.error}</p>`;
    } else {
      resultDiv.innerHTML = `
        <h3>Results:</h3>
        <p><strong>BMI:</strong> ${data.bmi} (${data.bmiCategory})</p>
        <p><strong>Blood Pressure:</strong> ${data.bloodPressureCategory}</p>
        <p><strong>Total Score:</strong> ${data.totalScore}</p>
        <p><strong>Risk Category:</strong> ${data.riskCategory}</p>
      `;
    }
    resultDiv.style.display = "block";
  } catch (err) {
    document.getElementById("result").innerHTML =
      `<p style="color:red;">Error connecting to server: ${err.message}</p>`;
  }
});

// Summary Section
const nextBtn = document.getElementById("nextBtn");
const summarySection = document.getElementById("summarySection");
const summaryList = document.getElementById("summaryList");
const confirmBtn = document.getElementById("confirmBtn");

nextBtn.addEventListener("click", () => {
  const error = validateInputs();
  if (error) {
    alert(error);
    return; // Stops from continuing if validation fails
  }

  const age = document.getElementById("age").value;
  const heightFt = document.getElementById("heightFt").value;
  const heightIn = document.getElementById("heightIn").value;
  const weight = document.getElementById("weight").value;
  const bpSys = document.getElementById("bpSys").value;
  const bpDia = document.getElementById("bpDia").value;
  const familyHistory = document.getElementById("familyHistory").value;

  summaryList.innerHTML = `
    <li><strong>Age:</strong> ${age}</li>
    <li><strong>Height:</strong> ${heightFt} ft ${heightIn} in</li>
    <li><strong>Weight:</strong> ${weight} lbs</li>
    <li><strong>Blood Pressure:</strong> ${bpSys}/${bpDia}</li>
    <li><strong>Family History:</strong> ${familyHistory || "None"}</li>
  `;

  summarySection.style.display = "block";
  document.getElementById("riskForm").style.display = "none";
  document.getElementById("result").style.display = "none";
});

confirmBtn.addEventListener("click", async () => {
  document.getElementById("riskForm").requestSubmit();
});
