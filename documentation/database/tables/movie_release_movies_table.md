# Trigger on insert and on update

- Value of release's "release_date", if given, can not indicate time before movie's "original_release_date" (checked only if both are given). If this is violated an exception is thrown and the whole operation is rolled back \*.
- If movie's "part_of_queen_collection" is true, value of release's "part_of_queen_collection" must also be true, otherwise an exception is thrown and the whole operation is rolled back \*.

\* All critical validation errors are collected before throwing an exception. Every error message is pruned of a new line character (it is replaced by a regular space). In the final error message passed with exception all these error messages are concatenated using a new line character as a separator.
