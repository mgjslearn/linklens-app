import './App.css';
import React, { useState } from 'react';
import { Network, MessageCircle, Clock, Users, TrendingUp, Send, MapPin, Target, Lightbulb, CheckCircle, Mail, Upload, Download } from 'lucide-react';
import Papa from 'papaparse';

const AINetworkingPathfinder = () => {

  // CSV sample for download and demo
  const sampleCSV = `First Name,Last Name,Email Address,Company,Position,Connected On\nJohn,Doe,john@example.com,Google,Software Engineer,2022-01-15\nJane,Smith,jane@example.com,Meta,Product Manager,2021-11-10`;

  // AI Insights state
  const [aiInsights, setAiInsights] = useState([]);

  // File upload state
  const [csvFileName, setCsvFileName] = useState('');


  // Core state (must be before any code that uses connections)
  const [activeTab, setActiveTab] = useState('import');
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [coachingQuestions, setCoachingQuestions] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // High-value connections paging state (now safe to use connections)
  const [highValuePage, setHighValuePage] = useState(0);
  const highValuePageSize = 6;
  const highValueConnectionsArr = connections.filter(c => c.relevanceScore > 80);
  const highValueTotalPages = Math.ceil(highValueConnectionsArr.length / highValuePageSize);
  const highValueToShow = highValueConnectionsArr.slice(highValuePage * highValuePageSize, (highValuePage + 1) * highValuePageSize);

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      // Find the line with the actual header
      const lines = text.split(/\r?\n/);
      let headerIndex = lines.findIndex(line => line.includes('First Name') && line.includes('Last Name'));
      if (headerIndex === -1) headerIndex = 0; // fallback
      const csvContent = lines.slice(headerIndex).join('\n');
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          setConnections(results.data);
          processLinkedInData(results.data);
          setIsProcessing(false);
        },
        error: (error) => {
          setIsProcessing(false);
        }
      });
    };
    reader.readAsText(file);
  };
  const [userGoals, setUserGoals] = useState('');


  const processLinkedInData = (data) => {
    // Enhanced AI processing of LinkedIn data
    const processedConnections = data.map((contact, index) => {
      const fullName = `${contact['First Name'] || ''} ${contact['Last Name'] || ''}`.trim();
      const company = contact['Company'] || contact['Organization'] || '';
      const position = contact['Position'] || contact['Job Title'] || '';
      const email = contact['Email Address'] || contact['Email'] || '';
      
      // AI-generated insights based on role and company
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
    }).filter(conn => conn.name && conn.name !== ' '); // Filter out empty entries

    setConnections(processedConnections);
    generateNetworkingInsights(processedConnections);
  };

  const analyzeConnection = (name, company, position) => {
    // AI analysis based on company and role
    const techCompanies = ['Google', 'Meta', 'Apple', 'Microsoft', 'Amazon', 'Netflix', 'Uber', 'Airbnb'];
    const fintechCompanies = ['Stripe', 'Coinbase', 'Square', 'PayPal', 'Robinhood', 'JPMorgan', 'Goldman Sachs'];
    const aiCompanies = ['OpenAI', 'Anthropic', 'DeepMind', 'Nvidia', 'Tesla'];
    
    let tags = [];
    let relevanceScore = 50;
    let timing = 'Good time to reach out';
    
    // Company-based analysis
    if (fintechCompanies.some(fc => company.toLowerCase().includes(fc.toLowerCase()))) {
      tags.push('fintech', 'payments');
      relevanceScore += 20;
      timing = 'Excellent - in target industry';
    }
    
    if (techCompanies.some(tc => company.toLowerCase().includes(tc.toLowerCase()))) {
      tags.push('tech', 'scale');
      relevanceScore += 15;
    }
    
    if (aiCompanies.some(ac => company.toLowerCase().includes(ac.toLowerCase()))) {
      tags.push('AI', 'machine learning');
      relevanceScore += 25;
      timing = 'Perfect - AI industry leader';
    }
    
    // Role-based analysis
    const roleLower = position.toLowerCase();
    if (roleLower.includes('product manager') || roleLower.includes('pm')) {
      tags.push('product management');
      relevanceScore += 20;
    }
    if (roleLower.includes('engineer') || roleLower.includes('developer')) {
      tags.push('engineering');
      relevanceScore += 10;
    }
    if (roleLower.includes('vp') || roleLower.includes('director') || roleLower.includes('head')) {
      tags.push('leadership');
      relevanceScore += 15;
      timing = 'Great - senior leader';
    }
    if (roleLower.includes('ai') || roleLower.includes('machine learning') || roleLower.includes('data science')) {
      tags.push('AI', 'data science');
      relevanceScore += 25;
    }
    
    // Generate realistic activities
    const activities = [
      'Posted about industry trends recently',
      'Shared career milestone this week',
      'Commented on fintech developments',
      'Updated job position recently',
      'Active in professional discussions',
      'Shared insights about their role',
      'Celebrated work anniversary',
      'Posted about team hiring'
    ];
    
    return {
      tags: tags.slice(0, 3), // Limit to 3 most relevant tags
      relevanceScore: Math.min(relevanceScore, 98),
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
    return '👤';
  };

  const generateMutualConnection = () => {
    const mutualTypes = [
      'Alumni Network', 
      'Former Colleague', 
      'Industry Contact',
      'Conference Connection',
      'LinkedIn Network',
      'Mutual Friend'
    ];
    return mutualTypes[Math.floor(Math.random() * mutualTypes.length)];
  };

  const generateNetworkingInsights = (processedConnections) => {
    const insights = [];
    // Industry analysis
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
    
    // High-value connections
    const highValueConns = processedConnections.filter(conn => conn.relevanceScore > 80);
    if (highValueConns.length > 0) {
      insights.push(`${highValueConns.length} high-value connections (80%+ relevance) identified`);
    }
    
    // Recent connections
    const recentConns = processedConnections.filter(conn => {
      if (!conn.connectedOn) return false;
      const connDate = new Date(conn.connectedOn);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return connDate > sixMonthsAgo;
    });
    
    if (recentConns.length > 0) {
      insights.push(`${recentConns.length} connections made in the last 6 months`);
    }
    
    setAiInsights(insights);
  };

  // --- Message Composer ---
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
      // Fill in placeholders
      template = template.replace(/{name}/g, connection.name || '');
      template = template.replace(/{company}/g, connection.company || '');
      template = template.replace(/{role}/g, connection.role || '');
      const goalText = userGoals ? `I'm especially interested in ${userGoals}. ` : '';
      template = template.replace(/{goal}/g, goalText);
      // Add recent activity and mutual connection if available
      if (connection.recentActivity) {
        template += `\n\nRecent activity: ${connection.recentActivity}`;
      }
      if (connection.mutualConnection) {
        template += `\nMutual connection: ${connection.mutualConnection}`;
      }
      setGeneratedMessage(template);
      setIsGeneratingMessage(false);
    }, 800);
  };

  // --- Conversation Coach ---
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

  // --- ConnectionCard component ---
  function ConnectionCard({ connection, selected, onClick }) {
    return (
      <button
        className={`ConnectionCard${selected ? ' selected' : ''}`}
        aria-selected={selected}
        tabIndex={0}
        onClick={onClick}
        style={{
          border: selected ? '2.5px solid #2d7ff9' : '1.5px solid #e3e8f0',
          background: selected ? '#eaf1fb' : '#fff',
          boxShadow: selected ? '0 0 0 3px #b3c6e0' : '0 2px 12px rgba(24,69,122,0.07)',
          transition: 'all 0.2s',
          marginBottom: '1.5rem',
          borderRadius: '1rem',
          padding: '1.5rem 2rem',
          cursor: 'pointer',
          outline: selected ? '2px solid #2d7ff9' : 'none',
          display: 'block',
          width: '100%'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '2.5rem', marginRight: '1rem' }}>{connection.profileImage}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '1.15rem', color: '#18457a' }}>{connection.name}</div>
            <div style={{ fontSize: '1rem', color: '#555' }}>{connection.role}</div>
            <div style={{ fontSize: '0.9rem', color: '#888' }}>{connection.company}</div>
          </div>
          {selected && (
            <span style={{ color: '#2d7ff9', fontSize: '1.5rem', marginLeft: '0.5rem' }} aria-label="Selected">✓</span>
          )}
        </div>
      </button>
    );
  }

  // --- ConversationQuestionCard component ---
  function ConversationQuestionCard({ question }) {
    return (
      <div
        className="question-card"
        style={{
          background: '#fff',
          border: '1.5px solid #e3e8f0',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 6px rgba(24,69,122,0.06)',
          padding: '1rem 1.5rem',
          marginBottom: '1rem',
          fontWeight: 500,
          color: '#18457a',
          fontSize: '1.05rem',
          transition: 'box-shadow 0.2s',
        }}
        tabIndex={0}
      >
        {question}
      </div>
    );
  }

  // --- MetricCard component ---
  function MetricCard({ label, value, icon }) {
    return (
      <div
        className="metric-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: '#fff',
          borderRadius: '1rem',
          boxShadow: '0 2px 12px rgba(24,69,122,0.07)',
          padding: '1.25rem 1.5rem',
          border: '1.5px solid #e3e8f0',
          marginBottom: '1rem',
          minWidth: '180px',
        }}
      >
        <span style={{ color: '#2d7ff9', fontSize: '2rem' }}>{icon}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#18457a' }}>{value}</div>
          <div style={{ fontSize: '0.95rem', color: '#888' }}>{label}</div>
        </div>
      </div>
    );
  }

  // --- In your main render, use the new components ---
  // Example for Connection Mapper:
  const connectionsToShow = userGoals
  ? connections.filter(c => {
      const keywords = userGoals.toLowerCase().split(/\s+/).filter(Boolean);
      return keywords.some(kw =>
        c.tags.some(tag => tag.toLowerCase().includes(kw)) ||
        (c.role && c.role.toLowerCase().includes(kw)) ||
        (c.company && c.company.toLowerCase().includes(kw))
      );
    })
  : connections;

  // Example for Analytics:
  const totalConnections = connections.length;
  const highValueConnections = connections.filter(c => c.relevanceScore > 80).length;
  const industryDistribution = {};
  
  connections.forEach(conn => {
    conn.tags.forEach(tag => {
      industryDistribution[tag] = (industryDistribution[tag] || 0) + 1;
    });
  });

  // Message templates for generatePersonalizedMessage
  const templates = {
    fintech: `Hi {name},\n\nI hope you're doing well! I noticed you're doing excellent work at {company} in {role}.\n\nGiven your experience in fintech and my interest in breaking into the industry, I'd love to learn more about your journey and any insights you might have.\n\nWould you be open to a brief 15-20 minute conversation sometime in the next few weeks? I'd be happy to work around your schedule.\n\nBest regards,\n[Your name]`,
    tech: `Hi {name},\n\nI hope this message finds you well! I've been following the impressive work at {company} and would love to learn more about your experience as {role}.\n\n{goal}I believe your insights would be incredibly valuable.\n\nWould you have 15-20 minutes for a brief call to share your perspective? I'd really appreciate any guidance you could offer.\n\nThanks so much,\n[Your name]`,
    leadership: `Hi {name},\n\nI hope you're doing well! Your leadership role as {role} at {company} is really inspiring.\n\n{goal}I'd be honored to learn about your career path and any advice you might have for someone looking to grow in this space.\n\nWould you be available for a brief conversation sometime in the coming weeks? I'd be happy to work with your schedule.\n\nBest,\n[Your name]`,
    product: `Hi {name},\n\nI came across your profile and was impressed by your work as a product manager at {company}.\n\n{goal}I'd love to hear about your journey and any tips you have for someone interested in product management.\n\nWould you be open to a quick chat?\n\nThank you!\n[Your name]`,
    engineering: `Hi {name},\n\nI noticed your engineering background at {company} and would love to learn more about your experience.\n\n{goal}If you have a few minutes, I'd appreciate any advice you could share.\n\nBest,\n[Your name]`,
    ai: `Hi {name},\n\nYour work in AI at {company} is inspiring!\n\n{goal}I'm eager to learn more about your path and any recommendations you have for someone interested in AI engineering.\n\nWould you be open to a brief conversation?\n\nThanks,\n[Your name]`
  };

  // Question sets for generateCoachingQuestions
  const questionSets = {
    product: [
      "What drew you to product management at {company}?",
      "How do you approach prioritizing features in a fast-moving environment?",
      "What's been your most impactful product decision recently?"
    ],
    engineering: [
      "What's the most interesting technical challenge you've tackled at {company}?",
      "How do you stay current with new technologies in your field?",
      "What advice would you give to someone looking to grow as an engineer?"
    ],
    leadership: [
      "What's your approach to building and leading high-performing teams?",
      "How has the industry changed since you started your career?",
      "What qualities do you look for when hiring for your team?"
    ],
    fintech: [
      "What trends are you most excited about in fintech right now?",
      "How do you balance innovation with regulatory requirements?",
      "What advice would you give to someone breaking into fintech?"
    ],
    ai: [
      "What excites you most about working in AI?",
      "How did you get started in AI engineering?",
      "What skills are most important for success in AI roles?"
    ]
  };

  // Top-level wrapper
  return (
    <div className="App">
      <header>
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Network className="w-8 h-8 text-blue-600" />
          <h1>LinkLens</h1>
          <span className="text-2xl">�</span>
        </div>
        <p className="text-blue-700 font-semibold italic">See your network with clarity</p>
      </header>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <nav>
          <button
            className={
              `tab-btn${activeTab === 'import' ? ' active' : ''}`
            }
            onClick={() => setActiveTab('import')}
          >
            <Upload className="w-4 h-4" />
            <span>Import Data</span>
          </button>
          <button
            className={
              `tab-btn${activeTab === 'mapper' ? ' active' : ''}`
            }
            onClick={() => setActiveTab('mapper')}
            disabled={connections.length === 0}
          >
            <MapPin className="w-4 h-4" />
            <span>Connection Mapper</span>
          </button>
          <button
            className={
              `tab-btn${activeTab === 'composer' ? ' active' : ''}`
            }
            onClick={() => setActiveTab('composer')}
            disabled={connections.length === 0}
          >
            <Mail className="w-4 h-4" />
            <span>Message Composer</span>
          </button>
          <button
            className={
              `tab-btn${activeTab === 'coach' ? ' active' : ''}`
            }
            onClick={() => setActiveTab('coach')}
            disabled={connections.length === 0}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Conversation Coach</span>
          </button>
          <button
            className={
              `tab-btn${activeTab === 'progress' ? ' active' : ''}`
            }
            onClick={() => setActiveTab('progress')}
            disabled={connections.length === 0}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        </nav>
        <div className="p-6">
          {activeTab === 'import' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-extrabold text-blue-900 mb-2 flex items-center justify-center gap-2">🔎 Welcome to LinkLens</h2>
                <p className="text-blue-700 font-semibold italic mb-4 import-subtitle-centered">See your network with clarity</p>
              </div>

              {connections.length === 0 ? (
                <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row gap-8 items-stretch justify-center onboarding-stepper-horizontal">
                  {/* Step 1: Export */}
                  <div className="flex-1 min-w-[260px] max-w-sm mx-auto bg-white rounded-2xl shadow-xl border border-blue-100 flex flex-col items-center px-7 py-10 mb-4 relative step-card group transition-all hover:shadow-2xl">
                    <div className="step-number-badge flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 shadow-lg border-4 border-white">
                      <span className="text-white text-lg font-bold">1</span>
                    </div>
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4 mt-2">
                      <span className="text-4xl">📋</span>
                    </div>
                    <div className="step-card-title">Export Connections</div>
                    <div className="step-card-subtitle">Download your LinkedIn connections CSV from LinkedIn’s settings.</div>
                    <hr className="step-card-divider" />
                    <ol className="step-card-list step-card-list-centered">
                      <li><span className="step-card-step">1.</span> Go to <b>LinkedIn.com → Settings & Privacy → Data Privacy → Get a copy of your data</b></li>
                      <li><span className="step-card-step">2.</span> Select <b>"Connections"</b> from the list</li>
                      <li><span className="step-card-step">3.</span> Click <b>"Request archive"</b></li>
                      <li><span className="step-card-step">4.</span> LinkedIn will email you a ZIP file with your connections CSV</li>
                    </ol>
                  </div>
                  {/* Step 2: Set Goals */}
                  <div className="flex-1 min-w-[260px] max-w-sm mx-auto bg-white rounded-2xl shadow-xl border border-green-100 flex flex-col items-center px-7 py-10 mb-4 relative step-card group transition-all hover:shadow-2xl">
                    <div className="step-number-badge flex items-center justify-center w-12 h-12 rounded-full bg-green-600 shadow-lg border-4 border-white">
                      <span className="text-white text-lg font-bold">2</span>
                    </div>
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4 mt-2">
                      <span className="text-4xl">🎯</span>
                    </div>
                    <div className="step-card-title">Set Your Goals <span className="text-xs font-normal text-green-700">(Optional)</span></div>
                    <div className="step-card-subtitle">What do you want to achieve? (e.g., Break into fintech, Connect with AI leaders)</div>
                    <hr className="step-card-divider" />
                    <textarea
                      className="w-full step-card-textarea"
                      rows="3"
                      placeholder="e.g., Break into fintech, Find product management roles, Connect with AI researchers..."
                      value={userGoals}
                      onChange={(e) => setUserGoals(e.target.value)}
                    />
                  </div>
                  {/* Step 3: Upload */}
                  <div className="flex-1 min-w-[260px] max-w-sm mx-auto bg-white rounded-2xl shadow-xl border border-purple-100 flex flex-col items-center px-7 py-10 mb-4 relative step-card group transition-all hover:shadow-2xl" style={{alignItems:'center',justifyContent:'flex-start'}}>
                    <div className="step-number-badge flex items-center justify-center w-12 h-12 rounded-full bg-purple-600 shadow-lg border-4 border-white">
                      <span className="text-white text-lg font-bold">3</span>
                    </div>
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-50 mb-4 mt-2">
                      <span className="text-4xl">📤</span>
                    </div>
                    <div className="step-card-title" style={{ color: '#7c3aed' }}>Upload CSV</div>
                    <div className="step-card-subtitle" style={{ color: '#7c3aed' }}>Import your LinkedIn connections CSV file to LinkLens.</div>
                    <hr className="step-card-divider" style={{ borderTopColor: '#e9d5ff' }} />
                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 w-full text-center mb-2 bg-white transition-all group-hover:border-purple-500 flex flex-col items-center justify-center" style={{minHeight:'120px'}}>
                      {isProcessing ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
                          <span className="text-purple-700">Processing your LinkedIn data...</span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                          <p className="text-purple-700 mb-2 text-xs">Drag and drop your CSV file here, or click to browse</p>
                          <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="block mx-auto mb-2"
                            id="csv-upload"
                            style={{display:'none'}}
                          />
                          <label
                            htmlFor="csv-upload"
                            className="bg-purple-600 text-white py-1 px-4 rounded-lg hover:bg-purple-700 cursor-pointer inline-block text-xs mb-2"
                            style={{minWidth:'120px',textAlign:'center'}}>
                            Choose CSV File
                          </label>
                          <div className="text-xs text-gray-500 mb-1" style={{textAlign:'center',width:'100%'}}>{csvFileName ? csvFileName : 'No file chosen'}</div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={downloadSampleCSV}
                      className="text-purple-600 hover:text-purple-700 text-xs flex items-center justify-center space-x-1 mx-auto mb-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download sample CSV</span>
                    </button>
                    <div className="text-center mt-2">
                      <p className="text-gray-600 text-xs mb-2">No data yet? Try the demo:</p>
                      <button
                        onClick={() => processLinkedInData(Papa.parse(sampleCSV, { header: true }).data)}
                        className="bg-gray-600 text-white py-1 px-4 rounded-lg hover:bg-gray-700 text-xs"
                      >
                        🚀 Try Demo
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">✅ Data Successfully Imported!</h3>
                  <p className="text-gray-600 mb-4">Processed {connections.length} LinkedIn connections with AI insights</p>
                  <button
                    onClick={() => setActiveTab('mapper')}
                    className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
                  >
                    Start Networking Analysis →
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'mapper' && connections.length > 0 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">🗺️ Your LinkedIn Network Analysis</h2>
                <p className="text-gray-600">AI-powered insights from your actual LinkedIn connections</p>
              </div>
              
              <div>
                {/* Responsive grid for connections */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1.5rem',
                  margin: '2rem 0',
                }}>
                  {connectionsToShow.map(conn => (
                    <button
                      key={conn.id}
                      onClick={() => setSelectedConnection(conn)}
                      style={{
                        background: selectedConnection && selectedConnection.id === conn.id ? '#e3e8f0' : '#fff',
                        border: selectedConnection && selectedConnection.id === conn.id ? '2px solid #2d7ff9' : '1.5px solid #e3e8f0',
                        borderRadius: '1rem',
                        boxShadow: '0 1px 6px rgba(24,69,122,0.06)',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        minHeight: '160px',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s, border 0.2s',
                        outline: 'none',
                      }}
                    >
                      <span style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{conn.profileImage}</span>
                      <div style={{ fontWeight: 600, color: '#18457a', fontSize: '1.1rem' }}>{conn.name}</div>
                      <div style={{ color: '#555', fontSize: '0.98rem', margin: '0.25rem 0' }}>{conn.role}</div>
                      <div style={{ color: '#888', fontSize: '0.92rem' }}>{conn.company}</div>
                      {selectedConnection && selectedConnection.id === conn.id && (
                        <span style={{ color: '#2d7ff9', fontSize: '1.5rem', marginTop: '0.5rem' }} aria-label="Selected">✓</span>
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">🤖 AI Insights</h3>
                  <div className="space-y-3 text-sm">
                    {aiInsights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                        <p>{insight}</p>
                      </div>
                    ))}
                    {userGoals && (
                      <div className="flex items-start space-x-2 bg-green-50 p-3 rounded-lg">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                        <p><strong>Goal-aligned connections:</strong> {connections.filter(c => c.relevanceScore > 70).length} matches found for "{userGoals}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'composer' && connections.length > 0 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">✉️ AI Message Composer</h2>
                <p className="text-gray-600">Personalized outreach messages for your LinkedIn connections</p>
              </div>

              {!selectedConnection ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Select a connection from the Connection Mapper to generate a personalized message</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Selected Connection</h3>
                    <ConnectionCard connection={selectedConnection} />
                    
                    <button 
                      onClick={() => generatePersonalizedMessage(selectedConnection)}
                      disabled={isGeneratingMessage}
                      className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {isGeneratingMessage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Generating AI Message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Generate Personalized Message</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Generated Message</h3>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-64">
                      {generatedMessage ? (
                        <div>
                          <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                            {generatedMessage}
                          </pre>
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-2 text-sm text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span>Message personalized with recent activity and mutual connection</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center mt-8">Click "Generate Personalized Message" to see AI-crafted outreach</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'coach' && connections.length > 0 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">🎤 Conversation Coach</h2>
                <p className="text-gray-600">Practice questions and conversation starters to reduce networking anxiety</p>
              </div>

              {!selectedConnection ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Select a connection to get personalized conversation coaching</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Connection Profile</h3>
                    <ConnectionCard connection={selectedConnection} />
                    
                    <button 
                      onClick={() => generateCoachingQuestions(selectedConnection)}
                      className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2"
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span>Get Conversation Questions</span>
                    </button>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Suggested Questions</h3>
                    <div>
                      {coachingQuestions.length > 0 ? (
                        coachingQuestions.map((q, i) => (
                          <ConversationQuestionCard key={i} question={q} />
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">Click "Get Conversation Questions" to see personalized questions for your chat</p>
                      )}
                    </div>
                    
                    {coachingQuestions.length > 0 && (
                      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-medium text-yellow-800 mb-2">💡 Pro Tips:</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Start with their recent work/posts to show genuine interest</li>
                          <li>• Ask open-ended questions that let them share their expertise</li>
                          <li>• Be prepared to share your own goals and background briefly</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && connections.length > 0 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">📊 Network Analytics</h2>
                <p className="text-gray-600">Visual dashboard of your LinkedIn network insights</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <MetricCard label="Total Connections" value={totalConnections} icon={<Users />} />
                <MetricCard label="High-Value Connections" value={highValueConnections} icon={<Target />} />
                {/* Upgraded Top Industry Card */}
                {(() => {
                  const topIndustry = Object.keys(industryDistribution).length > 0
                    ? Object.keys(industryDistribution).reduce((a, b) => industryDistribution[a] > industryDistribution[b] ? a : b)
                    : null;
                  const topCount = topIndustry ? industryDistribution[topIndustry] : 0;
                  const percent = connections.length > 0 ? Math.round((topCount / connections.length) * 100) : 0;
                  const industryIcons = {
                    engineering: '🛠️',
                    AI: '🤖',
                    'data science': '📊',
                    tech: '💻',
                    scale: '🚀',
                    fintech: '💸',
                    leadership: '👔',
                    product: '📦',
                    default: '🔹',
                  };
                  return (
                    <div className="relative flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow p-6 min-w-[220px] max-w-xs mx-auto" style={{minHeight:140}}>
                      <div className="absolute top-2 right-2 text-blue-400" title="Top Industry"><TrendingUp className="w-6 h-6" /></div>
                      <div className="text-5xl mb-2 drop-shadow-sm">{industryIcons[topIndustry] || industryIcons.default}</div>
                      <div className="font-extrabold text-blue-900 text-2xl mb-1 truncate w-full text-center" title={topIndustry}>{topIndustry ? topIndustry.charAt(0).toUpperCase() + topIndustry.slice(1) : 'N/A'}</div>
                      <div className="text-blue-700 text-xs mb-2 font-medium tracking-wide">Top Industry in Your Network</div>
                      <div className="w-full flex items-center gap-2 mb-2">
                        <div className="flex-1 bg-blue-100 rounded-full h-3">
                          <div className="bg-gradient-to-r from-blue-500 to-green-400 h-3 rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
                        </div>
                        <span className="text-xs text-blue-900 font-bold min-w-[32px] bg-white border border-blue-200 rounded px-2 py-0.5 shadow-sm">{percent}%</span>
                      </div>
                      <div className="text-sm text-gray-700 font-semibold mb-1">{topCount} connection{topCount === 1 ? '' : 's'}</div>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded-2xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Top Industries in Your Network</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(() => {
                      const industryIcons = {
                        engineering: '🛠️',
                        AI: '🤖',
                        'data science': '📊',
                        tech: '💻',
                        scale: '🚀',
                        fintech: '💸',
                        leadership: '👔',
                        product: '📦',
                        default: '🔹',
                      };
                      return Object.entries(
                        connections.reduce((acc, conn) => {
                          conn.tags.forEach(tag => {
                            acc[tag] = (acc[tag] || 0) + 1;
                          });
                          return acc;
                        }, {})
                      )
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([industry, count]) => {
                          const percent = connections.length > 0 ? Math.round((count / connections.length) * 100) : 0;
                          return (
                            <div key={industry} className="flex items-center gap-3 bg-blue-50/60 border border-blue-100 rounded-xl px-3 py-2 shadow-sm">
                              <span className="text-2xl mr-2">{industryIcons[industry] || industryIcons.default}</span>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-semibold text-blue-900 text-sm capitalize truncate" title={industry}>{industry}</span>
                                  <span className="text-xs text-blue-700 font-bold bg-white border border-blue-200 rounded px-2 py-0.5 ml-2 shadow-sm">{percent}%</span>
                                </div>
                                <div className="w-full bg-blue-100 rounded-full h-2 mb-1">
                                  <div className="bg-gradient-to-r from-blue-500 to-green-400 h-2 rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
                                </div>
                                <div className="text-xs text-gray-600 font-medium">{count} connection{count === 1 ? '' : 's'}</div>
                              </div>
                            </div>
                          );
                        });
                    })()}
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">High-Value Connections</h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '1.25rem',
                    marginBottom: '1rem',
                    overflowX: 'auto',
                    justifyContent: 'center',
                    alignItems: 'stretch',
                    minHeight: '220px',
                    padding: '0.5rem 0',
                  }}>
                    {highValueToShow.map((conn) => (
                      <div
                        key={conn.id}
                        className="ConnectionCard"
                        style={{
                          border: '1.5px solid #e3e8f0',
                          borderRadius: '1rem',
                          background: '#f9fbfd',
                          boxShadow: '0 1px 6px rgba(24,69,122,0.06)',
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          minWidth: '210px',
                          maxWidth: '220px',
                          minHeight: '180px',
                          justifyContent: 'center',
                          transition: 'box-shadow 0.2s',
                        }}
                      >
                        <span style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{conn.profileImage}</span>
                        <div style={{ fontWeight: 600, color: '#18457a', fontSize: '1.1rem' }}>{conn.name}</div>
                        <div style={{ color: '#555', fontSize: '0.98rem', margin: '0.25rem 0' }}>{conn.role}</div>
                        <div style={{ color: '#888', fontSize: '0.92rem' }}>{conn.company}</div>
                        <div style={{ color: '#1db954', fontWeight: 500, marginTop: '0.5rem' }}>{conn.relevanceScore}% match</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button
                      onClick={() => setHighValuePage((p) => Math.max(0, p - 1))}
                      disabled={highValuePage === 0}
                      style={{
                        padding: '0.5rem 1.25rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: highValuePage === 0 ? '#e3e8f0' : '#2d7ff9',
                        color: highValuePage === 0 ? '#888' : '#fff',
                        fontWeight: 600,
                        cursor: highValuePage === 0 ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s',
                      }}
                    >Prev</button>
                    <span style={{ alignSelf: 'center', color: '#18457a', fontWeight: 500 }}>
                      Page {highValuePage + 1} of {highValueTotalPages}
                    </span>
                    <button
                      onClick={() => setHighValuePage((p) => Math.min(highValueTotalPages - 1, p + 1))}
                      disabled={highValuePage >= highValueTotalPages - 1}
                      style={{
                        padding: '0.5rem 1.25rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: highValuePage >= highValueTotalPages - 1 ? '#e3e8f0' : '#2d7ff9',
                        color: highValuePage >= highValueTotalPages - 1 ? '#888' : '#fff',
                        fontWeight: 600,
                        cursor: highValuePage >= highValueTotalPages - 1 ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s',
                      }}
                    >Next</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>� LinkLens — See your network with clarity</p>
      </footer>
    </div>
  );
};

export default AINetworkingPathfinder;