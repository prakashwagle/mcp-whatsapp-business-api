-- Sample Data for WhatsApp MCP Server
-- This adds test contacts with different frequency preferences for testing

-- ============================================================================
-- CONTACT GROUPS
-- ============================================================================
INSERT INTO contact_groups (group_name, description) VALUES
('customers', 'Active customers who have purchased products'),
('leads', 'Potential customers showing interest'),
('team', 'Internal team members and colleagues'),
('vip', 'High-value customers requiring priority attention'),
('support', 'Customers needing technical support')
ON CONFLICT (group_name) DO NOTHING;

-- ============================================================================
-- TEST CONTACTS WITH DIFFERENT FREQUENCIES
-- ============================================================================

-- High frequency contacts (for frequent communication)
INSERT INTO whatsapp_contacts (phone_number, name, reply_count, frequency_preference, tags, notes) VALUES
('+1234567890', 'John Smith - CEO', 15, 'high', ARRAY['customer', 'vip', 'decision-maker'], 'Key client, prefers quick responses'),
('+1987654321', 'Sarah Johnson - Manager', 12, 'high', ARRAY['lead', 'enterprise'], 'Evaluating our enterprise solution'),
('+447911123456', 'David Wilson - UK', 8, 'high', ARRAY['customer', 'international'], 'UK customer, timezone GMT'),
('+33612345678', 'Marie Dubois - France', 6, 'high', ARRAY['customer', 'international'], 'French customer, speaks English well')
ON CONFLICT (phone_number) DO UPDATE SET
    name = EXCLUDED.name,
    frequency_preference = EXCLUDED.frequency_preference,
    tags = EXCLUDED.tags,
    notes = EXCLUDED.notes;

-- Normal frequency contacts (regular communication)
INSERT INTO whatsapp_contacts (phone_number, name, reply_count, frequency_preference, tags, notes) VALUES
('+1555123456', 'Alex Chen - Developer', 5, 'normal', ARRAY['team', 'technical'], 'Internal team member'),
('+1555987654', 'Lisa Rodriguez - Sales', 7, 'normal', ARRAY['customer', 'recurring'], 'Regular monthly orders'),
('+49151234567', 'Hans Mueller - Germany', 4, 'normal', ARRAY['customer', 'international'], 'German customer, good relationship'),
('+351912345678', 'Carlos Silva - Portugal', 3, 'normal', ARRAY['lead', 'qualified'], 'Interested in Q2 implementation'),
('+61412345678', 'Emma Thompson - Australia', 6, 'normal', ARRAY['customer', 'timezone-apac'], 'Australian customer, APAC timezone'),
('+91-9876543210', 'Raj Patel - India', 9, 'normal', ARRAY['customer', 'support'], 'Needs occasional technical support')
ON CONFLICT (phone_number) DO UPDATE SET
    name = EXCLUDED.name,
    frequency_preference = EXCLUDED.frequency_preference,
    tags = EXCLUDED.tags,
    notes = EXCLUDED.notes;

-- Low frequency contacts (occasional communication)
INSERT INTO whatsapp_contacts (phone_number, name, reply_count, frequency_preference, tags, notes) VALUES
('+1555000111', 'Tom Anderson - Prospect', 2, 'low', ARRAY['lead', 'cold'], 'Initial contact, needs nurturing'),
('+1555000222', 'Jennifer Lee - Consultant', 1, 'low', ARRAY['partner', 'occasional'], 'Occasional collaboration projects'),
('+81-90-1234-5678', 'Yuki Tanaka - Japan', 1, 'low', ARRAY['lead', 'international'], 'Japanese prospect, early stage'),
('+55-11-99999-8888', 'Pedro Santos - Brazil', 2, 'low', ARRAY['lead', 'latam'], 'LATAM region prospect'),
('+7-999-123-4567', 'Anna Volkov - Russia', 1, 'low', ARRAY['lead', 'international'], 'Russian market exploration')
ON CONFLICT (phone_number) DO UPDATE SET
    name = EXCLUDED.name,
    frequency_preference = EXCLUDED.frequency_preference,
    tags = EXCLUDED.tags,
    notes = EXCLUDED.notes;

-- ============================================================================
-- ASSIGN CONTACTS TO GROUPS
-- ============================================================================

-- VIP customers
INSERT INTO contact_group_members (contact_id, group_id)
SELECT c.id, g.id 
FROM whatsapp_contacts c, contact_groups g 
WHERE c.phone_number IN ('+1234567890', '+1987654321') 
AND g.group_name = 'vip'
ON CONFLICT (contact_id, group_id) DO NOTHING;

-- Regular customers
INSERT INTO contact_group_members (contact_id, group_id)
SELECT c.id, g.id 
FROM whatsapp_contacts c, contact_groups g 
WHERE c.phone_number IN ('+447911123456', '+33612345678', '+1555987654', '+49151234567', '+61412345678', '+91-9876543210') 
AND g.group_name = 'customers'
ON CONFLICT (contact_id, group_id) DO NOTHING;

