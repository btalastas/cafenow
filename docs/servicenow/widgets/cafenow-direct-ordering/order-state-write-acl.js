// Replace the exported state write ACL's vendo0 relationship with authoritative vendor.
// Keep vendor Admin/Staff role requirements. This is record authorization only;
// independently validate allowed transitions, actor and cancellation policy server-side.
answer = new CafeNowDirectOrdering().canManageVendorOrder(current);
