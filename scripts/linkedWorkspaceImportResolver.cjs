const { globSync, readFileSync } = require('node:fs');
const { registerHooks } = require('node:module');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const linkedWorkspace = process.env.BACKSTAGE_CLI_LINKED_WORKSPACE;

if (linkedWorkspace) {
  const workspacePackageJson = JSON.parse(
    readFileSync(path.resolve(linkedWorkspace, 'package.json'), 'utf8'),
  );
  const workspacePatterns = Array.isArray(workspacePackageJson.workspaces)
    ? workspacePackageJson.workspaces
    : workspacePackageJson.workspaces.packages;

  const packages = workspacePatterns.flatMap(pattern =>
    globSync(path.posix.join(pattern, 'package.json'), {
      cwd: linkedWorkspace,
    }).map(packageJsonPath => {
      const packageJson = JSON.parse(
        readFileSync(path.resolve(linkedWorkspace, packageJsonPath), 'utf8'),
      );
      return {
        dir: path.dirname(path.resolve(linkedWorkspace, packageJsonPath)),
        packageJson,
      };
    }),
  );
  const linkedPackageEntrypoints = new Map(
    packages.flatMap(pkg => {
      const { main, name } = pkg.packageJson;
      return name && main
        ? [[name, pathToFileURL(path.resolve(pkg.dir, main)).href]]
        : [];
    }),
  );

  // Backstage's built-in link hook covers require(), but not dynamic import().
  registerHooks({
    resolve(specifier, context, nextResolve) {
      const linkedEntrypoint = context.conditions.includes('import')
        ? linkedPackageEntrypoints.get(specifier)
        : undefined;
      return nextResolve(linkedEntrypoint ?? specifier, context);
    },
  });
}
