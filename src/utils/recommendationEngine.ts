import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  role: string;
  industry: string;
  company_size: string;
  ai_experience: string;
  goals: string[];
  time_availability: string;
  implementation_timeline: string;
}

export interface AITool {
  id: string;
  name: string;
  description: string;
  category_id: string;
  pricing_model: string;
  pricing_amount: number;
  website_url: string;
  logo_url: string;
  setup_difficulty: string;
  time_to_value: string;
  target_roles: string[];
  target_industries: string[];
  target_company_sizes: string[];
  features: string[];
  integrations: string[];
  pros: string[];
  cons: string[];
  user_rating: number;
  expert_rating: number;
  popularity_score: number;
  implementation_guide: string;
  video_tutorial_url: string;
}

export interface ToolRecommendation {
  tool: AITool;
  score: number;
  reason: string;
  category: string;
}

export class RecommendationEngine {
  static calculateRelevanceScore(tool: AITool, profile: UserProfile): number {
    let score = 0;

    console.log('Calculating score for tool:', tool.name, 'with profile role:', profile.role);

    // Role Match (40% weight)
    if (tool.target_roles?.includes(profile.role.toLowerCase())) {
      score += 40;
      console.log('Role match:', profile.role, 'in', tool.target_roles);
    } else if (tool.target_roles?.includes('all') || !tool.target_roles?.length) {
      score += 20; // Generic tools get partial score
      console.log('Generic role match');
    }

    // Industry Relevance (25% weight)
    const industryLower = profile.industry?.toLowerCase();
    if (tool.target_industries?.some(industry => industry.toLowerCase().includes(industryLower))) {
      score += 25;
      console.log('Industry match:', profile.industry, 'with', tool.target_industries);
    } else if (tool.target_industries?.includes('all') || !tool.target_industries?.length) {
      score += 12; // Generic tools get partial score
      console.log('Generic industry match');
    }

    // Company Size Fit (15% weight)
    if (tool.target_company_sizes?.includes(profile.company_size)) {
      score += 15;
    } else if (!tool.target_company_sizes?.length) {
      score += 7; // No restrictions get partial score
    }

    // AI Experience Level (10% weight)
    const experienceBonus = this.getExperienceBonus(tool, profile.ai_experience);
    score += experienceBonus;

    // Goal Alignment (10% weight)
    const goalAlignment = this.calculateGoalAlignment(tool, profile.goals);
    score += goalAlignment;

    // Time to Value bonus for urgent timelines
    if (profile.implementation_timeline === 'This week' && tool.time_to_value === 'minutes') {
      score += 5;
    } else if (profile.implementation_timeline === 'This week' && tool.time_to_value === 'hours') {
      score += 3;
    }

    // Setup difficulty penalty for beginners
    if (profile.ai_experience === 'never' && tool.setup_difficulty === 'hard') {
      score -= 10;
    }

    console.log('Final score for', tool.name, ':', Math.min(100, Math.max(0, score)));
    return Math.min(100, Math.max(0, score));
  }

  private static getExperienceBonus(tool: AITool, experience: string): number {
    switch (experience) {
      case 'never':
        return tool.setup_difficulty === 'easy' ? 10 : tool.setup_difficulty === 'medium' ? 5 : 0;
      case 'chatgpt':
        return tool.setup_difficulty === 'easy' ? 8 : tool.setup_difficulty === 'medium' ? 10 : 3;
      case 'multiple':
        return tool.setup_difficulty === 'easy' ? 6 : tool.setup_difficulty === 'medium' ? 10 : 8;
      case 'advanced':
        return tool.setup_difficulty === 'hard' ? 10 : tool.setup_difficulty === 'medium' ? 8 : 6;
      default:
        return 5;
    }
  }

