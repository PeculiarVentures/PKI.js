import React, { useState } from "react";
import CodeBlock from "@theme/CodeBlock";
import s from "./styles.module.scss";

type ExampleConsole = Pick<Console, "log">;

interface RunnableExampleProps {
  /** Example source, imported with `!!raw-loader!` */
  source: string;
  /** Lazily loads the example as a function, imported with `?run` */
  load: () => Promise<{ default: (console: ExampleConsole) => Promise<void> }>;
}

interface OutputLine {
  text: string;
  error?: boolean;
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

export default function RunnableExample({ source, load }: RunnableExampleProps) {
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<OutputLine[] | null>(null);

  const run = async () => {
    setRunning(true);
    const lines: OutputLine[] = [];
    const exampleConsole: ExampleConsole = {
      log: (...args: unknown[]) => {
        lines.push({ text: args.map(format).join(" ") });
      },
    };

    try {
      const example = await load();
      await example.default(exampleConsole);
    } catch (error) {
      lines.push({ text: format(error), error: true });
    }

    setOutput(lines);
    setRunning(false);
  };

  return (
    <div className={s.example}>
      <CodeBlock language="ts">{source}</CodeBlock>
      <div className={s.toolbar}>
        <button type="button" className="button button--primary button--sm" onClick={run} disabled={running}>
          {running ? "Running…" : output ? "Run again" : "Run"}
        </button>
        <span className={s.hint}>Runs in your browser</span>
      </div>
      {output && (
        <pre className={s.output} aria-live="polite">
          {output.length === 0 && <span className={s.empty}>No output</span>}
          {output.map((line, index) => (
            <div key={index} className={line.error ? s.error : undefined}>
              {line.text}
            </div>
          ))}
        </pre>
      )}
    </div>
  );
}
