Flash Sale API

## Description

A rest api to process flash sale orders of the client application.

## Project setup

```bash
$ npm install
```

## Setup Environment variable

1. Create new .env file
2. Copy the values from env.example
3. Change the nessesary value based on your local setup

## Migration

1. Run Table migration before running the app locally.

```bash
$ npx typeorm-ts-node-commonjs migration:run -d ormconfig.ts
```

2. Run the seeder. This will create new product and flash sale data in your database table.

```bash
$ npm run initialize-data
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test:unit

# e2e tests
$ npm run test:e2e

# run stress test
# stress test needs to your actual database data.
$ npm run test:stress
```

## Other available commands

### Create migration file

```bash
$  npx typeorm migration:create migrations/create-products-table
```

### Rollback migration

```bash
$ npx typeorm-ts-node-commonjs migration:revert -d ormconfig.ts
```
