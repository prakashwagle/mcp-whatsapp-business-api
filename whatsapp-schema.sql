-- WhatsApp Business API - Contact & Message Storage Schema
-- Created for storing contacts and incoming webhook messages

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
-- INDEXES for better performance
-- ============================================================================
-- Contacts table indexes
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON whatsapp_contacts(phone_number);
CREATE INDEX IF NOT EXISTS idx_contacts_reply_count ON whatsapp_contacts(reply_count);
CREATE INDEX IF NOT EXISTS idx_contacts_last_reply ON whatsapp_contacts(last_reply);
CREATE INDEX IF NOT EXISTS idx_contacts_active ON whatsapp_contacts(is_active);

-- Incoming messages table indexes
CREATE INDEX IF NOT EXISTS idx_incoming_from_phone ON incoming_messages(from_phone);
CREATE INDEX IF NOT EXISTS idx_incoming_message_type ON incoming_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_incoming_timestamp ON incoming_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_incoming_status ON incoming_messages(webhook_status);

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

-- Trigger for contacts table
CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON whatsapp_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for incoming messages table
CREATE TRIGGER update_incoming_messages_updated_at 
    BEFORE UPDATE ON incoming_messages
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

-- View: Most active contacts
CREATE OR REPLACE VIEW most_active_contacts AS
SELECT 
    phone_number,
    name,
    reply_count,
    last_reply,
    EXTRACT(DAYS FROM (NOW() - last_reply)) as days_since_last_reply
FROM whatsapp_contacts 
WHERE is_active = true
ORDER BY reply_count DESC, last_reply DESC;

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

-- View: Daily message statistics
CREATE OR REPLACE VIEW daily_message_stats AS
SELECT 
    DATE(timestamp) as message_date,
    COUNT(*) as total_messages,
    COUNT(DISTINCT from_phone) as unique_contacts,
    COUNT(*) FILTER (WHERE message_type = 'text') as text_messages,
    COUNT(*) FILTER (WHERE message_type != 'text') as media_messages
FROM incoming_messages
GROUP BY DATE(timestamp)
ORDER BY message_date DESC;

-- ============================================================================
-- SAMPLE DATA (for testing - uncomment to use)
-- ============================================================================

-- Sample contact
-- INSERT INTO whatsapp_contacts (phone_number, name, reply_count, notes)
-- VALUES ('+1234567890', 'John Doe', 5, 'Interested in our services');

-- Sample incoming message
-- INSERT INTO incoming_messages (
--     message_id, 
--     from_phone, 
--     to_phone_id, 
--     message_type, 
--     message_content, 
--     message_text, 
--     timestamp
-- ) VALUES (
--     'wamid.sample123',
--     '+1234567890',
--     'your_phone_number_id',
--     'text',
--     '{"text": {"body": "Hello!"}}',
--     'Hello!',
--     NOW()
-- );

-- ============================================================================
-- USEFUL QUERIES (examples)
-- ============================================================================

-- Get top 10 most active contacts
-- SELECT * FROM most_active_contacts LIMIT 10;

-- Get all messages from last 24 hours
-- SELECT * FROM recent_messages_with_contacts 
-- WHERE timestamp > NOW() - INTERVAL '24 hours';

-- Get contacts who haven't replied in 7 days
-- SELECT phone_number, name, reply_count, last_reply 
-- FROM whatsapp_contacts 
-- WHERE last_reply < NOW() - INTERVAL '7 days' AND is_active = true;

-- Get message statistics for today
-- SELECT * FROM daily_message_stats WHERE message_date = CURRENT_DATE;