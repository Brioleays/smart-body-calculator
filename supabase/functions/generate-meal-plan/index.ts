const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid method" }),
        {
          headers: corsHeaders,
          status: 405,
        }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing OpenAI key" }),
        {
          headers: corsHeaders,
          status: 500,
        }
      );
    }

    const {
      email,
      mealType,
      calories,
      protein,
      carbs,
      fat,
      gender,
    } = await req.json();

    if (!email || !mealType || !calories) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing fields" }),
        {
          headers: corsHeaders,
          status: 400,
        }
      );
    }

    /* =========================
       Arabic AI Prompt
    ========================== */
    const prompt = `
أنت خبير تغذية.
أنشئ خطة وجبات يومية باللغة العربية فقط.

المعلومات:
- النوع: ${gender}
- السعرات اليومية: ${calories}
- البروتين: ${protein}g
- الكربوهيدرات: ${carbs}g
- الدهون: ${fat}g
- نوع النظام: ${mealType}

قسّم الخطة إلى:
فطور
غداء
عشاء
وجبات خفيفة

استخدم أطعمة بسيطة ومتوفرة.
لا تضف أي شرح خارج الخطة.
`;

    /* =========================
       OpenAI Call
    ========================== */
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "أنت مساعد غذائي محترف." },
          { role: "user", content: prompt },
        ],
        temperature: 0.6,
      }),
    });

    const aiData = await aiRes.json();

    if (!aiRes.ok) {
      console.error(aiData);
      throw new Error("OpenAI request failed");
    }

    const mealPlan =
      aiData.choices?.[0]?.message?.content || "تعذر إنشاء الخطة";

    /* =========================
       Success Response
    ========================== */
    return new Response(
      JSON.stringify({
        success: true,
        mealPlan,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});
