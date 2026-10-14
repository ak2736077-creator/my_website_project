// History ko browser mein save karna
const HISTORY_KEY = "myWebsiteHistory";

// Saved history load karna
function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch (error) {
        return [];
    }
}

// History ko browser mein save karna
function saveHistory(history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

// History table mein entries dikhana
function displayHistory() {
    const history = loadHistory();
    const logs = document.getElementById("logs");

    logs.innerHTML = "";

    history.forEach(item => {
        const row = document.createElement("tr");

        const periodCell = document.createElement("td");
        periodCell.textContent = item.period;

        const predictionCell = document.createElement("td");
        predictionCell.textContent = item.prediction;

        const numberCell = document.createElement("td");
        numberCell.textContent = item.number;

        const statusCell = document.createElement("td");
        statusCell.textContent = item.status;
        statusCell.className = item.status === "WIN" ? "win" : "loss";

        row.append(periodCell, predictionCell, numberCell, statusCell);
        logs.appendChild(row);
    });
}

// Page load hote hi saved history dikhana
displayHistory();

// 1) Apna naam yahan aur index.html mein "YOUR NAME" ki jagah likhein.
const ADMIN_PASS = "AALOK DADDY";
const BIG_POOL = [5, 6, 7, 8, 9];
const SMALL_POOL = [0, 1, 2, 3, 4];

let currentOpposites = [];
let lastId = null;
let savedPrediction = null;
let savedOpps = [];

// Demo UI ke admin panel ko kholna/band karna
const adminButton = document.getElementById("adminButton");
const closeAdminButton = document.getElementById("closeAdminButton");
const overlay = document.getElementById("overlay");
const adminPanel = document.getElementById("adminPanel");

adminButton.addEventListener("click", () => {
  const enteredPassword = prompt("PASSWORD:");
  if (enteredPassword === ADMIN_PASS) {
    adminPanel.classList.remove("hidden");
    overlay.classList.remove("hidden");
  } else if (enteredPassword !== null) {
    alert("Incorrect password");
  }
});

function closeAdmin() {
  adminPanel.classList.add("hidden");
  overlay.classList.add("hidden");
}

closeAdminButton.addEventListener("click", closeAdmin);
overlay.addEventListener("click", closeAdmin);

// This is a simple trend-based demo, not a reliable prediction system.
function getPrediction(numbers) {
  const trend = numbers.slice(0, 3).map((item) =>
    Number(item.number) >= 5 ? "BIG" : "SMALL"
  );
  return trend.filter((item) => item === "BIG").length > 1 ? "BIG" : "SMALL";
}

async function updateDashboard() {
  try {
    const response = await fetch(
      "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json"
    );
    if (!response.ok) throw new Error("Could not fetch latest data");

    const json = await response.json();
    const history = json?.data?.list;

    if (!Array.isArray(history) || history.length === 0) {
      throw new Error("No history data received");
    }

    const latest = history[0];
    const nextPrediction = getPrediction(history);

    if (lastId !== latest.issueNumber) {
      const actualSize = Number(latest.number) >= 5 ? "BIG" : "SMALL";
      const predictionToCheck = savedPrediction || nextPrediction;
      const selectedPool = predictionToCheck === "BIG" ? BIG_POOL : SMALL_POOL;
      const oppositePool = predictionToCheck === "BIG" ? SMALL_POOL : BIG_POOL;

      const num1 = selectedPool[Math.floor(Math.random() * selectedPool.length)];
      const num2 = oppositePool[Math.floor(Math.random() * oppositePool.length)];
      currentOpposites = [num1, num2];

      if (lastId !== null) {
        const isWin =
          predictionToCheck === actualSize ||
          savedOpps.includes(Number(latest.number));

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${String(latest.issueNumber).slice(-3)}</td>
          <td>${predictionToCheck}</td>
          <td>${latest.number}</td>
          <td class="${isWin ? "win" : "loss"}">${isWin ? "WIN" : "LOSS"}</td>
        `;
        document.getElementById("logs").prepend(row);


const history = loadHistory();

history.unshift({
    period: String(latest.issueNumber).slice(-3),
    prediction: predictionToCheck,
    number: latest.number,
    status: isWin ? "WIN" : "LOSS"
});

// Sirf latest 100 entries save hongi
saveHistory(history.slice(0, 100));

// Table ko update karna
displayHistory();

      }

      lastId = latest.issueNumber;
      savedPrediction = nextPrediction;
      savedOpps = currentOpposites;
    }

    document.getElementById("pID").textContent =
      "PERIOD: " + (BigInt(latest.issueNumber) + 1n).toString();
    document.getElementById("pRes").textContent = nextPrediction;
    document.getElementById("pOpps").textContent =
      "NUMBERS: " + currentOpposites.join(", ");
  } catch (error) {
    console.error("Dashboard update failed:", error);
    document.getElementById("pOpps").textContent =
      "DATA LOAD FAILED — check connection or data source";
  }
}

// Start once immediately, then refresh every 3 seconds.
updateDashboard();
setInterval(updateDashboard, 3000);
