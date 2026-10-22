import React, { useEffect, useRef, useState } from "react";
import CodeBlock from "@theme/CodeBlock";
import { captureDownloads, type Download, type FileInput, type Input, type TextInput } from "@site/docs/examples/io";
import s from "./styles.module.scss";

type ExampleConsole = Pick<Console, "log">;

interface ExampleModule {
  default: (console: ExampleConsole) => Promise<void>;
  inputs?: Record<string, Input>;
}

interface RunnableExampleProps {
  /** Example source, imported with `!!raw-loader!` */
  source: string;
  /** Lazily loads the example as a function, imported with `?run` */
  load: () => Promise<ExampleModule>;
}

interface OutputLine {
  text: string;
  error?: boolean;
}

interface Result {
  lines: OutputLine[];
  downloads: Download[];
}

function format(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "bigint") return `${value}n`;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  try {
    return JSON.stringify(value, (_, item) => (typeof item === "bigint" ? `${item}n` : item)) ?? String(value);
  } catch {
    return String(value);
  }
}

function formatSize(bytes: number): string {
  return bytes < 1024 ? `${bytes} bytes` : `${(bytes / 1024).toFixed(1)} KB`;
}

function saveFile({ name, data }: Download) {
  const url = URL.createObjectURL(new Blob([data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function FileField({ input, onChange }: { input: FileInput; onChange: () => void }) {
  const picker = useRef<HTMLInputElement>(null);
  const [pasting, setPasting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const isSample = input.value === input.sample;

  const setFile = (name: string, value: Uint8Array<ArrayBuffer>) => {
    input.name = name;
    input.value = value;
    onChange();
  };
  const readFile = async (file: File | undefined) => {
    if (file) setFile(file.name, new Uint8Array(await file.arrayBuffer()));
  };

  return (
    <div
      className={`${s.field} ${dragging ? s.dragging : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        void readFile(event.dataTransfer.files[0]);
      }}
    >
      <div className={s.fieldHeader}>
        <span className={s.label}>{input.label}</span>
        <span className={s.value}>
          {input.name} ({formatSize(input.value.byteLength)}){isSample && <span className={s.badge}>sample</span>}
        </span>
      </div>
      <div className={s.actions}>
        <button type="button" className="button button--secondary button--sm" onClick={() => picker.current?.click()}>
          Choose file…
        </button>
        <button type="button" className="button button--secondary button--sm" onClick={() => setPasting(!pasting)}>
          {pasting ? "Close" : "Paste text"}
        </button>
        {!isSample && (
          <button type="button" className="button button--link button--sm" onClick={() => setFile(input.sampleName, input.sample)}>
            Use the sample
          </button>
        )}
        <span className={s.hint}>or drop a file here</span>
        <input
          ref={picker}
          type="file"
          hidden
          accept={input.accept}
          onChange={(event) => {
            void readFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>
      {pasting && (
        <textarea
          className={s.textarea}
          rows={8}
          spellCheck={false}
          placeholder="Paste text, such as a PEM certificate or an email"
          onChange={(event) => setFile("pasted text", new TextEncoder().encode(event.target.value))}
        />
      )}
    </div>
  );
}

function TextField({ input, onChange }: { input: TextInput; onChange: () => void }) {
  return (
    <div className={s.field}>
      <div className={s.fieldHeader}>
        <span className={s.label}>{input.label}</span>
        {input.value !== input.sample && (
          <button
            type="button"
            className="button button--link button--sm"
            onClick={() => {
              input.value = input.sample;
              onChange();
            }}
          >
            Use the sample
          </button>
        )}
      </div>
      <textarea
        className={s.textarea}
        rows={Math.min(8, input.value.split("\n").length + 1)}
        spellCheck={false}
        value={input.value}
        onChange={(event) => {
          input.value = event.target.value;
          onChange();
        }}
      />
    </div>
  );
}

export default function RunnableExample({ source, load }: RunnableExampleProps) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [inputs, setInputs] = useState<Input[]>([]);
  // The inputs are the example module's own objects: editing them re-renders through this counter
  const [, setVersion] = useState(0);
  const rerender = () => setVersion((version) => version + 1);

  useEffect(() => {
    let active = true;
    load().then(
      (example) => active && setInputs(Object.values(example.inputs ?? {})),
      () => {}, // The Run button reports loading errors
    );
    return () => {
      active = false;
    };
  }, [load]);

  const run = async () => {
    setRunning(true);
    const lines: OutputLine[] = [];
    const downloads: Download[] = [];
    const exampleConsole: ExampleConsole = {
      log: (...args: unknown[]) => {
        lines.push({ text: args.map(format).join(" ") });
      },
    };

    const restore = captureDownloads((item) => downloads.push(item));
    try {
      const example = await load();
      await example.default(exampleConsole);
    } catch (error) {
      lines.push({ text: format(error), error: true });
    } finally {
      restore();
    }

    setResult({ lines, downloads });
    setRunning(false);
  };

  return (
    <div className={s.example}>
      <CodeBlock language="ts">{source}</CodeBlock>
      {inputs.length > 0 && (
        <div className={s.inputs}>
          {inputs.map((input) =>
            input.type === "file" ? (
              <FileField key={input.label} input={input} onChange={rerender} />
            ) : (
              <TextField key={input.label} input={input} onChange={rerender} />
            ),
          )}
        </div>
      )}
      <div className={s.toolbar}>
        <button type="button" className="button button--primary button--sm" onClick={run} disabled={running}>
          {running ? "Running…" : result ? "Run again" : "Run"}
        </button>
        <span className={s.hint}>Runs in your browser{inputs.length > 0 && ": your files are not uploaded anywhere"}</span>
      </div>
      {result && (
        <div className={s.result} aria-live="polite">
          <pre className={s.output}>
            {result.lines.length === 0 && <span className={s.empty}>No output</span>}
            {result.lines.map((line, index) => (
              <div key={index} className={line.error ? s.error : undefined}>
                {line.text}
              </div>
            ))}
          </pre>
          {result.downloads.length > 0 && (
            <div className={s.downloads}>
              {result.downloads.map((item, index) => (
                <button key={index} type="button" className="button button--secondary button--sm" onClick={() => saveFile(item)}>
                  ⬇ {item.name} ({formatSize(item.data.byteLength)})
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
