import { signal } from "@preact/signals";
import { useCallback } from "preact/hooks";
import { MediaPlayer } from "./MediaPlayer";

const videoDimensions = signal(null);

export const MarkableMediaPlayer = ({ src }) => {
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
        <canvas
          width={videoDimensions.value.width}
          height={videoDimensions.value.height}
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            backgroundColor: "rgba(255, 128, 0, 0.2)",
          }}
        ></canvas>
      ) : null}
    </div>
  );
};