-- Populate implementation guides for popular tools
INSERT INTO public.implementation_guides (title, description, tool_id, difficulty_level, estimated_time, target_roles, steps, prerequisites, success_metrics, troubleshooting) VALUES 
-- ChatGPT Implementation Guide
('ChatGPT Setup and Integration Guide', 'Complete guide to implementing ChatGPT in your daily workflow for maximum productivity', (SELECT id FROM tools WHERE name = 'ChatGPT'), 'easy', '30 minutes', ARRAY['All Roles'], 
jsonb_build_object(
  'steps', ARRAY[
    jsonb_build_object('title', 'Create Your Account', 'description', 'Sign up for ChatGPT and choose the right plan', 'duration', '5 minutes'),
    jsonb_build_object('title', 'Learn Basic Prompting', 'description', 'Understand how to write effective prompts for your use case', 'duration', '10 minutes'),
    jsonb_build_object('title', 'Set Up Custom Instructions', 'description', 'Configure ChatGPT with your preferences and context', 'duration', '5 minutes'),
    jsonb_build_object('title', 'Practice Common Tasks', 'description', 'Try ChatGPT with your most frequent work activities', 'duration', '10 minutes')
  ]
), ARRAY['Basic computer skills'], ARRAY['Complete first task using ChatGPT', 'Save 30 minutes on routine work'], 
jsonb_build_object(
  'common_issues', ARRAY[
    jsonb_build_object('issue', 'Poor response quality', 'solution', 'Improve prompt specificity and provide more context'),
    jsonb_build_object('issue', 'Rate limiting', 'solution', 'Upgrade to ChatGPT Plus or space out requests')
  ]
)),

-- Zapier Implementation Guide  
('Zapier Automation Setup Guide', 'Step-by-step guide to create your first automated workflows with Zapier', (SELECT id FROM tools WHERE name = 'Zapier'), 'medium', '2 hours', ARRAY['Operations Manager', 'CEO'], 
jsonb_build_object(
  'steps', ARRAY[
    jsonb_build_object('title', 'Account Setup and Planning', 'description', 'Create Zapier account and identify automation opportunities', 'duration', '20 minutes'),
    jsonb_build_object('title', 'Connect Your Apps', 'description', 'Link the applications you want to automate between', 'duration', '15 minutes'),
    jsonb_build_object('title', 'Create Your First Zap', 'description', 'Build a simple trigger-action automation', 'duration', '30 minutes'),
    jsonb_build_object('title', 'Test and Refine', 'description', 'Test your automation and make necessary adjustments', 'duration', '25 minutes'),
    jsonb_build_object('title', 'Scale Your Automation', 'description', 'Add more complex workflows and multi-step automations', 'duration', '30 minutes')
  ]
), ARRAY['Familiarity with apps to be connected'], ARRAY['Successfully automate one repetitive task', 'Save 2+ hours per week'], 
jsonb_build_object(
  'common_issues', ARRAY[
    jsonb_build_object('issue', 'Authentication errors', 'solution', 'Reconnect apps and check permissions'),
    jsonb_build_object('issue', 'Zap not triggering', 'solution', 'Check trigger conditions and test data format')
  ]
)),

-- Notion AI Implementation Guide
('Notion AI Workspace Setup', 'Transform your workspace with Notion AI for enhanced productivity and organization', (SELECT id FROM tools WHERE name = 'Notion AI'), 'easy', '1 hour', ARRAY['Project Manager', 'CEO'], 
jsonb_build_object(
  'steps', ARRAY[
    jsonb_build_object('title', 'Notion Setup', 'description', 'Create account and set up basic workspace structure', 'duration', '15 minutes'),
    jsonb_build_object('title', 'Enable Notion AI', 'description', 'Activate AI features and understand capabilities', 'duration', '10 minutes'),
    jsonb_build_object('title', 'Create AI-Enhanced Templates', 'description', 'Build templates that leverage AI for content generation', 'duration', '20 minutes'),
    jsonb_build_object('title', 'Organize Your Content', 'description', 'Structure your workspace for optimal AI assistance', 'duration', '15 minutes')
  ]
), ARRAY['Basic understanding of note-taking tools'], ARRAY['Create first AI-generated content', 'Organize 80% of work documents'], 
jsonb_build_object(
  'common_issues', ARRAY[
    jsonb_build_object('issue', 'AI responses are generic', 'solution', 'Provide more specific context and examples'),
    jsonb_build_object('issue', 'Slow performance', 'solution', 'Organize content in smaller, focused pages')
  ]
)),

-- Grammarly Implementation Guide
('Grammarly Professional Setup', 'Integrate Grammarly across your writing workflow for consistent, professional communication', (SELECT id FROM tools WHERE name = 'Grammarly'), 'easy', '20 minutes', ARRAY['Marketing Manager', 'Content Creator'], 
jsonb_build_object(
  'steps', ARRAY[
    jsonb_build_object('title', 'Account Creation', 'description', 'Sign up and choose appropriate plan for your needs', 'duration', '5 minutes'),
    jsonb_build_object('title', 'Browser Extension Setup', 'description', 'Install Grammarly extension for seamless integration', 'duration', '3 minutes'),
    jsonb_build_object('title', 'Configure Writing Goals', 'description', 'Set up tone, audience, and style preferences', 'duration', '7 minutes'),
    jsonb_build_object('title', 'Test Integration', 'description', 'Try Grammarly in your most-used writing applications', 'duration', '5 minutes')
  ]
), ARRAY['Regular writing tasks'], ARRAY['Improve writing clarity by 25%', 'Reduce editing time'], 
jsonb_build_object(
  'common_issues', ARRAY[
    jsonb_build_object('issue', 'Extension not working', 'solution', 'Refresh browser and check extension permissions'),
    jsonb_build_object('issue', 'Too many suggestions', 'solution', 'Adjust sensitivity settings in preferences')
  ]
)),

-- Canva AI Implementation Guide
('Canva AI Design Workflow', 'Master Canva AI tools for professional design creation without design experience', (SELECT id FROM tools WHERE name = 'Canva AI'), 'easy', '45 minutes', ARRAY['Marketing Manager', 'Content Creator'], 
jsonb_build_object(
  'steps', ARRAY[
    jsonb_build_object('title', 'Canva Account Setup', 'description', 'Create account and explore AI-powered features', 'duration', '10 minutes'),
    jsonb_build_object('title', 'Brand Kit Creation', 'description', 'Set up brand colors, fonts, and logos for consistency', 'duration', '15 minutes'),
    jsonb_build_object('title', 'AI Design Generation', 'description', 'Use Magic Design and AI tools for content creation', 'duration', '15 minutes'),
    jsonb_build_object('title', 'Template Customization', 'description', 'Adapt AI-generated designs to your brand guidelines', 'duration', '5 minutes')
  ]
), ARRAY['Basic understanding of design needs'], ARRAY['Create first professional design', 'Establish consistent brand presence'], 
jsonb_build_object(
  'common_issues', ARRAY[
    jsonb_build_object('issue', 'Designs don''t match brand', 'solution', 'Update brand kit and use brand-specific templates'),
    jsonb_build_object('issue', 'Low-quality images', 'solution', 'Use Canva Pro stock photos or upload high-resolution images')
  ]
));