# Trigger on insert and on update

- It is not allowed to change values of "artist_id" or "entry id" once record is created - if happens exception is thrown and operation is rolled back \*
- If for corresponding artist value of "part_of_queen_family" is true, but for corresponding entry value of "part_of_queen_collection" is false an exception is thrown and the whole operation is rolled back \*
- If "entry_artist_name_id" is not null, but references an entry in "alternative_artist_names" table which corresponds to a different artist, an exception is thrown and the whole operation is rolled back \*

\* All critical validation errors are collected before throwing an exception. Every error message is pruned of a new line character (it is replaced by a regular space). In the final error message passed with exception all these error messages are concatenated using a new line character as a separator.
