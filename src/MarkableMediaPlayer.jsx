import { signal } from "@preact/signals";
import { useCallback, useLayoutEffect, useRef } from "preact/hooks";
import { MediaPlayer } from "./MediaPlayer";

const videoDimensions = signal(null);

export const MarkableMediaPlayer = ({ src, onAddRegion, regions }) => {
  const handleOnSetVideoDimensions = useCallback((newDimensions) => {
    videoDimensions.value = newDimensions;
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <MediaPlayer
        src={src}
        onSetVideoDimensions={handleOnSetVideoDimensions}
      />
      {videoDimensions.value ? (
        <MarkableCanvas
          dimensions={videoDimensions.value}
          onAddRegion={onAddRegion}
          regions={regions}
        />
      ) : null}
    </div>
  );
};

function getCanvasRelativePosition(event) {
  const rect = event.target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x, y };
}

function drawRegions(canvas, regions) {
  if (!regions.length) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255, 128, 0, 0.2)";
  
  for (const region of regions) {
    ctx.fillRect(region.x, region.y, region.width, region.height);
    if (region.id !== undefined) {
      const previousFillStyle = ctx.fillStyle;
      const previousFont = ctx.font;
      ctx.fillStyle = "black";
      ctx.font = "12px Arial";
      ctx.fillText(region.id, region.x + 20, region.y + 20);
      ctx.fillStyle = previousFillStyle;
      ctx.font = previousFont;
    }
  }
}

const currentRegion = signal(null);

const MarkableCanvas = ({ dimensions, onAddRegion, regions }) => {
  const canvasRef = useRef();

  const handleOnMouseDown = (event) => {
    event.preventDefault();

    const { x, y } = getCanvasRelativePosition(event);
    currentRegion.value = { x, y, width: 0, height: 0 };
  };

  const handleOnMouseUp = (event) => {
    event.preventDefault();
    if (!currentRegion.value) {
      return;
    }

    const { x, y } = getCanvasRelativePosition(event);
    const regionW = x - currentRegion.value.x;
    const regionH = y - currentRegion.value.y;
    onAddRegion({
      ...currentRegion.value,
      width: regionW,
      height: regionH,
    });
    currentRegion.value = null;
  };

  const handleOnMouseMove = (event) => {
    event.preventDefault();
    if (!currentRegion.value) {
      return;
    }

    const { x, y } = getCanvasRelativePosition(event);
    const regionW = x - currentRegion.value.x;
    const regionH = y - currentRegion.value.y;
    currentRegion.value = {
      ...currentRegion.value,
      width: regionW,
      height: regionH,
    };

    const nextRegions = currentRegion.value
      ? [...regions, currentRegion.value]
      : regions;
    drawRegions(canvasRef.current, nextRegions);
  };

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const nextRegions = currentRegion.value
      ? [...regions, currentRegion.value]
      : regions;
    drawRegions(canvas, nextRegions);
  }, [regions]);

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handleOnMouseDown}
      onPointerUp={handleOnMouseUp}
      onPointerMove={handleOnMouseMove}
      width={dimensions.width}
      height={dimensions.height}
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        cursor: "crosshair",
      }}
    ></canvas>
  );
};
