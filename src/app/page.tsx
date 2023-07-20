"use client";

import { useEffect, useRef, useState } from "react";
import { Presence } from "@/components/presence";
import { LayoutProjectionNode } from "@/lib/projection";

export default function Home() {
  const sourceRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState(true);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sourceRef.current || !targetRef.current) return;

    const sourceNode = new LayoutProjectionNode(sourceRef.current);
    const targetNode = new LayoutProjectionNode(targetRef.current);

    sourceNode.activate();
    targetNode.activate();
    sourceNode.measure();
    targetNode.measure();

    targetNode.calculate(sourceNode.boundingBox!);
    sourceNode.calculate(targetNode.boundingBox!);

    sourceNode.project();
    targetNode.project();

    sourceNode.element.style.backgroundColor = "green";
    sourceNode.element.style.width = "100px";
    sourceNode.element.style.height = "100px";
  });
  return (
    <Presence>
      {visible ? (
        <div
          ref={ref}
          className="bg-slate-500 w-20 h-20 rounded-md"
          style={{
            transition: "2s",
          }}
          key="source"
          onClick={() => setVisible(false)}
        >
          Source
        </div>
      ) : null}

      <div key="target" className="w-20 h-20 bg-red-400"></div>
    </Presence>
  );
}
