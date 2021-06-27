const fastify = require('fastify')({
    logger: true
  })
  const fpg = require('fastify-postgres')
  const path = require("path");
  const postgres = require("./src/plugins/postgres");
  const fastifyAutoload = require("fastify-autoload");
  const fastifyCookie = require('fastify-cookie')
  const fs = require('fs')

  const start = async () => {
      try {
        fastify.register(postgres)
        fastify.register(require('fastify-static'), {
            root: path.join(__dirname, 'public'),
            prefix: '/',
        });
        fastify.register(require('fastify-formbody'));
        fastify.register(fastifyCookie);
        fastify.register(require("point-of-view"), {
            engine: {
              pug: require("pug"),
              options: {baseDir: "/public/template"}
            }
          });
      
      fastify.register(fastifyAutoload, {
        dir: path.join(__dirname, 'src/routes')
      });
      await fastify.listen(80, "0.0.0.0");
      fastify.log.info(`server listening on ${fastify.server.address().port}`);
    } catch (err) {
        console.log(err)
      fastify.log.error(err);
      process.exit(1);
    }
};
start();