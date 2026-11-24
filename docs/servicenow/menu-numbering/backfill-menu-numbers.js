// Run once at a time as an administrator in Scripts - Background, scope=CafeNow.
// Install the NEW Global CafeNowMenuNumberGenerator helper first.
// NumberManager stays Global-private; Menu writes stay in their owning CafeNow scope.
// First run DRY_RUN=true; change to false only after reviewing its target/count.
(function () {
    var TABLE = 'x_1234_cafenow_menu'; // Verify the current Menu table technical name.
    var FIELD = 'number'; // User relabeled Number to Item Number; column name stays number.
    var DRY_RUN = true;
    var gr = new GlideRecord(TABLE);
    if (!gr.isValid() || !gr.isValidField(FIELD)) {
        gs.error('CafeNow Menu numbering: verify table ' + TABLE + ' and field ' + FIELD + '.');
        return;
    }
    var configuration = new GlideRecord('sys_number');
    configuration.addQuery('category', TABLE);
    configuration.query();
    if (!configuration.next() || String(configuration.getValue('prefix')) !== 'MENU') {
        gs.error('CafeNow Menu numbering: configure Number Maintenance for this table with prefix MENU.');
        return;
    }
    if (configuration.next()) {
        gs.error('CafeNow Menu numbering: multiple Number Maintenance entries found. Review before backfill.');
        return;
    }
    gr.addNullQuery(FIELD);
    gr.orderBy('sys_created_on');
    gr.orderBy('sys_id');
    gr.query();
    if (DRY_RUN) {
        // No NumberManager call: preview does not consume sequence numbers.
        gs.info('DRY RUN: ' + gr.getRowCount() + ' blank ' + TABLE + '.' + FIELD + ' values would be populated. No records or counters changed.');
        return;
    }
    var numberManager = new global.CafeNowMenuNumberGenerator();
    var updated = 0;
    var skipped = 0;
    var failed = 0;
    while (gr.next()) {
        // Re-read to avoid overwriting a number filled since the initial query.
        var record = new GlideRecord(TABLE);
        if (!record.get(String(gr.getUniqueValue())) || String(record.getValue(FIELD) || '') !== '') {
            skipped++;
            continue;
        }
        var nextNumber = String(numberManager.next() || '');
        if (!/^MENU[0-9]+$/.test(nextNumber) || nextNumber.length > 40) {
            gs.error('CafeNow Menu numbering: unexpected generated format. Stopped; review Number Maintenance.');
            failed++;
            break;
        }
        var collision = new GlideRecord(TABLE);
        collision.addQuery(FIELD, nextNumber);
        collision.query();
        if (collision.next()) {
            gs.error('CafeNow Menu numbering: generated number already exists. Stopped; review the counter without resetting existing numbers.');
            failed++;
            break;
        }
        record.setValue(FIELD, nextNumber);
        if (record.update()) updated++;
        else {
            failed++;
            gs.error('CafeNow Menu numbering: update failed. Stopped; review Business Rules/application access.');
            break;
        }
    }
    gs.info('CafeNow Menu numbering: updated=' + updated + ', skipped=' + skipped + ', failed=' + failed + '. Existing nonblank numbers were preserved.');
})();
