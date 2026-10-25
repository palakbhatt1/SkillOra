"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

/** Animate everything marked with data-* inside a scope. Shared by all app screens. */
export function animateIn(scope: HTMLElement) {
  const q = gsap.utils.selector(scope);
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  const items = q("[data-in]");
  if (items.length) tl.from(items, { y: 36, opacity: 0, duration: 0.8, stagger: 0.07 }, 0);
  q(".bar > i[data-w]").forEach((el) => {
    const w = (el as HTMLElement).dataset.w;
    tl.to(el, { width: `${w}%`, duration: 1.2, ease: "power2.out" }, 0.3);
  });
  q("[data-count]").forEach((el) => {
    const target = Number((el as HTMLElement).dataset.count);
    const suffix = (el as HTMLElement).dataset.suffix ?? "";
    const o = { v: 0 };
    tl.to(
      o,
      {
        v: target,
        duration: 1.4,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = Math.round(o.v) + suffix;
        },
      },
      0.2
    );
  });
  return tl;
}
