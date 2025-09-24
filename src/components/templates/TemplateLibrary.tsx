import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  BarChart3,
  DollarSign,
  Target,
  Clock,
  Star
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string[];
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  rating: number;
  downloads: number;
  fileType: string;
  size: string;
  lastUpdated: string;
  tags: string[];
}

const templates: Template[] = [
  {
    id: '1',
    name: 'CFO Monthly Dashboard Template',
    description: 'Comprehensive executive dashboard with KPIs, cash flow, and variance analysis',
    category: 'Financial Reporting',
    industry: ['All Industries'],
    difficulty: 'Medium',
    rating: 4.8,
    downloads: 1247,
    fileType: 'Excel',
    size: '2.4 MB',
    lastUpdated: '2024-09-15',
    tags: ['Dashboard', 'KPI', 'Executive', 'Monthly']
  },
  {
    id: '2',
    name: 'Budget vs Actual Analysis',
    description: 'Automated variance analysis with drill-down capabilities and commentary templates',
    category: 'Budgeting & Forecasting',
    industry: ['Manufacturing', 'Retail', 'Technology'],
    difficulty: 'Easy',
    rating: 4.9,
    downloads: 2156,
    fileType: 'Excel',
    size: '1.8 MB',
    lastUpdated: '2024-09-20',
    tags: ['Budget', 'Variance', 'Analysis', 'Automated']
  },
  {
    id: '3',
    name: 'Cash Flow Forecasting Model',
    description: '13-week rolling cash flow forecast with scenario planning and sensitivity analysis',
    category: 'Cash Management',
    industry: ['All Industries'],
    difficulty: 'Advanced',
    rating: 4.7,
    downloads: 892,
    fileType: 'Excel',
    size: '3.2 MB',
    lastUpdated: '2024-09-18',
    tags: ['Cash Flow', 'Forecasting', 'Scenario Planning']
  },
  {
    id: '4',
    name: 'Board Presentation Template',
    description: 'Professional board deck template with financial highlights and strategic metrics',
    category: 'Board Reporting',
    industry: ['All Industries'],
    difficulty: 'Easy',
    rating: 4.6,
    downloads: 1789,
    fileType: 'PowerPoint',
    size: '4.1 MB',
    lastUpdated: '2024-09-12',
    tags: ['Board', 'Presentation', 'Executive', 'Strategic']
  },
  {
    id: '5',
    name: 'Financial Close Checklist',
    description: 'Comprehensive month-end close checklist with automated task tracking',
    category: 'Process Management',
    industry: ['All Industries'],
    difficulty: 'Easy',
    rating: 4.8,
    downloads: 1534,
    fileType: 'Excel',
    size: '1.2 MB',
    lastUpdated: '2024-09-22',
    tags: ['Month End', 'Checklist', 'Process', 'Automation']
  },
  {
    id: '6',
    name: 'ROI Analysis Framework',
    description: 'Standardized ROI calculation template for capital investments and projects',
    category: 'Investment Analysis',
    industry: ['Manufacturing', 'Healthcare', 'Technology'],
    difficulty: 'Medium',
    rating: 4.7,
    downloads: 943,
    fileType: 'Excel',
    size: '2.1 MB',
    lastUpdated: '2024-09-16',
    tags: ['ROI', 'Investment', 'Capital', 'Analysis']
  }
];

const categories = [
  'All Categories',
  'Financial Reporting',
  'Budgeting & Forecasting',
  'Cash Management',
  'Board Reporting',
  'Process Management',
  'Investment Analysis'
];

const difficulties = ['All Levels', 'Easy', 'Medium', 'Advanced'];

export function TemplateLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Levels');

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All Categories' || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All Levels' || template.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Financial Reporting': return BarChart3;
      case 'Budgeting & Forecasting': return Target;
      case 'Cash Management': return DollarSign;
      case 'Board Reporting': return FileText;
      case 'Process Management': return Clock;
      case 'Investment Analysis': return Target;
      default: return FileText;
    }
  };

  const handleDownload = (template: Template) => {
    // In a real app, this would trigger the actual download
    console.log(`Downloading template: ${template.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span>CFO Template Library</span>
          </CardTitle>
          <CardDescription>
            Ready-to-use templates and frameworks to accelerate your financial processes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{templates.length}</div>
              <p className="text-sm text-muted-foreground">Templates Available</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {Math.round(templates.reduce((sum, t) => sum + t.rating, 0) / templates.length * 10) / 10}
              </div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {templates.reduce((sum, t) => sum + t.downloads, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total Downloads</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Free</div>
              <p className="text-sm text-muted-foreground">All Templates</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Templates</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty Level</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Results</label>
              <div className="flex items-center space-x-2 pt-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {filteredTemplates.length} templates found
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const IconComponent = getCategoryIcon(template.category);
          
          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{template.category}</Badge>
                        <Badge 
                          variant="outline"
                          className={getDifficultyColor(template.difficulty)}
                        >
                          {template.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{template.rating}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>

                {/* Template Details */}
                <div className="grid grid-cols-2 gap-4 py-3 bg-accent/5 rounded-lg px-3">
                  <div>
                    <p className="text-xs text-muted-foreground">File Type</p>
                    <p className="text-sm font-medium">{template.fileType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Size</p>
                    <p className="text-sm font-medium">{template.size}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Downloads</p>
                    <p className="text-sm font-medium">{template.downloads.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Updated</p>
                    <p className="text-sm font-medium">
                      {new Date(template.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.tags.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Industry */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Best for:</p>
                  <p className="text-sm">{template.industry.join(', ')}</p>
                </div>

                {/* Download Button */}
                <Button 
                  onClick={() => handleDownload(template)}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse all categories
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All Categories');
                setSelectedDifficulty('All Levels');
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}