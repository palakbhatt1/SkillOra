"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Background orbs (slow drift), cursor glow follower, magnetic primary buttons. */
export default function Ambient() {
  const root = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.to(".orb.a", { x: 120, y: 80, duration: 14, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".orb.b", { x: -140, y: 110, duration: 17, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".orb.c", { x: 90, y: -90, duration: 12, repeat: -1, yoyo: true, ease: "sine.inOut" });

      const gx = gsap.quickTo(glow.current, "x", { duration: 0.6, ease: "power3" });
      const gy = gsap.quickTo(glow.current, "y", { duration: 0.6, ease: "power3" });
      let active: HTMLElement | null = null;
      const move = (e: MouseEvent) => {
        gx(e.clientX);
        gy(e.clientY);
        const t = (e.target as HTMLElement | null)?.closest?.(".btn.primary") as HTMLElement | null;
        if (active && active !== t) {
          gsap.to(active, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.5)", overwrite: "auto" });
        }
        active = t;
        if (t) {
          const r = t.getBoundingClientRect();
          gsap.to(t, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.3, overwrite: "auto" });
        }
      };
      window.addEventListener("mousemove", move);
      return () => window.removeEventListener("mousemove", move);
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      <div className="ambient">
        <div className="orb a" />
        <div className="orb b" />
        <div className="orb c" />
      </div>
      <div className="cursor-glow" ref={glow} />
    </div>
  );
}
