# Multi-Agent Recruiting Copilot Architecture

## PART 1: Full System Architecture
Our architecture is designed around an event-driven, multi-agent orchestration pattern using a central Orchestrator (Planner Agent) that directs workflows to specialized Sub-Agents via a message queue. 

*   **Frontend**: React (Vite + Tailwind + shadcn/ui) representing the HR Dashboard. Enables users to input descriptions, monitor agent states, review outputs, and approve final actions (human-in-the-loop).
*   **API Gateway**: Node.js / Express handling authentication, rate limiting, and HTTP/WebSocket connections.
*   **Orchestration Engine**: Google Agents ADK orchestrating the workflow state machine. Stores execution state in Redis.
*   **Agent Skill Layer**: Loads `.agents/skills/*` at runtime. Each skill defines rules, triggers, and expected behaviors. Uses Gemini 3.1 Pro (or equivalent) for reasoning.
*   **Tool/MCP Layer**: Connects agents to external systems (LinkedIn, Greenhouse, internal Confluence for company context) via Model Context Protocol (MCP) servers.
*   **Persistence Layer**: Postgres for relational data (Jobs, Candidates, Users) and pgvector for semantic memory (candidate profile embeddings).

## PART 2: Production-Grade Folder Structure
```text
/
├── .agents/                    # Agent Definition Files (ADK portable skills)
│   └── skills/                 
│       ├── planner/            # Orchestrator
│       ├── research/           # Market / Salary research
│       ├── jd_creation/        # Job Description author
│       ├── candidate_hunt/     # Sourcing
│       ├── interview_nudge/    # Sequence generation
│       ├── content_generator/  # Scorecards & collaterals
│       ├── editor/             # Tone & styling
│       └── quality_compliance/ # Guardrails & Policy
├── src/
│   ├── backend/
│   │   ├── api/                # Express routes & middleware
│   │   ├── orchestration/      # Workflow engine & queue workers
│   │   ├── tools/              # Custom MCP tool implementations
│   │   ├── db/                 # Drizzle/Prisma schema & migrations
│   │   └── server.ts           # Backend entrypoint
│   ├── frontend/
│   │   ├── components/         # React Reusable Components
│   │   ├── pages/              # HR Dashboard, Approvals, Chat
│   │   ├── store/              # Zustand state / React Query
│   │   └── App.tsx             # Frontend entrypoint
│   └── shared/
│       └── types.ts            # Shared Zod schemas & interfaces
├── docker-compose.yml          # Local infra (Postgres, Redis)
└── architecture.md             # This document
```

## PART 3: Agent Orchestration Design
We use a **Supervisory / Hierarchical Routing** approach:
1.  **Trigger**: HR user posts intent (e.g., "Need a Senior React Dev").
2.  **Planner Agent (Supervisor)**: Evaluates intent, creates a Directed Acyclic Graph (DAG) of required tasks.
3.  **Execution Loop**: 
    - The Planner pushes Task A (Research) to the Queue.
    - Research Agent picks it up, uses MCP to query compensation tools, and returns a JSON artifact payload.
    - The Planner evaluates if Research succeeded. If yes, it moves to JD Creation and Candidate Hunt (in parallel).
4.  **Editor & Compliance**: Every document generation step automatically flows through Editor, then Quality Compliance before reaching the Human-in-the-Loop review stage.
5.  **State Management**: Graph execution state (Pending, Running, Failed, Complete, Pending Approval) is persisted in Redis.

## PART 4: Database Schema Design (Postgres/Supabase + pgvector)

