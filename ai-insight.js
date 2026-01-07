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
  if (!window.smartBodyData) {
    alert("")
    return;
  }

  const mealType = document.getElementById("meal-type").value;
  const email = document.getElementById("user-email").value;
  const data = window.smartBodyData;
  

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("يرجى إدخال بريد إلكتروني صحيح");
    return;
  }



  if (!mealType || !data) {
    alert("يرجى اختيار نوع الوجبة");
    return;
  }

  // 🔹 Save to Supabase
  const { error } = await supabase.from("meal_plan_requests").insert([
    {
      email,
      meal_type: mealType,
      gender: data.gender,
      age: data.age,
      bmi: data.bmi,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat
    }
  ]);

  if (error) {
    alert("حدث خطأ أثناء حفظ البيانات");
    console.error(error);
    return;
  }

  // 🔹 Generate meal plan (temporary static logic)
  generateLocalMealPlan(mealType);
}

function generateLocalMealPlan() {
  

  let plan = "";

  switch (mealType) {
    case "balanced":
      plan = `
فطور: بيض + خبز أسمر + فاكهة
غداء: أرز + دجاج مشوي + خضار
عشاء: زبادي + مكسرات
      `;
      break;

    case "high_protein":
      plan = `
فطور: بيض مسلوق + زبادي يوناني
غداء: صدر دجاج + خضار
عشاء: تونة أو سمك
      `;
      break;

    case "low_carb":
      plan = `
فطور: أومليت خضار
غداء: لحم مشوي + سلطة
عشاء: جبن + مكسرات
      `;
      break;

    case "keto":
      plan = `
فطور: بيض + أفوكادو
غداء: سمك دهني + زبدة
عشاء: جبن كامل الدسم
      `;
      break;

    case "intermittent_fasting":
      plan = `
وجبة أولى: بروتين + كربوهيدرات معقدة
وجبة ثانية: خضار + دهون صحية
      `;
      break;

    case "mediterranean":
      plan = `
فطور: زيت زيتون + خبز حبوب كاملة
غداء: سمك + خضار
عشاء: فواكه + مكسرات
      `;
      break;

    case "vegetarian":
      plan = `
فطور: شوفان + فاكهة
غداء: عدس أو حمص
عشاء: خضار مطهية
      `;
      break;
  }

  document.querySelector("#mealinput textarea").value = plan.trim();
}

document.addEventListener("DOMContentLoaded", () => {
  const mealTypeSelect = document.getElementById("meal-type");

  if (!mealTypeSelect) return;

});
