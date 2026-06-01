#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const pluginRepoPath = path.resolve(scriptDir, '..');
const kartverketDevPath = path.join(pluginRepoPath, '..', 'kartverket.dev');

if (process.env.RISC_SKIP_DEP_CHECK === '1') {
  console.log(
    'Skipping dependency alignment check because RISC_SKIP_DEP_CHECK=1',
  );
  process.exit(0);
}

const pluginDependencies = yarnInfoVersions(pluginRepoPath);
const kartverketDevDependencies = yarnInfoVersions(kartverketDevPath);

const mismatches = [];
let sharedDependencyCount = 0;

for (const [dependencyKey, pluginVersions] of pluginDependencies) {
  const kartverketDevVersions = kartverketDevDependencies.get(dependencyKey);

  if (!kartverketDevVersions) {
    continue;
  }

  sharedDependencyCount += 1;

  if (
    formatVersions(pluginVersions) !== formatVersions(kartverketDevVersions)
  ) {
    mismatches.push({
      dependencyKey,
      pluginVersions,
      kartverketDevVersions,
    });
  }
}

if (mismatches.length > 0) {
  console.error(
    'Dependency version mismatch between this plugin repo and kartverket.dev.',
  );
  console.error(
    'Only dependencies found in both repos are checked. Dependencies found in just one repo are ignored.',
  );
  console.error('');

  for (const mismatch of mismatches.sort((a, b) =>
    a.dependencyKey.localeCompare(b.dependencyKey),
  )) {
    console.error(`- ${mismatch.dependencyKey}`);
    console.error(
      `  plugin repo:    ${formatVersions(mismatch.pluginVersions)}`,
    );
    console.error(
      `  kartverket.dev: ${formatVersions(mismatch.kartverketDevVersions)}`,
    );
  }

  console.error('');
  console.error(
    'Align the versions or rerun with RISC_SKIP_DEP_CHECK=1 if this mismatch is intentional.',
  );
  process.exit(1);
}

console.log(
  `Dependency alignment check passed for ${sharedDependencyCount} shared direct dependencies.`,
);

// Reads direct workspace dependencies from Yarn.
// Example: {"value":"react@npm:18.3.1","children":{"Version":"18.3.1"}}
// Output: Map { "react@npm" => Set { "18.3.1" } }
function yarnInfoVersions(cwd) {
  const result = spawnSync('yarn', ['info', '-A', '--json'], {
    cwd,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    console.error(`Failed to run "yarn info -A --json" in ${cwd}`);
    if (result.stdout) {
      console.error(result.stdout.trim());
    }
    if (result.stderr) {
      console.error(result.stderr.trim());
    }
    process.exit(result.status ?? 1);
  }

  const versionsByPackage = new Map();

  for (const line of result.stdout.split('\n')) {
    if (!line.trim()) {
      continue;
    }

    const yarnInfo = JSON.parse(line);
    const locator = yarnInfo.value;
    const version = yarnInfo.children?.Version;

    if (!locator || !version) {
      continue;
    }

    const dependencyKey = dependencyKeyFromLocator(locator);

    if (!versionsByPackage.has(dependencyKey)) {
      versionsByPackage.set(dependencyKey, new Set());
    }

    versionsByPackage.get(dependencyKey).add(version);
  }

  return versionsByPackage;
}

// Extracts the dependency identity from a Yarn locator.
// Example: "@backstage/core-components@npm:0.18.10" -> "@backstage/core-components@npm"
// Example: "@kartverket/ros-common@workspace:packages/ros-common" -> "@kartverket/ros-common@workspace"
// Example: "unknown-locator-format" -> "unknown-locator-format"
function dependencyKeyFromLocator(locator) {
  const locatorSeparatorIndex = locator.indexOf(':');

  if (locatorSeparatorIndex === -1) {
    return locator;
  }

  return locator.slice(0, locatorSeparatorIndex);
}

// Formats a set of versions for deterministic comparison and output.
// Example: Set { "2.0.0", "1.0.0" } -> "1.0.0, 2.0.0"
function formatVersions(versions) {
  return [...versions].sort().join(', ');
}
