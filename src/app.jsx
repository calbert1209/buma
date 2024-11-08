import "./app.css";
import { signal } from "@preact/signals";
import { MarkableMediaPlayer } from "./MarkableMediaPlayer";
import { useState } from "preact/hooks";

const objectUrl = signal(null);

export function App() {
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
    setRegions((s) => [...s, region]);
    console.log("region added", region);
  };

  const handleOnRemoveRegion = (regionId) => {
    console.log("region removed", regionId);
    setRegions((s) => s.filter((region) => region.id !== regionId));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setRegions([]);
      const url = URL.createObjectURL(file);
      console.log(url);
      objectUrl.value = url;
    }
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
        <div>
          <div style={{ width: "100%", height: "64px", display: "flex", gap:"4px" }}>
            {regions.map((region) => (
              <button
                key={region.id}
                onClick={() => handleOnRemoveRegion(region.id)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                {region.id}
              </button>
            ))}
          </div>
          <MarkableMediaPlayer
            src={objectUrl.value}
            onAddRegion={handleOnAddRegion}
            regions={regions}
          />
        </div>
      )}
    </div>
  );
}
