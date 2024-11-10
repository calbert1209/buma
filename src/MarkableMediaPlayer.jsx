import { useCallback, useState } from "preact/hooks";
import { MediaPlayer } from "./MediaPlayer";
import { MarkableCanvas } from "./MarkableCanvas";

export const MarkableMediaPlayer = ({
  src,
  onAddRegion,
  regions,
  onLoadedMetadata,
}) => {
  const [dimensionsOnScreen, setDimensionsOnScreen] = useState(null);

  const handleOnSetVideoDimensions = useCallback((newDimensions) => {
    setDimensionsOnScreen(newDimensions);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <MediaPlayer
        src={src}
        onResize={handleOnSetVideoDimensions}
        onLoadedMetadata={onLoadedMetadata}
      />
      {dimensionsOnScreen ? (
        <MarkableCanvas
          dimensions={dimensionsOnScreen}
          onAddRegion={onAddRegion}
          regions={regions}
        />
      ) : null}
    </div>
  );
};
