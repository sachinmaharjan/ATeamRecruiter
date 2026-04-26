import { useEffect, useState } from "react";
import { User, Activity, CheckCircle, Search, Mail, FileText, Shield, Briefcase, Plus, Send, List, LayoutDashboard, Users, MapPin, DollarSign, MessageSquare } from "lucide-react";

function QueuePage() {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await fetch('/api/queue');
        const data = await res.json();
        setJobs(data.jobs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchQueue();
    const interval = setInterval(fetchQueue, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-3">
      <h2 className="text-lg font-medium mb-4">Active Agent Queue</h2>
      {jobs.length === 0 ? (
        <p className="text-gray-500 text-sm py-4">No jobs in queue. Create a requisition to start.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 rounded-tl-lg">Job ID</th>
                <th className="py-3 px-4">Intent</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 rounded-tr-lg">Created Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-gray-500">{job.id}</td>
                  <td className="py-3 px-4 max-w-lg truncate" title={job.intent}>{job.intent}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block whitespace-nowrap
                      ${job.status.includes('Pending') ? 'bg-gray-100 text-gray-600' :
                        job.status.includes('Completed') ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                    {new Date(job.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function JobDescriptionPage() {
  const [jds, setJds] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/job-descriptions')
      .then(res => res.json())
      .then(data => setJds(data))
      .catch(err => console.error(err));
  }, []);

  if (jds.length === 0) return <div className="p-8 text-center text-gray-500">Loading Job Descriptions...</div>;

  return (
    <div className="col-span-3 space-y-8">
      {jds.map(jd => (
        <div key={jd.id} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{jd.title}</h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {jd.location}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {jd.salaryRange}</span>
              </div>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              Approved by Quality Agent
            </span>
          </div>

          <div className="space-y-8">
            <section>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Role Summary</h3>
              <p className="text-gray-700 leading-relaxed text-sm">{jd.summary}</p>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Responsibilities</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                {jd.responsibilities?.map((item: string, i: number) => (
                  <li key={i} className="pl-1 leading-relaxed">{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Requirements</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                {jd.requirements?.map((item: string, i: number) => (
                  <li key={i} className="pl-1 leading-relaxed">{item}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      ))}
    </div>
  );
}

function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/candidates')
      .then(res => res.json())
      .then(data => setCandidates(data.candidates))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="col-span-3 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Sourced Candidates</h2>
        <span className="text-sm text-gray-500 font-mono">Found by Candidate Hunt Agent</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((c) => (
          <div key={c.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full border-t-4 hover:shadow-md transition-shadow" style={{ borderTopColor: c.score >= 90 ? '#10B981' : c.score >= 85 ? '#3B82F6' : '#F59E0B' }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 px-2 py-0.5 bg-gray-100 rounded-sm inline-block">{c.jobTitle}</div>
                <h3 className="font-semibold text-gray-900 text-lg mt-1">{c.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5 max-w-[200px] leading-tight">{c.title}</p>
              </div>
              <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-2 border border-gray-100 min-w[48px]">
                <span className="text-lg font-bold" style={{ color: c.score >= 90 ? '#10B981' : c.score >= 85 ? '#3B82F6' : '#F59E0B' }}>
                  {c.score}
                </span>
                <span className="text-[10px] text-gray-400 font-mono uppercase">Match</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3 leading-relaxed">
              {c.summary}
            </p>
            
            <div className="mt-auto">
              <div className="flex flex-wrap gap-1.5 mb-4">
                {c.skills.map((skill: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin className="w-3 h-3" /> {c.location}</span>
                <button className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">Review Profile &rarr;</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NudgePage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [nudge, setNudge] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/candidates')
      .then(res => res.json())
      .then(data => {
         setCandidates(data.candidates);
         if (data.candidates.length > 0) {
            handleSelectCandidate(data.candidates[0]);
         }
      })
      .catch(err => console.error(err));
  }, []);

  const handleSelectCandidate = async (candidate: any) => {
      setSelectedCandidate(candidate);
      setLoading(true);
      setNudge(null);
      // simulate agent generation delay
      setTimeout(async () => {
         try {
           const res = await fetch(`/api/nudges/${candidate.id}`);
           const data = await res.json();
           setNudge(data);
         } catch(e) {
           console.error(e);
         } finally {
           setLoading(false);
         }
      }, 1500);
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-3 min-h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-xl font-semibold text-gray-900">Interview Nudge Agent</h2>
           <p className="text-sm text-gray-500 mt-1">Generating personalized, high-conversion outreach sequences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-gray-200 rounded-lg overflow-y-auto max-h-[400px]">
           {candidates.map(c => (
              <button 
                key={c.id}
                onClick={() => handleSelectCandidate(c)}
                className={`w-full text-left p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${selectedCandidate?.id === c.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
              >
                 <div className="font-medium text-gray-900 text-sm">{c.name}</div>
                 <div className="text-xs font-semibold text-blue-600 mt-0.5 truncate" title={c.jobTitle}>{c.jobTitle}</div>
                 <div className="text-xs text-gray-500 mt-1 truncate" title={c.title}>{c.title}</div>
              </button>
           ))}
        </div>

        <div className="col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-6 relative flex flex-col">
           {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 rounded-lg z-10">
                 <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-sm text-blue-600 font-medium animate-pulse">Editor & Nudge Agent iterating on copy...</p>
              </div>
           ) : null}

           {nudge && selectedCandidate ? (
              <div className="flex-grow flex flex-col animate-in fade-in duration-500">
                  <div className="mb-4">
                     <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</span>
                     <div className="text-sm font-medium mt-1">{selectedCandidate.name}</div>
                  </div>
                  <div className="mb-4">
                     <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</span>
                     <div className="text-sm font-medium mt-1 bg-white border border-gray-200 p-3 rounded-md">{nudge.subject}</div>
                  </div>
                  <div className="flex-grow">
                     <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">First Touch Outreach</span>
                     <div className="text-sm text-gray-800 mt-1 bg-white border border-gray-200 p-4 rounded-md whitespace-pre-wrap leading-relaxed min-h-[200px]">
                        {nudge.message}
                     </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                     <button className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-200 rounded-md transition-colors border border-gray-300">
                        Regenerate Variant
                     </button>
                     <button className="px-4 py-2 text-sm text-white bg-black font-medium hover:bg-gray-800 rounded-md transition-colors flex items-center gap-2">
                        <Send className="w-4 h-4"/> Approve & Send
                     </button>
                  </div>
              </div>
           ) : !loading ? (
              <div className="flex-grow flex items-center justify-center text-gray-400 text-sm">
                 Select a candidate to generate a nudge.
              </div>
           ) : null}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [intent, setIntent] = useState("");
  const [orchestrating, setOrchestrating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'queue' | 'job_description' | 'candidates' | 'nudges'>('dashboard');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrchestrating(true);
    setStatus("Calling Planner Agent...");
    try {
      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent }),
      });
      const data = await res.json();
      setStatus(`Success! Job created: ${data.jobId}. Watch the queue for updates.`);
    } catch (e) {
      setStatus("Failed to trigger orchestrator.");
    } finally {
      setOrchestrating(false);
    }
  };

  const agentConfig = [
    { name: "Planner Agent", icon: <Activity className="w-5 h-5 text-blue-500" /> },
    { name: "Research Agent", icon: <Search className="w-5 h-5 text-indigo-500" /> },
    { name: "Jd Creation Agent", icon: <FileText className="w-5 h-5 text-purple-500" /> },
    { name: "Candidate Hunt Agent", icon: <User className="w-5 h-5 text-green-500" /> },
    { name: "Interview Nudge Agent", icon: <Mail className="w-5 h-5 text-amber-500" /> },
    { name: "Content Generator Agent", icon: <Briefcase className="w-5 h-5 text-pink-500" /> },
    { name: "Editor Agent", icon: <CheckCircle className="w-5 h-5 text-teal-500" /> },
    { name: "Quality Compliance Agent", icon: <Shield className="w-5 h-5 text-red-500" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 py-4">
          <div className="bg-black text-white p-2 rounded-lg">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight">AI Recruiting Copilot</h1>
            <p className="text-xs text-gray-500">Multi-Agent ADK Architecture</p>
          </div>
        </div>
        
        <nav className="flex space-x-2">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`px-4 py-4 text-sm font-medium border-b-2 flex items-center gap-2 ${currentView === 'dashboard' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentView('queue')}
            className={`px-4 py-4 text-sm font-medium border-b-2 flex items-center gap-2 ${currentView === 'queue' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <List className="w-4 h-4" />
            Job Queue
          </button>
          <button 
            onClick={() => setCurrentView('job_description')}
            className={`px-4 py-4 text-sm font-medium border-b-2 flex items-center gap-2 ${currentView === 'job_description' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <FileText className="w-4 h-4" />
            Job Description
          </button>
          <button 
            onClick={() => setCurrentView('candidates')}
            className={`px-4 py-4 text-sm font-medium border-b-2 flex items-center gap-2 ${currentView === 'candidates' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <Users className="w-4 h-4" />
            Candidates
          </button>
          <button 
            onClick={() => setCurrentView('nudges')}
            className={`px-4 py-4 text-sm font-medium border-b-2 flex items-center gap-2 ${currentView === 'nudges' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <MessageSquare className="w-4 h-4" />
            Outreach Nudges
          </button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {currentView === 'queue' ? (
          <QueuePage />
        ) : currentView === 'job_description' ? (
          <JobDescriptionPage />
        ) : currentView === 'candidates' ? (
          <CandidatesPage />
        ) : currentView === 'nudges' ? (
          <NudgePage />
        ) : (
          <>
            {/* Left Col: Prompt Intake */}
            <section className="col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-medium mb-2">New Requisition Input</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Provide a paragraph describing the role, team context, seniority, and location. Our Planner Agent will interpret intent and dispatch tasks.
                </p>
                <form onSubmit={handleSubmit}>
                  <textarea
                    className="w-full h-40 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none mb-4"
                    placeholder="We need a Senior React Developer for the frontend team in NYC. Onsite 3 days a week. Urgent backfill..."
                    value={intent}
                    onChange={(e) => setIntent(e.target.value)}
                    required
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-mono text-gray-500">{status || "Status: Waiting for input..."}</p>
                    <button
                      type="submit"
                      disabled={orchestrating || !intent.trim()}
                      className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 transition"
                    >
                      <Send className="w-4 h-4" />
                      {orchestrating ? "Orchestrating..." : "Dispatch Planner"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                 <h2 className="text-lg font-medium mb-4">Architecture Documentation</h2>
                 <div className="h-64 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
                   <p className="font-mono mb-2">/ARCHITECTURE.md generated.</p>
                   <p className="mb-2"><strong>Parts Included:</strong></p>
                   <ul className="list-disc pl-5 space-y-1">
                     <li>PART 1: Full system architecture</li>
                     <li>PART 2: Production-grade folder structure</li>
                     <li>PART 3: Agent orchestration design</li>
                     <li>PART 4: Database schema design</li>
                     <li>PART 5: Queue architecture</li>
                     <li>PART 6: Memory architecture (short-term + long-term)</li>
                     <li>PART 7: MCP tools design</li>
                     <li>PART 8: Prompt architecture for each agent</li>
                     <li>PART 9: Failure handling + retry system</li>
                     <li>PART 10: Security + compliance architecture</li>
                     <li>PART 11: Multi-tenant SaaS architecture</li>
                     <li>PART 12: Deployment architecture (AWS/GCP/Vercel)</li>
                     <li>PART 13: How to make this enterprise-grade</li>
                     <li>PART 14: Portfolio project for AI Agent Engineer</li>
                     <li>PART 15: Exact implementation roadmap</li>
                   </ul>
                   <p className="mt-4 italic">Open the workspace file explorer to inspect the deployed Markdown documentation and the 8 generated SKILL.md agents.</p>
                 </div>
              </div>
            </section>

            {/* Right Col: Loaded Agents */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Loaded ADK Agents</h2>
              <div className="space-y-3">
                {agentConfig.map((agent, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                      {agent.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">{agent.name}</h3>
                      <p className="text-xs text-green-600 font-mono flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mb-[1px]"></span>
                        SKILL.md Loaded
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

