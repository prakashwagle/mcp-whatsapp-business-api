-- Database Initialization Script for WhatsApp MCP Server
-- Run this script to set up the complete database schema

-- ============================================================================
-- CREATE DATABASE (run this first if database doesn't exist)
-- ============================================================================
-- CREATE DATABASE whatsapp_mcp;
-- \c whatsapp_mcp;

-- ============================================================================
-- CONTACTS TABLE - Store WhatsApp contacts with interaction tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS whatsapp_contacts (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(50) UNIQUE NOT NULL,          -- Contact's phone number (with country code)
    name VARCHAR(255),                                 -- Contact's name (from WhatsApp profile or manual)
    reply_count INTEGER DEFAULT 0,                     -- Number of times they have replied
    first_contact TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- First time they contacted us
    last_reply TIMESTAMP WITH TIME ZONE DEFAULT NOW(),    -- Last time they sent a message
    is_active BOOLEAN DEFAULT TRUE,                     -- Is this contact still active
    notes TEXT,                                         -- Optional notes about the contact
    frequency_preference VARCHAR(20) DEFAULT 'normal', -- high, normal, low for sending frequency
    tags TEXT[],                                        -- Tags for grouping contacts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INCOMING MESSAGES TABLE - Store all incoming messages from webhooks
-- ============================================================================
CREATE TABLE IF NOT EXISTS incoming_messages (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(255) UNIQUE NOT NULL,           -- WhatsApp message ID (from webhook)
    from_phone VARCHAR(50) NOT NULL,                   -- Sender's phone number
    to_phone_id VARCHAR(50) NOT NULL,                  -- Our WhatsApp phone number ID
    message_type VARCHAR(20) NOT NULL,                 -- text, image, audio, document, video, sticker
    message_content JSONB NOT NULL,                    -- Full message content from webhook
    message_text TEXT,                                 -- Extracted text (if text message)
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,       -- Message timestamp from WhatsApp
    webhook_status VARCHAR(20) DEFAULT 'received',     -- received, processed, failed
    processing_error TEXT,                             -- Error message if processing failed
    raw_webhook_payload JSONB,                         -- Full webhook payload for debugging
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- OUTGOING MESSAGES TABLE - Track messages we send
-- ============================================================================
CREATE TABLE IF NOT EXISTS outgoing_messages (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(255),                           -- WhatsApp message ID (from API response)
    to_phone VARCHAR(50) NOT NULL,                     -- Recipient's phone number
    from_phone_id VARCHAR(50) NOT NULL,                -- Our WhatsApp phone number ID
    message_type VARCHAR(20) NOT NULL,                 -- text, template, image, etc.
    message_content JSONB NOT NULL,                    -- Message content sent
    message_text TEXT,                                 -- Extracted text content
    template_name VARCHAR(255),                        -- Template name if template message
    delivery_status VARCHAR(20) DEFAULT 'sent',        -- sent, delivered, read, failed
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    failed_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CONTACT GROUPS TABLE - Organize contacts into groups
-- ============================================================================
CREATE TABLE IF NOT EXISTS contact_groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CONTACT GROUP MEMBERS - Many-to-many relationship
-- ============================================================================
CREATE TABLE IF NOT EXISTS contact_group_members (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES whatsapp_contacts(id) ON DELETE CASCADE,
    group_id INTEGER REFERENCES contact_groups(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(contact_id, group_id)
);

-- ============================================================================
-- INDEXES for better performance
-- ============================================================================
-- Contacts table indexes
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON whatsapp_contacts(phone_number);
CREATE INDEX IF NOT EXISTS idx_contacts_reply_count ON whatsapp_contacts(reply_count);
CREATE INDEX IF NOT EXISTS idx_contacts_last_reply ON whatsapp_contacts(last_reply);
CREATE INDEX IF NOT EXISTS idx_contacts_active ON whatsapp_contacts(is_active);
CREATE INDEX IF NOT EXISTS idx_contacts_frequency ON whatsapp_contacts(frequency_preference);

-- Incoming messages table indexes
CREATE INDEX IF NOT EXISTS idx_incoming_from_phone ON incoming_messages(from_phone);
CREATE INDEX IF NOT EXISTS idx_incoming_message_type ON incoming_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_incoming_timestamp ON incoming_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_incoming_status ON incoming_messages(webhook_status);

-- Outgoing messages table indexes
CREATE INDEX IF NOT EXISTS idx_outgoing_to_phone ON outgoing_messages(to_phone);
CREATE INDEX IF NOT EXISTS idx_outgoing_template ON outgoing_messages(template_name);
CREATE INDEX IF NOT EXISTS idx_outgoing_status ON outgoing_messages(delivery_status);
CREATE INDEX IF NOT EXISTS idx_outgoing_sent_at ON outgoing_messages(sent_at);

-- ============================================================================
-- TRIGGERS for automatic updates
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON whatsapp_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incoming_messages_updated_at 
    BEFORE UPDATE ON incoming_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outgoing_messages_updated_at 
    BEFORE UPDATE ON outgoing_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update contact reply count and last_reply
CREATE OR REPLACE FUNCTION update_contact_reply_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert contact information when new message arrives
    INSERT INTO whatsapp_contacts (phone_number, reply_count, last_reply)
    VALUES (NEW.from_phone, 1, NEW.timestamp)
    ON CONFLICT (phone_number) 
    DO UPDATE SET 
        reply_count = whatsapp_contacts.reply_count + 1,
        last_reply = NEW.timestamp,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update contact stats when new message arrives
CREATE TRIGGER update_contact_stats_on_message 
    AFTER INSERT ON incoming_messages
    FOR EACH ROW EXECUTE FUNCTION update_contact_reply_stats();

-- ============================================================================
-- USEFUL VIEWS for easy querying
-- ============================================================================

-- View: Most active contacts with group info
CREATE OR REPLACE VIEW contact_summary AS
SELECT 
    c.id,
    c.phone_number,
    c.name,
    c.reply_count,
    c.last_reply,
    c.frequency_preference,
    c.tags,
    EXTRACT(DAYS FROM (NOW() - c.last_reply)) as days_since_last_reply,
    COUNT(cgm.group_id) as group_count,
    ARRAY_AGG(cg.group_name) FILTER (WHERE cg.group_name IS NOT NULL) as groups
FROM whatsapp_contacts c
LEFT JOIN contact_group_members cgm ON c.id = cgm.contact_id
LEFT JOIN contact_groups cg ON cgm.group_id = cg.id AND cg.is_active = true
WHERE c.is_active = true
GROUP BY c.id, c.phone_number, c.name, c.reply_count, c.last_reply, c.frequency_preference, c.tags
ORDER BY c.reply_count DESC, c.last_reply DESC;

-- View: Recent messages with contact info
CREATE OR REPLACE VIEW recent_messages_with_contacts AS
SELECT 
    im.id,
    im.message_id,
    im.from_phone,
    wc.name as contact_name,
    wc.reply_count as contact_reply_count,
    im.message_type,
    im.message_text,
    im.timestamp,
    im.webhook_status
FROM incoming_messages im
LEFT JOIN whatsapp_contacts wc ON im.from_phone = wc.phone_number
ORDER BY im.timestamp DESC;

-- View: Message frequency by contact
CREATE OR REPLACE VIEW contact_message_frequency AS
SELECT 
    c.phone_number,
    c.name,
    c.frequency_preference,
    COUNT(om.id) as messages_sent,
    COUNT(im.id) as messages_received,
    MAX(om.sent_at) as last_message_sent,
    MAX(im.timestamp) as last_message_received
FROM whatsapp_contacts c
LEFT JOIN outgoing_messages om ON c.phone_number = om.to_phone
LEFT JOIN incoming_messages im ON c.phone_number = im.from_phone
GROUP BY c.id, c.phone_number, c.name, c.frequency_preference
ORDER BY messages_sent DESC, messages_received DESC;

-- Print success message
DO $$
BEGIN
    RAISE NOTICE '✅ WhatsApp MCP Database initialized successfully!';
    RAISE NOTICE '📋 Tables created: whatsapp_contacts, incoming_messages, outgoing_messages, contact_groups, contact_group_members';
    RAISE NOTICE '📊 Views created: contact_summary, recent_messages_with_contacts, contact_message_frequency';
    RAISE NOTICE '🔧 Triggers created: Auto-update contact stats and timestamps';
    RAISE NOTICE '📝 Next step: Run sample-data.sql to add test contacts';
END $$;