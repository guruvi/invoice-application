const fp = require("fastify-plugin");
const envSchema = require("env-schema");
const fastifyPostgres = require("fastify-postgres");
const pg = require("pg");
const pgCamelCase = require("pg-camelcase");
pgCamelCase.inject(pg);

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

module.exports = fp(async (fastify, options) => {
    const config = envSchema({
      schema: schema,
      data: options,
      dotenv: true
    });
    const {
      DB_HOST,
      DB_PORT,
      DB_NAME,
      DB_USER,
      DB_PASSWORD,
      DB_MAX_CONNECTION,
      DB_CONNECTION_TIMEOUT,
      DB_STATEMENT_TIMEOUT
    } = config;
  
    fastify.register(fastifyPostgres, {
      host: DB_HOST,
      port: DB_PORT,
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
      pg: pg,
      max: DB_MAX_CONNECTION,
      connectionTimeoutMillis: Math.trunc(DB_CONNECTION_TIMEOUT),
      statementTimeout: Math.trunc(DB_STATEMENT_TIMEOUT)
    });
  });