import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response("OpenAI key missing", { status: 500 });
    }

    // 1️⃣ Read data from frontend
    const {
      email,
      mealType,
      calories,
      protein,
      carbs,
      fat,
      gender
    } = await req.json();

    if (!email || !mealType || !calories) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // 2️⃣ Arabic AI prompt (high quality, reusable)
    const prompt = `
أنت أخصائي تغذية محترف.
أنشئ خطة وجبات يومية باللغة العربية فقط.

المعلومات:
- الجنس: ${gender}
- السعرات اليومية: ${calories} سعرة
- البروتين: ${protein} جرام
- الكربوهيدرات: ${carbs} جرام
- الدهون: ${fat} جرام
- نوع الخطة: ${mealType}

المطلوب:
- فطور
- غداء
- عشاء
- وجبتين خفيفتين
- كميات واضحة
- أطعمة عربية أو شائعة
- لا تذكر أي تحذيرات طبية
`;

    // 3️⃣ Call OpenAI
    const openAIResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "أنت مساعد تغذية ذكي" },
            { role: "user", content: prompt }
          ],
          temperature: 0.7
        })
      }
    );

    const aiData = await openAIResponse.json();

    if (!aiData.choices?.length) {
      throw new Error("Invalid AI response");
    }

    const mealPlan = aiData.choices[0].message.content;

    // 4️⃣ Return to frontend
    return new Response(
      JSON.stringify({
        success: true,
        mealPlan
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "AI generation failed" }),
      { status: 500 }
    );
  }
});
