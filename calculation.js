/* =========================
   CONFIGURATION CONSTANTS
========================= */

// BMI ranges
const BMI = {
  UNDERWEIGHT: 18.5,
  NORMAL_MAX: 24.9,
  OVERWEIGHT_MAX: 29.9
};

// BMR (Mifflin–St Jeor)
const BMR = {
  MALE_OFFSET: 5,
  FEMALE_OFFSET: -161
};

// Activity multipliers
const ACTIVITY_FACTOR = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9
};

// Goal adjustment
const GOAL_FACTOR = {
  lose: 0.85,
  maintain: 1,
  gain: 1.1
};

// Body fat – BMI method
const BODY_FAT_BASIC = {
  BMI_MULTIPLIER: 1.2,
  AGE_MULTIPLIER: 0.23,
  MALE_OFFSET: -16.2,
  FEMALE_OFFSET: -5.4
};

// Body fat – US Navy
const BODY_FAT_ADVANCED = {
  MALE: { A: 86.010, B: 70.041, C: 36.76 },
  FEMALE: { A: 163.205, B: 97.684, C: -78.387 }
};

// Muscle estimation
const MUSCLE_RATIO = 0.5;

// Nutrition
const NUTRITION = {
  PROTEIN_PER_KG: 1.6,
  FAT_PER_KG: 0.9,
  CAL_PROTEIN: 4,
  CAL_CARBS: 4,
  CAL_FAT: 9
};

// Water
const WATER = {
  ML_PER_KG: 35,
  ML_PER_CUP: 240
};

/* =========================
   HELPERS
========================= */

const $ = id => document.getElementById(id);
const round = (n, d = 1) => Number(n.toFixed(d));

function getGender() {
  return $("male")?.classList.contains("bg-primary")
    ? "male"
    : "female";
}

function markInvalid(...elements) {
  elements.forEach(el => {
    if (!el) return;
    el.classList.add("border-red-400", "bg-red-50");
  });
}

function clearInvalid(...elements) {
  elements.forEach(el => {
    if (!el) return;
    el.classList.remove("border-red-400", "bg-red-50");
  });
}


/* =========================
   MAIN CALCULATION
========================= */

