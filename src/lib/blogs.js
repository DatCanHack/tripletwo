// src/lib/blogs.js

export const BLOGS = [
  {
    id: 1,
    slug: "giu-co-khi-cat-mo-5-meo",
    title: "5 mẹo giữ cơ khi cắt mỡ",
    tag: "Nutrition",
    mins: 4,
    date: "2025-09-13",
    author: {
      name: "TwentyTwo Team",
      avatar: "/images/home/logo.png",
    },
    cover: "/images/blog/avatar/keep-muscle.jpg", // đã đồng nhất folder /images/blog
    excerpt:
      "Cắt mỡ không đồng nghĩa với mất cơ. Tối ưu bữa ăn, giấc ngủ và cường độ tập để lean hơn mà vẫn giữ sức mạnh.",
    content: [
      { type: "h2", text: "1) Giữ protein đủ cao" },
      {
        type: "p",
        text: "Mục tiêu 1.6–2.2 g/kg mỗi ngày. Chia đều 3–4 bữa, ưu tiên nguồn nạc như ức gà, thịt nạc, đậu hũ, whey…",
      },
      { type: "h2", text: "2) Deficit vừa phải" },
      {
        type: "p",
        text: "Giảm 10–20% TDEE là hợp lý. Deficit quá sâu dễ sụt cơ, giảm hiệu suất và thèm ăn mạnh.",
      },
      { type: "h2", text: "3) Tập tạ giữ hiệu suất" },
      {
        type: "p",
        text: "Tiếp tục progressive overload nhưng bảo thủ hơn; giữ volume chính, tránh quá tải và chấn thương.",
      },
      { type: "h2", text: "4) Ngủ đủ" },
      {
        type: "p",
        text: "7–8 giờ/ngày giúp hồi phục và giữ cân bằng hormone khi cut.",
      },
      { type: "h2", text: "5) Cardio vừa phải" },
      {
        type: "p",
        text: "Thêm 1–3 buổi cardio cường độ vừa (LISS) giữa các buổi tập tạ để tăng tiêu hao mà không đuối sức.",
      },
      {
        type: "quote",
        text: "Lean là một quá trình. Đều đặn và khoa học > đốt cháy giai đoạn.",
      },
    ],
  },
  {
    id: 2,
    slug: "metcon-la-gi-danh-cho-ai",
    title: "Metcon là gì? Dành cho ai?",
    tag: "Training",
    mins: 6,
    date: "2025-08-31",
    author: {
      name: "TwentyTwo Team",
      avatar: "/images/home/logo.png",
    },
    cover: "/images/blog/avatar/metcon.jpg",
    excerpt:
      "Metabolic Conditioning (Metcon) là kiểu bài giúp tăng nhịp tim, sức bền và tiêu hao calo nhanh. Cách bắt đầu an toàn cho người mới.",
    content: [
      {
        type: "p",
        text: "Metcon thường gồm các tổ hợp động tác bodyweight/tạ nhẹ theo vòng, nghỉ ngắn.",
      },
      {
        type: "ul",
        items: [
          "Người mới: 10–15 phút, 4–6 động tác",
          "Tuần 2–3 buổi, cách ngày",
          "Ưu tiên kỹ thuật",
        ],
      },
      {
        type: "p",
        text: "Phối hợp với tập tạ trong tuần để vừa đốt mỡ, vừa giữ cơ.",
      },
    ],
  },
  {
    id: 3,
    slug: "bat-dau-yoga-7-tu-the-co-ban",
    title: "Bắt đầu Yoga: 7 tư thế cơ bản",
    tag: "Yoga",
    mins: 5,
    date: "2025-09-25",
    author: {
      name: "TwentyTwo Team",
      avatar: "/images/home/logo.png",
    },
    cover: "/images/blog/cover/yoga.jpg",
    excerpt:
      "7 tư thế giúp làm quen nhịp thở, thăng bằng và độ dẻo: Mountain, Downward Dog, Cobra…",
    content: [
      { type: "h2", text: "1) Mountain" },
      { type: "p", text: "Đứng thẳng, hít sâu, thả lỏng vai, căng nhẹ core." },
      { type: "h2", text: "2) Downward Dog" },
      { type: "p", text: "Kéo giãn lưng sau và gân kheo, giữ hơi thở đều." },
      {
        type: "p",
        text: "… và thêm các tư thế Cobra, Child Pose, Warrior 1, Warrior 2, Bridge.",
      },
    ],
  },
  {
    id: 4,
    slug: "lich-tap-4-ngay-cho-beginner",
    title: "Lịch tập 4 ngày cho Beginner",
    tag: "Programming",
    mins: 7,
    date: "2025-09-28",
    author: {
      name: "TwentyTwo Team",
      avatar: "/images/home/logo.png",
    },
    cover: "/images/blog/cover/cardio.jpg",
    excerpt:
      "Lịch 4 ngày giúp làm quen Compound + Core + Conditioning, dễ bám và dễ tiến bộ.",
    content: [
      {
        type: "ul",
        items: [
          "Ngày 1: Đẩy (ngực – vai – tay sau)",
          "Ngày 2: Kéo (lưng – tay trước)",
          "Ngày 3: Nghỉ/ LISS 20–30’",
          "Ngày 4: Chân – core",
          "Ngày 5: Conditioning (Metcon nhẹ)",
        ],
      },
      { type: "p", text: "Mẹo: ghi log tải và reps, tăng rất nhẹ mỗi tuần." },
    ],
  },
];

/* ====================== Helpers ====================== */

/** Lấy bài theo slug */
export function getBlogBySlug(slug) {
  return BLOGS.find((b) => b.slug === slug);
}

/** Gợi ý bài liên quan (ưu tiên cùng tag) */
export function getRelated(slug, count = 3) {
  const cur = getBlogBySlug(slug);
  if (!cur) return BLOGS.slice(0, count);
  const sameTag = BLOGS.filter((b) => b.slug !== slug && b.tag === cur.tag);
  const others = BLOGS.filter((b) => b.slug !== slug && b.tag !== cur.tag);
  return [...sameTag, ...others].slice(0, count);
}

/** Danh sách tag (kèm "All") */
export const TAGS = ["All", ...Array.from(new Set(BLOGS.map((b) => b.tag)))];

// (Tuỳ chọn) chuyển mảng blocks → HTML string để render nhanh bằng dangerouslySetInnerHTML
export function blocksToHtml(blocks = []) {
  const escape = (s = "") =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let html = "";
  for (const b of blocks) {
    if (b.type === "h2") html += `<h2>${escape(b.text)}</h2>`;
    else if (b.type === "p") html += `<p>${escape(b.text)}</p>`;
    else if (b.type === "quote")
      html += `<blockquote>${escape(b.text)}</blockquote>`;
    else if (b.type === "ul" && Array.isArray(b.items)) {
      html += "<ul>";
      for (const it of b.items) html += `<li>${escape(it)}</li>`;
      html += "</ul>";
    }
  }
  return html;
}
