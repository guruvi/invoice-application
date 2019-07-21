const fastifyPlugin = require("fastify-plugin");
const sql = require("@nearform/sql");
const uuidv5 = require("uuid/v5");

const customerAPI = (fastify, options, next) => {

    fastify.post("/customers", async (request, reply)=>{
        const customerName = request.body.customerName || null;
        const mobileNumber = request.body.mobileNumber;
        const shopMobileNumber = request.cookies.shopId;
        const address = request.body.address || null;
        const city = request.body.city || null;
        const gstin = request.body.gstin || null;
        const email = request.body.email || null;
        const uuid = uuidv5(`${mobileNumber}-${shopMobileNumber}`, uuidv5.URL);

        const query = sql`INSERT INTO customer 
            (
                uuid,
                customer_name,
                mobile_number,
                shop_mobile_number,
                address,
                city,
                gstin,
                email
            )
            values 
            (
                ${uuid},
                ${customerName},
                ${mobileNumber},
                ${shopMobileNumber},
                ${address},
                ${city},
                ${gstin},
                ${email}
            ) 
            ON CONFLICT (uuid) DO UPDATE SET
                customer_name = ${customerName},
                mobile_number = ${mobileNumber},
                shop_mobile_number = ${shopMobileNumber},
                address = ${address},
                city = ${city},
                gstin = ${gstin},
                email = ${email}`;

        const result = await fastify.pg.query(query);
        reply.view('/public/template/home.pug', { data: ""});        
    });

    fastify.get("/customers", async (request, reply)=>{
        const shopId = request.cookies.shopId;
        const data = {  shopId };
        reply.view('/public/template/customerDetails.pug', { data: {shopId} } );        
    });

    const validate = async (shopId) => {
        try{
            const query = sql`SELECT 
                shop_mobile_number,
                mobile_number,
                customer_name,
                address,
                city,
                gstin,
                email
            FROM customer WHERE mobile_number = ${shopId}`;
            const result = await fastify.pg.query(query);
            return result.rowCount > 0 ? result.rows[0] : false;
        } catch(err) {
            fastify.log.error(err);
        }
    };
    fastify.decorate("customerRepository", { validate });
    next();
};

module.exports = fastifyPlugin(customerAPI);