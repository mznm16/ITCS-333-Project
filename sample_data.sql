-- Sample data for mydb database
USE mydb;

-- Sample users with hashed passwords (all passwords are 'password123')
INSERT INTO users (username, email, password) VALUES 
('john_doe', 'john@example.com', '$2y$10$6mMq4S5eGGK0Wgyl27YBVu9kOO7lLAl3KXL92WPNT83SwEsQQW1Mi'),
('jane_smith', 'jane@example.com', '$2y$10$6mMq4S5eGGK0Wgyl27YBVu9kOO7lLAl3KXL92WPNT83SwEsQQW1Mi'),
('ahmed_ali', 'ahmed@example.com', '$2y$10$6mMq4S5eGGK0Wgyl27YBVu9kOO7lLAl3KXL92WPNT83SwEsQQW1Mi'),
('sara_khan', 'sara@example.com', '$2y$10$6mMq4S5eGGK0Wgyl27YBVu9kOO7lLAl3KXL92WPNT83SwEsQQW1Mi'),
('mike_wilson', 'mike@example.com', '$2y$10$6mMq4S5eGGK0Wgyl27YBVu9kOO7lLAl3KXL92WPNT83SwEsQQW1Mi');

-- Sample study groups
INSERT INTO study_groups (title, category, course, description, max_members, meeting_time, location, days, requirements, image, owner_id, created_at) VALUES 
('ITCS 333 Study Group', 'IT', 'itcs333', 'Weekly study sessions for Internet Web Development course. We focus on HTML, CSS, JavaScript, and PHP.', 8, UNIX_TIMESTAMP('2023-09-15 14:00:00'), 'S40', JSON_ARRAY('Sunday', 'Wednesday'), JSON_ARRAY('laptop', 'notes'), '../images/newcs.jpg', 1, '2023-09-01 10:00:00'),
('Data Structures Group', 'IT', 'itcs214', 'Deep dive into algorithms and data structures. We solve problems together and prepare for exams.', 6, UNIX_TIMESTAMP('2023-09-16 16:30:00'), 'S50', JSON_ARRAY('Monday', 'Thursday'), JSON_ARRAY('laptop', 'notes'), '../images/newcs.jpg', 2, '2023-09-02 11:30:00'),
('Calculus Study Group', 'Science', 'math101', 'Group for students struggling with calculus concepts. We go through problems step by step.', 5, UNIX_TIMESTAMP('2023-09-17 15:00:00'), 'S1B', JSON_ARRAY('Tuesday', 'Thursday'), JSON_ARRAY('notes'), '../images/newcs.jpg', 3, '2023-09-03 09:15:00'),
('Physics Concepts', 'Science', 'phys101', 'Discussions and problem-solving for Physics 101. We focus on mechanics and thermodynamics.', 3, UNIX_TIMESTAMP('2023-09-18 13:00:00'), 'S1A', JSON_ARRAY('Sunday', 'Tuesday'), JSON_ARRAY('notes', 'laptop'), '../images/newcs.jpg', 4, '2023-09-04 14:20:00'),
('Business Statistics', 'Business', 'bus103', 'Going through statistical concepts and their applications in business scenarios.', 7, UNIX_TIMESTAMP('2023-09-19 17:00:00'), 'IT Food Court', JSON_ARRAY('Monday', 'Wednesday'), JSON_ARRAY('laptop'), '../images/newcs.jpg', 5, '2023-09-05 16:45:00');

