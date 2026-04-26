import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";

interface Job {
  id: string;
  intent: string;
  status: string;
  createdAt: number;
}
const jobQueue: Job[] = [];

const mockJobDescriptions = [
  {
    id: 1,
    title: "Senior React Developer",
    location: "New York, NY (Hybrid)",
    salaryRange: "$140,000 - $180,000",
    summary: "We are looking for an experienced Senior React Developer to join our frontend team in NYC. You will be responsible for architecting scalable UI components, mentoring junior developers, and driving the technical vision for our core web application. This role is highly impactful and requires a deep understanding of modern web architectures.",
    responsibilities: [
      "Build and maintain advanced React applications using modern hooks and state management.",
      "Collaborate with cross-functional teams (Design, Product, Backend) to define and ship features.",
      "Optimize application for maximum speed and scalability.",
      "Participate in rigorous code reviews and advocate for front-end best practices."
    ],
    requirements: [
      "5+ years of professional front-end development experience.",
      "Deep expertise in React, TypeScript, and modern CSS frameworks (Tailwind).",
      "Experience with server-side rendering frameworks like Next.js.",
      "Strong understanding of web performance, DOM manipulation, and accessibility (WCAG)."
    ]
  },
  {
    id: 2,
    title: "Supabase Database Engineer",
    location: "Remote",
    salaryRange: "$130,000 - $170,000",
    summary: "We are seeking a Backend / Database Engineer with deep expertise in Postgres and the Supabase ecosystem. You will be responsible for designing resilient database schemas, optimizing complex multi-tenant queries, and writing robust Edge Functions. Your work will directly impact the performance and scalability of our AI-powered applications.",
    responsibilities: [
      "Design, implement, and maintain PostgreSQL database schemas to support evolving architectural requirements.",
      "Leverage Supabase features including Auth, Realtime, Storage, and Edge Functions.",
      "Implement strong Row Level Security (RLS) policies for multi-tenant data isolation.",
      "Optimize queries, manage indexing, and monitor database performance in a production environment."
    ],
    requirements: [
      "4+ years of backend engineering experience heavily focused on PostgreSQL.",
      "Extensive hands-on experience building with Supabase.",
      "Strong understanding of Row Level Security (RLS) and Postgres roles.",
      "Experience with TypeScript (for Edge Functions) and schema migration tools."
    ]
  }
];

const mockCandidates = [
  { id: 1, name: "Alice Johnson", title: "Lead Frontend Engineer at TechCorp", location: "New York, NY", score: 95, skills: ["React", "TypeScript", "Tailwind", "Next.js"], summary: "Strong leader with 7 years of React experience. Recently rebuilt TechCorp's core dashboard, driving a 40% performance increase.", jobTitle: "Senior React Developer" },
  { id: 2, name: "Bob Smith", title: "Senior React Developer at WebSolutions", location: "Brooklyn, NY", score: 88, skills: ["React", "JavaScript", "Redux", "CSS"], summary: "Solid React foundations, 5 years experience, actively looking for a hybrid role in NYC.", jobTitle: "Senior React Developer" },
  { id: 3, name: "Carol Davis", title: "Frontend Software Engineer at startup.io", location: "Newark, NJ", score: 82, skills: ["React", "Vue", "TypeScript"], summary: "Versatile developer, good TypeScript knowledge. Willing to commute to NYC 3 days a week.", jobTitle: "Senior React Developer" },
  { id: 4, name: "David Kim", title: "Database Engineer at DataFlow", location: "Remote", score: 96, skills: ["PostgreSQL", "Supabase", "TypeScript", "RLS"], summary: "Deep expertise in Postgres and Supabase native features like Realtime and Edge Functions. Currently managing a multi-tenant DB with millions of rows.", jobTitle: "Supabase Database Engineer" },
  { id: 5, name: "Eve Chen", title: "Backend Engineer at CloudScale", location: "Remote", score: 89, skills: ["Node.js", "PostgreSQL", "JavaScript", "SQL"], summary: "Strong relational database experience. Recently migrated a legacy system to a modern Postgres architecture. Eager to dive deeper into Supabase.", jobTitle: "Supabase Database Engineer" }
];

