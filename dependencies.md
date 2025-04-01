# Current status of dependencies

<br>

## React, MUI and Backstage

It's difficult to upgrade these packages because they permeate the project whilst requiring different versions of one another.

We want to achieve the latest versions, but for now the focus is only the next major versions.

Targets:

- React: 18
- MUI: 5

We are currently stuck in an awkward spot between versions, see migrations guides:

- https://mui.com/material-ui/migration/migration-v4/
- https://backstage.io/docs/tutorials/migrate-to-mui5/
- https://react.dev/blog/2022/03/08/react-18-upgrade-guide
- https://backstage.io/docs/tutorials/react18-migration/

Old -> New
<br>
`@material-ui` -> `@mui`
