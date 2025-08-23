"use client";
import { useState, useEffect, useRef } from "react";

interface UseTypingEffectOptions {
  speed?: number; // Milliseconds per character
  delay?: number; // Initial delay before typing starts
  enabled?: boolean; // Có bật typing effect hay không
}

export function useTypingEffect(
  text: string,
  options: UseTypingEffectOptions = {}
) {
  const { speed = 50, delay = 0, enabled = true } = options;
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Sử dụng ref để tránh stale closure
  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Cleanup previous timeouts/intervals
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Reset state khi text thay đổi
    setDisplayedText("");
    setIsTyping(false);

    if (!text) {
      return;
    }

    // Nếu typing effect bị tắt, hiển thị text ngay lập tức
    if (!enabled) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    // Bắt đầu typing sau delay
    timeoutRef.current = setTimeout(() => {
      setIsTyping(true);
      let currentIndex = 0;

      intervalRef.current = setInterval(() => {
        if (currentIndex < text.length) {
          // Sử dụng functional update để tránh stale state
          setDisplayedText(text.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          // Hoàn thành typing
          clearInterval(intervalRef.current!);
          setIsTyping(false);
        }
      }, speed);
    }, delay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, speed, delay, enabled]); // Bỏ hasStarted khỏi dependencies

  return { displayedText, isTyping };
}

// Phiên bản advanced với nhiều tính năng hơn
interface UseAdvancedTypingEffectOptions extends UseTypingEffectOptions {
  loop?: boolean; // Lặp lại typing
  eraseDelay?: number; // Delay trước khi xóa
  eraseSpeed?: number; // Tốc độ xóa
  onComplete?: () => void; // Callback khi hoàn thành
  onStart?: () => void; // Callback khi bắt đầu
}

export function useAdvancedTypingEffect(
  texts: string | string[],
  options: UseAdvancedTypingEffectOptions = {}
) {
  const {
    speed = 50,
    delay = 0,
    enabled = true,
    loop = false,
    eraseDelay = 1000,
    eraseSpeed = 30,
    onComplete,
    onStart,
  } = options;

  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const textArray = Array.isArray(texts) ? texts : [texts];

  useEffect(() => {
    // Cleanup
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Reset
    setDisplayedText("");
    setIsTyping(false);
    setIsErasing(false);
    setCurrentTextIndex(0);

    if (!textArray.length || !textArray[0]) return;

    if (!enabled) {
      setDisplayedText(textArray[0]);
      return;
    }

    const startTyping = () => {
      onStart?.();
      setIsTyping(true);

      const currentText = textArray[currentTextIndex];
      let charIndex = 0;

      const typeChar = () => {
        if (charIndex < currentText.length) {
          setDisplayedText(currentText.substring(0, charIndex + 1));
          charIndex++;
          timeoutRef.current = setTimeout(typeChar, speed);
        } else {
          setIsTyping(false);
          onComplete?.();

          // Nếu có nhiều text và loop enabled
          if (textArray.length > 1 && loop) {
            timeoutRef.current = setTimeout(() => {
              setIsErasing(true);
              eraseText();
            }, eraseDelay);
          }
        }
      };

      const eraseText = () => {
        const currentText = textArray[currentTextIndex];
        let charIndex = currentText.length;

        const eraseChar = () => {
          if (charIndex > 0) {
            setDisplayedText(currentText.substring(0, charIndex - 1));
            charIndex--;
            timeoutRef.current = setTimeout(eraseChar, eraseSpeed);
          } else {
            setIsErasing(false);
            setCurrentTextIndex((prev) => (prev + 1) % textArray.length);
            // Restart typing with next text
            timeoutRef.current = setTimeout(startTyping, speed);
          }
        };

        eraseChar();
      };

      timeoutRef.current = setTimeout(typeChar, delay);
    };

    startTyping();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    textArray.join(","),
    speed,
    delay,
    enabled,
    loop,
    eraseDelay,
    eraseSpeed,
    currentTextIndex,
  ]);

  return {
    displayedText,
    isTyping,
    isErasing,
    currentTextIndex,
  };
}

// Hook đơn giản cho typing chỉ 1 lần
export function useSimpleTypingEffect(text: string, speed: number = 50) {
  return useTypingEffect(text, { speed, enabled: true });
}
