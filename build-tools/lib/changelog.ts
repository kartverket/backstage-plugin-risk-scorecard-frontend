import { Readable } from 'node:stream';
import { ConventionalChangelog } from 'conventional-changelog';

/**
 * Generate changelog content for a specific version using conventional-changelog
 * Uses 'conventionalcommits' preset to properly support feat!, fix!, etc.
 * Returns only the changelog for the new version (not cumulative)
 */
async function generateChangelog(): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: string[] = [];

    // Use conventionalcommits preset to match the version bump detection
    const changelog = new ConventionalChangelog().loadPreset(
      'conventionalcommits',
    );

    const changelogStream: Readable = changelog.writeStream();

    changelogStream.on('data', (chunk: string | Buffer) => {
      chunks.push(typeof chunk === 'string' ? chunk : chunk.toString('utf-8'));
    });

    changelogStream.on('end', () => {
      const changelogContent = chunks.join('');
      resolve(changelogContent.trim());
    });

    changelogStream.on('error', (err: Error) => {
      reject(err);
    });
  });
}

/**
 * Format changelog for GitHub release body
 * Strips the version header since GitHub release already shows the tag
 */
export async function getChangelogFormattedForRelease(): Promise<string> {
  const changelog = await generateChangelog();

  // Split by lines and remove the first header line if it contains the version
  const lines = changelog.split('\n');

  // Find the first non-empty line that starts with ##
  const headerIndex = lines.findIndex(
    line => line.startsWith('## ') || line.startsWith('# '),
  );

  if (headerIndex !== -1) {
    // Remove the header line and any empty lines immediately after
    const withoutHeader = lines.slice(headerIndex + 1);
    const firstContentIndex = withoutHeader.findIndex(
      line => line.trim() !== '',
    );
    return withoutHeader.slice(firstContentIndex).join('\n').trim();
  }

  return changelog;
}
