// server/src/routes/ai.routes.js
import { Router } from "express";
import OpenAI from "openai";
import { sql } from "../db/sql.js";
import { env } from "../config/env.js";
import { requireAuth } from "../middleware/authz.js";

export const aiRoutes = Router();

// Khởi tạo client (có thể null nếu chưa set key)
const openai = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

/* ------------ Lấy catalog (an toàn ngay cả khi DB rỗng) ------------ */
async function fetchCatalog(q = "", plan = "FREE") {
  try {
    const like = `%${q}%`;
    const whereLessons = q ? sql`where "title" ilike ${like}` : sql``;
    const wherePrograms = q ? sql`where "title" ilike ${like}` : sql``;

    const [lessons, programs] = await Promise.all([
      sql`
        select id, title, "premiumOnly", duration
        from "Lesson"
        ${whereLessons}
        order by "createdAt" desc
        limit 6
      `,
      sql`
        select id, title, category, "planMin"
        from "Program"
        ${wherePrograms}
        order by "createdAt" desc
        limit 6
      `,
    ]);

    return { lessons, programs };
  } catch {
    return { lessons: [], programs: [] };
  }
}

const SYSTEM_PROMPT = `
Bạn là trợ lý dinh dưỡng & huấn luyện của TripleTwo. Nói chuyện thân thiện, ngắn gọn, tiếng Việt.
QUY TẮC:
- Ưu tiên an toàn: không chẩn đoán bệnh, không kê thuốc.
- Dinh dưỡng: gợi ý bữa ăn (~kcal + macro) và 2–4 lựa chọn tương đương.
- Tập luyện: gợi ý theo mục tiêu (compound/core/cardio), kèm hiệp/reps cơ bản cho người mới/đã tập.
- Nếu phù hợp, đề xuất 2–3 bài học/chương trình trong danh mục (CONTEXT) với link nội bộ:
  • Lesson: /video?id=<lessonId>
  • Program: /program/<category>
- Tôn trọng hạn chế người dùng (ăn chay/không sữa/ít muối…).
- Kết thúc bằng 1–2 tips ngắn dễ làm.
- Nhắc: "Nội dung chỉ mang tính tham khảo. Nếu có bệnh nền, hãy hỏi bác sĩ/HLV."
`;

/* ----------------------------- Ping ----------------------------- */
// Ping cũng yêu cầu đăng nhập để đảm bảo FE check được phiên (optional)
aiRoutes.get("/ping", requireAuth, (_req, res) =>
  res.json({ ok: true, ts: Date.now() })
);

/* ----------------------------- Chat ----------------------------- */
// ✅ BẮT BUỘC ĐĂNG NHẬP
aiRoutes.post("/chat", requireAuth, async (req, res) => {
  try {
    const { message = "", history = [] } = req.body || {};
    const userPlan = req.user?.subscriptionPlan || "FREE";
    const userMsg = String(message).slice(0, 1000);

    const catalog = await fetchCatalog(userMsg, userPlan);

    // Trả lời giả lập nếu chưa có key (để test Frontend ⇄ Backend)
    if (!openai) {
      return res.json({
        ok: true,
        reply:
          "Môi trường dev chưa cấu hình OPENAI_API_KEY, trả lời demo:\n\n" +
          "• Ăn: ~500 kcal bữa trưa (ức gà 150g, cơm gạo lứt 120g, salad dầu ôliu). " +
          "Protein ~35–40g / Carb ~55–60g / Fat ~12–15g.\n" +
          "• Tập: 3 buổi/tuần 30' (Toàn thân – Nghỉ – Core/Cardio – Nghỉ – Push/Pull nhẹ).\n\n" +
          "Bạn có thể mở các bài học/chương trình trong app để theo ngay.",
        catalog,
        suggestions: [
          "Gợi ý bữa ~500 kcal giàu protein",
          "Lịch tập 3 buổi/tuần cho người mới",
          "Ăn gì trước/sau tập?",
        ],
      });
    }

    // Chuẩn bị CONTEXT để mô hình biết bạn đang có gì trong app
    const ctxLessons =
      catalog.lessons.length > 0
        ? catalog.lessons
            .map(
              (l) =>
                `• [Lesson#${l.id}] ${l.title} (${l.duration || 0}m)${
                  l.premiumOnly ? " — premium" : ""
                } → /video?id=${l.id}`
            )
            .join("\n")
        : "• (Không có lesson phù hợp)";

    const ctxPrograms =
      catalog.programs.length > 0
        ? catalog.programs
            .map((p) => {
              const cat = String(p.category || "").toLowerCase(); // ⬅️ đảm bảo link FE đúng
              return `• [Program] ${p.title} — category: ${cat} — min: ${p.planMin} → /program/${cat}`;
            })
            .join("\n")
        : "• (Không có program phù hợp)";

    const CONTEXT = `CONTEXT
PLAN: ${userPlan}
LESSONS:
${ctxLessons}

PROGRAMS:
${ctxPrograms}`;

    // Lấy history gần nhất để gọn prompt
    const trimmedHistory = history.slice(-8).map(({ role, content }) => ({
      role,
      content: String(content || "").slice(0, 1000),
    }));

    const messages = [
      { role: "system", content: SYSTEM_PROMPT + "\n" + CONTEXT },
      ...trimmedHistory,
      { role: "user", content: userMsg },
    ];

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini", // đổi model nếu tài khoản bạn khác
      messages,
      temperature: 0.65,
      max_tokens: 450,
    });

    const reply =
      resp?.choices?.[0]?.message?.content?.trim() ||
      "Xin lỗi, mình chưa thể trả lời.";

    res.json({
      ok: true,
      reply,
      catalog,
      suggestions: [
        "Gợi ý bữa ~500 kcal giàu protein",
        "Lịch tập 3 buổi/tuần cho người mới",
        "Ăn gì trước/sau tập?",
      ],
    });
  } catch (e) {
    console.error("AI_CHAT_ERROR:", e);
    res
      .status(500)
      .json({ ok: false, message: "Không gọi được AI, thử lại nhé." });
  }
});
