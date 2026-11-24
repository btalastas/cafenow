# Menu Item Number - November 9, 2026

User reports creating Menu numbering through Number Maintenance with prefix MENU and adding Number to the form, then relabeling Number as Item Number. The screenshot shows two distinct columns: `number` and older `item_number`. A label change does not change a column name; the prepared backfill targets `number`. Preserve the older column and any values/references until its uses are reviewed.

## New Menu records

1. Verify the actual Menu table technical name; the retained export uses `x_1234_cafenow_menu`.
2. In System Definition > Number Maintenance, open that exact table's configuration. Confirm prefix MENU and the desired padding/counter. Do not reset an existing sequence merely to start at 1. ServiceNow supports one number format per table.
3. In the dictionary for column `number`, confirm String(40), label Item Number and the auto-number Default value supplied by Number Maintenance. The documented standard is `javascript:getNextObjNumberPadded();`; verify a new record actually numbers in this scoped application. The user's subsequent live error confirms NumberManager is Global-private: do NOT use `new global.NumberManager(...)` as a CafeNow-scoped default. Retain/test the platform-generated default. A new-record default failure requires a separate supported configuration review; the Global maintenance backfill does not resolve that by itself. Do not alter the shared NumberManager accessibility.
4. Set the field read-only on the form and protect number writes appropriately through ACLs/server rules. A UI read-only setting alone does not prevent API writes. Do not make the older `item_number` another consumer of the same counter.
5. Place this field near Item Name in Form Designer and save the intended view. Remove the older Item Number *form element* if it duplicates the new field, after confirming the element's actual column name. Do not delete the old column/data. Existing forms may need their respective views updated.
6. Create and save a disposable Menu record, then verify its number persists with MENU prefix. Adding the field to a form does not populate existing records. Dictionary defaults may consume sequence values even when a new form is abandoned; gaps are acceptable.

## Existing records

The live results show two separate scope boundaries: CafeNow cannot call Global-private NumberManager, and Global cannot write the protected CafeNow Menu table. Neither base protection should be loosened. Use a NEW Global helper for generation and keep the backfill/table updates in CafeNow scope.

### Install the maintenance helper once

1. As admin, select the **Global** application and create a new Script Include named **CafeNowMenuNumberGenerator**.
2. Paste [CafeNowMenuNumberGenerator.js](CafeNowMenuNumberGenerator.js). Active=true; Accessible from=All application scopes; Client callable=false. Leave the existing platform NumberManager unchanged.
3. The helper requires the admin role, accepts no table parameter and generates only the next number for `x_1234_cafenow_menu`. It does not read/update Menu records. It is for maintenance only: do not use this admin-only helper as the dictionary default for normal Menu users.
4. If the instance requires an execute cross-scope privilege, review only that specific call to this custom helper; do not broaden Menu table access or NumberManager accessibility. Actual scope execution is not verified by local mocks.

### Run the backfill

Use the updated [backfill-menu-numbers.js](backfill-menu-numbers.js) in **Scripts - Background as an administrator, with execution scope set to CafeNow**. It calls `new global.CafeNowMenuNumberGenerator().next()` for numbers, then updates Menu from its own scope. It validates table/column and the table's MENU Number Maintenance entry, selects only null/empty numbers, sorts oldest first with sys_id as tie breaker, rechecks blanks, validates generated numbers and stops on collisions/failed writes. It preserves existing nonblank numbers and the separate `item_number` column.

1. Install the helper, choose CafeNow in the Background Script execution scope selector and paste the updated backfill. Verify TABLE/FIELD; the helper and backfill must both target the same actual Menu table.
2. Run with DRY_RUN=true. This reports the blank-record count without allocating sequence numbers or updating records.
3. During a single maintenance run, pause Menu editing/import activity and review the specific Menu-updated automation. The retained Menu import flow reacts to Menu updates and may synchronize Catalog Items; normal update() is intentionally retained and can trigger Business Rules/Flows. This script does not globally disable automation or falsify sys_updated_on/audit attribution. Do not assume setWorkflow(false) would suppress every Flow Designer trigger.
4. Set DRY_RUN=false and run once. Check updated/skipped/failed output, the Menu list and a sample of saved records. Re-running fills remaining blanks only; it is not a renumbering operation.
5. Restore the paused import/editing activity. If numbers must be strictly unique, verify existing duplicates and add an actual unique index on `number`; the counter/collision check alone is not a database uniqueness guarantee. Do not drop existing values to create the index. Do not run multiple backfills concurrently: a re-read is additional protection, not an atomic compare-and-set against other writers.

Local checks: `node docs/servicenow/menu-numbering/verify.cjs` passes 12 mocked backfill/helper checks, including dry-run counter preservation, fixed-table generation, admin-only access, nonblank preservation, collisions and failed writes. Both scripts parse. These mocks do not simulate the ServiceNow scope engine, field defaults, persistence, Flow effects or form rendering.

The user reported a live Global-private NumberManager error from CafeNow, then a Global-to-Menu write refusal with updated=0/skipped=0/failed=1. Successful backfill remains unverified. The refused write happened after number allocation, so a sequence gap may remain; do not reset the counter to close it. The new helper keeps each operation in its intended owning scope.

Sources: user November 9 screenshots and label-change report; retained Menu dictionary/export; [automatic numbering](https://www.servicenow.com/docs/r/platform-administration/t_AutoNumberingRecordsInATable.html), [unique numbering](https://www.servicenow.com/docs/r/platform-administration/c_EnforcingUniqueNumbering.html), [custom-table padding preparation](https://www.servicenow.com/docs/r/platform-administration/t_PrepToLeftPadNumFldsInCustmTbls.html). Verify the corresponding documentation for the actual release. D02/V01/I01/S04 retain live delivery evidence on the shared VTB.
