# Additional properties that are not reflected in prisma schema (because it cannot express it)

- There is a check constraint requiring "amount" to be greater than zero. Zero and negative values are rejected.
