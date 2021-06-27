CREATE TABLE "order" (
	order_number integer,
    shop_mobile_number text,
    bill_date text,
    customer_mobile_number text,
    product_details jsonb[],
    order_summary json,
    PRIMARY KEY(order_number)
);