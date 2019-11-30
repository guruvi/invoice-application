const fastifyPlugin = require("fastify-plugin");
const sql = require("@nearform/sql")

const shopAPI = (fastify, options, next) => {

    fastify.get("/shop", async(request, reply)=>{
        const shopDetails = await validate(request.cookies.shopId);
        return reply.view('/public/template/shopDetails.pug', { data: shopDetails});
    });

    fastify.post("/shop", async (request, reply)=>{
        const mobileNumber = request.body.mobileNumber || null;
        const shopName = request.body.shopName || null;
        const address = request.body.address || null;
        const city = request.body.city || null;
        const gstin = request.body.gstin || null;
        const bankName = request.body.bankName || null;
        const accNo = request.body.accNo || null;
        const email = request.body.email || null;

        const query = sql`INSERT INTO shop 
            (
                mobile_number,
                shop_name,
                address,
                city,
                gstin,
                email,
                bank_name,
                acc_no
            )
            values 
            (
                ${mobileNumber},
                ${shopName},
                ${address},
                ${city},
                ${gstin},
                ${email},
                ${bankName},
                ${accNo}
            ) ON CONFLICT (mobile_number) DO UPDATE SET
                mobile_number = ${mobileNumber},
                shop_name = ${shopName},
                address = ${address},
                city = ${city},
                gstin = ${gstin},
                email = ${email},
                bank_name = ${bankName},
                acc_no = ${accNo}`;

        const result = await fastify.pg.query(query);
        reply.setCookie('shopId', mobileNumber, {path: '/'});
        return reply.view('/public/template/home.pug', { data: ""});
    });

    const validate = async (shopId) => {
        try{
            const query = sql`SELECT 
                mobile_number,
                shop_name,
                address,
                city,
                gstin,
                email,
                bank_name,
                acc_no
            FROM shop WHERE mobile_number = ${shopId}`;
            const result = await fastify.pg.query(query);
            return result.rowCount > 0 ? result.rows[0] : false;
        }catch(err){
            fastify.log.error(err);
        }
    };
    next();
    fastify.decorate("shopRepository", {
        validate    
    });
};

module.exports = fastifyPlugin(shopAPI);