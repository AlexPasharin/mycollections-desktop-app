# Fields' additional properties that are not reflected in prisma schema (because it cannot express it)

- Field "short_name" is of custom type "non_empty_text", meaning that it's values are not allowed to be empty strings after trimming
- Field "description" is of custom type "non_empty_text", meaning that it's values are not allowed to be empty strings after trimming

# Trigger on insert and on update

- It is not allowed to update value of "short_name" once record is created - if happens exception is thrown and operation is rolled back
- Value of "short_name" is trimmed (with notification about it in case this changes value)
- Value of "description" is trimmed (with notification about it in case this changes value)
