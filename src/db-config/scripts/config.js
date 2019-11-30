const Postgrator = require("postgrator");
const envSchema = require("env-schema");

const schema = {
    type: "object",
    required: [
      "DB_HOST",
      "DB_PORT",
      "DB_NAME",
      "DB_USER",
      "DB_PASSWORD",
      "DB_MAX_CONNECTION",
      "DB_CONNECTION_TIMEOUT",
      "DB_STATEMENT_TIMEOUT"
    ],
    properties: {
      DB_HOST: {
        type: "string"
      },
      DB_PORT: {
        type: "string"
      },
      DB_NAME: {
        type: "string"
      },
      DB_USER: {
        type: "string"
      },
      DB_PASSWORD: {
        type: "string"
      },
      DB_MAX_CONNECTION: {
        type: "number"
      },
      DB_CONNECTION_TIMEOUT: {
        type: "string",
        default: "10000"
      },
      DB_STATEMENT_TIMEOUT: {
        type: "string",
        default: "10000"
      }
    }
};

const config = envSchema({
    schema: schema,
    dotenv: true
  });
 
const postgrator = new Postgrator({
  migrationDirectory: __dirname + "/../migrations",
  driver: "pg",
  host: config.DB_HOST,
  port: config.DB_PORT,
  database: config.DB_NAME,
  username: config.DB_USER,
  password: config.DB_PASSWORD,
  schemaTable: "schemaversion"
});

postgrator.on('migration-started', () => console.log("migration started", config));
postgrator.on('migration-finished', () => console.log("migration finished"));

postgrator
  .migrate()
  .then(appliedMigrations => console.log(appliedMigrations))
  .catch(error => { console.log(config); console.log(error); });


