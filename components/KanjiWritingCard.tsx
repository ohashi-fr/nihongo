"use client";

import { useEffect, useRef, useState } from "react";
import type { KanjiFields } from "@/components/KanjiQuizClient";

type Props = {
  fields: KanjiFields;
  onAnswered: (wasCorrect: boolean) => void;
  onNext: () => void;
};

type Phase = "drawing" | "revealed";

const CANVAS_SIZE = 280;

export default function KanjiWritingCard({
  fields,
  onAnswered,
  onNext,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("drawing");
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);

  // Build the prompt: "to eat — たべる / しょく"
  const promptMeaning = fields.meanings.join(", ");
  const promptReading = [...fields.kunyomi, ...fields.onyomi].join(" / ");

  // Initialize canvas with a white background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function getPos(
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { x: number; y: number } | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX: number;
    let clientY: number;
    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("changedTouches" in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if ("clientX" in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return null;
    }
    // Scale from CSS pixels to canvas backing-store pixels.
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function startStroke(
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) {
    if (phase !== "drawing") return;
    e.preventDefault();
    const pos = getPos(e);
    if (!pos) return;
    drawingRef.current = true;
    lastRef.current = pos;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#1a1a1a";
    ctx.fill();
  }

  function continueStroke(
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) {
    if (!drawingRef.current || phase !== "drawing") return;
    e.preventDefault();
    const pos = getPos(e);
    const last = lastRef.current;
    if (!pos || !last) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastRef.current = pos;
  }

  function endStroke() {
    drawingRef.current = false;
    lastRef.current = null;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function reveal() {
    setPhase("revealed");
  }

  function selfEval(correct: boolean) {
    onAnswered(correct);
    window.setTimeout(onNext, 400);
  }

  return (
    <div className="rounded-lg border border-border bg-white p-8 shadow-card">
      {/* Prompt */}
      <div className="mb-6 text-center">
        <div className="text-xs uppercase tracking-[0.25em] text-muted">
          Write the kanji for
        </div>
        <div className="mt-2 text-2xl font-medium">
          {promptMeaning}
          {promptReading && (
            <>
              {" "}
              <span className="jp text-muted">— {promptReading}</span>
            </>
          )}
        </div>
      </div>

      {phase === "drawing" ? (
        <div className="flex flex-col items-center gap-4">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="rounded-md border border-border bg-white touch-none"
            style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
            onMouseDown={startStroke}
            onMouseMove={continueStroke}
            onMouseUp={endStroke}
            onMouseLeave={endStroke}
            onTouchStart={startStroke}
            onTouchMove={continueStroke}
            onTouchEnd={endStroke}
          />
          <div className="flex gap-3">
            <button onClick={clearCanvas} className="btn-outline">
              Clear
            </button>
            <button onClick={reveal} className="btn-primary">
              Reveal
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <div className="text-xs uppercase tracking-wide text-muted">
                Yours
              </div>
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="mt-2 rounded-md border border-border bg-white"
                style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
              />
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs uppercase tracking-wide text-muted">
                Correct
              </div>
              <div
                className="jp mt-2 flex items-center justify-center rounded-md border border-border bg-soft text-[180px] leading-none"
                style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
              >
                {fields.kanji}
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border bg-soft/40 p-4 text-center">
            <p className="text-sm text-muted">How did you do?</p>
            <div className="mt-3 flex justify-center gap-3">
              <button
                onClick={() => selfEval(false)}
                className="btn justify-center border border-accent/40 bg-accent/5 text-accent hover:bg-accent/10"
              >
                ✗ I missed it
              </button>
              <button
                onClick={() => selfEval(true)}
                className="btn justify-center border border-green-600 bg-green-50 text-green-800 hover:bg-green-100"
              >
                ✓ I got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
