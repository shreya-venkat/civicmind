"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useGSAP() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".fade-up", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });

      gsap.from(".stagger-item", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
      });

      gsap.from(".scale-in", {
        scale: 0.95,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "back.out(1.2)",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return containerRef;
}

export function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(entry.target, {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: "power2.out",
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    elements.forEach((el) => {
      gsap.set(el, { y: 30, opacity: 0 });
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
}

export function useHoverEffect() {
  useEffect(() => {
    const cards = document.querySelectorAll(".hover-lift");
    
    cards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        gsap.to(card, { y: -4, duration: 0.3, ease: "power2.out" });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, { y: 0, duration: 0.3, ease: "power2.out" });
      });
    });
  }, []);
}