function calculateResults() {
  const advancedToggle = document.querySelector(
  "#advanced-measurement-container input[type='checkbox']"
);
  const advancedUIEnabled = advancedToggle?.checked;

  const age = +$("age")?.value;
  const weight = +$("weight")?.value;
  const heightCm = +$("height")?.value;
  const activity = $("activity-level")?.value;
  // const goal = $("goal")?.value || "maintain";
  const goal = "maintain";


  if (!age || !weight || !heightCm || !activity) {
    alert("يرجى إدخال جميع البيانات المطلوبة");
    return;
  }


  const heightM = heightCm / 100;
  const gender = getGender();
  const isMale = gender === "male";

  /* === BMI === */
  const bmi = weight / (heightM ** 2);

  let bmiLabel = "Normal";
  if (bmi < BMI.UNDERWEIGHT) bmiLabel = "Underweight";
  else if (bmi <= BMI.NORMAL_MAX) bmiLabel = "Normal";
  else if (bmi <= BMI.OVERWEIGHT_MAX) bmiLabel = "Overweight";
  else bmiLabel = "Obese";


  $("bmi-value").textContent = round(bmi);
  $("bmi-vtowords").textContent = bmiLabel;

  /* === Ideal Weight Range === */
  $("iwr-value").textContent =
    `${round(BMI.UNDERWEIGHT * heightM ** 2)} – ${round(BMI.NORMAL_MAX * heightM ** 2)}`;

  /* === Calories === */
  const baseBmr =
    10 * weight +
    6.25 * heightCm -
    5 * age +
    (isMale ? BMR.MALE_OFFSET : BMR.FEMALE_OFFSET);

  const calories =
    baseBmr *
    ACTIVITY_FACTOR[activity] *
    GOAL_FACTOR[goal];

  $("calories-value").textContent = round(calories);

    /* === Body Fat Calculation === */

  const waist = +$("waist")?.value;
  const neck = +$("neck")?.value;
  const hip = +$("hip")?.value;

  const waistEl = $("waist");
  const neckEl = $("neck");
  const hipEl = $("hip");

  clearInvalid(waistEl, neckEl, hipEl);

  let bodyFat;

  const advancedEnabled =
    waist > 0 &&
    neck > 0 &&
    (isMale || hip > 0) &&
    advancedUIEnabled;

  let invalidAdvanced = false;

  if (advancedEnabled) {
    if (waist <= neck) {
      markInvalid(waistEl, neckEl);
      invalidAdvanced = true;
    }

    if (!isMale && waist + hip <= neck) {
      markInvalid(waistEl, hipEl, neckEl);
      invalidAdvanced = true;
    }
  }

  const useAdvanced = advancedEnabled && !invalidAdvanced;

  if (useAdvanced) {
    bodyFat = isMale
      ? BODY_FAT_ADVANCED.MALE.A * Math.log10(waist - neck)
        - BODY_FAT_ADVANCED.MALE.B * Math.log10(heightCm)
        + BODY_FAT_ADVANCED.MALE.C
      : BODY_FAT_ADVANCED.FEMALE.A * Math.log10(waist + hip - neck)
        - BODY_FAT_ADVANCED.FEMALE.B * Math.log10(heightCm)
        + BODY_FAT_ADVANCED.FEMALE.C;

    $("advanced-fc-value") &&
      ($("advanced-fc-value").textContent = round(bodyFat));
  } else {
    const sexFactor = isMale ? 1 : 0;

    bodyFat =
      BODY_FAT_BASIC.BMI_MULTIPLIER * bmi +
      BODY_FAT_BASIC.AGE_MULTIPLIER * age -
      10.8 * sexFactor -
      5.4;

    bodyFat = Math.min(Math.max(bodyFat, 3), 60);

    $("basic-fc-value") &&
      ($("basic-fc-value").textContent = round(bodyFat));
      $("advanced-fc-value") && ($("advanced-fc-value").textContent = "N/A");

  }



  /* === Muscle Mass === */
  const leanMass = weight * (1 - bodyFat / 100);
  $("mme-value").textContent = round(leanMass * MUSCLE_RATIO);

  /* === Nutrition === */
  const protein = weight * NUTRITION.PROTEIN_PER_KG;
  const fat = weight * NUTRITION.FAT_PER_KG;
  
  $("fat-value").textContent = round(fat);
  

  /* === Water === */
  const waterMl = weight * WATER.ML_PER_KG;
  /* === Female Status Adjustment === */

  let adjustedCalories = calories;
  let adjustedProtein = protein;
  let adjustedWaterMl = waterMl;

  const status = $("status")?.value;

  if (gender === "female") {
  if (status === "Pregnant") {
    adjustedCalories += 300;
    adjustedProtein += 15;
    adjustedWaterMl += 500;
  }

  if (status === "breastfeeding") {
    adjustedCalories += 500;
    adjustedProtein += 20;
    adjustedWaterMl += 800;
  }
  }
  /* === Nutrition (adjusted carbs) === */
const adjustedRemainingCalories =
  adjustedCalories -
  adjustedProtein * NUTRITION.CAL_PROTEIN -
  fat * NUTRITION.CAL_FAT;

const adjustedCarbs =
  Math.max(0, adjustedRemainingCalories) / NUTRITION.CAL_CARBS;

  $("carbs-value").textContent = round(adjustedCarbs);
  $("calories-value").textContent = round(adjustedCalories);
  $("protein-value").textContent = round(adjustedProtein);

  $("water-value").innerHTML =
    `<span class="text-primary">L</span> ${round(adjustedWaterMl / 1000, 1)}`;

  $("water-cups") &&
    ($("water-cups").innerHTML =
      `<span>cups</span> ${round(adjustedWaterMl / WATER.ML_PER_CUP, 0)}`);

  window.smartBodyData = {
  gender,
  age,
  bmi: round(bmi),
  bmiLabel,
  bodyFat: round(bodyFat),
  calories: round(adjustedCalories),
  protein: round(adjustedProtein),
  carbs: round(adjustedCarbs),
  fat: round(fat),
  waterLiters: round(adjustedWaterMl / 1000, 1),
  };

  if (typeof generateSummary === "function") {
    generateSummary();
  }
  document.getElementById("meal-type").disabled = false;

}

/* =========================
   INIT
========================= */
function printResults() {
  window.print();
}


function shareWhatsApp() {
  const data = window.smartBodyData;
  if (!data) return;

  const text = `
نتائجي الصحية:
BMI: ${data.bmi} (${data.bmiLabel})
سعراتي اليومية: ${data.calories} kcal
بروتين: ${data.protein}g
ماء: ${data.waterLiters}L
`;

  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}


