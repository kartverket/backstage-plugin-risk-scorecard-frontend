# Contributing to Backstage plugin risk scorecard

## Issues

We use GitHub issues to track bugs and feature requests.

- All issues: https://github.com/kartverket/backstage-plugin-risk-scorecard-frontend/issues

## Local development

Follow the steps in the [README.md](README.md).

## Versioning

The plugin is published as a NPM-package. The following rules apply for when we expect different kinds of version bumps:

**Major**: When introducing BREAKING changes. Meaning ALL changes to the RoS-schema as well as any change that's dependent on a backend change.

**Minor**: New features should result in a new minor version.

**Patch**: Bugfixes and small changes (like text or pixel-nudging).

## Process for PRs

All PR's should be reviewed and approved by a member of the RoS-team. After that, the "Request review" feature can be used to assign a person from SKVIS. This signals that the PR is done with internal review and is ready for final approval and merging. In most cases, the person from SKVIS should simply approve and merge (at own discretion of course, but a high level of trust between the teams should be the foundation of this process).

### Test checklist

A feature should be tested locally by author and potentially reviewer(s) upon request or at their own discretion. A test should include the steps in the list below in addition to actually testing the fix or feature introduced. The result of testing the fix/feature should be documented in the PR using screenshots, code snippets, links or other suitable documentation.

**Note:** You're allowed to use your judgment here! If you've made a very small change that obviously doesn't affect functionality, you don't need to test everything (maybe not anything at all) in the list below.

If you deviate from the checklist, briefly describe which considerations you've made and what you've tested.

For example:

> This PR is only a color change on a button. The attached screenshot shows that the color is changed, and no other functionality will be touched by this.

**The list:**

- A proper version bump will happen on merge - see [versioning](#versioning).
- Introduced changes work as expected.
- Verify that you can navigate between Risk scorecards.
- Check that RiScs can be created:
  - via initial RiSc and empty
  - can select encryption key
- Check that RiSc can be updated, both in table and drawer (e.g., click refresh on an action).
- If you've made changes regarding encryption: Make sure that RiSc's are still getting encrypted.
- Check any new/modified UI elements in both dark and light mode.
- Verify changes with designer(s) or at least one other team member if the team is without a designer.
