-- WhatsApp Business API Database Schema
-- This is an OPTIONAL schema for storing WhatsApp data
-- The MCP server works with ANY PostgreSQL database structure

-- ============================================================================
-- MESSAGES TABLE - Store sent/received WhatsApp messages
-- ============================================================================
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(255) UNIQUE NOT NULL,           -- WhatsApp message ID
    phone_number_id VARCHAR(50) NOT NULL,              -- Phone number that sent/received
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    from_number VARCHAR(50) NOT NULL,                  -- Sender phone number
    to_number VARCHAR(50) NOT NULL,                    -- Recipient phone number
    message_type VARCHAR(20) NOT NULL,                 -- text, image, audio, document, etc.
    content JSONB NOT NULL,                            -- Message content (text, media info, etc.)
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,       -- Message timestamp
    status VARCHAR(20) DEFAULT 'sent',                 -- sent, delivered, read, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CONTACTS TABLE - Store WhatsApp contact information
-- ============================================================================
CREATE TABLE IF NOT EXISTS whatsapp_contacts (
    id SERIAL PRIMARY KEY,
    wa_id VARCHAR(50) UNIQUE NOT NULL,                 -- WhatsApp ID (phone number)
    phone_number_id VARCHAR(50) NOT NULL,              -- Associated phone number ID
    name VARCHAR(255),                                 -- Contact name
    profile_picture_url TEXT,                          -- Profile picture URL
    is_business BOOLEAN DEFAULT FALSE,                 -- Is this a business contact
    metadata JSONB,                                    -- Additional contact info
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MESSAGE TEMPLATES - Store WhatsApp Business message templates
-- ============================================================================
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id SERIAL PRIMARY KEY,
    template_id VARCHAR(100) UNIQUE NOT NULL,          -- WhatsApp template ID
    name VARCHAR(255) NOT NULL,                        -- Template name
    language VARCHAR(10) NOT NULL,                     -- Language code (en_US, etc.)
    category VARCHAR(50) NOT NULL,                     -- UTILITY, MARKETING, etc.
    status VARCHAR(20) NOT NULL,                       -- APPROVED, PENDING, REJECTED
    components JSONB NOT NULL,                         -- Template components (header, body, footer, buttons)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- WEBHOOK EVENTS - Log all webhook events for debugging
-- ============================================================================
CREATE TABLE IF NOT EXISTS webhook_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,                   -- message, status, etc.
    webhook_payload JSONB NOT NULL,                    -- Full webhook payload
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_status VARCHAR(20) DEFAULT 'success',   -- success, failed, skipped
    error_message TEXT,                                -- Error if processing failed
    phone_number_id VARCHAR(50),                       -- Extracted phone number ID
    message_id VARCHAR(255)                            -- Extracted message ID if applicable
);

-- ============================================================================
-- RATE LIMIT TRACKING - Monitor API usage (optional, as we use Bottleneck)
-- ============================================================================
CREATE TABLE IF NOT EXISTS rate_limit_logs (
    id SERIAL PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,                    -- API endpoint called
    phone_number_id VARCHAR(50),                       -- Phone number ID if applicable
    request_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_time_ms INTEGER,                          -- Response time in milliseconds
    status_code INTEGER,                               -- HTTP status code
    rate_limited BOOLEAN DEFAULT FALSE,                -- Was this request rate limited
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for better performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_messages_phone_number_id ON whatsapp_messages(phone_number_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON whatsapp_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_direction ON whatsapp_messages(direction);
CREATE INDEX IF NOT EXISTS idx_messages_status ON whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_contacts_wa_id ON whatsapp_contacts(wa_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone_number_id ON whatsapp_contacts(phone_number_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_timestamp ON webhook_events(processed_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_endpoint ON rate_limit_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_timestamp ON rate_limit_logs(request_timestamp);

-- ============================================================================
-- TRIGGERS for updated_at timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_whatsapp_messages_updated_at BEFORE UPDATE ON whatsapp_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_contacts_updated_at BEFORE UPDATE ON whatsapp_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_templates_updated_at BEFORE UPDATE ON whatsapp_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================
-- INSERT INTO whatsapp_messages (message_id, phone_number_id, direction, from_number, to_number, message_type, content, timestamp)
-- VALUES ('wamid.test123', '1234567890', 'outbound', '1234567890', '0987654321', 'text', '{"body": "Hello from MCP!"}', NOW());

-- INSERT INTO whatsapp_contacts (wa_id, phone_number_id, name, is_business)
-- VALUES ('0987654321', '1234567890', 'Test Contact', false);