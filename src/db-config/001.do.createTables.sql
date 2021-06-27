CREATE TABLE shop (
    mobile_number text,
    shop_name text,
    "address" text,
    city text,
    gstin text,
    email text,
    bank_name text,
    acc_no text,
    PRIMARY KEY (mobile_number)
);

CREATE TABLE customer (
	uuid UUID NOT NULL,
    shop_mobile_number text REFERENCES shop(mobile_number),
    mobile_number text,
    customer_name text,
    "address" text,
    city text,
    gstin text,
    email text,
    PRIMARY KEY(uuid)
);

CREATE INDEX cstmr_mobile_idx ON CUSTOMER (mobile_number);
CREATE INDEX cstmr_name_idx ON CUSTOMER (customer_name);
CREATE INDEX cstmr_gstin_idx ON CUSTOMER (gstin);