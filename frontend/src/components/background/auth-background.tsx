"use client";
import React from "react";

interface AuthBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const AuthBackground: React.FC<AuthBackgroundProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`min-h-screen bg-black relative overflow-hidden ${className}`}
    >
      {/* Base gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-black to-gray-900"></div>

      {/* Radial gradients for glow effects */}
      <div
        className="fixed inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(88, 28, 135, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgb(234 138 51 / 35%) 0%, transparent 50%)
          `,
        }}
      ></div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          mask: "radial-gradient(circle at center, black 0%, transparent 80%)",
        }}
      ></div>

      {/* Central glow effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full animate-pulse">
        <div
          className="w-full h-full rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 30%, transparent 70%)`,
          }}
        ></div>
      </div>

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingOrb
          size="w-1 h-1"
          color="rgba(139, 92, 246, 0.6)"
          position="top-[20%] left-[10%]"
          delay="delay-0"
        />
        <FloatingOrb
          size="w-1.5 h-1.5"
          color="rgba(59, 130, 246, 0.4)"
          position="top-[60%] left-[80%]"
          delay="delay-[2s]"
        />
        <FloatingOrb
          size="w-[3px] h-[3px]"
          color="rgba(147, 51, 234, 0.5)"
          position="top-[80%] left-[30%]"
          delay="delay-[4s]"
        />
        <FloatingOrb
          size="w-[5px] h-[5px]"
          color="rgba(79, 70, 229, 0.3)"
          position="top-[30%] left-[70%]"
          delay="delay-[6s]"
        />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {children}
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes customPulse {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.3;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.5;
          }
          25% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-10px) translateX(-5px);
            opacity: 0.3;
          }
          75% {
            transform: translateY(-30px) translateX(-10px);
            opacity: 0.6;
          }
        }

        .animate-customPulse {
          animation: customPulse 4s ease-in-out infinite;
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

interface FloatingOrbProps {
  size: string;
  color: string;
  position: string;
  delay: string;
}

const FloatingOrb: React.FC<FloatingOrbProps> = ({
  size,
  color,
  position,
  delay,
}) => {
  return (
    <div
      className={`absolute rounded-full blur-[1px] animate-float ${size} ${position} ${delay}`}
      style={{
        backgroundColor: color,
        animationDelay: delay.includes("[") ? delay.slice(7, -2) : "0s",
      }}
    ></div>
  );
};

export default AuthBackground;
