-- Populate topics table with the default topics from TopicLibrary
-- This will add the topics that are currently displayed as fallback

INSERT INTO topics (title, description, icon, color, usage_count, popularity_score, ai_generated) VALUES
('Faith', 'Believe and receive', '✨', '#f59e0b', 0, 0.0, false),
('Peace', 'God''s protection', '🛡️', '#3b82f6', 0, 0.0, false),
('Love', 'Unconditional love', '❤️', '#ef4444', 0, 0.0, false),
('Wisdom', 'Divine understanding', '💡', '#f59e0b', 0, 0.0, false),
('Prosperity', 'Abundant blessings', '💰', '#10b981', 0, 0.0, false),
('Relationships', 'Godly connections', '👥', '#8b5cf6', 0, 0.0, false)
ON CONFLICT (title) DO NOTHING;

-- Add some sample verses for each topic
INSERT INTO topic_verses (topic_id, verse_text, reference, book, chapter, verse, translation, is_featured) 
SELECT 
  t.id,
  'Now faith is confidence in what we hope for and assurance about what we do not see.',
  'Hebrews 11:1',
  'Hebrews',
  11,
  1,
  'NIV',
  true
FROM topics t WHERE t.title = 'Faith';

INSERT INTO topic_verses (topic_id, verse_text, reference, book, chapter, verse, translation, is_featured) 
SELECT 
  t.id,
  'And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
  'Philippians 4:7',
  'Philippians',
  4,
  7,
  'NIV',
  true
FROM topics t WHERE t.title = 'Peace';

INSERT INTO topic_verses (topic_id, verse_text, reference, book, chapter, verse, translation, is_featured) 
SELECT 
  t.id,
  'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
  'John 3:16',
  'John',
  3,
  16,
  'NIV',
  true
FROM topics t WHERE t.title = 'Love';

INSERT INTO topic_verses (topic_id, verse_text, reference, book, chapter, verse, translation, is_featured) 
SELECT 
  t.id,
  'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.',
  'James 1:5',
  'James',
  1,
  5,
  'NIV',
  true
FROM topics t WHERE t.title = 'Wisdom';

INSERT INTO topic_verses (topic_id, verse_text, reference, book, chapter, verse, translation, is_featured) 
SELECT 
  t.id,
  'The Lord will open the heavens, the storehouse of his bounty, to send rain on your land in season and to bless all the work of your hands.',
  'Deuteronomy 28:12',
  'Deuteronomy',
  28,
  12,
  'NIV',
  true
FROM topics t WHERE t.title = 'Prosperity';

INSERT INTO topic_verses (topic_id, verse_text, reference, book, chapter, verse, translation, is_featured) 
SELECT 
  t.id,
  'Two are better than one, because they have a good return for their labor: If either of them falls down, one can help the other up.',
  'Ecclesiastes 4:9-10',
  'Ecclesiastes',
  4,
  9,
  'NIV',
  true
FROM topics t WHERE t.title = 'Relationships';

-- Add some sample confessions for each topic
INSERT INTO topic_confessions (topic_id, confession_text, title, is_featured) 
SELECT 
  t.id,
  'I confess that I walk by faith and not by sight. I believe in God''s promises and trust in His perfect plan for my life.',
  'Confession of Faith',
  true
FROM topics t WHERE t.title = 'Faith';

INSERT INTO topic_confessions (topic_id, confession_text, title, is_featured) 
SELECT 
  t.id,
  'I confess that the peace of God guards my heart and mind. I am not anxious about anything, but in every situation, I present my requests to God.',
  'Confession of Peace',
  true
FROM topics t WHERE t.title = 'Peace';

INSERT INTO topic_confessions (topic_id, confession_text, title, is_featured) 
SELECT 
  t.id,
  'I confess that I am loved by God unconditionally. His love for me is perfect and never fails, and I am called to love others as He loves me.',
  'Confession of Love',
  true
FROM topics t WHERE t.title = 'Love';

INSERT INTO topic_confessions (topic_id, confession_text, title, is_featured) 
SELECT 
  t.id,
  'I confess that I have the mind of Christ and access to divine wisdom. God gives me understanding and guides my decisions.',
  'Confession of Wisdom',
  true
FROM topics t WHERE t.title = 'Wisdom';

INSERT INTO topic_confessions (topic_id, confession_text, title, is_featured) 
SELECT 
  t.id,
  'I confess that God supplies all my needs according to His riches in glory. I am blessed to be a blessing to others.',
  'Confession of Prosperity',
  true
FROM topics t WHERE t.title = 'Prosperity';

INSERT INTO topic_confessions (topic_id, confession_text, title, is_featured) 
SELECT 
  t.id,
  'I confess that I am surrounded by godly relationships. God has placed the right people in my life to encourage and support me.',
  'Confession of Relationships',
  true
FROM topics t WHERE t.title = 'Relationships';
