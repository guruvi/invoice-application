SET TIME ZONE 'Asia/Kolkata';
ALTER TABLE "order" ADD COLUMN bill_year text default extract(year from current_timestamp);
ALTER TABLE "ORDER" ADD COLUMN created_at timestamp default current_timestamp
ALTER TABLE "order" DROP CONSTRAINT order_pkey; 