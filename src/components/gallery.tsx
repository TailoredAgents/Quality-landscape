"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
} from "lucide-react";
import { gallery } from "@/lib/business";
export function Gallery({ featured = false }: { featured?: boolean }) {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<number | null>(null);
  const [before, setBefore] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const items = featured
    ? gallery.slice(0, 3)
    : gallery.filter((g) => filter === "All" || g.category === filter);
  const move = (dir: number) => {
    setSelected((n) =>
      n === null ? null : (n + dir + items.length) % items.length,
    );
    setBefore(false);
  };
  useEffect(() => {
    if (selected !== null) {
      if (!dialog.current?.open) {
        previousFocus.current = document.activeElement as HTMLElement;
        dialog.current?.showModal();
      }
      document.body.style.overflow = "hidden";
    } else {
      dialog.current?.close();
      document.body.style.overflow = "";
      previousFocus.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);
  const current = selected === null ? null : items[selected];
  return (
    <>
      {!featured && (
        <div className="gallery-toolbar">
          <div className="filter-tabs" aria-label="Filter gallery">
            {["All", "Lawns", "Details", "Irrigation"].map((f) => (
              <button
                key={f}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f === "All" ? "All inspiration" : f}
              </button>
            ))}
          </div>
          <span>{items.length.toString().padStart(2, "0")} photographs</span>
        </div>
      )}
      <div className={`gallery-grid ${featured ? "gallery-featured" : ""}`}>
        {items.map((g, i) => (
          <button
            className="gallery-item"
            key={g.src}
            onClick={() => {
              setSelected(i);
              setBefore(false);
            }}
            aria-label={`View ${g.title}`}
          >
            <Image
              src={g.src}
              alt={g.alt}
              fill
              sizes={
                featured
                  ? "(max-width: 768px) 100vw, 50vw"
                  : "(max-width: 768px) 100vw, 50vw"
              }
            />
            <span className="gallery-overlay">
              <span>
                <small>{g.category}</small>
                <strong>{g.title}</strong>
              </span>
              <span className="gallery-open">
                <ArrowUpRight size={23} />
              </span>
            </span>
            <span className="gallery-zoom">
              <Maximize2 size={17} />
            </span>
          </button>
        ))}
      </div>
      <dialog
        aria-label="Landscape photo viewer"
        className="lightbox"
        ref={dialog}
        onCancel={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            move(1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            move(-1);
          }
        }}
      >
        <button
          className="lightbox-close"
          aria-label="Close photo viewer"
          onClick={() => setSelected(null)}
        >
          <X />
        </button>
        {current && (
          <>
            <div className="lightbox-image">
              <Image
                src={
                  before && current.beforeSrc ? current.beforeSrc : current.src
                }
                alt={current.alt}
                fill
                sizes="95vw"
                style={{ objectFit: "contain" }}
              />
            </div>
            <div className="lightbox-controls">
              <button onClick={() => move(-1)} aria-label="Previous photo">
                <ChevronLeft />
              </button>
              <div>
                <strong>{current.title}</strong>
                <p>
                  {current.category} · {selected! + 1} / {items.length}
                </p>
                {current.beforeSrc && (
                  <button onClick={() => setBefore(!before)}>
                    Show {before ? "after" : "before"}
                  </button>
                )}
              </div>
              <button onClick={() => move(1)} aria-label="Next photo">
                <ChevronRight />
              </button>
            </div>
            <p className="lightbox-note">
              Landscape inspiration · Photography courtesy of Pexels.
            </p>
          </>
        )}
      </dialog>
    </>
  );
}
