-- Populate learning paths with essential content
INSERT INTO public.learning_paths (title, description, difficulty_level, target_role, estimated_duration_hours, learning_objectives, prerequisites, status, path_order) VALUES 
('AI Fundamentals for Executives', 'Essential AI knowledge for business leaders and decision makers', 'beginner', 'Executive', 2, ARRAY['Understand AI capabilities', 'Identify business opportunities', 'Make informed AI investments'], ARRAY['Basic business knowledge'], 'active', 1),

('Getting Started with ChatGPT', 'Comprehensive guide to using ChatGPT effectively in your workflow', 'beginner', 'All Roles', 3, ARRAY['Master prompt engineering', 'Integrate ChatGPT into daily tasks', 'Avoid common mistakes'], ARRAY['None'], 'active', 2),

('AI-Powered Marketing Automation', 'Learn to automate and optimize marketing processes with AI tools', 'intermediate', 'Marketing Manager', 4, ARRAY['Set up automated campaigns', 'Use AI for content creation', 'Measure marketing ROI'], ARRAY['Basic marketing knowledge'], 'active', 3),

('Workflow Automation with AI', 'Create efficient automated workflows using AI and no-code tools', 'intermediate', 'Operations Manager', 5, ARRAY['Design automated workflows', 'Connect multiple tools', 'Monitor and optimize processes'], ARRAY['Basic understanding of business processes'], 'active', 4),

('AI for Customer Support', 'Implement AI chatbots and support automation for better customer experience', 'intermediate', 'Customer Support', 3, ARRAY['Set up AI chatbots', 'Create knowledge bases', 'Handle escalations effectively'], ARRAY['Customer service experience'], 'active', 5);

-- Populate learning modules for each path
INSERT INTO public.learning_modules (title, description, module_type, duration_minutes, path_id, order_in_path, content_preview, learning_objectives, prerequisites) VALUES 
-- AI Fundamentals for Executives modules
('What is AI and Why It Matters', 'Introduction to artificial intelligence and its business impact', 'video', 30, (SELECT id FROM learning_paths WHERE title = 'AI Fundamentals for Executives'), 1, 'Explore the basics of AI technology and understand how it can transform business operations...', ARRAY['Define artificial intelligence', 'Understand AI vs automation'], ARRAY['None']),

('AI Use Cases Across Industries', 'Real-world examples of successful AI implementation', 'interactive', 45, (SELECT id FROM learning_paths WHERE title = 'AI Fundamentals for Executives'), 2, 'Discover how companies in various industries are using AI to drive growth and efficiency...', ARRAY['Identify industry-specific opportunities', 'Evaluate AI readiness'], ARRAY['Basic AI knowledge']),

('Building an AI Strategy', 'Framework for developing and implementing AI initiatives', 'workshop', 60, (SELECT id FROM learning_paths WHERE title = 'AI Fundamentals for Executives'), 3, 'Learn to create a comprehensive AI strategy that aligns with business objectives...', ARRAY['Create AI roadmap', 'Set realistic expectations'], ARRAY['Understanding of business strategy']),

-- Getting Started with ChatGPT modules  
('ChatGPT Basics and Setup', 'Getting started with ChatGPT and understanding its capabilities', 'tutorial', 25, (SELECT id FROM learning_paths WHERE title = 'Getting Started with ChatGPT'), 1, 'Step-by-step guide to setting up and navigating ChatGPT interface...', ARRAY['Navigate ChatGPT interface', 'Understand model limitations'], ARRAY['None']),

('Prompt Engineering Fundamentals', 'Learn to write effective prompts for better AI responses', 'interactive', 40, (SELECT id FROM learning_paths WHERE title = 'Getting Started with ChatGPT'), 2, 'Master the art of prompt writing with practical exercises and examples...', ARRAY['Write clear prompts', 'Use context effectively'], ARRAY['Basic ChatGPT usage']),

('Advanced ChatGPT Techniques', 'Advanced strategies for complex tasks and integrations', 'workshop', 50, (SELECT id FROM learning_paths WHERE title = 'Getting Started with ChatGPT'), 3, 'Explore advanced features like custom instructions, plugins, and API usage...', ARRAY['Use advanced features', 'Integrate with workflows'], ARRAY['Prompt engineering basics']),

-- AI-Powered Marketing Automation modules
('Marketing AI Landscape', 'Overview of AI tools available for marketing teams', 'video', 35, (SELECT id FROM learning_paths WHERE title = 'AI-Powered Marketing Automation'), 1, 'Comprehensive overview of AI marketing tools and their applications...', ARRAY['Understand marketing AI tools', 'Identify use cases'], ARRAY['Marketing experience']),

('Content Creation with AI', 'Using AI for blog posts, social media, and ad copy', 'tutorial', 45, (SELECT id FROM learning_paths WHERE title = 'AI-Powered Marketing Automation'), 2, 'Hands-on training for creating compelling marketing content using AI...', ARRAY['Generate marketing copy', 'Maintain brand voice'], ARRAY['Content marketing basics']),

('Campaign Automation Setup', 'Building automated marketing campaigns with AI insights', 'workshop', 60, (SELECT id FROM learning_paths WHERE title = 'AI-Powered Marketing Automation'), 3, 'Complete walkthrough of setting up automated marketing campaigns...', ARRAY['Build automated campaigns', 'Set up tracking'], ARRAY['Marketing automation basics']),

-- Workflow Automation modules
('Automation Fundamentals', 'Understanding when and how to automate business processes', 'video', 30, (SELECT id FROM learning_paths WHERE title = 'Workflow Automation with AI'), 1, 'Learn the principles of effective process automation and tool selection...', ARRAY['Identify automation opportunities', 'Choose right tools'], ARRAY['Business process knowledge']),

('No-Code Automation Tools', 'Hands-on with Zapier, Make, and other automation platforms', 'tutorial', 50, (SELECT id FROM learning_paths WHERE title = 'Workflow Automation with AI'), 2, 'Practical training on popular no-code automation platforms...', ARRAY['Use automation tools', 'Create simple workflows'], ARRAY['Basic technical understanding']),

('Advanced Workflow Design', 'Creating complex multi-step automated workflows', 'workshop', 70, (SELECT id FROM learning_paths WHERE title = 'Workflow Automation with AI'), 3, 'Advanced techniques for designing robust automated workflows...', ARRAY['Design complex workflows', 'Handle error cases'], ARRAY['Basic automation experience']),

-- AI for Customer Support modules
('AI Chatbot Fundamentals', 'Introduction to AI-powered customer support solutions', 'video', 25, (SELECT id FROM learning_paths WHERE title = 'AI for Customer Support'), 1, 'Understanding how AI can enhance customer support operations...', ARRAY['Understand chatbot capabilities', 'Plan implementation'], ARRAY['Customer service experience']),

('Chatbot Setup and Training', 'Building and training your first AI customer support bot', 'tutorial', 55, (SELECT id FROM learning_paths WHERE title = 'AI for Customer Support'), 2, 'Step-by-step guide to creating effective customer support chatbots...', ARRAY['Build chatbot', 'Train AI responses'], ARRAY['Basic AI knowledge']),

('Support Analytics and Optimization', 'Using AI insights to improve customer support performance', 'workshop', 40, (SELECT id FROM learning_paths WHERE title = 'AI for Customer Support'), 3, 'Learn to analyze and optimize AI-powered support systems...', ARRAY['Analyze support metrics', 'Optimize AI performance'], ARRAY['Chatbot implementation']);