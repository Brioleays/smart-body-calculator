function initUIControls() {
  /* =========================
     Gender Toggle + Status
  ========================== */

  const maleBtn = document.getElementById("male");
  const femaleBtn = document.getElementById("female");
  const statusContainer = document.getElementById("status-container");
  const hipContainer = document.getElementById("hip-container");


  function setGender(active) {

    [maleBtn, femaleBtn].forEach(btn =>
      btn.classList.remove("bg-primary", "text-white", "rounded-full")
    );

    active.classList.add("bg-primary", "text-white", "rounded-full");

    if (active === maleBtn) {
      statusContainer.classList.add("hidden");
      statusContainer.querySelector("select").value = "none";
      hipContainer.classList.add("hidden");
      document.getElementById("hip").value = "";
    } else {
      statusContainer.classList.remove("hidden");
      hipContainer.classList.remove("hidden");
    }
  }

  maleBtn.addEventListener("click", () => setGender(maleBtn));
  femaleBtn.addEventListener("click", () => setGender(femaleBtn));

  /* =========================
     Advanced Measurements
  ========================== */
  const advancedToggle = document.querySelector(
    "#advanced-measurement-container input[type='checkbox']"
  );
  const advancedMeasurements = document.getElementById("advanced-measurements");
  const basicFat = document.getElementById("basicfc");
  const advancedFat = document.getElementById("advancedfc");

  function toggleAdvancedUI(enabled) {
    advancedMeasurements.classList.toggle("hidden", !enabled);
    basicFat.classList.toggle("hidden", enabled);
    advancedFat.classList.toggle("hidden", !enabled);
  }

  toggleAdvancedUI(false);

  advancedToggle.addEventListener("change", e =>
    toggleAdvancedUI(e.target.checked)
  );

  /* =========================
     AI Meal Plan UI (Scoped)
  ========================== */
  const aiSection = document.getElementById("ai-meal-plan");
  const createMealBtn = aiSection.querySelector(
    "button:not(#cancel-meal-plan)"
  );
  const emailContainer = document.getElementById("email-container");
  const mealTypeSelect = document.getElementById("meal-type");
  const cancelMealBtn = aiSection.querySelector("#cancel-meal-plan");
  const mealInputSection = document.getElementById("mealinput");

  mealInputSection.classList.add("hidden");

  createMealBtn.addEventListener("click", () => {
    mealInputSection.classList.remove("hidden");
    emailContainer.classList.remove("hidden");
    createMealBtn.disabled = true;
    mealTypeSelect.disabled = true;
    createMealBtn.classList.add("opacity-50", "cursor-not-allowed");

    cancelMealBtn.classList.remove("hidden");
  });


  cancelMealBtn.addEventListener("click", () => {
    // Only close AI meal UI
    mealInputSection.classList.add("hidden");

    // Reset AI meal inputs only
    mealInputSection.querySelectorAll("select, textarea").forEach(el => {
      el.value = "";
    });

    // Restore buttons
    createMealBtn.disabled = false;
    createMealBtn.classList.remove("opacity-50", "cursor-not-allowed");
    cancelMealBtn.classList.add("hidden");
  });

  /* =========================
     GLOBAL Reset (Main Form)
  ========================== */
  const mainResetBtn = document.querySelector(
    "section form #reset"
  );

  mainResetBtn.addEventListener("click", () => {
    document.querySelectorAll("input, select, textarea").forEach(el => {
      if (el.type === "checkbox") el.checked = false;
      else el.value = "";
    });

    setGender(femaleBtn);
    toggleAdvancedUI(false);

    // Reset AI section fully
    mealInputSection.classList.add("hidden");
    createMealBtn.disabled = false;
    createMealBtn.classList.remove("opacity-50", "cursor-not-allowed");
    cancelMealBtn.classList.add("hidden");
  });
}

/* =========================
   Init UI
========================== */
document.addEventListener("DOMContentLoaded", initUIControls);

/* === Date (Self-updating, exact format) === */
function getOrdinal(day) {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

function updateDate() {
  const dateEl = document.getElementById("date");
  if (!dateEl) return;

  const now = new Date();

  const day = now.getDate();
  const ordinal = getOrdinal(day);

  const month = now.toLocaleString("en-US", { month: "short" });
  const year = now.getFullYear();

  dateEl.textContent = `${day}${ordinal} ${month}. ${year}`;
}

// run once on load
updateDate();
