#!/usr/bin/env -S yarn dlx tsx

import process from 'node:process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { validatePRTitle } from './lib/pr-validator.ts';
import { getChangelogFormattedForRelease } from './lib/changelog.ts';
import { log } from './lib/logging.ts';

export interface ValidateOptions {
  prTitle: string;
}

export interface ValidationResult {
  valid: boolean;
  prTitle: string;
  expectedBumpType: string | null;
  message: string;
  hasConventionalCommits: boolean;
}

export async function runValidation(
  options: ValidateOptions,
): Promise<ValidationResult> {
  const { prTitle } = options;

  log(`🔍 Validating PR title: "${prTitle}"`);
  log('');

  // when using the current commits to determine the expected bump, the Bumper instance for some reason returns patch even when there are no conventional commits. The changelog however works as expected. Could probably get around this somehow, usign the explicit passing of commits to the Bumper, but this works for now.
  log('🧾 Generating changelog to detect conventional commits...');
  const releaseNotes = await getChangelogFormattedForRelease();
  const hasConventionalCommits = !!releaseNotes && releaseNotes.trim() !== '';

  const result = await validatePRTitle(prTitle, hasConventionalCommits);

  return {
    ...result,
    hasConventionalCommits,
  };
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .scriptName('validate-pr')
    .usage('$0 [options]')
    .option('pr-title', {
      alias: 't',
      type: 'string',
      description: 'PR title to validate',
      demandOption: true,
    })
    .example(
      '$0 --pr-title "fix: resolve login issue"',
      'Validate PR title against commits',
    )
    .help()
    .parse();

  const result = await runValidation({
    prTitle: argv.prTitle,
  });

  console.log(result.message);
  console.log('');

  if (!result.valid) {
    process.exit(1);
  }
}

// Only run main() when executed directly, not when imported
const isMainModule =
  resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1] ?? '');
if (isMainModule) {
  main();
}
