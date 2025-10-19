const API_BASE = window.location.hostname.includes('localhost')
  ? 'http://localhost:3000'
  : 'https://risk-calculator-api-d6dea9a7ehcxc2fw.canadacentral-01.azurewebsites.net';

const riskForm = document.getElementById("riskForm");
const nextBtn = document.getElementById("nextBtn");
const confirmBtn = document.getElementById("confirmBtn");
const resultDiv = document.getElementById("result");
const summarySection = document.getElementById("summarySection");
const summaryList = document.getElementById("summaryList");
const errorDiv = document.getElementById("errorMessage");
const welcomeMsg = document.getElementById("welcomeMsg");
if (welcomeMsg) welcomeMsg.style.display = "block";

// Helper for showing errors
function showError(message, field) {
  errorDiv.textContent = message;
  if (field) {
    field.classList.add("invalid");
    field.focus();
  }
  return false;
}


// Validate all inputs
function validateInputs() {
  errorDiv.textContent = "";
  document.querySelectorAll("input").forEach(i => i.classList.remove("invalid"));

  const age = Number(document.getElementById("age").value);
  const heightFt = Number(document.getElementById("heightFt").value);
  const heightIn = Number(document.getElementById("heightIn").value);
  const weight = Number(document.getElementById("weight").value);
  const bpSys = Number(document.getElementById("bpSys").value);
  const bpDia = Number(document.getElementById("bpDia").value);

  if (!age || age < 1 || age > 120) return showError("⚠️ Age must be between 1 and 120.", document.getElementById("age"));
  if (!heightFt || heightFt < 2 || heightFt > 8) return showError("⚠️ Height (feet) must be between 2 and 8.", document.getElementById("heightFt"));
  if (heightIn < 0 || heightIn > 11) return showError("⚠️ Height (inches) must be between 0 and 11.", document.getElementById("heightIn"));
  if (!weight || weight < 50 || weight > 700) return showError("⚠️ Weight must be between 50 and 700 lbs.", document.getElementById("weight"));
  if (!bpSys || bpSys < 70 || bpSys > 250) return showError("⚠️ Systolic BP must be between 70 and 250.", document.getElementById("bpSys"));
  if (!bpDia || bpDia < 40 || bpDia > 150) return showError("⚠️ Diastolic BP must be between 40 and 150.", document.getElementById("bpDia"));

  return true;
}

// Summary button
nextBtn.addEventListener("click", () => {
  if (!validateInputs()) return;
  if (welcomeMsg) welcomeMsg.style.display = "none";

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

  riskForm.style.display = "none";
  summarySection.style.display = "block";
});

// Confirm button
confirmBtn.addEventListener("click", async () => {
  const age = Number(document.getElementById("age").value);
  const heightFt = Number(document.getElementById("heightFt").value);
  const heightIn = Number(document.getElementById("heightIn").value);
  const weight = Number(document.getElementById("weight").value);
  const systolic = Number(document.getElementById("bpSys").value);
  const diastolic = Number(document.getElementById("bpDia").value);
  const familyHistory = document.getElementById("familyHistory").value
    ? document.getElementById("familyHistory").value.split(",").map(c => c.trim())
    : [];

  const userData = { age, heightFt, heightIn, weight, systolic, diastolic, familyHistory };

  try {
    const res = await fetch(`${API_BASE}/api/calculate-risk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });

    const data = await res.json();

    let color = data.bmiCategory.toLowerCase().includes("obese") ? "red" :
                data.bmiCategory.toLowerCase().includes("overweight") ? "orange" : "green";

    resultDiv.innerHTML = `
      <h3>Results:</h3>
      <p><strong>BMI:</strong> ${data.bmi} <span style="color:${color}">(${data.bmiCategory})</span></p>
      <p><strong>Blood Pressure:</strong> ${data.bloodPressureCategory}</p>
      <p><strong>Total Score:</strong> ${data.totalScore}</p>
      <p><strong>Risk Category:</strong> ${data.riskCategory}</p>
      <button id="startOverBtn">Start Over</button>
    `;

    summarySection.style.display = "none";
    resultDiv.style.display = "block";

    document.getElementById("startOverBtn").addEventListener("click", () => {
      resultDiv.style.display = "none";
      riskForm.reset();
      // Reset views to initial state
      summarySection.style.display = "none";
      if (welcomeMsg) welcomeMsg.style.display = "block";
      riskForm.style.display = "block";
      errorDiv.textContent = "";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

  } catch (err) {
    resultDiv.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }
});
