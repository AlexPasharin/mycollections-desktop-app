Created with `yarn create electron-app mycollections-desktop-app --template=webpack-typescript`, so meant to be used with `yarn`.

To delete `.webpack` and `out` folders, run `yarn clean`.

# DB

Useful commands:
`yarn prisma generate` - Generate types and prisma client to reflect current state of `prisma/schema.prisma`

`yarn prisma migrate dev` - run migrations
