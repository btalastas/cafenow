// Advanced READ ACL script for Order Line. Replace its admin-only read ACL for portal reads.
// Keep create/write/delete administrative/service-controlled.
answer = new CafeNowDirectOrdering().canReadLine(current);