*   **Tenants (Companies)**: `id`, `name`, `billing_tier`, `created_at`
*   **Users (Recruiters)**: `id`, `tenant_id`, `email`, `role`, `oauth_tokens`
*   **Job_Requisitions**: `id`, `tenant_id`, `status` (Draft, Sourcing, Closed), `raw_intent`, `structured_requirements` (JSONB)
*   **Agent_Workflows**: `id`, `req_id`, `current_state`, `execution_graph` (JSONB), `created_at`, `updated_at`
*   **Candidates**: `id`, `tenant_id`, `linkedin_url`, `name`, `current_title`, `status`, `resume_text`
*   **Candidate_Embeddings (pgvector)**: `id`, `candidate_id`, `embedding (vector(1536))` - used for semantic similarity search against Requisitions.
*   **Outreach_Sequences**: `id`, `candidate_id`, `req_id`, `touches` (JSONB arrays of messages), `status`.

## PART 5: Queue Architecture (BullMQ / Temporal)
To handle asynchronous agent inference, we rely on **BullMQ** over Redis.
-   **PlannerQueue**: Processes HR input and updates workflow states.
-   **ExecutionQueue**: Dedicated queues for each agent (e.g., `agent:research`, `agent:jd_creation`).
-   **RateLimiterQueue**: For external API calls (e.g., LinkedIn API, Greenhouse API) to prevent getting banned.
-   **Retry Strategy**: Exponential backoff. If an LLM encounters a context limit or transient API error, BullMQ automatically retries 3 times before moving the job to the Dead Letter Queue (DLQ). The Planner agent monitors the DLQ to alert the human operator.

## PART 6: Memory Architecture (Short-term + Long-term)

*   **Short-Term Memory (Context Window)**: Each workflow execution maintains a JSON "Scratchpad" in Redis. When the Planner calls the Editor Agent, it strictly passes only the generated JD text and the company's tone guidelines, preventing context bloat.
*   **Long-Term Memory (Vector DB)**: 
    *   *Company Context*: Embedded wiki/handbook pages (e.g., "What is our vacation policy?"). The Research and JD Agents do a semantic search/RAG over this data.
    *   *Candidate Profiles*: Historical candidate profiles and their interview scores are embedded. The Candidate Hunt Agent searches this to find past "Silver Medalist" candidates.

## PART 7: MCP Tools Design
Model Context Protocol (MCP) servers encapsulate external capabilities:
1.  **ATSMCP**: `get_open_reqs()`, `create_candidate(profile)`, `move_stage(candidateId, stage)`
2.  **LinkedInMCP** (Simulated or via Apify/Proxy): `search_profiles(query)`, `get_profile(url)`
3.  **CompensationMCP**: `get_salary_band(role, location, company_stage)`
4.  **CompanyWikiMCP**: `search_wiki(query)` - accesses internal Confluence/Notion for employer branding details.

## PART 8: Prompt Architecture For Each Agent
Instead of giant monolithic prompts, we use the `SKILL.md` paradigm. Each agent's prompt context contains:
1.  **System Persona**: From `SKILL.md` (e.g., "You are a strict Legal & DEI Auditor").
2.  **Tool Definitions**: OpenAPI schemas of injected MCPs.
3.  **Input Payload**: Strict JSON (e.g., `{"role": "React Dev", "draft_text": "..."}`).
4.  **Format Instructions**: We forcefully use Gemini Function Calling / Structured Outputs to ensure the agent replies with parsable JSON, preventing "Sure, here is your output:" text wrapping.

## PART 9: Failure Handling + Retry System
1.  **LLM Output Parsing Failure**: If the output doesn't match the Zod schema, the task is instantly retried with the error message appended to the prompt: *"Your previous output failed validation: [Error]. Fix it."*
2.  **Tool Execution Failure**: If an MCP tool fails (e.g., 404 from ATS), the agent receives a ToolError response. The Planner decides if the sub-agent should try an alternative strategy or if the workflow requires human intervention.
3.  **Hallucination/Compliance Failure**: If the Quality Compliance Agent detects an invalid claim, it throws a "ComplianceReject" event. The Planner loops the task back to the Editor Agent with the feedback. Hard cap at 3 loops to prevent infinite cycles.

