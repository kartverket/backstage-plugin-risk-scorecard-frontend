# Playwright

Main folder to write playwright 2e2 tests.

## Conventions

1. Mark html nodes with `data-pw` as unique identifiers that can be targeted by playwright.
   - Do not hardcode on reusable components, it must be passed as a prop by consumer to ensure uniqueness.

## Notes

Because the ROS project is comprised of multiple repositories, and the deployment steps aren't automated yet,
there is currently no set location for e2e tests.

## Env

Fill in missing values.

```sh
cp playwright/.env.example playwright/.env
```

## Core functionality

1. Open ROS tab and all elements are visible
   - Scorecard overview
   - Scorecard selector
   - Status card
   - List of Risk scenarios
   - Risk matrix
2. Create new scorecard
3. Edit encryption
4. Accept risks in status card
5. Add scenario to scorecard
6. Edit list
   - Drag & drop to reorder list
   - Delete item (currently missing a confirmation dialog)
   - Look for banner "Updated"
7. Clickable list items
   - Opens drawer
   - Edit scenario
   - Edit action
   - Delete action
   - Delete scenario
   - Close
8. Risk matrix is interactable
   - Initial/remaining risk
   - Estimated risk information modal
   - Clickable matrix numbers opens drawer
   -
