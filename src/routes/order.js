const fastifyPlugin = require("fastify-plugin");
const SQL = require("@nearform/sql");
var writtenNumber = require('written-number');
writtenNumber.defaults.lang = 'enIndian';

const ordersAPI = (fastify, options, next) => {
    
    fastify.post("/orders", async (request, reply) => {
        try{
            const shopMobileNumber = request.cookies.shopId;
            const customerMobileNumber = request.body.customerMobileNumber;
            const billDate = request.body.billDate;
            const productDetails = request.body.productJSON;
            const orderSummary = request.body.orderSummary;
            const order = {
                shopMobileNumber,
                billDate,
                customerMobileNumber,
                productDetails: JSON.parse(productDetails),
                orderSummary
            };
            const response = await insert(order);
            reply.view('/public/template/order.pug', {data: {...response}});
        } catch (error){
            console.log(error);
        }
    });

    fastify.get("/orders", async (request, reply) => {
        let order = {};
        if (request.query.orderNumber){
            order = await getByOrderNumber(request.query.orderNumber);
        }
        reply.view('/public/template/order.pug', {data: { ...order}});        
    });

    fastify.get("/orders/print", async(request, reply)=> {
        const orderNumber = request.query.orderNumber;
        order = await getByOrderNumber(orderNumber);
        const shopDetails = await fastify.shopRepository.validate(order.shopMobileNumber);
        const customerDetails = await fastify.customerRepository.validate(order.customerMobileNumber);
        const data = 
            { 
                order, 
                shop: shopDetails, 
                customer: customerDetails, 
                totalValueInText: writtenNumber(order.orderSummary.totalAfterRoundOff)
            };
        if(order) {
            reply.view('/public/template/orderPrint.pug', { data });                
        } else{
            
        }
    });

    const getByOrderNumber = async (orderNumber) => {
        const sql = SQL`
                    SELECT 
                        order_number,
                        shop_mobile_number,
                        bill_date,
                        customer_mobile_number,
                        product_details,
                        order_summary
                    FROM "order" where order_number = ${orderNumber}`;
        const result = await fastify.pg.query(sql);
        return result.rows[0];
    };

    const update = async (orderNumber) => {
        const sql = SQL`UPDATE order set 
            shop_mobile_number = ${order.shopMobileNumber}, 
            bill_date = ${order.billDate}, 
            customer_mobile_number = ${order.customerMobileNumber}, 
            product_details = ${order.productDetails}, 
            sgst = ${order.sgst}, 
            cgst = ${order.cgst}, 
            gst_percent  = ${order.gstPercent}, 
            total_before_gst = ${order.totalBeforeGst}, 
            total = ${order.total}
            where order_number = ${orderNumber}`;
    };

    const insert = async (order) => {
        const orderSummary = order.orderSummary;

        try{
            const sql = SQL`INSERT INTO "order" 
                            (
                                shop_mobile_number,
                                bill_date,
                                customer_mobile_number,
                                product_details,
                                order_summary
                            )
                            values 
                            (
                                ${order.shopMobileNumber || null},
                                ${order.billDate || null},
                                ${order.customerMobileNumber || null},
                                ${order.productDetails || []},
                                ${orderSummary || {}}
                            )
                            RETURNING *`;
            const orders = await fastify.pg.query(sql);
            orders.rowCount > 0 ? orders.rows[0] : null;
            return orders.rows[0];
        }catch(error){
            fastify.log.error(error);
        }
    };

    next();
};

module.exports = fastifyPlugin(ordersAPI);