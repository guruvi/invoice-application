const fastify = require("fastify")({ logger: true });
const postgres = require("./src/plugins/postgres");
const path = require("path");
const fastifyPlugin = require("fastify-plugin");
const fastifyAutoload = require("fastify-autoload");
const fastifyCookie = require('fastify-cookie')
const Ajv = require("ajv");

const serveHomePage = (fastify,options,next) => {
  fastify.get("/",(request, reply) => {
    reply.sendFile("/html/login.html");
  });
  next();
};

const ajv = new Ajv({
  removeAdditional: false,
  useDefaults: true,
  coerceTypes: false,
  allErrors: true
});

const homePageFastifyPlugin = fastifyPlugin(serveHomePage);

const start = async () => {
    try {
      fastify.register(postgres);
      fastify.register(require('fastify-static'), {
        root: path.join(__dirname, 'public'),
        prefix: '/',
      });
      fastify.addContentTypeParser("application/x-www-form-urlencoded", function(req, next) {
        let data = "";
        let obj = {};
        req.on("data", chunk => {
          data += chunk;
        });
        req.on("end", () => {
          data = unescape(data);
          data = data.replace(/\+/g," ");
          data.split("&").forEach(params => {
            const [param, value] = params.split("=");
            obj[param] = value;
          });
          next(null, obj);
        });
      });
      fastify.register(fastifyCookie);
      fastify.register(require("point-of-view"), {
        engine: {
          pug: require("pug"),
          options: {baseDir: "/public/template"}
        }
      });
      fastify.setSchemaCompiler(schema => ajv.compile(schema));
      fastify.register(fastifyAutoload, {
        dir: path.join(__dirname, 'src/routes')
      });
      await fastify.listen(3000);
      fastify.log.info(`server listening on ${fastify.server.address().port}`);
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
};
start();
