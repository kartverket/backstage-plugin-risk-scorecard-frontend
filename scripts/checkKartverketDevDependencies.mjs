#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const pluginRepoPath = path.resolve(scriptDir, '..');
const kartverketDevPath = path.join(pluginRepoPath, '..', 'kartverket.dev');
const resolutionCheckCommand = [
  'yarn',
  'install',
  '--immutable',
  '--check-resolutions',
  '--mode=skip-build',
];

if (process.env.RISC_SKIP_DEP_CHECK === '1') {
  console.log(
    'Skipping dependency alignment check because RISC_SKIP_DEP_CHECK=1',
  );
  process.exit(0);
}

const pluginBackstageVersion = readBackstageVersion(pluginRepoPath);
const kartverketDevBackstageVersion = readBackstageVersion(kartverketDevPath);

if (pluginBackstageVersion !== kartverketDevBackstageVersion) {
  console.error(
    'Backstage version mismatch between this plugin repo and kartverket.dev.',
  );
  console.error('kartverket.dev is treated as the source of truth.');
  console.error('');
  console.error(`plugin repo:    ${pluginBackstageVersion}`);
  console.error(`kartverket.dev: ${kartverketDevBackstageVersion}`);
  console.error('');
  console.error(
    `Fix this repo: yarn backstage:upgrade --release ${kartverketDevBackstageVersion}`,
  );
  console.error('Rerun with RISC_SKIP_DEP_CHECK=1 to avoid fixing this now.');
  process.exit(1);
}

const dependencyCheck = checkDependencies();

if (dependencyCheck.mismatches.length > 0) {
  printMismatches(dependencyCheck.mismatches);
  checkYarnResolutions();

  if (process.stdin.isTTY) {
    await promptForFixes(dependencyCheck.mismatches);
    const postFixCheck = checkDependencies();

    if (postFixCheck.mismatches.length === 0) {
      checkYarnResolutions();
      console.log(
        `Dependency alignment check passed for ${postFixCheck.sharedDependencyCount} shared direct dependencies.`,
      );
      process.exit(0);
    }

    console.error('');
    console.error(
      'Dependency alignment still has mismatches after the selected fixes.',
    );
    printMismatches(postFixCheck.mismatches);
  }

  process.exit(1);
}

checkYarnResolutions();
console.log(
  `Dependency alignment check passed for ${dependencyCheck.sharedDependencyCount} shared direct dependencies.`,
);

function checkDependencies() {
  const pluginDependencies = yarnInfoVersions(pluginRepoPath);
  const kartverketDevDependencies = yarnInfoVersions(kartverketDevPath);

  const mismatches = [];
  let sharedDependencyCount = 0;

  for (const [packageName, pluginVersions] of pluginDependencies) {
    const kartverketDevVersions = kartverketDevDependencies.get(packageName);

    if (!kartverketDevVersions) {
      continue;
    }

    sharedDependencyCount += 1;

    if (
      formatVersions(pluginVersions) !== formatVersions(kartverketDevVersions)
    ) {
      mismatches.push({
        packageName,
        pluginVersions,
        kartverketDevVersions,
      });
    }
  }

  return {
    mismatches: sortMismatches(mismatches),
    sharedDependencyCount,
  };
}

function printMismatches(mismatches) {
  console.error(
    'Dependency version mismatch between this plugin repo and kartverket.dev.',
  );
  console.error('kartverket.dev is treated as the source of truth.');
  console.error(
    'Only dependencies found in both repos are checked. Dependencies found in just one repo are ignored.',
  );
  console.error('Rerun with RISC_SKIP_DEP_CHECK=1 to avoid fixing this now.');
  console.error('');

  for (const mismatch of mismatches) {
    console.error(`- ${mismatch.packageName}`);
    console.error(
      `  plugin repo:    ${formatVersions(mismatch.pluginVersions)}`,
    );
    console.error(
      `  kartverket.dev: ${formatVersions(mismatch.kartverketDevVersions)}`,
    );
  }
}

async function promptForFixes(mismatches) {
  const prompts = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    for (const mismatch of mismatches) {
      const fixes = lockfileFixesForMismatch(mismatch);

      if (fixes.length === 0) {
        console.error(
          `No lockfile-only automatic fix for ${mismatch.packageName}`,
        );
        continue;
      }

      for (const fix of fixes) {
        try {
          console.info('');
          await prompts.question(
            `Press Enter to run "${formatCommand(fix)}" or Ctrl-C to stop: `,
          );
        } catch (error) {
          if (error.code === 'ABORT_ERR') {
            console.error('');
            console.error('Stopped dependency fixes.');
            process.exit(1);
          }

          throw error;
        }

        const result = spawnSync(fix[0], fix.slice(1), {
          cwd: pluginRepoPath,
          stdio: 'inherit',
        });

        if (result.status !== 0) {
          console.error(`Command failed: ${formatCommand(fix)}`);
          process.exit(result.status ?? 1);
        }

        checkYarnResolutions();
      }
    }
  } finally {
    prompts.close();
  }
}

