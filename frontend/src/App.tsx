import { useState, useEffect } from "react";
import axios from "axios";
import { Word, Flashcard } from "./types";

function App() {
  const [inputText, setInputText] = useState<string>("");

  const [words, setWords] = useState<Word[]>(
    inputText.split(" ").map((word, index) => ({
      id: index,
      text: word,
      meaning: "",
      selected: false,
    }))
  );

  const [flashcardStack, setFlashcardStack] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadScript = (src: string, callback: () => void) => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = src;
      script.onload = () => {
        console.log("Script loaded:", true);
        console.log("lbDictPlugin:", window.lbDictPlugin);
        callback();
      };
      script.onerror = () => {
        console.error("Failed to load script");
        setScriptLoaded(false);
      };
      document.head.appendChild(script);
    };

    setTimeout(() => {
      if (!document.getElementById("lbdictex_find_popup")) {
        loadScript(
          `/laban-script/dictionary/js/plugin/lbdictplugin.min.js?${
            Date.now() % 10000
          }`,
          () => {
            const lbplugin_event_opt = {
              extension_enable: true,
              dict_type: 1,
              dbclk_event: { trigger: "none", enable: false, display: 2 },
              select_event: { trigger: "click", enable: true, display: 1 },
            };
            if (window.lbDictPlugin) {
              window.lbDictPlugin.init(lbplugin_event_opt);
            }
            setScriptLoaded(true);
          }
        );
      }
    }, 1000);

    return () => {
      const script = document.querySelector(
        'script[src*="/laban-script/dictionary/js/plugin/lbdictplugin.min.js"]'
      );
      if (script) script.remove();
    };
  }, []);

  // Hàm dùng Hugging Face API để dịch từ
  const fetchGoogleTranslation = async (word: string): Promise<string> => {
    setIsLoading(true);
    console.log("Fetching Google Translation for:", word);

    try {
      const response = await axios.post("http://127.0.0.1:3001/translate", {
        text: word,
      });

      return response.data.translatedText || "Không tìm thấy nghĩa";
    } catch (error) {
      console.error("Lỗi khi gọi Google API:", error);
      return "Không thể tra nghĩa do lỗi API";
    } finally {
      setIsLoading(false);
    }
  };

  const handleWordClick = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newWords = [...words];
    const targetWord = newWords[index];

    targetWord.selected = !targetWord.selected;

    if (targetWord.selected && !targetWord.meaning) {
      const wordLower = targetWord.text.toLowerCase();
      targetWord.meaning = await fetchGoogleTranslation(wordLower); // Gọi Hugging Face API
    }

    setWords(newWords);
  };

  const generateFlashcards = () => {
    const selectedWords = words.filter((word) => word.selected);
    const newFlashcards = selectedWords.map((word, index) => ({
      id: index,
      front: word.text,
      back: word.meaning,
      isFlipped: false,
    }));
    setFlashcardStack(newFlashcards);
    setCurrentIndex(0);
  };
  const handleInputText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
    console.log("Input text:", inputText);
  };
  const handleChangeText = () => {
    setWords(
      inputText.split(" ").map((word, index) => ({
        id: index,
        text: word,
        meaning: "",
        selected: false,
      }))
    );
  };
  const handleCardClick = () => {
    if (!flashcardStack.length) return;

    const currentCard = flashcardStack[currentIndex];

    if (!currentCard.isFlipped) {
      const newStack = [...flashcardStack];
      newStack[currentIndex].isFlipped = true;
      setFlashcardStack(newStack);
    } else {
      const nextIndex =
        currentIndex + 1 < flashcardStack.length ? currentIndex + 1 : 0;
      const newStack = flashcardStack.map((card, idx) => ({
        ...card,
        isFlipped: idx === nextIndex ? false : card.isFlipped,
      }));
      setFlashcardStack(newStack);
      setCurrentIndex(nextIndex);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold mb-4">
          Ứng Dụng Học Ngôn Ngữ Của Bé Chu
        </h1>
        <div className="flex align-center mb-4 justify-between">
          <textarea
            onChange={handleInputText}
            placeholder="Nhập văn bản tại đây..."
            className="w-full mr-1 border-[#FFD4DB] border-2 rounded-lg p-2 resize-none overflow-auto scrollbar-hidden "
            rows={4}
          />
          <button
            onClick={handleChangeText}
            className={` px-5 rounded text-white 
            bg-[#FFD4DB] hover:bg-[#FFC5D3] cursor-pointer
            transition duration-300 ease-in-out transform hover:scale-101
              `}
          >
            Add
          </button>
        </div>
        <div className="text-lg select-none">
          {words.map((word, index) => (
            <span
              key={word.id}
              onClick={(e) => handleWordClick(index, e)}
              className={`cursor-pointer mr-1 inline-block ${
                word.selected
                  ? "bg-yellow-200 px-1 rounded"
                  : "hover:bg-gray-200 px-1 rounded"
              }`}
            >
              {word.text}
              {word.selected && word.meaning && (
                <span className="text-sm text-gray-600 ml-1">
                  {isLoading ? "(Đang tra...)" : `(${word.meaning})`}
                </span>
              )}
            </span>
          ))}
        </div>
        <button
          onClick={generateFlashcards}
          disabled={!scriptLoaded || isLoading}
          className={`mt-4 px-4 py-2 rounded text-white ${
            scriptLoaded && !isLoading
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Tạo Bộ Flashcard
        </button>
      </div>

      {flashcardStack.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">
            Bộ Flashcard ({currentIndex + 1}/{flashcardStack.length})
          </h2>
          <div
            onClick={handleCardClick}
            className="bg-white p-8 rounded-lg shadow-md cursor-pointer 
              transform transition-all duration-300 hover:scale-105
              flex items-center justify-center min-h-[200px]"
          >
            <div className="text-2xl font-bold text-center">
              {flashcardStack[currentIndex].isFlipped
                ? flashcardStack[currentIndex].back
                : flashcardStack[currentIndex].front}
            </div>
          </div>
          <p className="text-center mt-2 text-gray-600">
            Nhấn để{" "}
            {flashcardStack[currentIndex].isFlipped
              ? "xem thẻ tiếp theo"
              : "xem nghĩa"}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
