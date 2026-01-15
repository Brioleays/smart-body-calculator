const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid method" }),
        { status: 405, headers: corsHeaders }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("Missing OpenAI API key");
    }

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
        JSON.stringify({ success: false, error: "Missing fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const prompt = `
أنت خبير تغذية.
أنشئ خطة وجبات يومية باللغة العربية فقط.

- النوع: ${gender}
- السعرات: ${calories}
- البروتين: ${protein}g
- الكربوهيدرات: ${carbs}g
- الدهون: ${fat}g
- نوع النظام: ${mealType}

قسّم الخطة إلى:
فطور
غداء
عشاء
وجبات خفيفة
`;

    const aiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [
            { role: "system", content: "أنت مساعد غذائي محترف." },
            { role: "user", content: prompt }
          ],
          temperature: 0.6
        })
      }
    );

    const aiData = await aiRes.json();
    if (!aiRes.ok) {
      throw new Error(aiData.error?.message || "OpenAI request failed");
    }

    return new Response(
      JSON.stringify({
        success: true,
        mealPlan: aiData.choices[0].message.content
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );

  } catch (err) {
    console.error("EDGE FUNCTION ERROR:", err);

    return new Response(
      JSON.stringify({
        success: false,
        error: err.message
      }),
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
});
