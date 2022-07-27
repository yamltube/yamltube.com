import * as childProcess from "child_process";

const notFoundRegex = new RegExp("no stack named.*found");
const alreadyExistsRegex = new RegExp("stack.*already exists");
const conflictText = "[409] Conflict: Another update is currently in progress.";

/**
 * CommandError is an error resulting from invocation of a Pulumi Command.
 * @alpha
 */
export class CommandError extends Error {
  /** @internal */
  constructor(private commandResult: CommandResult) {
    super(commandResult.toString());
    this.name = "CommandError";
  }
}

/**
 * ConcurrentUpdateError is thrown when attempting to update a stack that already has an update in progress.
 */
export class ConcurrentUpdateError extends CommandError {
  /** @internal */
  constructor(commandResult: CommandResult) {
    super(commandResult);
    this.name = "ConcurrentUpdateError";
  }
}

/**
 * StackNotFoundError is thrown when attempting to select a stack that does not exist.
 */
export class StackNotFoundError extends CommandError {
  /** @internal */
  constructor(commandResult: CommandResult) {
    super(commandResult);
    this.name = "StackNotFoundError";
  }
}

/**
 * StackAlreadyExistsError is thrown when attempting to create a stack that already exists.
 */
export class StackAlreadyExistsError extends CommandError {
  /** @internal */
  constructor(commandResult: CommandResult) {
    super(commandResult);
    this.name = "StackAlreadyExistsError";
  }
}

export function createCommandError(result: CommandResult): CommandError {
  const stderr = result.stderr;
  return notFoundRegex.test(stderr)
    ? new StackNotFoundError(result)
    : alreadyExistsRegex.test(stderr)
    ? new StackAlreadyExistsError(result)
    : stderr.indexOf(conflictText) >= 0
    ? new ConcurrentUpdateError(result)
    : new CommandError(result);
}

export class CommandResult {
  stdout: string;
  stderr: string;
  code: number;
  err?: Error;
  constructor(stdout: string, stderr: string, code: number, err?: Error) {
    this.stdout = stdout;
    this.stderr = stderr;
    this.code = code;
    this.err = err;
  }
  toString(): string {
    let errStr = "";
    if (this.err) {
      errStr = this.err.toString();
    }
    return `code: ${this.code}\n stdout: ${this.stdout}\n stderr: ${this.stderr}\n err?: ${errStr}\n`;
  }
}

const unknownErrCode = -2;

export function runPulumiCmd(
  args: string[],
  cwd: string,
  additionalEnv: { [key: string]: string },
  onOutput?: (data: string) => void
): Promise<CommandResult> {
  // all commands should be run in non-interactive mode.
  // this causes commands to fail rather than prompting for input (and thus hanging indefinitely)

  if (!args.includes("--non-interactive")) {
    args.push("--non-interactive");
  }

  const env = { ...process.env, ...additionalEnv };

  return new Promise<CommandResult>((resolve, reject) => {
    let rootCmd = "pulumi";
    // allow users to run arbitrary commands like: ["$", "git", "status"]
    if (args[0] === "$") {
      rootCmd = args[1];
    }

    const proc = childProcess.spawn(rootCmd, args, { env, cwd });

    // TODO: write to buffers and avoid concatenation
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (data) => {
      if (data && data.toString) {
        data = data.toString();
      }
      if (onOutput) {
        onOutput(data);
      }
      stdout += data;
    });
    proc.stderr.on("data", (data) => {
      stderr += data;
    });
    proc.on("exit", (code, signal) => {
      const resCode = code !== null ? code : unknownErrCode;
      const result = new CommandResult(stdout, stderr, resCode);
      if (code !== 0) {
        return reject(createCommandError(result));
      }
      return resolve(result);
    });
    proc.on("error", (err) => {
      const result = new CommandResult(stdout, stderr, unknownErrCode, err);
      return reject(createCommandError(result));
    });
  });
}
