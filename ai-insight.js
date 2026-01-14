function generateSummary() {
  const data = window.smartBodyData;
  if (!data) return;

  let summary = `
  مؤشر كتلة جسمك هو ${data.bmi} (${data.bmiLabel}).
  نسبة الدهون المقدرة ${data.bodyFat}%.
  احتياجك اليومي من السعرات حوالي ${data.calories} سعرة حرارية.
  `;

  if (data.bmiLabel === "Overweight") {
    summary += "ننصح بتقليل السعرات وزيادة النشاط البدني.";
  }

  document.getElementById("summary").value = summary.trim();
}

async function generateMealPlan() {
  const data = window.smartBodyData;

  if (!data) {
    alert("يرجى حساب النتائج أولاً");
    return;
  }

  const mealType = document.getElementById("meal-type")?.value?.trim();
  const emailInput = document.getElementById("user-email");

  if (!mealType) {
    alert("يرجى اختيار نوع الوجبة");
    return;
  }

  if (!emailInput || !emailInput.value) {
    alert("يرجى إدخال البريد الإلكتروني");
    return;
  }

  const email = emailInput.value.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("يرجى إدخال بريد إلكتروني صحيح");
    return;
  }

  try {
    const SUPABASE_ANON_KEY = "sb_publishable_1wsugr9SntYndCpXUJlGMQ_hq-DdUeI";

    const res = await fetch(
      "https://dautyurfgvyenuegcjps.supabase.co/functions/v1/generate-meal-plan",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          email,
          mealType,
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
          gender: data.gender
        })
      }
    );


    const result = await res.json();

    if (!res.ok || !result.success) {
      console.error(result);
      throw new Error("AI generation failed");
    }

    document.querySelector("#meal-plan-output").value =
      result.mealPlan;

  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء إنشاء خطة الوجبات");
  }
}