const mockNudges = {
  1: {
    subject: "TechCorp <> Senior React Developer position",
    message: "Hi Alice,\n\nI was really impressed by your background, particularly your work as Lead Frontend Engineer at TechCorp. We’re currently looking for a Senior React Developer to architect scalable UI components for our core web application in NYC.\n\nGiven your 7 years of React experience and success in rebuilding TechCorp's dashboard, I think you'd be a fantastic fit. We also offer a hybrid setup that might align well with you.\n\nWould you be open to a quick 15-minute chat this week to hear more about what we're building?\n\nBest,\nRecruiting Team"
  },
  2: {
    subject: "Senior React Developer role in NYC",
    message: "Hi Bob,\n\nI came across your profile and your 5 years of solid React foundations stood out to me. We're actively seeking a Senior React Developer for our NYC frontend team and noticed you're looking for a hybrid role.\n\nWe need someone who can mentor junior developers and drive technical vision. I’d love to tell you more about the impactful work we do.\n\nLet me know if you have time for a brief introduction call on Wednesday or Thursday.\n\nBest,\nRecruiting Team"
  },
  3: {
    subject: "Opportunity: Frontend Software Engineer",
    message: "Hi Carol,\n\nI noticed your versatile development skills and your solid TypeScript knowledge. We have an opening for a Senior React Developer on our NYC frontend team (with 3 days onsite, which seems to fit your commute preferences from Newark!).\n\nYour background at startup.io makes you a compelling candidate for our fast-paced environment. I'd love to connect.\n\nAre you available for a quick chat next week to discuss?\n\nBest,\nRecruiting Team"
  },
  4: {
    subject: "Database engineering at a fast-growing AI startup",
    message: "Hi David,\n\nI've been following your work at DataFlow and I'm deeply impressed by your expertise in PostgreSQL and Supabase. We are currently looking for a Supabase Database Engineer to help us design resilient schemas and leverage Edge Functions for our AI-powered applications.\n\nGiven your hands-on experience with multi-tenant architectures and RLS, I think you'd thrive in this role. The position is fully remote, and we tackle some very interesting data scaling challenges.\n\nAre you open to a brief chat sometime next week to explore this?\n\nBest regards,\nRecruiting Team"
  },
  5: {
    subject: "Opportunity: Supabase Database Engineer (Remote)",
    message: "Hi Eve,\n\nI came across your profile and was really impressed by your backend engineering background at CloudScale, especially your recent successful Postgres migration. We're actively looking for a remote Database Engineer to join our team and build heavily on the Supabase ecosystem.\n\nYour solid grasp of SQL and Postgres architecture is exactly what we need as we scale out our multi-tenant platform. I think this role would be a great environment for you to dive deeper into Supabase.\n\nWould you be open to a 15-minute introductory call next week?\n\nBest,\nRecruiting Team"
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/queue", (req, res) => {
    res.json({ jobs: [...jobQueue].sort((a,b) => b.createdAt - a.createdAt) });
  });

  app.get("/api/job-descriptions", (req, res) => {
    res.json(mockJobDescriptions);
  });

  app.get("/api/candidates", (req, res) => {
    res.json({ candidates: mockCandidates });
  });

  app.get("/api/nudges/:candidateId", (req, res) => {
    const candidateId = Number(req.params.candidateId);
    res.json(mockNudges[candidateId as keyof typeof mockNudges] || { subject: "Opportunity", message: "We'd love to chat." });
  });

  // Dummy endpoint to show agent loading
  app.get("/api/agents", (req, res) => {
    try {
      const skillsDir = path.join(process.cwd(), ".agents", "skills");
      if (!fs.existsSync(skillsDir)) {
         return res.json({ agents: [] });
      }
      
      const agents = fs.readdirSync(skillsDir).map(agentFolder => {
        const skillPath = path.join(skillsDir, agentFolder, "SKILL.md");
        const exists = fs.existsSync(skillPath);
        return {
           id: agentFolder,
           name: agentFolder.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
           loaded: exists
        }
      });
      res.json({ agents });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load agents" });
    }
  });

  // Example orchestrator trigger endpoint
  app.post("/api/orchestrate", (req, res) => {
    const { intent } = req.body;
    if (!intent) {
      return res.status(400).json({ error: "No intent provided" });
    }
    
    const jobId = `job_${Date.now()}`;
    const newJob: Job = {
      id: jobId,
      intent,
      status: "Pending: Planner Agent starting...",
      createdAt: Date.now()
    };
    jobQueue.push(newJob);

    // Simulate agent workflow state transitions asynchronously
    setTimeout(() => {
      const job = jobQueue.find(j => j.id === jobId);
      if (job) job.status = "In Progress: Generating Job Description";
    }, 3000);
    
    setTimeout(() => {
      const job = jobQueue.find(j => j.id === jobId);
      if (job) {
         job.status = "In Progress: Finding Candidates";
         
         // mock agent generating Job Description
         mockJobDescriptions.push({
            id: Date.now(),
            title: `Role for '${intent.substring(0, 20)}...'`,
            location: "TBD",
            salaryRange: "Analyzing Market Data...",
            summary: "Job description is currently being generated by the JD Agent and refined by the Editor Agent.",
            responsibilities: ["Task 1", "Task 2"],
            requirements: ["Req 1", "Req 2"]
         });
      }
    }, 7000);

    setTimeout(() => {
      const job = jobQueue.find(j => j.id === jobId);
      if (job) job.status = "Completed: HitL Review Pending";
    }, 12000);

    // In a real system, this would push to a Redis BullMQ to start the ADK Planner Agent
    res.json({ 
      status: "Orchestration triggered", 
      jobId,
      message: "Planner Agent dispatched. Check worker queues."
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
