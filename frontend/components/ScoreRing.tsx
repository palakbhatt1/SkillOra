"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export default function ScoreRing({ value, size = 22 }: { value: number; size?: number }) {
  const arc = useRef<SVGCircleElement>(null);
  const num = useRef<HTMLElement>(null);
  const state = useRef({ v: 0 });
  const R = 54;
  const C = 2 * Math.PI * R;

  useGSAP(
    () => {
      gsap.to(state.current, {
        v: value,
        duration: 1.6,
        ease: "power3.out",
        onUpdate: () => {
          const v = state.current.v;
          if (arc.current) arc.current.style.strokeDashoffset = String(C * (1 - v / 100));
          if (num.current) num.current.textContent = String(Math.round(v));
        },
      });
    },
    { dependencies: [value] }
  );

  return (
    <div className="ring-wrap" style={{ width: `${size}rem`, height: `${size}rem` }}>
      <svg viewBox="0 0 120 120" width="100%" height="100%" style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fdba74" />
            <stop offset="1" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="9" />
        <circle ref={arc} className="progress-ring" cx="60" cy="60" r={R} fill="none" stroke="url(#rg)" strokeWidth="9" strokeDasharray={C} strokeDashoffset={C} />
      </svg>
      <div className="num">
        <b ref={num}>0</b>
        <span className="muted small">/ 100 job-fit</span>
      </div>
    </div>
  );
}
