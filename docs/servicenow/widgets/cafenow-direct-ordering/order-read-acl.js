// Advanced READ ACL script for CafeNow Order; review/replace existing broad allow rules.
// Roles on that ACL can include employee/vendor roles; this script adds record isolation.
answer = new CafeNowDirectOrdering().canReadOrder(current);
