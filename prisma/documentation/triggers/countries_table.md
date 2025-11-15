# Fields additional properties that are not reflected in prisma schema (because it cannot express it)

- Fields "code_name" and "name" are of custom type "non_empty_text", meaning that their values are not allowed to be empty strings after trimming

# Trigger on create and on update

- Triggers only on changes on fields "name", "name_for_sorting" and "other_names"
- It is not allowed to update value of "code_name" once record is created - if happens exception is thrown and operation is rolled back
- Value of "code_name" is trimmed (with notification about it in case this changes value). After trimming "code_name" must match regex ^[A-Z]+ - if does not, exception is thrown and operation is rolled back
- Value of "name" is trimmed (with notification about it in case this changes value)
