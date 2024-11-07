import "./app.css";
import { signal } from "@preact/signals";
import { MediaPlayer } from "./MediaPlayer";
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
        <MediaPlayer src={objectUrl.value} />
      )}
    </div>
  );
}
