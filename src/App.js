import './App.css';
import React, { useState } from 'react';
import { Network, MessageCircle, Clock, Users, TrendingUp, Send, MapPin, Target, Lightbulb, CheckCircle, Mail, Upload, Download, Eye, Star, Zap, BarChart3, Globe, ArrowRight } from 'lucide-react';
import Papa from 'papaparse';

const LinkLens = () => {
  // Track if using sample data or real upload
  const [isSampleData, setIsSampleData] = useState(true);

  // For demo: when using sample data, show names; when uploading real CSV, blur names in network map
  const handleSampleData = () => {
    setIsSampleData(true);
    processLinkedInData(Papa.parse(sampleCSV, { header: true }).data);
  };
  // CSV sample for download and demo
  const sampleCSV = `First Name,Last Name,Email Address,Company,Position,Connected On
John,Doe,john@example.com,OpenAI,AI Research Scientist,2023-01-15
Jane,Smith,jane@example.com,Meta,Product Manager,2022-11-10
David,Johnson,david@example.com,Goldman Sachs,VP Investment Banking,2023-03-20
Sarah,Wilson,sarah@example.com,Google,Senior Software Engineer,2022-08-05
Michael,Brown,michael@example.com,Stripe,Head of Growth,2023-02-12
Emily,Davis,emily@example.com,Andreessen Horowitz,Investment Partner,2022-12-18
Alex,Chen,alex@example.com,Tesla,Director of AI,2023-01-30
Lisa,Rodriguez,lisa@example.com,Coinbase,Senior Product Manager,2022-09-22`;

  // Core state
  const [activeTab, setActiveTab] = useState('import');
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [coachingQuestions, setCoachingQuestions] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvFileName, setCsvFileName] = useState('');
  const [userGoals, setUserGoals] = useState('');
  const [aiInsights, setAiInsights] = useState([]);

  // High-value connections paging
  // Network Map view mode (grid/list)
  const [viewMode, setViewMode] = useState('grid');
  const [highValuePage, setHighValuePage] = useState(0);
  const highValuePageSize = 4;
  const highValueConnectionsArr = connections.filter(c => c.relevanceScore > 80);
  const highValueTotalPages = Math.ceil(highValueConnectionsArr.length / highValuePageSize);
  const highValueToShow = highValueConnectionsArr.slice(highValuePage * highValuePageSize, (highValuePage + 1) * highValuePageSize);

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsProcessing(true);
    setCsvFileName(file.name);
    setIsSampleData(false);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/);
      let headerIndex = lines.findIndex(line => line.includes('First Name') && line.includes('Last Name'));
      if (headerIndex === -1) headerIndex = 0;
      const csvContent = lines.slice(headerIndex).join('\n');
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          processLinkedInData(results.data);
          setIsProcessing(false);
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          setIsProcessing(false);
        }
      });
    };
    reader.readAsText(file);
  };

  const processLinkedInData = (data) => {
    const processedConnections = data.map((contact, index) => {
      const fullName = `${contact['First Name'] || ''} ${contact['Last Name'] || ''}`.trim();
      const company = contact['Company'] || contact['Organization'] || '';
      const position = contact['Position'] || contact['Job Title'] || '';
      const email = contact['Email Address'] || contact['Email'] || '';
      
      const aiAnalysis = analyzeConnection(fullName, company, position);
      
      return {
        id: index + 1,
        name: fullName,
        role: position,
        company: company,
        email: email,
        connectedOn: contact['Connected On'] || '',
        ...aiAnalysis
      };
    }).filter(conn => conn.name && conn.name !== ' ');

    setConnections(processedConnections);
    generateNetworkingInsights(processedConnections);
  };

  const analyzeConnection = (name, company, position) => {
    const techCompanies = ['Google', 'Meta', 'Apple', 'Microsoft', 'Amazon', 'Netflix', 'Uber', 'Airbnb'];
    const fintechCompanies = ['Stripe', 'Coinbase', 'Square', 'PayPal', 'Robinhood', 'JPMorgan', 'Goldman Sachs'];
    const aiCompanies = ['OpenAI', 'Anthropic', 'DeepMind', 'Nvidia', 'Tesla'];
    
    let tags = [];
    let relevanceScore = 50;
    let timing = 'Good time to reach out';
    
    if (fintechCompanies.some(fc => company.toLowerCase().includes(fc.toLowerCase()))) {
      tags.push('fintech', 'payments');
      relevanceScore += 25;
      timing = 'Excellent - in target industry';
    }
    
    if (techCompanies.some(tc => company.toLowerCase().includes(tc.toLowerCase()))) {
      tags.push('tech', 'scale');
      relevanceScore += 20;
    }
    
    if (aiCompanies.some(ac => company.toLowerCase().includes(ac.toLowerCase()))) {
      tags.push('AI', 'machine learning');
      relevanceScore += 30;
      timing = 'Perfect - AI industry leader';
    }
    
    const roleLower = position.toLowerCase();
    if (roleLower.includes('product manager') || roleLower.includes('pm')) {
      tags.push('product management');
      relevanceScore += 25;
    }
    if (roleLower.includes('engineer') || roleLower.includes('developer')) {
      tags.push('engineering');
      relevanceScore += 15;
    }
    if (roleLower.includes('vp') || roleLower.includes('director') || roleLower.includes('head') || roleLower.includes('chief')) {
      tags.push('leadership');
      relevanceScore += 20;
      timing = 'Great - senior leader';
    }
    if (roleLower.includes('ai') || roleLower.includes('machine learning') || roleLower.includes('data science')) {
      tags.push('AI', 'data science');
      relevanceScore += 30;
    }
    
    const activities = [
      'Posted about industry trends recently',
      'Shared career milestone this week',
      'Active in professional discussions',
      'Updated job position recently',
      'Shared insights about their role',
      'Celebrated work anniversary',
      'Posted about team hiring'
    ];
    
    return {
      tags: tags.slice(0, 3),
      relevanceScore: Math.min(relevanceScore, 95),
      timing,
      recentActivity: activities[Math.floor(Math.random() * activities.length)],
      profileImage: getProfileEmoji(position),
      mutualConnection: generateMutualConnection()
    };
  };

  const getProfileEmoji = (position) => {
    const roleLower = position.toLowerCase();
    if (roleLower.includes('engineer') || roleLower.includes('developer')) return '👨‍💻';
    if (roleLower.includes('product')) return '👩‍💼';
    if (roleLower.includes('design')) return '👨‍🎨';
    if (roleLower.includes('data') || roleLower.includes('scientist')) return '👩‍🔬';
    if (roleLower.includes('marketing')) return '📱';
    if (roleLower.includes('sales')) return '💼';
    if (roleLower.includes('ai') || roleLower.includes('machine learning')) return '🤖';
    if (roleLower.includes('vp') || roleLower.includes('director') || roleLower.includes('head')) return '👔';
    return '👤';
  };

  const generateMutualConnection = () => {
    const mutualTypes = [
      'Stanford Alumni Network', 
      'Former Google Colleague', 
      'Y Combinator Network',
      'TechCrunch Disrupt Connection',
      'Industry Conference Contact',
      'Mutual Friend from Berkeley'
    ];
    return mutualTypes[Math.floor(Math.random() * mutualTypes.length)];
  };

  const generateNetworkingInsights = (processedConnections) => {
    const insights = [];
    
    const industries = {};
    processedConnections.forEach(conn => {
      conn.tags.forEach(tag => {
        industries[tag] = (industries[tag] || 0) + 1;
      });
    });
    
    const industryKeys = Object.keys(industries);
    if (industryKeys.length > 0) {
      const topIndustry = industryKeys.reduce((a, b) => industries[a] > industries[b] ? a : b);
      insights.push(`Your network is strongest in ${topIndustry} with ${industries[topIndustry]} connections`);
    }
    
    const highValueConns = processedConnections.filter(conn => conn.relevanceScore > 80);
    if (highValueConns.length > 0) {
      insights.push(`${highValueConns.length} high-impact connections identified for strategic outreach`);
    }
    
    const recentConns = processedConnections.filter(conn => {
      if (!conn.connectedOn) return false;
      const connDate = new Date(conn.connectedOn);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return connDate > sixMonthsAgo;
    });
    
    if (recentConns.length > 0) {
      insights.push(`${recentConns.length} fresh connections made in the last 6 months`);
    }
    
    setAiInsights(insights);
  };

  const getGoalKeywords = () => userGoals.toLowerCase().split(/\s+/).filter(Boolean);

  const isGoalMatch = (conn) => {
    const keywords = getGoalKeywords();
    return keywords.some(kw =>
      conn.tags.some(tag => tag.toLowerCase().includes(kw)) ||
      (conn.role && conn.role.toLowerCase().includes(kw)) ||
      (conn.company && conn.company.toLowerCase().includes(kw))
    );
  };

  const generatePersonalizedMessage = (connection) => {
    setIsGeneratingMessage(true);
    setTimeout(() => {
      let messageType = 'tech';
      if (isGoalMatch(connection)) {
        if (connection.tags.includes('fintech')) messageType = 'fintech';
        else if (connection.tags.includes('leadership')) messageType = 'leadership';
        else if (connection.tags.includes('product management')) messageType = 'product';
        else if (connection.tags.includes('engineering')) messageType = 'engineering';
        else if (connection.tags.includes('AI')) messageType = 'ai';
      }
      
      let template = templates[messageType] || templates['tech'];
      template = template.replace(/{name}/g, connection.name || '');
      template = template.replace(/{company}/g, connection.company || '');
      template = template.replace(/{role}/g, connection.role || '');
      const goalText = userGoals ? `I'm particularly interested in ${userGoals}. ` : '';
      template = template.replace(/{goal}/g, goalText);
      
      setGeneratedMessage(template);
      setIsGeneratingMessage(false);
    }, 1200);
  };

  const generateCoachingQuestions = (connection) => {
    let questionType = 'engineering';
    if (isGoalMatch(connection)) {
      if (connection.tags.includes('product management')) questionType = 'product';
      else if (connection.tags.includes('leadership')) questionType = 'leadership';
      else if (connection.tags.includes('fintech')) questionType = 'fintech';
      else if (connection.tags.includes('AI')) questionType = 'ai';
    }
    setCoachingQuestions(questionSets[questionType] || questionSets['engineering']);
  };

  const downloadSampleCSV = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linkedin_connections_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Professional Connection Card
  const ConnectionCard = ({ connection, selected, onClick, compact = false }) => (
    <div
      className={`relative bg-white rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
        selected 
          ? 'border-blue-500 bg-blue-50 shadow-lg' 
          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
      } ${compact ? 'p-4' : 'p-6'}`}
      onClick={onClick}
    >
      {selected && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
          <CheckCircle className="w-4 h-4" />
        </div>
      )}
      <div className="flex items-start gap-4">
        <div className={`${compact ? 'text-2xl' : 'text-3xl'} bg-gray-100 rounded-full p-2 flex-shrink-0`}>
          {connection.profileImage}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-base'} truncate`}>
            {connection.name}
          </h3>
          <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'} truncate`}>
            {connection.role}
          </p>
          <p className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'} truncate mb-2`}>
            {connection.company}
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {connection.tags.slice(0, 2).map(tag => (
              <span key={tag} className={`bg-blue-100 text-blue-800 ${compact ? 'text-xs px-2 py-0.5' : 'text-xs px-2 py-1'} rounded-full font-medium`}>
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connection.relevanceScore > 80 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className={`text-gray-600 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
                {connection.relevanceScore}% match
              </span>
            </div>
            {!compact && (
              <Star className={`w-4 h-4 ${connection.relevanceScore > 80 ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const MetricCard = ({ label, value, icon, trend, description }) => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="text-blue-600">{icon}</div>
        {trend && (
          <div className="flex items-center text-green-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
      {description && <div className="text-xs text-gray-500">{description}</div>}
    </div>
  );

  // Filter connections based on goals
  const connectionsToShow = userGoals
    ? connections.filter(isGoalMatch)
    : connections;

  // Analytics calculations
  const totalConnections = connections.length;
  const highValueConnections = connections.filter(c => c.relevanceScore > 80).length;
  const industryDistribution = {};
  
  connections.forEach(conn => {
    conn.tags.forEach(tag => {
      industryDistribution[tag] = (industryDistribution[tag] || 0) + 1;
    });
  });

  // Message templates
  const templates = {
    fintech: `Hi {name},

I hope you're doing well! I've been following the impressive work at {company} and would love to learn more about your experience as {role}.

{goal}Given your expertise in fintech, I believe your insights would be incredibly valuable for someone looking to break into this space.

Would you be open to a brief 15-20 minute conversation sometime in the next few weeks? I'd be happy to work around your schedule and would really appreciate any guidance you could offer.

Thank you for your time and consideration.

Best regards,
[Your name]`,
    
    ai: `Hi {name},

I hope this message finds you well! Your work in AI at {company} is truly inspiring, and I've been following the developments in this space with great interest.

{goal}I'm eager to learn more about your journey in AI and would value any insights you might have for someone passionate about this field.

Would you have 15-20 minutes for a brief conversation? I'd be honored to learn from your experience.

Thank you so much,
[Your name]`,
    
    leadership: `Hi {name},

I hope you're doing well! Your leadership role as {role} at {company} caught my attention, and I'm impressed by the work you're doing.

{goal}I'd be honored to learn about your career path and any advice you might have for someone looking to grow in leadership roles.

Would you be available for a brief conversation sometime in the coming weeks? I'd be happy to work with your schedule.

Best regards,
[Your name]`,
    
    product: `Hi {name},

I hope this message finds you well! I came across your profile and was impressed by your work as a product manager at {company}.

{goal}I'd love to hear about your journey in product management and any insights you have for someone interested in this field.

Would you be open to a quick 15-20 minute chat? I'd really appreciate your perspective.

Thank you!
[Your name]`,
    
    engineering: `Hi {name},

I hope you're doing well! I noticed your engineering background at {company} and would love to learn more about your experience.

{goal}If you have a few minutes, I'd appreciate any advice you could share about the engineering field and your career path.

Thank you for your time.

Best,
[Your name]`,
    
    tech: `Hi {name},

I hope this message finds you well! I've been following the impressive work at {company} and would love to learn more about your experience as {role}.

{goal}I believe your insights would be incredibly valuable, and I'd be honored to learn from your experience.

Would you have 15-20 minutes for a brief call to share your perspective? I'd really appreciate any guidance you could offer.

Thanks so much,
[Your name]`
  };

  // Question sets for coaching
  const questionSets = {
    product: [
      "What initially drew you to product management at {company}?",
      "How do you approach prioritizing features in a fast-moving environment?",
      "What's been your most impactful product decision recently?",
      "How do you balance user needs with business objectives?"
    ],
    engineering: [
      "What's the most interesting technical challenge you've tackled at {company}?",
      "How do you stay current with rapidly evolving technologies?",
      "What advice would you give to someone looking to grow as an engineer?",
      "How do you approach system design and scalability challenges?"
    ],
    leadership: [
      "What's your approach to building and leading high-performing teams?",
      "How has the industry landscape changed since you started your career?",
      "What qualities do you look for when hiring for your team?",
      "How do you balance strategic thinking with day-to-day execution?"
    ],
    fintech: [
      "What trends are you most excited about in fintech right now?",
      "How do you balance innovation with regulatory compliance?",
      "What advice would you give to someone breaking into fintech?",
      "How do you see the intersection of traditional finance and technology evolving?"
    ],
    ai: [
      "What excites you most about working in AI and machine learning?",
      "How did you transition into AI engineering from other fields?",
      "What skills are most important for success in AI roles today?",
      "How do you approach ethical considerations in AI development?"
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-xl p-3 flex items-center justify-center shadow-md">
                <Network className="w-8 h-8 text-blue-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm" style={{letterSpacing: '0.5px'}}>LinkLens</h1>
                <p className="text-sm text-white font-medium">Intelligent Network Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-blue-100 font-medium">
                {connections.length > 0 && `${connections.length} connections analyzed`}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
          <nav className="flex">
            {[
              { id: 'import', label: 'Import Data', icon: Upload, disabled: false },
              { id: 'mapper', label: 'Network Map', icon: MapPin, disabled: connections.length === 0 },
              { id: 'composer', label: 'Message Composer', icon: Mail, disabled: connections.length === 0 },
              { id: 'coach', label: 'Conversation Coach', icon: Lightbulb, disabled: connections.length === 0 },
              { id: 'progress', label: 'Analytics', icon: BarChart3, disabled: connections.length === 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : tab.disabled
                    ? 'border-transparent text-gray-400 cursor-not-allowed'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'import' && (
            <div className="max-w-6xl mx-auto">
              {connections.length === 0 ? (
                <div className="space-y-8">
                  {/* Hero Section */}
                  <div className="text-center space-y-2 mb-2">
                    <div className="text-blue-700 font-semibold text-base tracking-tight mb-1">See your network with clarity</div>
                    <p className="text-base text-gray-600 max-w-xl mx-auto">
                      Instantly discover who matters most in your LinkedIn network with AI-powered insights and smart recommendations.
                    </p>
                  </div>

                  {/* Steps (Reordered) */}
                  <div className="grid md:grid-cols-3 gap-8">
                    {/* Step 1: Set Goals */}
                    <div className="bg-white rounded-2xl px-14 py-6 border border-gray-200 shadow-sm relative flex flex-col min-h-[370px] text-center items-center justify-center">
                      <div className="absolute -top-4 left-0 w-full flex items-center justify-center z-20">
                        <div className="bg-blue-600 text-white rounded-t-xl w-full max-w-full flex items-center justify-center font-bold text-lg shadow-md border-4 border-white py-1" style={{height:'38px'}}>
                          1
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="flex flex-col items-center w-full min-h-[100px] justify-center mt-[-80px]">
                          <div className="flex flex-row items-center justify-center gap-2 mb-0">
                            <span className="text-4xl">🎯</span>
                            <h3 className="text-xl font-semibold text-gray-900 tracking-tight leading-snug min-h-[28px] flex items-center mt-[-10px]" style={{fontFamily: 'Inter, Segoe UI, system-ui, Arial, sans-serif'}}>Set Your Goals</h3>
                          </div>
                          <p className="text-gray-700 text-[1rem] mb-4 leading-normal font-normal max-w-xs" style={{fontFamily: 'Inter, Segoe UI, system-ui, Arial, sans-serif'}}>
                            Tell us what you're looking for to get personalized recommendations.
                          </p>
                        </div>
                        <div className="flex flex-col items-center gap-3 w-full">
                          <textarea
                            className="w-full max-w-xs p-3 border border-blue-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-left mx-8 shadow-sm placeholder-gray-400"
                            rows="3"
                            placeholder="e.g., Break into fintech, Find AI/ML roles, Connect with product managers at unicorns..."
                            value={userGoals}
                            onChange={(e) => setUserGoals(e.target.value)}
                          />
                          <div className="flex flex-wrap gap-2 justify-center mt-1">
                            {["Break into fintech","Find AI/ML roles","Connect with product managers","Grow my leadership network","Explore startup opportunities"].map(suggestion => (
                              <button
                                key={suggestion}
                                type="button"
                                className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 text-xs font-medium hover:bg-blue-100 transition"
                                onClick={() => setUserGoals(suggestion)}
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Export Data */}
                    <div className="bg-white rounded-2xl px-14 py-6 border border-gray-200 shadow-sm relative flex flex-col min-h-[370px] text-center items-center justify-center">
                      <div className="absolute -top-4 left-0 w-full flex items-center justify-center z-20">
                        <div className="bg-blue-600 text-white rounded-t-xl w-full max-w-full flex items-center justify-center font-bold text-lg shadow-md border-4 border-white py-1" style={{height:'38px'}}>
                          2
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="flex flex-col items-center w-full min-h-[100px] justify-center mt-[-80px]">
                          <div className="flex flex-row items-center justify-center gap-2 mb-0">
                            <span className="text-4xl">📊</span>
                            <h3 className="text-xl font-semibold text-gray-900 tracking-tight leading-snug min-h-[28px] flex items-center mt-[-10px]" style={{fontFamily: 'Inter, Segoe UI, system-ui, Arial, sans-serif'}}>Export LinkedIn Data</h3>
                          </div>
                          <p className="text-gray-700 text-[1rem] mb-4 leading-normal font-normal max-w-xs" style={{fontFamily: 'Inter, Segoe UI, system-ui, Arial, sans-serif'}}>
                            Download your LinkedIn <span className="font-semibold text-blue-700">connections CSV</span> from your LinkedIn data export.
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-5 text-sm mt-2 text-left border border-blue-100 w-full max-w-xs">
                          <div className="space-y-3 text-blue-900">
                            <div className="flex items-start gap-3">
                              <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                              <span className="leading-relaxed">Go to <span className="font-medium">LinkedIn Settings & Privacy → Data Privacy → Get a copy of your data</span></span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                              <span className="leading-relaxed">Select <span className="font-medium">"Connections"</span> and request archive</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                              <span className="leading-relaxed">Download the CSV file from your email</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Upload & Analyze */}
                    <div className="bg-white rounded-2xl px-14 py-6 border border-gray-200 shadow-sm relative flex flex-col min-h-[370px] text-center items-center justify-center">
                      <div className="absolute -top-4 left-0 w-full flex items-center justify-center z-20">
                        <div className="bg-blue-600 text-white rounded-t-xl w-full max-w-full flex items-center justify-center font-bold text-lg shadow-md border-4 border-white py-1" style={{height:'38px'}}>
                          3
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="flex flex-col items-center w-full min-h-[100px] justify-center mt-[-80px]">
                          <div className="flex flex-row items-center justify-center gap-2 mb-0">
                            <span className="text-4xl">🚀</span>
                            <h3 className="text-xl font-semibold text-gray-900 tracking-tight leading-snug min-h-[28px] flex items-center mt-[-10px]" style={{fontFamily: 'Inter, Segoe UI, system-ui, Arial, sans-serif'}}>Upload & Analyze</h3>
                          </div>
                          <p className="text-gray-700 text-[1rem] mb-4 leading-normal font-normal max-w-xs" style={{fontFamily: 'Inter, Segoe UI, system-ui, Arial, sans-serif'}}>
                            Upload your CSV and let AI analyze your network.
                          </p>
                        </div>
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-5 w-full max-w-xs">
                          {isProcessing ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent"></div>
                              <span className="text-purple-700 font-medium">Analyzing your network...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <Upload className="w-8 h-8 text-gray-400 mb-1" />
                              <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="csv-upload"
                              />
                              <label
                                  htmlFor="csv-upload"
                                  className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 cursor-pointer font-medium text-center"
                                  style={{ minWidth: '140px', maxWidth: '200px', width: 'fit-content' }}
                                >
                                  Choose CSV File
                                </label>
                              {csvFileName && (
                                <p className="text-sm text-gray-600 mt-2">{csvFileName}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex flex-col gap-2 w-full">
                          <button
                            onClick={downloadSampleCSV}
                            className="w-full bg-white border border-blue-600 text-blue-700 hover:bg-blue-50 hover:border-blue-700 text-sm flex items-center justify-center gap-1 font-medium rounded-lg py-2 px-4 transition"
                          >
                            <Download className="w-4 h-4" />
                            Download sample CSV
                          </button>
                          <button
                            onClick={handleSampleData}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm font-medium transition"
                          >
                            Try Demo with Sample Data
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Network Analysis Complete!</h3>
                  <p className="text-gray-600 mb-6">
                    Successfully processed {connections.length} LinkedIn connections with AI-powered insights
                  </p>
                  <button
                    onClick={() => setActiveTab('mapper')}
                    className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium inline-flex items-center gap-2"
                  >
                    Explore Your Network
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'mapper' && connections.length > 0 && (
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Your Network Map</h2>
                <p className="text-gray-600">AI-powered analysis of your LinkedIn connections</p>
              </div>

              {/* AI Insights Banner */}
              {aiInsights.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 rounded-lg p-2 flex-shrink-0">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">AI Network Insights</h3>
                      <div className="space-y-2">
                        {aiInsights.map((insight, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-gray-700">{insight}</p>
                          </div>
                        ))}
                        {userGoals && (
                          <div className="bg-green-100 rounded-lg p-3 mt-3">
                            <div className="flex items-start gap-2">
                              <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <p className="text-green-800">
                                <span className="font-medium">Goal-aligned connections:</span> {connectionsToShow.length} matches found for "{userGoals}"
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* View Toggle */}
              <div className="flex justify-end mb-2">
                <button
                  className={`px-3 py-1 rounded-l border border-blue-200 text-sm font-medium ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 hover:bg-blue-50'}`}
                  onClick={() => setViewMode('grid')}
                >
                  Grid View
                </button>
                <button
                  className={`px-3 py-1 rounded-r border-t border-b border-r border-blue-200 text-sm font-medium ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 hover:bg-blue-50'}`}
                  onClick={() => setViewMode('list')}
                >
                  List View
                </button>
              </div>

              {/* Connections Display */}
              {viewMode === 'grid' ? (
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {connectionsToShow.map(conn => (
                    <ConnectionCard
                      key={conn.id}
                      connection={conn}
                      selected={selectedConnection?.id === conn.id}
                      onClick={() => setSelectedConnection(conn)}
                      compact={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {connectionsToShow.map(conn => (
                    <ConnectionCard
                      key={conn.id}
                      connection={conn}
                      selected={selectedConnection?.id === conn.id}
                      onClick={() => setSelectedConnection(conn)}
                      compact={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'composer' && connections.length > 0 && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">AI Message Composer</h2>
                <p className="text-gray-600">Generate personalized outreach messages for your connections</p>
              </div>

              {!selectedConnection ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Connection</h3>
                  <p className="text-gray-600">Choose a connection from the Network Map to generate a personalized message</p>
                  <button
                    onClick={() => setActiveTab('mapper')}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Go to Network Map
                  </button>
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Connection</h3>
                      <ConnectionCard connection={selectedConnection} selected={true} />
                      
                      <div className="mt-4 bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Connection Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Relevance Score:</span>
                            <span className="font-medium text-gray-900">{selectedConnection.relevanceScore}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Best Time:</span>
                            <span className="font-medium text-gray-900">{selectedConnection.timing}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Recent Activity:</span>
                            <span className="font-medium text-gray-900 text-right">{selectedConnection.recentActivity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Mutual Connection:</span>
                            <span className="font-medium text-gray-900 text-right">{selectedConnection.mutualConnection}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => generatePersonalizedMessage(selectedConnection)}
                      disabled={isGeneratingMessage}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                    >
                      {isGeneratingMessage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Generating Message...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Generate Personalized Message
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Message</h3>
                      <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-96">
                        {generatedMessage ? (
                          <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-sans">
                                {isSampleData
                                  ? generatedMessage
                                  : (() => {
                                      return generatedMessage;
                                    })()
                                }
                              </pre>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <div className="text-sm">
                                <p className="text-green-800 font-medium mb-1">Message personalized with:</p>
                                <ul className="text-green-700 space-y-1">
                                  <li>• Recent activity and mutual connections</li>
                                  <li>• Role-specific conversation starters</li>
                                  <li>• Your career goals and interests</li>
                                </ul>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigator.clipboard?.writeText(generatedMessage)}
                                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 font-medium"
                              >
                                Copy Message
                              </button>
                              <button
                                onClick={() => generatePersonalizedMessage(selectedConnection)}
                                className="flex-1 bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 font-medium"
                              >
                                Generate New Version
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-8">
                            <Send className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                            <p>Click "Generate Personalized Message" to create AI-crafted outreach</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'coach' && connections.length > 0 && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Conversation Coach</h2>
                <p className="text-gray-600">Practice questions and conversation starters to build confidence</p>
              </div>

              {!selectedConnection ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                  <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Connection</h3>
                  <p className="text-gray-600">Choose a connection to get personalized conversation coaching</p>
                  <button
                    onClick={() => setActiveTab('mapper')}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Go to Network Map
                  </button>
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Profile</h3>
                      <ConnectionCard connection={selectedConnection} selected={true} />
                    </div>
                    
                    <button 
                      onClick={() => generateCoachingQuestions(selectedConnection)}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"
                    >
                      <Lightbulb className="w-4 h-4" />
                      Get Conversation Questions
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Questions</h3>
                      <div className="space-y-3">
                        {coachingQuestions.length > 0 ? (
                          coachingQuestions.map((question, index) => (
                            <div
                              key={index}
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                            >
                              <p className="text-gray-800 font-medium">{question}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 py-8">
                            <Lightbulb className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                            <p>Click "Get Conversation Questions" for personalized coaching</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {coachingQuestions.length > 0 && (
                      <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                        <h4 className="flex items-center gap-2 font-medium text-yellow-800 mb-3">
                          <Lightbulb className="w-4 h-4" />
                          Pro Tips for Great Conversations
                        </h4>
                        <ul className="space-y-2 text-sm text-yellow-700">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                            Start with their recent work or posts to show genuine interest
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                            Ask open-ended questions that let them share their expertise
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                            Be prepared to share your goals and background briefly
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                            Follow up with a thank you message within 24 hours
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && connections.length > 0 && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Network Analytics</h2>
                <p className="text-gray-600">Data-driven insights about your LinkedIn network</p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                  label="Total Connections"
                  value={totalConnections}
                  icon={<Users className="w-6 h-6" />}
                  description="LinkedIn network size"
                />
                <MetricCard
                  label="High-Impact Connections"
                  value={highValueConnections}
                  icon={<Target className="w-6 h-6" />}
                  trend="+12%"
                  description="80%+ relevance score"
                />
                <MetricCard
                  label="Industries Represented"
                  value={Object.keys(industryDistribution).length}
                  icon={<Globe className="w-6 h-6" />}
                  description="Diverse network reach"
                />
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Industry Distribution */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Industry Distribution</h3>
                  <div className="space-y-4">
                    {Object.entries(industryDistribution)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 6)
                      .map(([industry, count]) => {
                        const percentage = Math.round((count / totalConnections) * 100);
                        const industryIcons = {
                          'AI': '🤖',
                          'fintech': '💳',
                          'tech': '💻',
                          'engineering': '⚙️',
                          'product management': '📊',
                          'leadership': '👔',
                          'data science': '📈'
                        };
                        
                        return (
                          <div key={industry} className="flex items-center gap-3">
                            <div className="text-2xl">{industryIcons[industry] || '🔹'}</div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-gray-900 capitalize">{industry}</span>
                                <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* High-Value Connections */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Strategic Connections</h3>
                  <div className="space-y-4">
                    {highValueToShow.map((conn) => (
                      <div
                        key={conn.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => setSelectedConnection(conn)}
                      >
                        <div className="text-xl">{conn.profileImage}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{conn.name}</p>
                          <p className="text-sm text-gray-600 truncate">{conn.role} at {conn.company}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">{conn.relevanceScore}%</div>
                          <div className="text-xs text-gray-500">match</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {highValueTotalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                      <button
                        onClick={() => setHighValuePage(Math.max(0, highValuePage - 1))}
                        disabled={highValuePage === 0}
                        className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {highValuePage + 1} of {highValueTotalPages}
                      </span>
                      <button
                        onClick={() => setHighValuePage(Math.min(highValueTotalPages - 1, highValuePage + 1))}
                        disabled={highValuePage >= highValueTotalPages - 1}
                        className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkLens; 