const fastifyPlugin = require("fastify-plugin");

const loginAPI = (fastify, options, next) => {
    fastify.get("/login", (request, reply)=>{
        return reply.view('/public/template/login.pug');
    });

    fastify.post("/login", async (request, reply)=>{
        const shopId = request.body.mobileNumber;
        const shopDetails = await fastify.shopRepository.validate(shopId);
        if(shopDetails){
            reply.setCookie('shopId', shopDetails.mobileNumber, {path: '/'});
            return reply.view('/public/template/home.pug', { data: shopDetails, shopId: shopDetails.mobileNumber });
        } else {
            return reply.view('/public/template/shopDetails.pug', { data: ""});
        }
    });

    next();
};

module.exports=fastifyPlugin(loginAPI);