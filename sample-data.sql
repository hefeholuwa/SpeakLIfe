-- Sample Data for SpeakLife Database
-- Run this after creating the schema to populate with sample data

-- Insert sample topics
INSERT INTO topics (title, description, icon, color) VALUES
('Faith', 'Building and strengthening your faith through God''s Word', '🙏', '#3b82f6'),
('Healing', 'Scriptures for physical, emotional, and spiritual healing', '💚', '#10b981'),
('Victory', 'Declarations of victory and overcoming challenges', '🏆', '#f59e0b'),
('Peace', 'Finding peace and rest in God''s presence', '🕊️', '#8b5cf6'),
('Love', 'Understanding and receiving God''s love', '❤️', '#ef4444'),
('Wisdom', 'Seeking and applying God''s wisdom', '🧠', '#06b6d4'),
('Strength', 'Drawing strength from the Lord', '💪', '#84cc16'),
('Protection', 'God''s protection and covering', '🛡️', '#f97316'),
('Purpose', 'Discovering and walking in God''s purpose', '🎯', '#ec4899'),
('Prosperity', 'Biblical principles of prosperity and abundance', '💰', '#22c55e')
ON CONFLICT (title) DO NOTHING;

-- Insert sample verses for Faith topic
INSERT INTO verses (topic_id, reference, scripture_text, confession_text, version) 
SELECT 
    t.id,
    'Hebrews 11:1',
    'Now faith is confidence in what we hope for and assurance about what we do not see.',
    'I have confidence in what I hope for and assurance about what I do not see. My faith is strong and unwavering.',
    'NIV'
FROM topics t WHERE t.title = 'Faith';

INSERT INTO verses (topic_id, reference, scripture_text, confession_text, version) 
SELECT 
    t.id,
    'Mark 11:24',
    'Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours.',
    'I believe that I have received what I ask for in prayer, and it is mine according to God''s will.',
    'NIV'
FROM topics t WHERE t.title = 'Faith';

-- Insert sample verses for Healing topic
INSERT INTO verses (topic_id, reference, scripture_text, confession_text, version) 
SELECT 
    t.id,
    'Isaiah 53:5',
    'But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed.',
    'By His wounds, I am healed. I receive complete healing in my body, mind, and spirit.',
    'NIV'
FROM topics t WHERE t.title = 'Healing';

INSERT INTO verses (topic_id, reference, scripture_text, confession_text, version) 
SELECT 
    t.id,
    'Jeremiah 30:17',
    'But I will restore you to health and heal your wounds, declares the Lord.',
    'The Lord is restoring me to health and healing all my wounds. I am being made whole.',
    'NIV'
FROM topics t WHERE t.title = 'Healing';

-- Insert sample verses for Victory topic
INSERT INTO verses (topic_id, reference, scripture_text, confession_text, version) 
SELECT 
    t.id,
    '1 Corinthians 15:57',
    'But thanks be to God! He gives us the victory through our Lord Jesus Christ.',
    'Thanks be to God! He gives me the victory through Jesus Christ. I am more than a conqueror.',
    'NIV'
FROM topics t WHERE t.title = 'Victory';

INSERT INTO verses (topic_id, reference, scripture_text, confession_text, version) 
SELECT 
    t.id,
    'Romans 8:37',
    'No, in all these things we are more than conquerors through him who loved us.',
    'In all things, I am more than a conqueror through Christ who loves me. Nothing can separate me from His love.',
    'NIV'
FROM topics t WHERE t.title = 'Victory';

-- Insert sample verses for Peace topic
INSERT INTO verses (topic_id, reference, scripture_text, confession_text, version) 
SELECT 
    t.id,
    'Philippians 4:7',
    'And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
    'The peace of God, which transcends all understanding, guards my heart and mind in Christ Jesus.',
    'NIV'
FROM topics t WHERE t.title = 'Peace';

INSERT INTO verses (topic_id, reference, scripture_text, confession_text, version) 
SELECT 
    t.id,
    'John 14:27',
    'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.',
    'I receive the peace that Jesus gives. My heart is not troubled and I am not afraid.',
    'NIV'
FROM topics t WHERE t.title = 'Peace';
