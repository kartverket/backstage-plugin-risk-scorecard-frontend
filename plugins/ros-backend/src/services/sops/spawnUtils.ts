import { spawn } from 'child_process';
import { spawnSync } from 'node:child_process';

const SOPS_TIMEOUT_MS = 30_000;

export interface SopsResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface SpawnSopsOptions {
  args: string[];
  env?: Record<string, string>;
  stdin?: string;
  timeoutMs?: number;
}

/**
 * Low-level wrapper around the `sops` CLI binary.
 * Spawns a subprocess, pipes stdin, collects stdout/stderr, and enforces a timeout.
 */
// TODO: Vurder å generalisere denne til bare `spawn` el.l og ta inn 'sops' som parameter
// TODO: Hva blir forskjellen opp mot spawnSync
export async function spawnSops(
  options: SpawnSopsOptions,
): Promise<SopsResult> {
  const { args, env = {}, stdin, timeoutMs = SOPS_TIMEOUT_MS } = options;

  return new Promise<SopsResult>((resolve, reject) => {
    const child = spawn('sops', args, {
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, timeoutMs);

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    child.on('error', err => {
      clearTimeout(timer);
      reject(new Error(`Failed to spawn sops: ${err.message}`));
    });

    child.on('close', exitCode => {
      clearTimeout(timer);
      if (timedOut) {
        reject(new Error(`sops process timed out after ${timeoutMs}ms`));
        return;
      }
      resolve({ stdout, stderr, exitCode: exitCode ?? 1 });
    });

    if (stdin !== undefined) {
      child.stdin.write(stdin);
      child.stdin.end();
    }
  });
}
