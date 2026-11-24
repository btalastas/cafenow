# Vendor ACL testing reference

## Test account mapping - November 4, 2026

User-supplied test persona labels, in employee/admin order. These are display labels, not verified usernames or sys_ids. No credentials are recorded.

| Vendor | Persona | Test user label |
| --- | --- | --- |
| Vendor A | Employee / vendor staff | Abel Tutor |
| Vendor A | Vendor admin | Abe Lincoln |
| Vendor B | Employee / vendor staff | Beth |
| Vendor B | Vendor admin | Joe |

## State write checks

Use separate orders referencing Vendor A and Vendor B and the appropriate protected vendor group. Test by impersonating each account; do not use an administrator session as evidence of vendor permissions.

| Test user | Vendor A order State | Vendor B order State | Actual result |
| --- | --- | --- | --- |
| Abel Tutor | Allow | Deny | Not recorded |
| Abe Lincoln | Allow | Deny | Not recorded |
| Beth | Deny | Allow | Not recorded |
| Joe | Deny | Allow | Not recorded |

Allow means an otherwise valid state update; server-side lifecycle rules still apply. Verify direct record access and attempted saves, not only whether the field appears editable. Confirm role assignments, direct membership in the referenced vendor group, and that ordinary vendor users cannot change the order vendor/group or vendor membership configuration. The ACL verification dialog shows inheritance impact, not successful authorization tests.

Record executed results and evidence on the shared MVP VTB. This file supplies the test reference, not a second live task board.