-- Leads
INSERT INTO contact_group_members (contact_id, group_id)
SELECT c.id, g.id 
FROM whatsapp_contacts c, contact_groups g 
WHERE c.phone_number IN ('+1987654321', '+351912345678', '+1555000111', '+81-90-1234-5678', '+55-11-99999-8888', '+7-999-123-4567') 
AND g.group_name = 'leads'
ON CONFLICT (contact_id, group_id) DO NOTHING;

-- Team members
INSERT INTO contact_group_members (contact_id, group_id)
SELECT c.id, g.id 
FROM whatsapp_contacts c, contact_groups g 
WHERE c.phone_number IN ('+1555123456') 
AND g.group_name = 'team'
ON CONFLICT (contact_id, group_id) DO NOTHING;

-- Support contacts
INSERT INTO contact_group_members (contact_id, group_id)
SELECT c.id, g.id 
FROM whatsapp_contacts c, contact_groups g 
WHERE c.phone_number IN ('+91-9876543210') 
AND g.group_name = 'support'
ON CONFLICT (contact_id, group_id) DO NOTHING;

-- ============================================================================
-- SAMPLE INCOMING MESSAGES (to populate message history)
-- ============================================================================
INSERT INTO incoming_messages (
    message_id, from_phone, to_phone_id, message_type, message_content, 
    message_text, timestamp, webhook_status
) VALUES
('wamid.sample001', '+1234567890', 'your_phone_number_id', 'text', 
 '{"text": {"body": "Hi, when can we schedule our next meeting?"}}', 
 'Hi, when can we schedule our next meeting?', 
 NOW() - INTERVAL '2 hours', 'processed'),

('wamid.sample002', '+1987654321', 'your_phone_number_id', 'text', 
 '{"text": {"body": "Thanks for the demo yesterday. Very impressed!"}}', 
 'Thanks for the demo yesterday. Very impressed!', 
 NOW() - INTERVAL '1 day', 'processed'),

('wamid.sample003', '+447911123456', 'your_phone_number_id', 'text', 
 '{"text": {"body": "Order status update needed please"}}', 
 'Order status update needed please', 
 NOW() - INTERVAL '3 hours', 'processed'),

('wamid.sample004', '+91-9876543210', 'your_phone_number_id', 'text', 
 '{"text": {"body": "Having issues with the API integration"}}', 
 'Having issues with the API integration', 
 NOW() - INTERVAL '5 hours', 'processed')
ON CONFLICT (message_id) DO NOTHING;

-- ============================================================================
-- SAMPLE OUTGOING MESSAGES (to show message history)
-- ============================================================================
INSERT INTO outgoing_messages (
    message_id, to_phone, from_phone_id, message_type, message_content, 
    message_text, delivery_status, sent_at, delivered_at
) VALUES
('wamid.out001', '+1234567890', 'your_phone_number_id', 'text', 
 '{"text": {"body": "Hello John! How about tomorrow at 2 PM?"}}', 
 'Hello John! How about tomorrow at 2 PM?', 
 'delivered', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '58 minutes'),

('wamid.out002', '+1987654321', 'your_phone_number_id', 'text', 
 '{"text": {"body": "Great to hear! I will send the proposal today."}}', 
 'Great to hear! I will send the proposal today.', 
 'read', NOW() - INTERVAL '20 hours', NOW() - INTERVAL '19 hours 30 minutes'),

('wamid.out003', '+447911123456', 'your_phone_number_id', 'text', 
 '{"text": {"body": "Your order #12345 is being prepared for shipment."}}', 
 'Your order #12345 is being prepared for shipment.', 
 'delivered', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 45 minutes')
ON CONFLICT (message_id) DO NOTHING;

-- ============================================================================
-- SUMMARY REPORT
-- ============================================================================
DO $$
DECLARE
    contact_count INTEGER;
    group_count INTEGER;
    high_freq_count INTEGER;
    normal_freq_count INTEGER;
    low_freq_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO contact_count FROM whatsapp_contacts;
    SELECT COUNT(*) INTO group_count FROM contact_groups;
    SELECT COUNT(*) INTO high_freq_count FROM whatsapp_contacts WHERE frequency_preference = 'high';
    SELECT COUNT(*) INTO normal_freq_count FROM whatsapp_contacts WHERE frequency_preference = 'normal';
    SELECT COUNT(*) INTO low_freq_count FROM whatsapp_contacts WHERE frequency_preference = 'low';
    
    RAISE NOTICE '✅ Sample data inserted successfully!';
    RAISE NOTICE '📞 Total contacts: %', contact_count;
    RAISE NOTICE '👥 Contact groups: %', group_count;
    RAISE NOTICE '🔥 High frequency contacts: %', high_freq_count;
    RAISE NOTICE '📊 Normal frequency contacts: %', normal_freq_count;
    RAISE NOTICE '📉 Low frequency contacts: %', low_freq_count;
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Ready for testing! Try these commands in Claude:';
    RAISE NOTICE '   "Show me my WhatsApp contacts"';
    RAISE NOTICE '   "Send a message to John Smith"';
    RAISE NOTICE '   "Show me high frequency contacts"';
    RAISE NOTICE '   "Browse postgres://tables/whatsapp_contacts/data"';
END $$;