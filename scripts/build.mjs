#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
};

// A Vercel project can be connected before its production facts are configured,
// but it must not publish a production deployment with placeholders. Preview and
// local builds remain available for review.
if (process.env.VERCEL_ENV === "production") {
  run(process.execPath, ["scripts/validate-release.mjs"]);
}

run(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "build"]);
