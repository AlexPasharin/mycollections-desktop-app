# Deferred constraint trigger on insert, on update and on delete

Unlike triggers on other tables, this one is a constraint trigger declared as "deferrable initially deferred". The check is performed once at the end of the transaction (on commit) against the final state of the table, and not after every statement. This is needed because related releases are synced by deleting all relations of a release and re-inserting them, which passes through intermediate states violating the rule below. Outside of an explicit transaction every statement is a transaction of its own, so the check happens at the end of that statement.

- Values of "child_release_order_number" of all records sharing the same "parent_release_id" are validated using "check_sequential_integers" function (see documentation/database/validation_functions/sequential_integers_validation). If validation fails an exception is thrown and the whole transaction is rolled back \*.
- On update, if value of "parent_release_id" is changed, the check above is done for both the new and the old parent release.
- Because the exception is thrown on commit, nothing done in the transaction is applied - not only the changes to this table.

\* All critical validation errors are collected before throwing an exception. Every error message is pruned of a new line character (it is replaced by a regular space). In the final error message passed with exception all these error messages are concatenated using a new line character as a separator.
