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
            const billDateFilter = request.body.billDate;
            const order = {
                shopMobileNumber,
                billDate,
                customerMobileNumber,
                productDetails: JSON.parse(productDetails),
                orderSummary,
                billDateFilter
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
        console.log(order);
        reply.view('/public/template/order.pug', {data: { ...order, mode: request.query.mode }});
    });

    fastify.get("/orders/edit", async (request, reply) => {
        reply.view('/public/template/editOrder.pug', {data: {}});
    });

    fastify.get("/orders/printForm", async (request, reply) => {
        reply.view('/public/template/orderPrintForm.pug', {data: {}});
    });

    fastify.get("/orders/reportForm", async (request, reply) => {
        reply.view('/public/template/reportForm.pug', {data: {}});
    });

    fastify.get("/orders/report", async (request, reply) => {
        const fromDate = request.query.fromDate;
        const toDate = request.query.toDate;

        const sql = SQL`SELECT
                            order_number,
                            bill_date,
                            order_summary::json->'totalGST',
                            order_summary
                        FROM
                            "order"
                        WHERE
                            bill_date_filter
                        BETWEEN ${fromDate} AND ${toDate}`;
        const response = await fastify.pg.query(sql);
        console.log(response.rows);
    });



    fastify.post("/orders/edit", async (request, reply) => {
        try{
            const shopMobileNumber = request.cookies.shopId;
            const customerMobileNumber = request.body.customerMobileNumber;
            const billDate = request.body.billDate;
            const productDetails = request.body.productJSON;
            const orderNumber = request.body.orderNumber;
            const orderSummary = request.body.orderSummary;
            const billDateFilter = request.body.billDate;
            const order = {
                shopMobileNumber,
                billDate,
                customerMobileNumber,
                productDetails: JSON.parse(productDetails),
                orderSummary,
                billDateFilter
            };
            const response = await update(orderNumber, order);
            reply.view('/public/template/order.pug', {data: {...response}});
        } catch (error){
            console.log(error);
        }
    });

    const update = async (orderNumber, order) => {
        try {
            const sql = SQL`UPDATE
                            "order" set
                            bill_date = ${order.billDate},
                            customer_mobile_number = ${order.customerMobileNumber},
                            product_details = ${order.productDetails},
                            order_summary = ${order.orderSummary},
                            bill_date_filter = ${order.billDateFilter}
                            where order_number = ${orderNumber}
                            RETURNING *`;
            const response = await fastify.pg.query(sql);
            response.rowCount > 0 ? response.rows[0] : null;
            return response.rows[0];
        } catch (err) {
            console.log(err);
        }
    };

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

    const generateOrderNumber = async () => {
        const sql = SQL`SELECT
                            max(order_number) AS "orderNumber"
                        FROM
                            "order"`;
        const response = await fastify.pg.query(sql);
        const orderNumber = response.rowCount > 0 ? (response.rows[0].orderNumber+1) : 1;
        if(!fastify.hasDecorator("orderNumber")){
            fastify.decorate("orderNumber", orderNumber);
        }
        return orderNumber;
    }

    const insert = async (order) => {
        const orderSummary = order.orderSummary;
        let orderNumber = 0;
        if(isNaN(fastify.orderNumber)){
            orderNumber = await generateOrderNumber();
        } else {
            orderNumber = ++fastify.orderNumber;
            fastify.orderNumber = orderNumber;
        }
        try{
            const sql = SQL`INSERT INTO "order" 
                            (
                                order_number,
                                shop_mobile_number,
                                bill_date,
                                customer_mobile_number,
                                product_details,
                                order_summary,
                                bill_date_filter
                            )
                            values 
                            (
                                ${orderNumber},
                                ${order.shopMobileNumber || null},
                                ${order.billDate || null},
                                ${order.customerMobileNumber || null},
                                ${order.productDetails || []},
                                ${orderSummary || {}},
                                ${order.billDateFilter}
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