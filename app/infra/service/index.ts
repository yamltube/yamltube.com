import type { OutputMap } from "@pulumi/pulumi/automation";
import type { InlineProgramArgs } from "@pulumi/pulumi/automation/localWorkspace";
import { LocalWorkspace } from "@pulumi/pulumi/automation/localWorkspace";

export class Service {
  private project;
  private stack;
  private triplet;
  private headers;
  constructor(triplet: string, token: string) {
    const [org, project, stack] = triplet.split("/");
    this.project = stack ? `${org}/${project}` : `${project}`;
    this.stack = stack || project;
    this.triplet = triplet;
    this.headers = {
      Accept: "application/vnd.pulumi+8",
      "Content-Type": "application/json",
      Authorization: `token ${token}`,
    };
  }

  async up<T>(
    funcName: string,
    program: () => Promise<T>,
    providers: string[]
  ): Promise<T> {
    // Create our stack
    const args: InlineProgramArgs = {
      stackName: funcName,
      projectName: "databaseMigration",
      program: program,
    };
    const stack = await LocalWorkspace.createOrSelectStack(args);
    for (let provider of providers) {
      await stack.workspace.installPlugin(
        provider.split("/")[0],
        provider.split("/")[1]
      );
    }
    await stack.refresh();

    const up = await stack.up({ onOutput: console.info });

    return this.toT(up.outputs);
  }

  async shamatches(triplet: string, head: string): Promise<boolean> {
    const resp = await fetch(
      `https://api.pulumi.com/api/stacks/${triplet}/updates?pageSize=1`,
      {
        headers: this.headers,
      }
    );
    return true;
  }

  toT<T>(data: OutputMap): T {
    let obj: { [key: string]: any } = {};
    for (let k in data) {
      obj[k] = data[k].value;
    }
    return obj as T;
  }
}