## PART 10: Security + Compliance Architecture
*   **Data Masking**: PII (Names, Emails) is stripped or replaced with hashes by a pre-processing middleware before sending candidate data to external LLMs.
*   **Tenant Isolation**: All DB queries use Row Level Security (RLS) filtering by `tenant_id`. Internal RAG embeddings are tagged with metadata `tenant_id` to prevent cross-company data leakage.
*   **Guardrails**: The Quality Compliance Agent acts as a firewall before any outgoing action. No automated emails are sent without Human-in-the-Loop (HITL) approval.

## PART 11: Multi-Tenant SaaS Architecture
*   **Auth**: Clerk or WorkOS for Enterprise SSO (SAML).
*   **Billing**: Stripe. Workflows cost "credits". Each successful Planner execution debits credits.
*   **Configuration**: Each Tenant has a Config panel where they inject their own Greenhouse API keys and Notion API keys, dynamically spawning tenant-specific MCP servers.

## PART 12: Deployment Architecture (AWS/GCP/Vercel)
*   **Frontend & API Gateway**: Vercel (Next.js/Express hybrid) or Google Cloud Run. Auto-scales to 0.
*   **Workers**: Containerized Node.js background workers running on AWS ECS or GCP Cloud Run background jobs to constantly process BullMQ queues without HTTP timeout limits.
*   **Database**: Supabase (managed Postgres with pgvector).
*   **Cache/Queue**: Upstash Redis (serverless Redis).

## PART 13: How To Make This Enterprise-Grade
1.  **SOC 2 Compliance**: Provide audit logs of *every* agent thought and action. Use a WORM (Write Once Read Many) bucket for compliance logging.
2.  **Bring Your Own Key (BYOK)**: Allow enterprises to plug in their own Azure OpenAI or Google Cloud Vertex AI instances so data stays in their VPC.
3.  **Custom Modifiable Agents**: Allow enterprise users to edit the `SKILL.md` files dynamically in the UI to match their exact internal corporate tone.

## PART 14: Portfolio Project for AI Agent Engineer Roles (2026)
To make this stand out to top startups:
1.  **Go beyond LangChain/CrewAI**: Use Google Agents ADK and raw SDKs to show you understand determinism, state routing, and prompt engineering better than high-level abstractions.
2.  **Focus on Evals**: Show that you built rigorous unit tests for the agent in `evals.yaml`. A serious AI Engineer tests their prompts against baseline datasets (DeepEval / Ragas).
3.  **UI/UX of Agentic Progress**: The real magic is the frontend. Build a beautiful UI that streams the agents' "thoughts" in real-time (like a terminal or glowing process graph). Show, don't tell.

## PART 15: Exact Implementation Roadmap (MVP → Prod → Enterprise)

### Phase 1: MVP (Weeks 1-2)  *Context & Core*
- Setup Express app and basic React UI.
- Implement Planner Agent, Research Agent, and JD Creation Agent.
- Chain them sequentially in a single Express API route.
- Output: Given a paragraph, generate an intelligent Job Description.

### Phase 2: Orchestrator & State (Weeks 3-4) *Reliability*
- Introduce Redis, BullMQ, and PostgreSQL.
- Move from sequential execution to graph execution.
- Build the remaining Agents (Hunt, Nudge, Content, Editor, QC).
- Build the Human-in-the-Loop review UI.

### Phase 3: External World Connection (Weeks 5-6) *Utility*
- Implement MCP tools (ATS integration, LinkedIn scraping/mocking).
- Implement RAG (pgvector) to inject company context.

### Phase 4: Production Polish (Weeks 7-8) *Safety & UI*
- Build streaming real-time UI using Server-Sent Events (SSE) or WebSockets so the user watches agents work in real time.
- Implement Auth, Billing, and Tenant Isolation.
- Write robust evals for hallucination checks.

### Phase 5: Enterprise (Post-Launch)
- Build visual workflow editors.
- Implement SOC2 audit logs.
- Custom LLM fine-tuning based on company's previously successful job descriptions.
