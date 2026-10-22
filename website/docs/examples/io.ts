// Inputs and downloads for examples. An input holds sample data until the reader replaces it on
// the example's page, so the examples also run unattended, in Node.js and in CI.

export interface FileInput {
  readonly type: "file";
  readonly label: string;
  /** File types the file picker offers, as in `<input accept>` */
  readonly accept?: string;
  readonly sampleName: string;
  readonly sample: Uint8Array<ArrayBuffer>;
  /** The file's name: the sample's, or the name of the file the reader chose */
  name: string;
  value: Uint8Array<ArrayBuffer>;
}

export interface TextInput {
  readonly type: "text";
  readonly label: string;
  readonly sample: string;
  value: string;
}

export type Input = FileInput | TextInput;

/** A file the reader can upload, paste, or drop; `sample` is used until they do */
export function file(label: string, options: { name: string; sample: Uint8Array<ArrayBuffer> | string; accept?: string }): FileInput {
  const sample = typeof options.sample === "string" ? new TextEncoder().encode(options.sample) : options.sample;
  return { type: "file", label, accept: options.accept, sampleName: options.name, sample, name: options.name, value: sample };
}

/** Text the reader can edit; `sample` is used until they do */
export function text(label: string, options: { sample: string }): TextInput {
  return { type: "text", label, sample: options.sample, value: options.sample };
}

export interface Download {
  name: string;
  data: Uint8Array<ArrayBuffer>;
}

let onDownload = (item: Download) => console.log(`Download: ${item.name} (${item.data.byteLength} bytes)`);

/** Offers a result to save as a file. Outside the website, it only prints the file's name and size. */
export function download(name: string, data: BufferSource | string) {
  const view =
    typeof data === "string"
      ? new TextEncoder().encode(data)
      : ArrayBuffer.isView(data)
        ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
        : new Uint8Array(data);
  // A copy, so the example can't change it afterwards
  onDownload({ name, data: new Uint8Array(view) });
}

/** Used by the Run button to collect the downloads of one run. Returns a function that restores the previous handler. */
export function captureDownloads(handler: (item: Download) => void): () => void {
  const previous = onDownload;
  onDownload = handler;
  return () => {
    onDownload = previous;
  };
}
