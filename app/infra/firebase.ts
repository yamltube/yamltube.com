import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { Service } from "./service";

export class Users {
  private service;

  constructor(triplet: string, head: string, service: Service) {
    this.service = service;
  }

  async init() {}

  async up() {
    // we aren't guaranteed *where* this will run.
    // we are only guaranteed that it *will* run
    const pulumiProgram = async () => {
      const bucket = new gcp.storage.Bucket("data", {
        location: "US-WEST1",
      });

      return {
        bucket: {
          url: bucket.url,
          name: bucket.name,
        },
      };
    };
  }
}
