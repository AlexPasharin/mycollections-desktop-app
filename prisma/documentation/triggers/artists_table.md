# Fields additional properties that are not reflected in prisma schema (because it cannot express it)

- Fields "name" and "name_for_sorting" are of custom type "non_empty_text", meaning that their values are not allowed to be empty strings after trimming
- Field "other_names" is optional (this is prisma bug, it always treats fields of array type as mandatory in schema but in fact generates them as optional in database)
- Field "other_names" is of custom type "non_empty_text_array", meaning that it's value cannot be an empty array and also each value in it must be a non-empty string after trimming

# Trigger on create and on update

- Triggers only on changes on fields "name", "name_for_sorting" and "other_names"
- Value of "name" is trimmed (with notification about it in case this changes value)
- Value of "name_for_sorting" is trimmed (with notification about it in case this changes value)
- None of "other_names" values can be same as "name" (both considered trimmed) - if happens exception is thrown and operation is rolled back
- Duplicate values are removed from "other_names" (with notification about it). Note that values are considered the same if they are same after trimming
- Remaining values in "other_names" arrays are trimmed (with notification about every value in case trimming changes it)
