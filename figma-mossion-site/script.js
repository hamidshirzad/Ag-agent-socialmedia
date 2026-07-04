const campaigns = [
  { name: "Pipeline lift", channel: "LinkedIn + Email", owner: "Autopilot", status: "active", score: "94%" },
  { name: "Retarget warm accounts", channel: "Paid Social", owner: "Needs review", status: "review", score: "82%" },
  { name: "Partner launch wave", channel: "Partner", owner: "Autopilot", status: "active", score: "89%" },
  { name: "Search intent capture", channel: "Search", owner: "Autopilot", status: "active", score: "91%" },
];

const views = {
  mission: "Launch a growth mission",
  audience: "Cluster priority audiences",
  content: "Generate creative variants",
  signals: "Read live market signals",
};

const table = document.querySelector("#campaignTable");
const filterButtons = document.querySelectorAll("[data-filter]");
const railButtons = document.querySelectorAll("[data-view]");
const workspaceTitle = document.querySelector("#workspaceTitle");
const budgetRange = document.querySelector("#budgetRange");
const budgetValue = document.querySelector("#budgetValue");
const campaignName = document.querySelector("#campaignName");
const channelFocus = document.querySelector("#channelFocus");
const previewTitle = document.querySelector("#previewTitle");
const forecastValue = document.querySelector("#forecastValue");
const leadValue = document.querySelector("#leadValue");
const confidenceValue = document.querySelector("#confidenceValue");
const engineStatus = document.querySelector("#engineStatus");
const autoToggle = document.querySelector("#autoToggle");
const commandModal = document.querySelector("#commandModal");

function renderCampaigns(filter = "all") {
  const rows = campaigns.filter((campaign) => filter === "all" || campaign.status === filter);

  table.innerHTML = rows
    .map(
      (campaign) => `
        <div class="campaign-row">
          <div>
            <div class="campaign-name">${campaign.name}</div>
            <div class="campaign-meta">${campaign.channel}</div>
          </div>
          <div class="campaign-meta">${campaign.owner}</div>
          <div class="campaign-meta">Signal score ${campaign.score}</div>
          <span class="tag ${campaign.status === "review" ? "review" : ""}">${campaign.status}</span>
        </div>
      `,
    )
    .join("");
}

function updateForecast() {
  const budget = Number(budgetRange.value);
  const channelBonus = channelFocus.value.includes("LinkedIn") ? 5 : channelFocus.value.includes("Search") ? 8 : 3;
  const forecast = Math.min(64, Math.round(budget * 0.54 + channelBonus));
  const leads = Math.round(budget * 30.5 + channelBonus * 19);
  const confidence = Math.min(96, Math.round(72 + budget / 5));

  budgetValue.textContent = `$${budget}k`;
  previewTitle.textContent = campaignName.value.trim() || "Untitled growth mission";
  forecastValue.textContent = `+${forecast}%`;
  leadValue.textContent = leads.toLocaleString();
  confidenceValue.textContent = `${confidence}%`;
}

function armEngine(message) {
  engineStatus.textContent = message;
  engineStatus.animate(
    [
      { transform: "scale(1)", filter: "brightness(1)" },
      { transform: "scale(1.04)", filter: "brightness(1.25)" },
      { transform: "scale(1)", filter: "brightness(1)" },
    ],
    { duration: 520, easing: "ease-out" },
  );
}

railButtons.forEach((button) => {
  button.addEventListener("click", () => {
    railButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    workspaceTitle.textContent = views[button.dataset.view];
    armEngine(`${button.textContent.trim()} ready`);
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    renderCampaigns(button.dataset.filter);
  });
});

document.querySelector("#missionForm").addEventListener("submit", (event) => {
  event.preventDefault();
  updateForecast();
  armEngine("Mission generated");
});

document.querySelector("#runDemo").addEventListener("click", () => {
  budgetRange.value = String(Math.min(120, Number(budgetRange.value) + 12));
  updateForecast();
  armEngine("Demo running");
  document.querySelector("#mission").scrollIntoView({ behavior: "smooth", block: "start" });
});

autoToggle.addEventListener("click", () => {
  const isOn = autoToggle.classList.toggle("is-on");
  autoToggle.setAttribute("aria-pressed", String(isOn));
  armEngine(isOn ? "Autonomy on" : "Human review mode");
});

budgetRange.addEventListener("input", updateForecast);
campaignName.addEventListener("input", updateForecast);
channelFocus.addEventListener("change", updateForecast);

document.querySelector("#openCommand").addEventListener("click", () => {
  commandModal.hidden = false;
});

document.querySelector("#closeCommand").addEventListener("click", () => {
  commandModal.hidden = true;
});

document.querySelector("#modalAction").addEventListener("click", () => {
  commandModal.hidden = true;
  armEngine("Engine launched");
  document.querySelector("#mission").scrollIntoView({ behavior: "smooth", block: "start" });
});

commandModal.addEventListener("click", (event) => {
  if (event.target === commandModal) {
    commandModal.hidden = true;
  }
});

renderCampaigns();
updateForecast();
