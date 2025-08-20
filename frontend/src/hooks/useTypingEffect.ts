"use client";
import { useState, useEffect } from "react";

interface UseTypingEffectOptions {
  speed?: number; // Characters per frame
  delay?: number; // Initial delay before typing starts
  enabled?: boolean; // Có bật typing effect hay không
}

export function useTypingEffect(
  text: string,
  options: UseTypingEffectOptions = {}
) {
  const { speed = 5, delay = 0, enabled = true } = options;
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!text) return;

    // Nếu typing effect bị tắt, hiển thị text ngay lập tức
    if (!enabled) {
      setDisplayedText(text);
      setIsTyping(false);
      setHasStarted(true);
      return;
    }

    setHasStarted(true);
    setIsTyping(true);
    setDisplayedText("");

    let typingInterval: NodeJS.Timeout;
    console.log("called");

    let i = 0;
    typingInterval = setInterval(() => {
      console.log("called");
      setDisplayedText((prev) => prev + text[i]);
      i++;
      if (i >= text.length) {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, speed); // Mặc định 5ms mỗi ký tự

    return () => {
      if (typingInterval) {
        clearInterval(typingInterval);
      }
    };
  }, [text, speed, delay, hasStarted, enabled]);

  return { displayedText, isTyping };
}
