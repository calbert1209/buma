import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

const mapRegionsToVideoDimensions = (regions, metadata) => {
  const {
    videoWidth: vw,
    videoHeight: vh,
    clientWidth: cw,
    clientHeight: ch,
  } = metadata;

  return regions.map((r) => {
    const x = Math.round((r.x / cw) * vw);
    const y = Math.round((r.y / ch) * vh);
    const width = Math.round((r.width / cw) * vw);
    const height = Math.round((r.height / ch) * vh);
    return { x, y, width, height, id: r.id };
  });
};

const createFilterCommand = (regions, blurRadius = 10) => {
  const crops = regions.map((r) => {
    const dimensions = [r.width, r.height, r.x, r.y].join(":");
    return `[0:v]crop=${dimensions},avgblur=${blurRadius}[r${r.id}]`;
  });

  const overlays = regions.map((r, i, array) => {
    const prefix = i == 0 ? "v:0" : `ovr${i - 1}`;
    const point = [r.x, r.y].join(":");
    const suffix = i + 1 < array.length ? `[ovr${i}]` : "";
    return `[${prefix}][r${r.id}]overlay=${point}${suffix}`;
  });

  return [...crops, ...overlays].join(";");
};

const createFfmpegCommand = ({
  input,
  output,
  regions,
  metadata,
  blurRadius = 10,
}) => {
  const mappedRegions = mapRegionsToVideoDimensions(regions, metadata);
  const filter = createFilterCommand(mappedRegions, blurRadius);
  return [
    "-i",
    input,
    "-filter_complex",
    filter,
    "-map",
    "0",
    "-map",
    "-0:a",
    output,
  ];
};

const BASE_URL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";

export class FfmpegWorker {
  #ffmpeg;
  #ext = "";
  #outputFileName = "output.mp4";

  constructor(ffmpeg) {
    this.#ffmpeg = ffmpeg;
  }

  /**
   * @typedef {Object} InitializationParams
   * @property {(message: string) => void} onLog
   * @property {(progress:number, time: number) => void} onProgress
   */

  /**
   * Initialize FfmpegWorker class
   * @param { InitializationParams } initParams
   * @returns { Promise<FfmpegWorker> }
   */
  static async initialize({ onLog, onProgress } = {}) {
    const ffmpeg = new FFmpeg();
    ffmpeg.on("log", ({ message }) => {
      onLog?.(message);
      console.info(message);
    });

    ffmpeg.on("progress", ({ progress, time }) => {
      onProgress?.(progress, time);
      console.info(progress, time);
    });

    const [coreURL, wasmURL, workerURL] = await Promise.all([
      toBlobURL(`${BASE_URL}/ffmpeg-core.js`, "text/javascript"),
      toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
      toBlobURL(`${BASE_URL}/ffmpeg-core.worker.js`, "text/javascript"),
    ]);

    await ffmpeg.load({ coreURL, wasmURL, workerURL });

    return new FfmpegWorker(ffmpeg);
  }

  get #inputFileName() {
    if (!this.#ext) {
      throw new Error("Worker has no input file extension");
    }

    return `input.${this.#ext}`;
  }

  /**
   * Convert file to Uint8Array
   * @param {File} file
   * @returns { Promise<Uint8Array> }
   */
  #fileToUint8Array(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onloadend = (event) => {
        if (event.target.readyState === FileReader.DONE) {
          const arrayBuffer = event.target.result;
          const array = new Uint8Array(arrayBuffer);
          resolve(array);
        }
        reject(new Error("Could not read file"));
      };
      fr.onerror = (event) => reject(event.target.error);

      fr.readAsArrayBuffer(file);
    });
  }

  async #writeFile(file) {
    const fileName = file.name;
    const ext = fileName.split(".").at(-1);
    this.#ext = ext;

    const fileData = await this.#fileToUint8Array(file);
    return this.#ffmpeg.writeFile(this.#inputFileName, fileData);
  }

  async #readFile() {
    const outputData = await this.#ffmpeg.readFile(this.#outputFileName);
    return URL.createObjectURL(
      new Blob([outputData.buffer], { type: "video/mp4" })
    );
  }

  async transcode({ file, regions, metadata, blurRadius = 10 }) {
    await this.#writeFile(file);

    const args = createFfmpegCommand({
      input: this.#inputFileName,
      output: this.#outputFileName,
      regions,
      metadata,
      blurRadius,
    });

    await this.#ffmpeg.exec(args);

    return this.#readFile();
  }
}
