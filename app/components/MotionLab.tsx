"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const burstGlyphs = ["✦", "●", "◆", "▰", "╱", "Y", "S"];

export default function MotionLab() {
  const burstLayerRef = useRef<HTMLDivElement>(null);
  const [signalOn, setSignalOn] = useState(false);

  const burstAt = useCallback((x: number, y: number) => {
    const layer = burstLayerRef.current;
    if (!layer) return;

    for (let index = 0; index < 14; index += 1) {
      const particle = document.createElement("span");
      const angle = (Math.PI * 2 * index) / 14 + Math.random() * 0.25;
      const distance = 46 + Math.random() * 82;

      particle.className = "signal-particle";
      particle.textContent = burstGlyphs[index % burstGlyphs.length];
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.setProperty("--burst-x", `${Math.cos(angle) * distance}px`);
      particle.style.setProperty("--burst-y", `${Math.sin(angle) * distance}px`);
      particle.style.setProperty("--burst-spin", `${-100 + Math.random() * 200}deg`);
      particle.style.setProperty("--burst-delay", `${index * 11}ms`);
      layer.appendChild(particle);
      window.setTimeout(() => particle.remove(), 1050);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const tiltTargets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-tilt]"),
    );
    let pointerFrame = 0;

    root.classList.add("motion-ready");

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -4%" },
    );

    revealTargets.forEach((target) => {
      if (reducedMotion.matches) target.classList.add("is-visible");
      else revealObserver.observe(target);
    });

    const handlePointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches || pointerFrame) return;
      const { clientX, clientY } = event;

      pointerFrame = window.requestAnimationFrame(() => {
        root.style.setProperty("--pointer-x", `${clientX}px`);
        root.style.setProperty("--pointer-y", `${clientY}px`);
        pointerFrame = 0;
      });
    };

    const tiltCleanups = tiltTargets.map((target) => {
      const maxTilt = Number(target.dataset.tilt || 4);

      const handleTilt = (event: PointerEvent) => {
        if (!finePointer.matches || reducedMotion.matches) return;
        const rect = target.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        target.style.setProperty("--tilt-x", `${-y * maxTilt}deg`);
        target.style.setProperty("--tilt-y", `${x * maxTilt}deg`);
        target.style.setProperty("--glow-x", `${(x + 0.5) * 100}%`);
        target.style.setProperty("--glow-y", `${(y + 0.5) * 100}%`);
      };

      const resetTilt = () => {
        target.style.setProperty("--tilt-x", "0deg");
        target.style.setProperty("--tilt-y", "0deg");
        target.style.setProperty("--glow-x", "50%");
        target.style.setProperty("--glow-y", "50%");
      };

      target.addEventListener("pointermove", handleTilt);
      target.addEventListener("pointerleave", resetTilt);

      return () => {
        target.removeEventListener("pointermove", handleTilt);
        target.removeEventListener("pointerleave", resetTilt);
      };
    });

    const handleBurstClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-burst]",
      );
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const x = event.clientX || rect.left + rect.width / 2;
      const y = event.clientY || rect.top + rect.height / 2;
      burstAt(x, y);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("click", handleBurstClick);

    return () => {
      root.classList.remove("motion-ready", "signal-chaos");
      root.style.removeProperty("--pointer-x");
      root.style.removeProperty("--pointer-y");
      revealObserver.disconnect();
      tiltCleanups.forEach((cleanup) => cleanup());
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("click", handleBurstClick);
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
    };
  }, [burstAt]);

  useEffect(() => {
    document.documentElement.classList.toggle("signal-chaos", signalOn);
    return () => document.documentElement.classList.remove("signal-chaos");
  }, [signalOn]);

  return (
    <>
      <div className="motion-pointer" aria-hidden="true" />
      <div className="signal-noise" aria-hidden="true" />
      <div
        className="signal-burst-layer"
        ref={burstLayerRef}
        aria-hidden="true"
      />
      <button
        className="swan-signal-control"
        type="button"
        aria-pressed={signalOn}
        data-cuelume-toggle="toggle"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
          setSignalOn((active) => !active);
        }}
      >
        <span aria-hidden="true">◉</span>
        {signalOn ? "CALM THE SWAN" : "SWAN SIGNAL"}
      </button>
    </>
  );
}
