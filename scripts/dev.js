const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const rootDir = path.join(__dirname, "..");

function ensureInstalled() {
  const requiredDirs = [
    path.join(rootDir, "backend", "node_modules"),
    path.join(rootDir, "frontend", "node_modules"),
  ];

  const missing = requiredDirs.filter((dir) => !fs.existsSync(dir));

  if (missing.length === 0) {
    return true;
  }

  process.stderr.write("Project dependencies are not installed yet.\n");
  process.stderr.write("Run `npm run install:all` from the repo root first.\n");
  return false;
}

function streamWithPrefix(stream, prefix) {
  const rl = readline.createInterface({ input: stream });
  rl.on("line", (line) => {
    process.stdout.write(`[${prefix}] ${line}\n`);
  });
}

function runService(name, cwd, args) {
  const child = spawn(npmCommand, args, {
    cwd,
    stdio: ["inherit", "pipe", "pipe"],
    env: process.env,
  });

  streamWithPrefix(child.stdout, name);
  streamWithPrefix(child.stderr, name);

  child.on("error", (error) => {
    process.stderr.write(`[${name}] Failed to start: ${error.message}\n`);
  });

  return child;
}

if (!ensureInstalled()) {
  process.exit(1);
}

const services = [
  runService("backend", path.join(rootDir, "backend"), ["run", "dev"]),
  runService("frontend", path.join(rootDir, "frontend"), ["run", "dev"]),
];

let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const service of services) {
    if (!service.killed) {
      service.kill("SIGINT");
    }
  }

  process.exitCode = exitCode;
}

for (const [index, service] of services.entries()) {
  service.on("exit", (code) => {
    if (!shuttingDown && code !== 0) {
      const names = ["backend", "frontend"];
      process.stderr.write(`[${names[index]}] exited with code ${code}\n`);
      shutdown(code || 1);
    }
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