  private static calculateGoalAlignment(tool: AITool, goals: string[]): number {
    const goalKeywords = {
      'Increase personal productivity': ['productivity', 'automation', 'efficiency', 'time'],
      'Improve team efficiency': ['collaboration', 'team', 'communication', 'project'],
      'Reduce operational costs': ['automation', 'efficiency', 'cost', 'optimize'],
      'Enhance customer experience': ['customer', 'service', 'experience', 'support'],
      'Drive innovation': ['innovation', 'creative', 'design', 'development'],
      'Stay competitive': ['analytics', 'insights', 'data', 'intelligence'],
      'Automate repetitive tasks': ['automation', 'workflow', 'process', 'task'],
      'Improve decision making': ['analytics', 'data', 'insights', 'intelligence'],
      'Scale operations': ['scalability', 'growth', 'enterprise', 'team'],
      'Learn new technologies': ['learning', 'education', 'tutorial', 'guide']
    };

    let alignmentScore = 0;
    const toolDescription = (tool.description + ' ' + tool.features?.join(' ') || '').toLowerCase();

    goals.forEach(goal => {
      const keywords = goalKeywords[goal] || [];
      const matches = keywords.filter(keyword => toolDescription.includes(keyword)).length;
      alignmentScore += (matches / keywords.length) * (10 / goals.length);
    });

    return alignmentScore;
  }

  static generateRecommendationReason(tool: AITool, profile: UserProfile, score: number): string {
    const reasons = [];

    if (tool.target_roles?.includes(profile.role)) {
      const roleNames = {
        'ceo': 'CEOs',
        'cto': 'CTOs', 
        'cmo': 'CMOs',
        'coo': 'COOs',
        'cfo': 'CFOs',
        'vp': 'VPs',
        'director': 'Directors',
        'manager': 'Managers',
        'individual': 'Individual Contributors'
      };
      reasons.push(`Specifically designed for ${roleNames[profile.role] || profile.role}`);
    }

    if (tool.target_industries?.includes(profile.industry)) {
      reasons.push(`Proven success in ${profile.industry}`);
    }

    if (tool.setup_difficulty === 'easy' && profile.ai_experience === 'never') {
      reasons.push('Easy setup perfect for AI beginners');
    }

    if (tool.time_to_value === 'minutes' && profile.implementation_timeline === 'This week') {
      reasons.push('Immediate value for quick implementation');
    }

    if (score >= 80) {
      reasons.push('Highly recommended match');
    } else if (score >= 60) {
      reasons.push('Good fit for your needs');
    }

    return reasons.length > 0 ? reasons.join('. ') + '.' : 'Recommended based on your profile.';
  }

  static async generateRecommendations(userId: string, profile: UserProfile): Promise<ToolRecommendation[]> {
    try {
      console.log('Generating recommendations for user:', userId, 'with profile:', profile);
      
      // Fetch all tools
      const { data: tools, error } = await supabase
        .from('tools')
        .select(`
          *,
          categories (
            name,
            color,
            icon
          )
        `)
        .eq('status', 'active');

      if (error) throw error;

      if (!tools) return [];

      console.log('Found', tools.length, 'active tools');

      // Calculate scores and generate recommendations
      const recommendations: ToolRecommendation[] = tools
        .map(tool => {
          const score = this.calculateRelevanceScore(tool, profile);
          const reason = this.generateRecommendationReason(tool, profile, score);
          
          return {
            tool,
            score,
            reason,
            category: tool.categories?.name || 'Uncategorized'
          };
        })
        .filter(rec => {
          console.log('Tool', rec.tool.name, 'scored', rec.score, '- included:', rec.score > 30);
          return rec.score > 30;
        }) // Only recommend tools with decent relevance
        .sort((a, b) => b.score - a.score)
        .slice(0, 8); // Top 8 recommendations

      console.log('Generated', recommendations.length, 'recommendations:', recommendations.map(r => ({ name: r.tool.name, score: r.score })));

      // Store recommendations in database
      if (recommendations.length > 0) {
        const recommendationInserts = recommendations.map(rec => ({
          user_id: userId,
          tool_id: rec.tool.id,
          recommendation_score: rec.score,
          reason: rec.reason,
          status: 'active'
        }));

        // Clear existing recommendations first
        await supabase
          .from('tool_recommendations')
          .delete()
          .eq('user_id', userId);

        // Insert new recommendations
        const { error: insertError } = await supabase
          .from('tool_recommendations')
          .insert(recommendationInserts);
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  static async getUserRecommendations(userId: string): Promise<ToolRecommendation[]> {
    try {
      const { data, error } = await supabase
        .from('tool_recommendations')
        .select(`
          *,
          tools (
            *,
            categories (
              name,
              color,
              icon
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('recommendation_score', { ascending: false });

      if (error) throw error;

      return data?.map(rec => ({
        tool: rec.tools,
        score: rec.recommendation_score,
        reason: rec.reason,
        category: rec.tools.categories?.name || 'Uncategorized'
      })) || [];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }
}