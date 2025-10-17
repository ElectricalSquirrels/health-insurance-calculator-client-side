// Adding API base Azure url
const API_BASE = window.location.hostname.includes('localhost')
  ? 'http://localhost:3000'
  : 'https://risk-calculator-api-d6dea9a7ehcxc2fw.canadacentral-01.azurewebsites.net';



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

  const userData = {
    age,
    heightFt,
    heightIn,
    weight,
    systolic,
    diastolic,
    familyHistory
  };

  try {
    const response = await fetch(`${API_BASE}/api/calculate-risk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status} ${response.statusText} — ${text}`);
    }

    const data = await response.json();
    const resultDiv = document.getElementById("result");

    if (data.error) {
      resultDiv.innerHTML = `<p style="color:red;">${data.error}</p>`;
    } else {
      let insurableStatus = data.riskCategory === "uninsurable"
        ? "❌ Uninsurable"
        : "✅ Insurable";

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

      //  Show result 
      resultDiv.style.display = "block";
      resultDiv.classList.add("show");

      //  Start Over button 
      document.getElementById("startOverBtn").addEventListener("click", () => {
        document.getElementById("riskForm").reset();
        resultDiv.style.display = "none";
        summarySection.style.display = "none";
        document.getElementById("riskForm").style.display = "block";
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
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
  const age = document.getElementById("age").value;
  const heightFt = document.getElementById("heightFt").value;
  const heightIn = document.getElementById("heightIn").value;
  const weight = document.getElementById("weight").value;
  const bpSys = document.getElementById("bpSys").value;
  const bpDia = document.getElementById("bpDia").value;
  const familyHistory = document.getElementById("familyHistory").value;

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

  summarySection.style.display = "block";
  document.getElementById("riskForm").style.display = "none";
  document.getElementById("result").style.display = "none";
});

//  Confirm & Calculate button 
confirmBtn.addEventListener("click", async () => {
  summarySection.style.display = "none";          
  document.getElementById("riskForm").style.display = "none"; 
  document.getElementById("result").style.display = "block";  
  document.getElementById("riskForm").requestSubmit();        
});
