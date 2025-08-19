"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Seeding database...");
    const demoUser = await prisma.user.upsert({
        where: { email: "demo@example.com" },
        update: {},
        create: {
            clerkId: "demo_clerk_id",
            email: "demo@example.com",
            firstName: "Demo",
            lastName: "User",
        },
    });
    console.log("Created demo user:", demoUser);
    const demoConversation = await prisma.conversation.create({
        data: {
            userId: demoUser.id,
            title: "Welcome to Prompt Assistant",
        },
    });
    console.log("Created demo conversation:", demoConversation);
    await prisma.message.createMany({
        data: [
            {
                conversationId: demoConversation.id,
                role: "USER",
                content: "Tôi muốn tạo một prompt để viết blog về AI",
            },
            {
                conversationId: demoConversation.id,
                role: "ASSISTANT",
                content: `🎯 **Goal**
Tạo một bài blog chất lượng cao về Artificial Intelligence, cung cấp thông tin hữu ích và dễ hiểu cho độc giả.

📥 **Input**
- Chủ đề: Artificial Intelligence
- Đối tượng: Độc giả phổ thông quan tâm đến công nghệ
- Độ dài: 1000-1500 từ
- Phong cách: Thông tin, dễ hiểu, hấp dẫn

📤 **Output**
Một bài blog hoàn chỉnh với:
- Tiêu đề thu hút
- Mở bài giới thiệu
- 3-4 phần nội dung chính
- Kết luận và call-to-action
- Tối ưu SEO cơ bản

📝 **Instructions**
1. Bắt đầu với tiêu đề thu hút và mở bài hook độc giả
2. Giải thích AI một cách đơn giản, tránh thuật ngữ phức tạp
3. Đưa ra ví dụ thực tế về ứng dụng AI trong đời sống
4. Thảo luận về lợi ích và thách thức của AI
5. Kết thúc với tầm nhìn tương lai và kêu gọi hành động
6. Sử dụng subheading (H2, H3) để cấu trúc rõ ràng
7. Thêm từ khóa liên quan đến AI tự nhiên trong nội dung

⚡ **Notes**
- Giữ tone tích cực nhưng cân bằng về AI
- Đảm bảo thông tin chính xác và cập nhật
- Sử dụng ngôn ngữ dễ tiếp cận cho người không chuyên`,
            },
        ],
    });
    console.log("✅ Seeding completed!");
}
main()
    .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map