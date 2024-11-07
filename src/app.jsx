import "./app.css";
import { signal } from "@preact/signals";
import { MarkableMediaPlayer } from "./MarkableMediaPlayer";
import { useState } from "preact/hooks";

const objectUrl = signal(null);

export function App() {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      console.log(url);
      objectUrl.value = url;
    }
  };

  const [regions, setRegions] = useState([]);

  const handleOnAddRegion = ({ x, y, width, height }) => {
    const nextRegionId = regions.at(-1)?.id + 1 || 0;
    const trueX = width < 0 ? x + width : x;
    const trueY = height < 0 ? y + height : y;
    const trueWidth = Math.abs(width);
    const trueHeight = Math.abs(height);
    const region = {
      id: nextRegionId,
      x: trueX,
      y: trueY,
      width: trueWidth,
      height: trueHeight,
    };
    setRegions((s) => [
      ...s,
      region,
    ]);
    console.log("region added", region);
  };
  return (
    <div className="column">
      {!objectUrl.value ? (
        <label htmlFor="fileInput">
          Choose a video:
          <input
            type="file"
            id="fileInput"
            accept="video/*"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <MarkableMediaPlayer
          src={objectUrl.value}
          onAddRegion={handleOnAddRegion}
          regions={regions}
        />
      )}
    </div>
  );
}
