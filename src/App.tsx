import { useEffect, useState } from "react";
import { User, Activity, CheckCircle, Search, Mail, FileText, Shield, Briefcase, Plus, Send, List, LayoutDashboard, Users, MapPin, DollarSign, MessageSquare, X, ArrowRight } from "lucide-react";

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
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 col-span-3 section">
      <div className="oversized-number-wrapper">
        <span className="oversized-number">01</span>
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Active Queue</h2>
          <div className="px-3 py-1 bg-gray-50 text-xs font-mono text-gray-500 uppercase tracking-wider rounded border border-gray-200">
            {jobs.length} items
          </div>
        </div>
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 font-mono text-center border-2 border-dashed border-gray-100 rounded-xl">No jobs active. Dispatch the planner.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm text-left align-middle">
              <thead className="bg-[#f0f0f0] text-gray-600 font-mono text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Intent</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 px-6 font-mono text-xs text-gray-400 break-keep">{job.id.split('_').pop()}</td>
                    <td className="py-5 px-6 max-w-sm truncate text-gray-700" title={job.intent}>{job.intent}</td>
                    <td className="py-5 px-6">
                      <span className={`px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wider inline-block whitespace-nowrap
                        ${job.status.includes('Pending') ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                          job.status.includes('Completed') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-gray-400 whitespace-nowrap font-mono text-xs text-right">
                      {new Date(job.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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

  if (jds.length === 0) return (
    <div className="col-span-3 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
      <p className="text-gray-500 font-mono text-sm py-8 border-2 border-dashed border-gray-100 rounded-xl">Loading Job Descriptions...</p>
    </div>
  );

  return (
    <div className="col-span-3 space-y-8">
      {jds.map((jd, idx) => (
        <div key={jd.id} className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm section">
          <div className="oversized-number-wrapper">
             <span className="oversized-number">0{idx + 2}</span>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10 border-b border-gray-100 pb-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">{jd.title}</h2>
                <div className="flex items-center gap-6 text-sm text-gray-500 font-mono">
                  <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#FF6321]" /> {jd.location}</span>
                  <span className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-[#FF6321]" /> {jd.salaryRange}</span>
                </div>
              </div>
              <span className="bg-[#f0f0f0] text-gray-800 px-4 py-2 rounded text-xs font-mono uppercase tracking-widest border border-gray-200">
                QC Approved
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-12">
                <section>
                  <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest mb-4">Role Summary</h3>
                  <p className="text-gray-800 leading-relaxed text-[15px]">{jd.summary}</p>
                </section>
                <section>
                  <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest mb-4">Responsibilities</h3>
                  <ul className="space-y-3 text-[15px] text-gray-800">
                    {jd.responsibilities?.map((item: string, i: number) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-[#FF6321] font-mono mt-0.5">&rarr;</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="space-y-12">
                <section className="bg-gray-50 p-8 rounded-xl border border-gray-100 h-full">
                  <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest mb-4">Requirements</h3>
                  <ul className="space-y-4 text-[15px] text-gray-800">
                    {jd.requirements?.map((item: string, i: number) => (
                      <li key={i} className="flex gap-3 border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <CheckCircle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  useEffect(() => {
    fetch('/api/candidates')
      .then(res => res.json())
      .then(data => setCandidates(data.candidates))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="col-span-3 space-y-6 section">
      <div className="oversized-number-wrapper">
         <span className="oversized-number">03</span>
      </div>
      <div className="relative z-10 flex items-end justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2 mt-4">Sourced Candidates</h2>
          <span className="text-sm text-gray-500 font-mono tracking-wider">Found by Candidate Hunt Agent</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {candidates.map((c) => (
          <div key={c.id} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full border-t-[6px] hover:shadow-md transition-all ease-in-out duration-300 relative overflow-hidden group" style={{ borderTopColor: c.score >= 90 ? '#10B981' : c.score >= 85 ? '#3B82F6' : '#FF6321' }}>
            <div className="absolute top-0 right-0 p-6 opacity-[0.15] group-hover:opacity-[0.25] transition-opacity pointer-events-none">
              <span className="text-8xl font-bold" style={{ color: c.score >= 90 ? '#10B981' : c.score >= 85 ? '#3B82F6' : '#FF6321' }}>{c.score}</span>
            </div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase font-mono tracking-widest mb-2 px-2.5 py-1 bg-[#f0f0f0] rounded inline-block border border-gray-200">{c.jobTitle}</div>
                <h3 className="font-bold text-gray-900 text-2xl mt-1">{c.name}</h3>
                <p className="text-sm text-gray-500 mt-1.5 max-w-[280px] leading-relaxed">{c.title}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100/80 mb-6 flex-grow relative z-10">
               <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                 <Activity className="w-3.5 h-3.5"/> Agent Analysis
               </div>
              <p className="text-[14px] text-gray-700 leading-relaxed font-sans">
                {c.summary}
              </p>
            </div>
            
            <div className="mt-auto relative z-10">
              <div className="flex flex-wrap gap-2 mb-6">
                {c.skills.map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-[10px] uppercase tracking-wider font-mono rounded">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="pt-5 border-t border-gray-100 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-gray-400 font-mono"><MapPin className="w-4 h-4" /> {c.location}</span>
                <button onClick={() => setSelectedProfile(c)} className="text-[11px] font-bold font-mono text-[#FF6321] uppercase tracking-widest hover:text-[#d34a10] transition-colors flex items-center gap-2">Review Profile <ArrowRight className="w-3 h-3"/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProfile && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-10 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedProfile(null)} 
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-2.5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pr-8">
              <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-3 px-2.5 py-1 bg-[#f0f0f0] rounded inline-block">{selectedProfile.jobTitle}</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">{selectedProfile.name}</h2>
              <p className="text-sm text-gray-500 mb-8 font-medium">{selectedProfile.title}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="md:col-span-2 space-y-8">
                  <div>
                    <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-4">AI Summary & Screening</h4>
                    <p className="text-[15px] text-gray-800 leading-relaxed bg-[#f0f0f0]/50 p-6 rounded-xl relative">
                       <span className="absolute top-0 left-0 w-1 h-full bg-[#FF6321] rounded-l-xl"></span>
                       {selectedProfile.summary}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-4">Extracted Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.skills.map((skill: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 font-mono text-[10px] uppercase tracking-wider rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-8 h-fit">
                  <div>
                    <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-3">Match Score</h4>
                    <div className="flex items-end gap-1">
                      <div className="text-5xl font-bold leading-none" style={{ color: selectedProfile.score >= 90 ? '#10B981' : selectedProfile.score >= 85 ? '#3B82F6' : '#FF6321' }}>
                        {selectedProfile.score}
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-gray-100">
                    <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-3">Location</h4>
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {selectedProfile.location}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 pt-8 border-t border-gray-100 flex justify-end gap-4">
                <button onClick={() => setSelectedProfile(null)} className="px-6 py-3 rounded text-sm font-mono uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors">
                  Close
                </button>
                <button onClick={() => setSelectedProfile(null)} className="bg-[#FF6321] text-white px-6 py-3 rounded text-[10px] font-mono uppercase tracking-widest hover:bg-[#d34a10] transition-colors shadow-sm flex items-center gap-2">
                  <User className="w-4 h-4" /> Go to ATS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NudgesPage() {
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
    <div className="col-span-3 space-y-6 section">
      <div className="oversized-number-wrapper">
         <span className="oversized-number">04</span>
      </div>
      <div className="relative z-10 flex justify-between items-end mb-8">
        <div>
           <h2 className="text-4xl font-bold text-gray-900 mb-2 mt-4">Interview Nudge Agent</h2>
           <p className="text-sm text-gray-500 font-mono tracking-wider">Generating personalized, high-conversion outreach sequences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <div className="border border-gray-100 rounded-2xl overflow-y-auto max-h-[500px] bg-white shadow-sm section-divider">
           {candidates.map(c => (
              <button 
                key={c.id}
                onClick={() => handleSelectCandidate(c)}
                className={`w-full text-left p-6 border-b border-gray-50 hover:bg-gray-50/80 transition-all duration-200 ${selectedCandidate?.id === c.id ? 'bg-[#f0f0f0]/50 border-l-[6px] border-l-[#FF6321]' : 'border-l-[6px] border-l-transparent'}`}
              >
                 <div className="font-bold text-gray-900 text-lg mb-1">{c.name}</div>
                 <div className="text-[10px] font-mono font-bold text-[#FF6321] uppercase tracking-widest mb-1 truncate" title={c.jobTitle}>{c.jobTitle}</div>
                 <div className="text-xs text-gray-500 truncate leading-relaxed" title={c.title}>{c.title}</div>
              </button>
           ))}
        </div>

        <div className="col-span-2 bg-white border border-gray-100 shadow-sm rounded-2xl p-8 relative flex flex-col h-[500px]">
           {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl z-10">
                 <div className="w-8 h-8 border-2 border-gray-200 border-t-[#FF6321] rounded-full animate-spin mb-4"></div>
                 <p className="text-xs font-mono text-gray-500 uppercase tracking-widest animate-pulse">Editor & Nudge Agent iterating on copy...</p>
              </div>
           ) : null}

           {nudge && selectedCandidate ? (
              <div className="flex-grow flex flex-col animate-in fade-in duration-500 h-full">
                  <div className="mb-6 pb-6 border-b border-gray-100">
                     <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Candidate</span>
                     <div className="text-xl font-bold text-gray-900 mt-2">{selectedCandidate.name}</div>
                  </div>
                  <div className="mb-6">
                     <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-2 block">Subject</span>
                     <div className="text-[14px] font-medium text-gray-800 bg-[#f0f0f0]/50 border border-gray-100 p-4 rounded-xl">{nudge.subject}</div>
                  </div>
                  <div className="flex-grow flex flex-col min-h-0">
                     <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-2 block">First Touch Outreach</span>
                     <div className="text-[14px] text-gray-700 bg-[#f0f0f0]/50 border border-gray-100 p-6 rounded-xl whitespace-pre-wrap leading-relaxed flex-grow overflow-y-auto">
                        {nudge.message}
                     </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-4 shrink-0">
                     <button className="px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-[#FF6321] font-bold hover:bg-[#FF6321]/5 rounded transition-colors">
                        Regenerate Variant
                     </button>
                     <button className="px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-white bg-black font-bold hover:bg-gray-800 rounded transition-colors flex items-center gap-2 shadow-sm">
                        <Send className="w-3.5 h-3.5"/> Approve & Send
                     </button>
                  </div>
              </div>
           ) : !loading ? (
              <div className="flex-grow flex items-center justify-center text-gray-400 font-mono text-xs uppercase tracking-widest">
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
    <div className="min-h-screen bg-[#f5f5f5] text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-100 px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 py-5">
          <div className="bg-[#141414] text-white p-2.5 rounded-xl">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">AI Recruiting Copilot</h1>
            <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mt-1">Multi-Agent ADK Architecture</p>
          </div>
        </div>
        
        <nav className="flex space-x-2">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`px-5 py-5 text-xs font-mono font-bold uppercase tracking-widest border-b-2 flex items-center gap-2 transition-colors ${currentView === 'dashboard' ? 'border-[#FF6321] text-[#FF6321]' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
          >
            <LayoutDashboard className="w-4 h-4 mb-[2px]" />
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentView('queue')}
            className={`px-5 py-5 text-xs font-mono font-bold uppercase tracking-widest border-b-2 flex items-center gap-2 transition-colors ${currentView === 'queue' ? 'border-[#FF6321] text-[#FF6321]' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
          >
            <List className="w-4 h-4 mb-[2px]" />
            Job Queue
          </button>
          <button 
            onClick={() => setCurrentView('job_description')}
            className={`px-5 py-5 text-xs font-mono font-bold uppercase tracking-widest border-b-2 flex items-center gap-2 transition-colors ${currentView === 'job_description' ? 'border-[#FF6321] text-[#FF6321]' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
          >
            <FileText className="w-4 h-4 mb-[2px]" />
            JDs
          </button>
          <button 
            onClick={() => setCurrentView('candidates')}
            className={`px-5 py-5 text-xs font-mono font-bold uppercase tracking-widest border-b-2 flex items-center gap-2 transition-colors ${currentView === 'candidates' ? 'border-[#FF6321] text-[#FF6321]' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
          >
            <Users className="w-4 h-4 mb-[2px]" />
            Candidates
          </button>
          <button 
            onClick={() => setCurrentView('nudges')}
            className={`px-5 py-5 text-xs font-mono font-bold uppercase tracking-widest border-b-2 flex items-center gap-2 transition-colors ${currentView === 'nudges' ? 'border-[#FF6321] text-[#FF6321]' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
          >
            <MessageSquare className="w-4 h-4 mb-[2px]" />
            Nudges
          </button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {currentView === 'queue' ? (
          <QueuePage />
        ) : currentView === 'job_description' ? (
          <JobDescriptionPage />
        ) : currentView === 'candidates' ? (
          <CandidatesPage />
        ) : currentView === 'nudges' ? (
          <NudgesPage />
        ) : (
          <>
            {/* Left Col: Prompt Intake */}
            <section className="col-span-2 space-y-8">
              <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm section">
                <div className="oversized-number-wrapper">
                   <span className="oversized-number">00</span>
                </div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">New Requisition</h2>
                  <p className="text-sm font-mono text-gray-500 mb-8 leading-relaxed">
                    Provide a paragraph describing the role, team context, seniority, and location. Our Planner Agent will interpret intent and dispatch tasks.
                  </p>
                  <form onSubmit={handleSubmit}>
                    <textarea
                      className="w-full h-48 bg-[#f0f0f0]/50 border border-gray-200 rounded-xl p-6 focus:ring-0 focus:border-[#FF6321] outline-none text-[15px] resize-none mb-6 font-sans text-gray-800 transition-colors"
                      placeholder="We need a Senior React Developer for the frontend team in NYC. Onsite 3 days a week. Urgent backfill..."
                      value={intent}
                      onChange={(e) => setIntent(e.target.value)}
                      required
                    />
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <p className="text-[11px] font-mono text-gray-400 uppercase tracking-widest">{status || "Status: Waiting for input..."}</p>
                      <button
                        type="submit"
                        disabled={orchestrating || !intent.trim()}
                        className="bg-[#FF6321] text-white px-8 py-3 rounded text-[11px] font-bold font-mono tracking-widest uppercase hover:bg-[#d34a10] disabled:opacity-50 flex items-center gap-2 shadow-sm transition-colors mt-4"
                      >
                        {orchestrating ? "Orchestrating..." : (
                           <>Dispatch Planner <ArrowRight className="w-4 h-4 ml-1" /></>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
                    <FileText className="w-64 h-64" />
                 </div>
                 <div className="relative z-10">
                   <h2 className="text-2xl font-bold text-gray-900 mb-6">Architecture Documentation</h2>
                   <div className="h-72 overflow-y-auto bg-[#141414] rounded-xl p-6 text-sm text-gray-300">
                     <p className="font-mono text-[#10B981] mb-6 tracking-wide text-xs">{">"} /ARCHITECTURE.md generated successfully.</p>
                     <p className="mb-4 font-mono text-xs uppercase tracking-wider text-gray-500">Modules Included:</p>
                     <ul className="space-y-4 font-mono text-xs">
                       <li className="flex gap-3"><span className="text-gray-600">01</span> PART 1: Full system architecture</li>
                       <li className="flex gap-3"><span className="text-gray-600">02</span> PART 2: Production-grade folder structure</li>
                       <li className="flex gap-3"><span className="text-gray-600">03</span> PART 3: Agent orchestration design</li>
                       <li className="flex gap-3"><span className="text-gray-600">04</span> PART 4: Database schema design</li>
                       <li className="flex gap-3"><span className="text-gray-600">05</span> PART 5: Queue architecture</li>
                       <li className="flex gap-3"><span className="text-gray-600">06</span> PART 6: Memory architecture (short-term + long-term)</li>
                       <li className="flex gap-3"><span className="text-gray-600">07</span> PART 7: MCP tools design</li>
                       <li className="flex gap-3"><span className="text-gray-600">08</span> PART 8: Prompt architecture for each agent</li>
                       <li className="flex gap-3"><span className="text-gray-600">09</span> PART 9: Failure handling + retry system</li>
                       <li className="flex gap-3"><span className="text-gray-600">10</span> PART 10: Security + compliance architecture</li>
                       <li className="flex gap-3"><span className="text-gray-600">11</span> PART 11: Multi-tenant SaaS architecture</li>
                       <li className="flex gap-3"><span className="text-gray-600">12</span> PART 12: Deployment architecture (AWS/GCP/Vercel)</li>
                       <li className="flex gap-3"><span className="text-gray-600">13</span> PART 13: How to make this enterprise-grade</li>
                       <li className="flex gap-3"><span className="text-gray-600">14</span> PART 14: Portfolio project for AI Agent Engineer</li>
                       <li className="flex gap-3"><span className="text-gray-600">15</span> PART 15: Exact implementation roadmap</li>
                     </ul>
                     <p className="mt-8 pt-6 border-t border-gray-800 text-gray-500 font-sans text-sm">Open the workspace file explorer to inspect the deployed Markdown documentation and the 8 generated SKILL.md agents.</p>
                   </div>
                 </div>
              </div>
            </section>

            {/* Right Col: Loaded Agents */}
            <section className="space-y-6">
              <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-gray-400 mb-2 px-2">Loaded ADK Agents</h2>
              <div className="space-y-4">
                {agentConfig.map((agent, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 hover:border-gray-200 transition-colors group cursor-default">
                    <div className="bg-[#f0f0f0]/50 p-3 rounded-xl border border-gray-100/80 group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                      {agent.icon}
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-gray-900 group-hover:text-[#FF6321] transition-colors">{agent.name}</h3>
                      <p className="text-[10px] text-emerald-600 font-mono flex items-center gap-1.5 mt-1.5 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mb-[1px]"></span>
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