-- Group members (including owners)
INSERT INTO group_members (group_id, user_id, is_owner, joined_at) VALUES 
-- Group 1 members
(1, 1, 1, '2023-09-01 10:00:00'), -- John is owner of Group 1
(1, 2, 0, '2023-09-01 11:20:00'), -- Jane joined Group 1
(1, 3, 0, '2023-09-01 12:15:00'), -- Ahmed joined Group 1
-- Group 2 members
(2, 2, 1, '2023-09-02 11:30:00'), -- Jane is owner of Group 2
(2, 4, 0, '2023-09-02 13:40:00'), -- Sara joined Group 2
(2, 5, 0, '2023-09-02 14:50:00'), -- Mike joined Group 2
-- Group 3 members
(3, 3, 1, '2023-09-03 09:15:00'), -- Ahmed is owner of Group 3
(3, 1, 0, '2023-09-03 10:25:00'), -- John joined Group 3
(3, 4, 0, '2023-09-03 11:35:00'), -- Sara joined Group 3
-- Group 4 members
(4, 4, 1, '2023-09-04 14:20:00'), -- Sara is owner of Group 4
(4, 2, 0, '2023-09-04 15:30:00'), -- Jane joined Group 4
(4, 5, 0, '2023-09-04 16:40:00'), -- Mike joined Group 4
-- Group 5 members
(5, 5, 1, '2023-09-05 16:45:00'), -- Mike is owner of Group 5
(5, 1, 0, '2023-09-05 17:55:00'), -- John joined Group 5
(5, 3, 0, '2023-09-05 18:05:00'); -- Ahmed joined Group 5

-- Group resources
INSERT INTO group_resources (group_id, title, type, description, url, added_by, last_updated) VALUES 
-- Resources for Group 1 (ITCS 333)
(1, 'HTML5 Cheat Sheet', 'pdf', 'Complete reference for HTML5 tags and attributes', 'https://example.com/html5-cheatsheet.pdf', 'Owner', '2023-09-01 15:30:00'),
(1, 'CSS Tricks', 'link', 'Website with useful CSS tips and tricks', 'https://css-tricks.com', 'Owner', '2023-09-01 15:35:00'),
(1, 'JavaScript Fundamentals', 'video', 'Introduction to JavaScript basics', 'https://www.youtube.com/watch?v=abc123', 'Member', '2023-09-01 16:40:00'),
(1, 'Web Dev Study Group', 'whatsapp', 'Join our WhatsApp group for discussions', 'https://chat.whatsapp.com/example123', 'Owner', '2023-09-01 17:45:00'),
-- Resources for Group 2 (Data Structures)
(2, 'Algorithms Visualization', 'link', 'Interactive visualization of common algorithms', 'https://visualgo.net', 'Owner', '2023-09-02 18:50:00'),
(2, 'Big O Cheat Sheet', 'pdf', 'Time and space complexity of common algorithms', 'https://example.com/bigo-cheatsheet.pdf', 'Member', '2023-09-02 19:55:00'),
-- Resources for Group 3 (Calculus)
(3, 'Calculus Made Easy', 'pdf', 'Simplified explanations of calculus concepts', 'https://example.com/calculus-guide.pdf', 'Owner', '2023-09-03 20:00:00'),
(3, 'Integral Techniques', 'video', 'Video explaining various integration methods', 'https://www.youtube.com/watch?v=def456', 'Member', '2023-09-03 21:05:00'),
-- Resources for Group 4 (Physics)
(4, 'Physics Formula Sheet', 'pdf', 'Collection of important physics formulas', 'https://example.com/physics-formulas.pdf', 'Owner', '2023-09-04 22:10:00'),
-- Resources for Group 5 (Business Statistics)
(5, 'Statistics Problems', 'pdf', 'Practice problems with solutions', 'https://example.com/stats-problems.pdf', 'Owner', '2023-09-05 23:15:00'),
(5, 'Excel for Statistics', 'video', 'Tutorial on using Excel for statistical analysis', 'https://www.youtube.com/watch?v=ghi789', 'Member', '2023-09-05 23:20:00');

