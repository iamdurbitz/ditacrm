-- DitaCRM database schema
-- WARNING: This script deletes existing data in the tables it recreates.
-- Intended for local development and testing only.

BEGIN;

-- =============================================
-- DROP EXISTING TABLES
-- =============================================

DROP TABLE IF EXISTS customer_custom_field_values CASCADE;
DROP TABLE IF EXISTS customer_table_preferences CASCADE;
DROP TABLE IF EXISTS custom_fields CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;

-- =============================================
-- BUSINESSES
-- Each business represents a separate tenant.
-- =============================================

CREATE TABLE businesses (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- USERS
-- Each user belongs to one business.
-- =============================================

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    business_id BIGINT NOT NULL
        REFERENCES businesses(id) ON DELETE CASCADE,

    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE'
        CHECK (role IN ('OWNER', 'EMPLOYEE')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_business_id
    ON users(business_id);

-- =============================================
-- CUSTOMERS
-- Every customer belongs to one business.
-- =============================================

CREATE TABLE customers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    business_id BIGINT NOT NULL
        REFERENCES businesses(id) ON DELETE CASCADE,

    name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30),
    company VARCHAR(150),
    address TEXT,
    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Required for composite foreign keys.
    CONSTRAINT uq_customers_business_id_id
        UNIQUE (business_id, id)
);

CREATE INDEX idx_customers_business_id
    ON customers(business_id);

CREATE INDEX idx_customers_business_name
    ON customers(business_id, name);

-- =============================================
-- CUSTOM FIELDS
-- Each business can define its own custom columns.
-- A field is created once and shared by all customers
-- belonging to that business.
-- =============================================

CREATE TABLE custom_fields (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    business_id BIGINT NOT NULL
        REFERENCES businesses(id) ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,

    field_type VARCHAR(20) NOT NULL
        CHECK (
            field_type IN (
                'text',
                'number',
                'date',
                'boolean'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate column names within one business.
    CONSTRAINT uq_custom_fields_business_name
        UNIQUE (business_id, name),

    -- Required for composite foreign keys.
    CONSTRAINT uq_custom_fields_business_id_id
        UNIQUE (business_id, id)
);

CREATE INDEX idx_custom_fields_business_id
    ON custom_fields(business_id);

-- =============================================
-- CUSTOMER CUSTOM FIELD VALUES
-- Stores the value of a custom field for a customer.
-- The same custom field can be used by every customer
-- belonging to the same business.
-- =============================================

CREATE TABLE customer_custom_field_values (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    business_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    custom_field_id BIGINT NOT NULL,

    value TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure the customer belongs to this business.
    CONSTRAINT fk_custom_values_customer
        FOREIGN KEY (business_id, customer_id)
        REFERENCES customers(business_id, id)
        ON DELETE CASCADE,

    -- Ensure the custom field belongs to this business.
    CONSTRAINT fk_custom_values_field
        FOREIGN KEY (business_id, custom_field_id)
        REFERENCES custom_fields(business_id, id)
        ON DELETE CASCADE,

    -- One value per customer for each custom field.
    CONSTRAINT uq_customer_custom_field
        UNIQUE (customer_id, custom_field_id)
);

CREATE INDEX idx_custom_values_business_customer
    ON customer_custom_field_values(business_id, customer_id);

-- =============================================
-- CUSTOMER TABLE PREFERENCES
-- Stores column visibility and ordering per business.
-- =============================================

CREATE TABLE customer_table_preferences (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    business_id BIGINT NOT NULL
        REFERENCES businesses(id) ON DELETE CASCADE,

    column_key VARCHAR(100) NOT NULL,

    is_visible BOOLEAN NOT NULL DEFAULT TRUE,

    position INTEGER NOT NULL DEFAULT 0
        CHECK (position >= 0),

    CONSTRAINT uq_customer_table_preference
        UNIQUE (business_id, column_key)
);

CREATE INDEX idx_customer_table_preferences_business
    ON customer_table_preferences(business_id);

COMMIT;