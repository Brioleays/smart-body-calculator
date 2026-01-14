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

  const mealType = document.getElementById("meal-type").value;
  const email = document.getElementById("user-email").value;

  if (!mealType) {
    alert("يرجى اختيار نوع الوجبة");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("يرجى إدخال بريد إلكتروني صحيح");
    return;
  }

  try {
    const res = await fetch(
      "https://dautyurfgvyenuegcjps.supabase.co/functions/v1/generate-meal-plan",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
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
      throw new Error("AI generation failed");
    }

    // Show AI meal plan in textarea
    document.querySelector("#mealinput textarea").value =
      result.mealPlan;

  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء إنشاء خطة الوجبات");
  }

}

