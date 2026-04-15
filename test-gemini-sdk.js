const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    const genAI = new GoogleGenerativeAI("AIzaSyArlhQryrgs_u9BJQdjaaDlEttAmjNTPk8");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    try {
        const result = await model.generateContent("Hello");
        console.log("Success:", result.response.text());
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
