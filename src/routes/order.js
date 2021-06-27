const fastifyPlugin = require("fastify-plugin");
const SQL = require("@nearform/sql");
var writtenNumber = require('written-number');
writtenNumber.defaults.lang = 'enIndian';

const ordersAPI = (fastify, options, next) => {
    
    fastify.post("/orders", async (request, reply) => {
        try{
            const shopMobileNumber = request.cookies.shopId;
            const gstin = request.body.gstin;
            const poNumber = request.body.poNumber;
            const billDate = request.body.billDate;
            const billType = request.body.billType;
            const productDetails = request.body.productJSON;
            const orderSummary = request.body.orderSummary;
            const billDateFilter = request.body.billDate;
            const order = {
                shopMobileNumber,
                billType,
                poNumber,
                billDate,
                gstin,
                productDetails: JSON.parse(productDetails),
                orderSummary,
                billDateFilter
            };
            const response = await insert(order);
            return reply.view('/public/template/order.pug', {data: {...response}});
        } catch (error){
            console.log(error);
        }
    });

    fastify.get("/orders", async (request, reply) => {
        let order = {};
        if (request.query.orderNumber){
            order = await getByOrderNumber(request.query.orderNumber);
        }
        return reply.view('/public/template/order.pug', {data: { ...order, mode: request.query.mode }});
    });

    fastify.get("/orders/edit", async (request, reply) => {
        return reply.view('/public/template/editOrder.pug', {data: {}});
    });

    fastify.get("/orders/numberchangeForm", async (request, reply) => {
        let oldNumber = await generateOrderNumber();
        return reply.view('/public/template/numberchangeForm.pug', {data: { oldNumber: oldNumber -1, orderChange: false }});
    });

    fastify.post("/orders/orderNumberchange", async (request, reply) => {
        fastify.orderNumber = parseInt(request.body.orderNumber) - 1;
        let order = {};
        const oldNumber = fastify.orderNumber + 1;
        return reply.view('/public/template/order.pug', {data: { ...order, changedOrderNumber: oldNumber }});
    });

    fastify.get("/orders/printForm", async (request, reply) => {
        return reply.view('/public/template/orderPrintForm.pug', {data: {}});
    });

    fastify.get("/orders/reportForm", async (request, reply) => {
        return reply.view('/public/template/reportForm.pug', {data: {}});
    });

    fastify.get("/orders/report", async (request, reply) => {
        const fromDate = request.query.fromDate;
        const toDate = request.query.toDate;
        const gstin = request.query.gstin;
        const billType = request.query.billType;

        

        const sql = SQL`SELECT
                            concat('FY',bill_year,'-',order_number) as order_number,
                            bill_date,
                            gstin,
                            order_summary::json->'totalAfterRoundOff' as Amount,
                            bill_year
                        FROM
                            "order"
                        WHERE `
        if(gstin) sql.append(SQL`gstin = ${gstin} AND `)
        if(billType) sql.append(SQL`bill_type = ${billType} AND `)
        sql.append(SQL` bill_date_filter 
                    BETWEEN ${fromDate} AND ${toDate} 
                    ORDER BY bill_date_filter asc`);
        const response = await fastify.pg.query(sql);
        const shopDetails = await fastify.shopRepository.validate(request.cookies.shopId);
        let sum = 0;
        response.rows.forEach(order=> sum+=parseInt(order.amount))
        const data = {
            order: response.rows,
            shop: shopDetails,
            totalValueInText: writtenNumber(sum),
            totalValue: sum.toFixed(2)
        };
        return reply.view('/public/template/printReport.pug', {data});
    });



    fastify.post("/orders/edit", async (request, reply) => {
        try{
            const shopMobileNumber = request.cookies.shopId;
            const gstin = request.body.gstin;
            const billType = request.body.billType;
            const billDate = request.body.billDate;
            const poNumber = request.body.poNumber;
            const productDetails = request.body.productJSON;
            const orderNumber = request.body.orderNumber;
            const orderSummary = request.body.orderSummary;
            const billDateFilter = request.body.billDate;
            const order = {
                shopMobileNumber,
                billDate,
                billType,
                gstin,
                productDetails: JSON.parse(productDetails),
                orderSummary,
                billDateFilter,
                poNumber
            };
            const response = await update(orderNumber, order);
            return reply.view('/public/template/order.pug', {data: {...response}});
        } catch (error){
            console.log(error);
        }
    });

    const update = async (orderNumber, order) => {
        try {
            const sql = SQL`UPDATE
                            "order" set
                            bill_date = ${order.billDate},
                            bill_type = ${order.billType},
                            gstin = ${order.gstin},
                            po_number = ${order.poNumber},
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
        const customerDetails = await fastify.customerRepository.validate(order.gstin);
        const data = 
            { 
                order, 
                shop: shopDetails, 
                customer: customerDetails, 
                totalValueInText: writtenNumber(order.orderSummary.totalAfterRoundOff)
            };
        if(order) {
            return reply.view('/public/template/orderPrint.pug', { data });                
        } else{
            
        }
    });

    const getByOrderNumber = async (orderNumber) => {
        const sql = SQL`
                    SELECT 
                        order_number,
                        bill_type,
                        shop_mobile_number,
                        bill_date,
                        po_number,
                        gstin,
                        product_details,
                        order_summary,
                        bill_year
                    FROM "order" where order_number = ${orderNumber}`;
        const result = await fastify.pg.query(sql);
        return result.rows[0];
    };

    const generateOrderNumber = async (billYear) => {
        
        if(!billYear){
            date = new Date()
            billYear = date.getFullYear()
            month = date.getMonth()
            year = date.getYear();
            if(month<3){
                billYear = year-1;
            }
        }
        const sql = SQL`SELECT
                            max(order_number) AS "orderNumber"
                        FROM
                            "order" where bill_year= ${billYear}`;
        const response = await fastify.pg.query(sql);
        const orderNumber = response.rowCount > 0 ? (response.rows[0].orderNumber+1) : 1;
        // if(!fastify.hasDecorator("orderNumber")){
        //     fastify.decorate("orderNumber", orderNumber);
        // }
        return orderNumber;
    }

    const insert = async (order) => {
        const orderSummary = order.orderSummary;
        let orderNumber = 0;

        billYear = order.billDateFilter.split("-")[0]
        bill_month = order.billDateFilter.split("-")[1]
        
        if (bill_month < 4) billYear = parseInt(bill_year) - 1;
        order.billYear = billYear

        if(isNaN(fastify.orderNumber)){
            orderNumber = await generateOrderNumber(billYear);
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
                                bill_type,
                                "po_number",
                                gstin,
                                product_details,
                                order_summary,
                                bill_date_filter,
                                bill_year
                            )
                            values 
                            (
                                ${orderNumber},
                                ${order.shopMobileNumber || null},
                                ${order.billDate || null},
                                ${order.billType || null},
                                ${order.poNumber || null},
                                ${order.gstin || null},
                                ${order.productDetails || []},
                                ${orderSummary || {}},
                                ${order.billDateFilter},
                                ${billYear}
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
