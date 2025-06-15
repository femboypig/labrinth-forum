INSERT INTO categories (name, slug, description, icon_name) VALUES
('General Discussion', 'general-discussion', 'Talk about anything and everything related to labrinth.', 'MessageSquare'),
('Announcements', 'announcements', 'Stay updated with the latest server news and important information.', 'Megaphone'),
('Server Updates', 'server-updates', 'Details about game updates, patches, and maintenance schedules.', 'ServerCog'),
('Support & Help', 'support-help', 'Need assistance? Post your questions and issues here.', 'HelpCircle'),
('Off-Topic Chat', 'off-topic-chat', 'Discuss non-server related topics with the community.', 'Coffee'),
('Feedback & Suggestions', 'feedback-suggestions', 'Share your valuable ideas to help improve labrinth.', 'Lightbulb')
ON CONFLICT (slug) DO NOTHING;