function lockfileFixesForMismatch(mismatch) {
  const kartverketDevVersions = [...mismatch.kartverketDevVersions].sort();

  if (kartverketDevVersions.length !== 1) {
    return [];
  }

  const resolution = `npm:${kartverketDevVersions[0]}`;

  return lockfileDescriptorsForPackageVersions(
    mismatch.packageName,
    mismatch.pluginVersions,
  ).map(descriptor => ['yarn', 'set', 'resolution', descriptor, resolution]);
}

function lockfileDescriptorsForPackageVersions(packageName, versions) {
  const lockfilePath = path.join(pluginRepoPath, 'yarn.lock');
  const lockfile = readFileSync(lockfilePath, 'utf8');
  const descriptors = new Set();
  const entryPattern = /^"([^"]+)":\n((?:  .+\n)+)/gm;
  let entry;

  while ((entry = entryPattern.exec(lockfile)) !== null) {
    const [, descriptorList, body] = entry;
    const version = body.match(/^  version: (.+)$/m)?.[1];

    if (!version || !versions.has(version)) {
      continue;
    }

    for (const descriptor of descriptorList.split(', ')) {
      if (packageNameFromPackageReference(descriptor) === packageName) {
        descriptors.add(descriptor);
      }
    }
  }

  return [...descriptors].sort();
}

function checkYarnResolutions() {
  console.info('');
  console.info(
    `Checking Yarn resolutions: ${formatCommand(resolutionCheckCommand)}`,
  );

  const result = spawnSync(
    resolutionCheckCommand[0],
    resolutionCheckCommand.slice(1),
    {
      cwd: pluginRepoPath,
      stdio: 'inherit',
    },
  );

  if (result.status === 0) {
    return;
  }

  console.error('');
  console.error(
    'Yarn resolution validation failed. Manual dependency handling is needed before starting kartverket.dev.',
  );
  console.error(`Failed command: ${formatCommand(resolutionCheckCommand)}`);
  console.error(
    'Use "yarn why <package> --recursive" to inspect the full requirement paths.',
  );
  process.exit(result.status ?? 1);
}

// Extracts the package name from Yarn locators and descriptors.
// Example: "@backstage/core-components@npm:0.18.10" -> "@backstage/core-components"
// Example: "react-hook-form@npm:^7.55.0" -> "react-hook-form"
// Example: "@backstage/cli@backstage:^::backstage=1.50.3&npm=0.36.1" -> "@backstage/cli"
// Example: "root@workspace:." with expectedProtocol "npm" -> undefined
function packageNameFromPackageReference(packageReference, expectedProtocol) {
  const match = packageReference.match(/^((?:@[^/]+\/)?[^@]+)@([^:]+):/);

  if (!match) {
    return undefined;
  }

  const [, packageName, protocol] = match;

  if (expectedProtocol && protocol !== expectedProtocol) {
    return undefined;
  }

  return packageName;
}

function formatCommand(command) {
  return command.map(formatCommandArgument).join(' ');
}

function formatCommandArgument(argument) {
  if (/^[\w./:@+-]+$/.test(argument)) {
    return argument;
  }

  return `'${argument.replaceAll("'", "'\\''")}'`;
}

function sortMismatches(mismatches) {
  return mismatches.sort((a, b) => a.packageName.localeCompare(b.packageName));
}

function readBackstageVersion(cwd) {
  const backstageJsonPath = path.join(cwd, 'backstage.json');

  try {
    const backstageJson = JSON.parse(readFileSync(backstageJsonPath, 'utf8'));

    if (typeof backstageJson.version === 'string') {
      return backstageJson.version;
    }
  } catch (error) {
    console.error(`Failed to read ${backstageJsonPath}`);
    console.error(error.message);
    process.exit(1);
  }

  console.error(`Missing version field in ${backstageJsonPath}`);
  process.exit(1);
}

// Reads direct npm package versions from Yarn.
// Example: {"value":"react@npm:18.3.1","children":{"Version":"18.3.1"}}
// Output: Map { "react" => Set { "18.3.1" } }
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

    const packageName = packageNameFromPackageReference(locator, 'npm');

    if (!packageName) {
      continue;
    }

    if (!versionsByPackage.has(packageName)) {
      versionsByPackage.set(packageName, new Set());
    }

    versionsByPackage.get(packageName).add(version);
  }

  return versionsByPackage;
}

// Formats a set of versions for deterministic comparison and output.
// Example: Set { "2.0.0", "1.0.0" } -> "1.0.0, 2.0.0"
function formatVersions(versions) {
  return [...versions].sort().join(', ');
}
