import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

app.post("/translate", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });
    const requestData = {
      origin_language: "en",
      target_language: "vi",
      words_not_to_translate: "",
      input_text: text,
    };

    console.log("Request data:", requestData); // Debug dữ liệu gửi lên API
    const response = await axios.post(
      "https://translateai.p.rapidapi.com/google/translate/text",
      requestData,
      {
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.RAPIDAPI_HOST,
          "Content-Type": "application/json",
        },
      }
    );
    const translatedText = response?.data?.translation || "Không có kết quả";
    res.json({ translatedText });
  } catch (error) {
    console.error("Lỗi khi gọi API:", error?.response?.data || error);
    res.status(500).json({ error: "Không thể dịch từ" });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
