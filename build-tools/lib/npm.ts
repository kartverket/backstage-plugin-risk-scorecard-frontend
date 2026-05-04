import { execSync, type ExecSyncOptions } from 'node:child_process';
import { resolve } from 'node:path';

interface PublishOptions {
  pluginPath: string;
  dryRun?: boolean;
  prereleaseTag?: string;
}

interface PublishResult {
  success: boolean;
  output: string;
}

interface PackResult {
  success: boolean;
  tarballPath?: string;
  tarballName?: string;
  error?: string;
}

/**
 * Publish the package to npm using OIDC trusted publishing
 *
 * Prerequisites for OIDC:
 * - npm CLI 11.5.1+ (auto-detects OIDC environment)
 * - GitHub Actions with id-token: write permission
 * - Trusted publisher configured on npmjs.com for this package
 *
 * No NPM_AUTH_TOKEN needed when using trusted publishing!
 */
export function publishToNpm(options: PublishOptions): PublishResult {
  const { pluginPath, dryRun = false, prereleaseTag } = options;

  const execOptions: ExecSyncOptions = {
    cwd: pluginPath,
    encoding: 'utf-8',
  };

  // Build the tag argument for prerelease versions - since we've hardcoded 0.0.0-development in package.json,
  // we need to fall back to that for dry runs (since dry run will not update package.json)
  const tagArg =
    dryRun || prereleaseTag ? ` --tag ${prereleaseTag || 'development'}` : '';

  try {
    const output = execSync(
      `npm publish --access public${tagArg}${dryRun ? ' --dry-run' : ''}`,
      execOptions,
    ) as string;
    return {
      success: true,
      output: `${dryRun ? '[DRY RUN] Would publish package:\n' : ''}${output}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      output: message,
    };
  }
}

/**
 * Build the package before publishing
 */
export function buildPackage(pluginPath: string): PublishResult {
  const execOptions: ExecSyncOptions = {
    cwd: pluginPath,
    encoding: 'utf-8',
    stdio: 'inherit', // Show build output directly
  };

  try {
    // Run TypeScript compilation
    execSync('yarn tsc', execOptions);

    // Run the build script (backstage-cli package build)
    execSync('yarn build', execOptions);

    return {
      success: true,
      output: 'Build completed successfully',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      output: `Build failed: ${message}`,
    };
  }
}

/**
 * Create a tarball of the package using npm pack
 */
export function createTarball(pluginPath: string, dryRun = false): PackResult {
  const execOptions: ExecSyncOptions = {
    cwd: pluginPath,
    encoding: 'utf-8',
  };

  try {
    const output = execSync(
      `npm pack${dryRun ? ' --dry-run' : ''}`,
      execOptions,
    ) as string;
    const tarballName = output.trim().split('\n').pop()?.trim();

    if (!tarballName) {
      return {
        success: false,
        error: 'Could not determine tarball name from npm pack output',
      };
    }

    return {
      success: true,
      tarballPath: dryRun ? undefined : resolve(pluginPath, tarballName),
      tarballName,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: message,
    };
  }
}
