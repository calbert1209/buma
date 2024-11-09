import { signal } from "@preact/signals";
import { useCallback } from "preact/hooks";
import { MediaPlayer } from "./MediaPlayer";
import { MarkableCanvas } from "./MarkableCanvas";

const videoDimensionsOnScreen = signal(null);

export const MarkableMediaPlayer = ({
  src,
  onAddRegion,
  regions,
  onLoadedMetadata,
}) => {
  const handleOnSetVideoDimensions = useCallback((newDimensions) => {
    videoDimensionsOnScreen.value = newDimensions;
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <MediaPlayer
        src={src}
        onResize={handleOnSetVideoDimensions}
        onLoadedMetadata={onLoadedMetadata}
      />
      {videoDimensionsOnScreen.value ? (
        <MarkableCanvas
          dimensions={videoDimensionsOnScreen.value}
          onAddRegion={onAddRegion}
          regions={regions}
        />
      ) : null}
    </div>
  );
};
