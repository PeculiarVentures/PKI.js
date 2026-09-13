import { assert, describe, it } from "vitest";
import * as pkijs from "../src";

const PID_DESCRIPTOR = Object.getOwnPropertyDescriptor(process, "pid");

/**
 * Runs `fn` with `process.pid` set to `pid`, restoring the original property
 * descriptor afterwards. Simulates runtimes exposing a partial `process`
 * object where `pid` exists but is not a number (e.g. edge runtimes).
 */
function withProcessPid<T>(pid: unknown, fn: () => T): T {
  Object.defineProperty(process, "pid", { value: pid, configurable: true, writable: true });
  try {
    return fn();
  } finally {
    if (PID_DESCRIPTOR) {
      Object.defineProperty(process, "pid", PID_DESCRIPTOR);
    }
  }
}

describe("Crypto engine global registry", () => {
  it("stores and returns the engine when process.pid is undefined", () => {
    const crypto = pkijs.getCrypto(true);

    withProcessPid(undefined, () => {
      pkijs.setEngine("undefined-pid", crypto);

      const engine = pkijs.getEngine();
      assert.equal(engine.name, "undefined-pid");
      assert.strictEqual(engine.crypto, crypto);
    });

    // The engine registered under the real pid is untouched.
    assert.equal(pkijs.getEngine().name, "newEngine");
  });

  it("stores and returns the engine when process.pid is not an integer", () => {
    const crypto = pkijs.getCrypto(true);

    withProcessPid(NaN, () => {
      pkijs.setEngine("nan-pid", crypto);
      assert.equal(pkijs.getEngine().name, "nan-pid");
    });

    assert.equal(pkijs.getEngine().name, "newEngine");
  });
});