-- Group sessions
INSERT INTO group_sessions (group_id, day, month, year, time, title, topics, status, session_type) VALUES 
-- Sessions for Group 1 (ITCS 333)
(1, '15', 'Sep', '2023', '14:00', 'HTML & CSS Basics', 'Introduction to HTML elements and CSS styling', 'Completed', 'study'),
(1, '22', 'Sep', '2023', '14:00', 'JavaScript Fundamentals', 'Variables, functions, and DOM manipulation', 'Ongoing', 'study'),
(1, '29', 'Sep', '2023', '14:00', 'PHP Introduction', 'Getting started with PHP programming', 'Ongoing', 'study'),
-- Sessions for Group 2 (Data Structures)
(2, '16', 'Sep', '2023', '16:30', 'Arrays and Linked Lists', 'Implementation and operations', 'Completed', 'study'),
(2, '23', 'Sep', '2023', '16:30', 'Trees and Graphs', 'Binary trees, traversal algorithms', 'Ongoing', 'practice'),
-- Sessions for Group 3 (Calculus)
(3, '17', 'Sep', '2023', '15:00', 'Limits and Continuity', 'Understanding limit concept', 'Completed', 'study'),
(3, '24', 'Sep', '2023', '15:00', 'Differentiation Rules', 'Product, quotient, and chain rules', 'Ongoing', 'practice'),
-- Sessions for Group 4 (Physics)
(4, '18', 'Sep', '2023', '13:00', 'Newton\'s Laws', 'Applications and problem solving', 'Completed', 'study'),
(4, '25', 'Sep', '2023', '13:00', 'Energy and Work', 'Conservation of energy problems', 'Ongoing', 'study'),
-- Sessions for Group 5 (Business Statistics)
(5, '19', 'Sep', '2023', '17:00', 'Descriptive Statistics', 'Mean, median, mode, and standard deviation', 'Completed', 'study'),
(5, '26', 'Sep', '2023', '17:00', 'Probability Distributions', 'Normal and binomial distributions', 'Ongoing', 'practice');

-- Group chat messages
INSERT INTO group_chat (group_id, user_id, text, is_owner, timestamp) VALUES 
-- Chat messages for Group 1 (ITCS 333)
(1, 1, 'Welcome everyone to our ITCS 333 study group! Looking forward to our first session.', 1, '2023-09-01 10:30:00'),
(1, 2, 'Thanks for setting this up! I\'m struggling with CSS flexbox, hope we can cover that.', 0, '2023-09-01 11:35:00'),
(1, 3, 'I can help with flexbox! I just completed a project using it.', 0, '2023-09-01 12:40:00'),
(1, 1, 'Great Ahmed! We\'ll definitely add that to our first session.', 1, '2023-09-01 13:45:00'),
-- Chat messages for Group 2 (Data Structures)
(2, 2, 'Hi everyone! Let\'s use this chat to coordinate our study sessions for Data Structures.', 1, '2023-09-02 14:50:00'),
(2, 4, 'Hello! I\'m finding the tree traversal algorithms confusing. Can we focus on those?', 0, '2023-09-02 15:55:00'),
(2, 5, 'Same here. Especially the difference between pre-order, in-order, and post-order traversal.', 0, '2023-09-02 16:00:00'),
-- Chat messages for Group 3 (Calculus)
(3, 3, 'Welcome to our Calculus study group! Please share topics you\'re struggling with.', 1, '2023-09-03 17:05:00'),
(3, 1, 'Integration by parts is killing me. Need help with that!', 0, '2023-09-03 18:10:00'),
-- Chat messages for Group 4 (Physics)
(4, 4, 'Physics study group is now open! Don\'t forget to bring your textbooks to the sessions.', 1, '2023-09-04 19:15:00'),
(4, 2, 'Will we be doing practical experiments or just problem-solving?', 0, '2023-09-04 20:20:00'),
-- Chat messages for Group 5 (Business Statistics)
(5, 5, 'Welcome statisticians! Our first session will cover basic probability concepts.', 1, '2023-09-05 21:25:00'),
(5, 1, 'Looking forward to it! Can we also review the binomial distribution?', 0, '2023-09-05 22:30:00'),
(5, 3, 'And maybe some Excel techniques for statistical analysis?', 0, '2023-09-05 23:35:00'),
(5, 5, 'Absolutely! I\'ll prepare some Excel examples for our session.', 1, '2023-09-06 00:40:00'); 