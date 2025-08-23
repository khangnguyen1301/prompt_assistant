"use client";

import { useTypingEffect } from "@/hooks/useTypingEffect";

interface TypingTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  showCursor?: boolean;
  enableTyping?: boolean; // Điều khiển có áp dụng typing effect hay không
}

export function TypingText({
  text,
  speed = 50,
  delay = 500,
  className = "",
  showCursor = true,
  enableTyping = true, // Mặc định bật typing effect
}: TypingTextProps) {
  const { displayedText } = useTypingEffect(text, {
    speed,
    delay,
    enabled: enableTyping, // Truyền flag để kiểm soát typing effect
  });

  // Nếu không bật typing effect, hiển thị text ngay lập tức
  const finalText = enableTyping ? displayedText : text;

  return <span className={className}>{finalText}</span>;
}
