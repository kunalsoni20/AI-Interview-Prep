const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Interview = require('../models/Interview');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
  }
});

// Function to parse resume from uploaded file
async function parseResume(file) {
  try {
    let text = '';
    if (file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(file.buffer);
      text = pdfData.text;
    } else {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      text = result.value;
    }
    return text;
  } catch (error) {
    console.error('Error parsing resume:', error);
    return '';
  }
}

router.post('/generate', protect, upload.single('resume'), async (req, res) => {
  try {
    const { jobTitle, jobDescription, userDescription } = req.body;
    let resumeText = '';
    
    if (req.file) {
      resumeText = await parseResume(req.file);
      console.log('Successfully parsed resume');
    }
    
    // Combine all user information
    const fullUserInfo = `${userDescription || ''}\n\nResume Content:\n${resumeText}`;
    console.log('Generating comprehensive interview report for:', jobTitle);

    const mockData = generateComprehensiveMockReport(jobTitle, fullUserInfo, jobDescription);

    const interview = await Interview.create({
      user: req.user._id,
      jobTitle,
      jobDescription,
      userDescription,
      resumeText,
      ...mockData
    });

    res.status(201).json(interview);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id/resume', protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const html = interview.resumeHtml || generateATSOptimizedResumeHtml(interview.jobTitle, interview.userDescription || interview.resumeText);

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename=ATS-Optimized-Resume-${interview.jobTitle.replace(/\s+/g, '-')}.html`);
    res.send(html);
  } catch (error) {
    console.error('Error generating resume:', error);
    res.status(500).json({ message: 'Error generating resume', error: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Interview.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/', protect, async (req, res) => {
  try {
    await Interview.deleteMany({ user: req.user._id });
    res.json({ message: 'All history cleared' });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

function generateComprehensiveMockReport(jobTitle, userInfo, jobDesc) {
  const score = calculateMatchScore(jobTitle, userInfo, jobDesc);
  const isFrontend = jobTitle.toLowerCase().includes('frontend') || jobTitle.toLowerCase().includes('front-end');
  const isBackend = jobTitle.toLowerCase().includes('backend') || jobTitle.toLowerCase().includes('back-end');
  const isFullstack = jobTitle.toLowerCase().includes('fullstack') || jobTitle.toLowerCase().includes('full-stack');
  
  return {
    matchScore: score,
    technicalQuestions: generateTechnicalQuestions(jobTitle, isFrontend, isBackend, isFullstack, userInfo),
    behavioralQuestions: generateBehavioralQuestions(),
    skillGaps: generateSkillGaps(jobTitle, isFrontend, isBackend, isFullstack),
    preparationPlan: generatePreparationPlan(jobTitle, isFrontend, isBackend, isFullstack),
    resumeHtml: generateATSOptimizedResumeHtml(jobTitle, userInfo)
  };
}

function calculateMatchScore(jobTitle, userInfo, jobDesc) {
  // Common technologies, languages, frameworks
  const techKeywords = new Set([
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'rust', 'go', 'kotlin', 'swift',
    'react', 'angular', 'vue', 'svelte', 'nodejs', 'node', 'express', 'django', 'flask', 'fastapi',
    'mongodb', 'postgres', 'postgresql', 'mysql', 'redis', 'dynamodb', 'sql', 'nosql',
    'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'git',
    'html', 'css', 'bootstrap', 'tailwind', 'webpack', 'vite', 'babel', 'eslint', 'jest',
    'rest', 'graphql', 'api', 'microservices', 'soap', 'grpc', 'websocket',
    'agile', 'scrum', 'kanban', 'ci/cd', 'devops', 'tdd', 'bdd',
    'machine', 'learning', 'tensorflow', 'pytorch', 'sklearn', 'numpy', 'pandas', 'ai', 'nlp',
    'react native', 'flutter', 'cordova', 'ionic', 'native',
    'salesforce', 'sap', 'jira', 'confluence', 'slack', 'excel', 'power', 'tableau'
  ]);

  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'you', 'your', 'from', 'are', 'was', 'were',
    'will', 'have', 'has', 'had', 'job', 'role', 'description', 'resume', 'candidate',
    'experience', 'skill', 'work', 'working', 'ability', 'able', 'etc', 'into', 'our',
    'their', 'them', 'they', 'too', 'use', 'using', 'used', 'within', 'based', 'about',
    'be', 'is', 'as', 'at', 'by', 'or', 'on', 'in', 'to', 'of', 'we', 'can', 'should',
    'must', 'may', 'would', 'could', 'should', 'do', 'does', 'doing', 'be', 'been'
  ]);

  const extractKeywords = (text) => {
    if (!text) return new Set();
    const lowerText = text.toLowerCase();
    const words = lowerText.match(/[a-z0-9+#.\-/_]+/g) || [];
    return new Set(words.filter((word) => word.length > 2 && !stopWords.has(word)));
  };

  const isTechKeyword = (word) => {
    return techKeywords.has(word) || [...techKeywords].some(tech => 
      tech.includes(word) || word.includes(tech)
    );
  };

  const text = `${jobTitle || ''} ${jobDesc || ''} ${userInfo || ''}`.toLowerCase();
  const jobText = `${jobTitle || ''} ${jobDesc || ''}`.toLowerCase();
  const userText = (userInfo || '').toLowerCase();

  const jobKeywords = extractKeywords(jobText);
  const candidateKeywords = extractKeywords(userText);
  const titleKeywords = extractKeywords(jobTitle || '');

  if (jobKeywords.size === 0 || candidateKeywords.size === 0) {
    return 0;
  }

  // Calculate keyword overlaps
  const allMatches = [...jobKeywords].filter((keyword) => candidateKeywords.has(keyword));
  const techMatches = allMatches.filter(isTechKeyword);
  const generalMatches = allMatches.filter(keyword => !isTechKeyword(keyword));

  // Calculate coverage percentages
  const jobTechKeywords = [...jobKeywords].filter(isTechKeyword);
  const candidateTechKeywords = [...candidateKeywords].filter(isTechKeyword);
  
  const techCoverage = jobTechKeywords.length > 0 
    ? techMatches.length / jobTechKeywords.length 
    : 0;
  
  const generalCoverage = jobKeywords.size > 0 
    ? generalMatches.length / jobKeywords.size 
    : 0;
  
  const titleMatch = titleKeywords.size > 0
    ? [...titleKeywords].filter((keyword) => candidateKeywords.has(keyword)).length / titleKeywords.size
    : 0;

  // Check for experience level match
  const jobExperienceMatch = extractExperienceLevel(jobText);
  const candidateExperienceMatch = extractExperienceLevel(userText);
  const experienceLevelScore = calculateExperienceLevelMatch(jobExperienceMatch, candidateExperienceMatch);

  // Calculate final score with better weighting
  // Tech skills are more important (40%), general keywords (25%), title (20%), experience level (15%)
  const rawScore = 
    (techCoverage * 40) + 
    (generalCoverage * 25) + 
    (titleMatch * 20) + 
    (experienceLevelScore * 15);

  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

function extractExperienceLevel(text) {
  const yearsMatch = text.match(/(\d+)\s*[\+-]?\s*years?/gi);
  const levels = {
    junior: text.includes('junior') || text.includes('entry level') || text.includes('entry-level') ? 1 : 0,
    mid: text.includes('mid') || text.includes('mid-level') ? 1 : 0,
    senior: text.includes('senior') || text.includes('lead') ? 1 : 0,
    principal: text.includes('principal') || text.includes('staff') ? 1 : 0
  };
  
  let years = 0;
  if (yearsMatch) {
    years = Math.max(...yearsMatch.map(m => parseInt(m.match(/\d+/)[0])));
  }

  return { years, levels };
}

function calculateExperienceLevelMatch(jobExp, candidateExp) {
  const jobLevel = Object.entries(jobExp.levels).findIndex(([_, v]) => v === 1);
  const candidateLevel = Object.entries(candidateExp.levels).findIndex(([_, v]) => v === 1);
  
  // If both have explicit level, check match
  if (jobLevel >= 0 && candidateLevel >= 0) {
    const diff = Math.abs(jobLevel - candidateLevel);
    return Math.max(0, 1 - (diff * 0.15)); // Penalty for level mismatch
  }

  // Use years as fallback
  if (jobExp.years > 0 && candidateExp.years > 0) {
    if (candidateExp.years < jobExp.years * 0.5) return 0.4; // Significantly under-experienced
    if (candidateExp.years < jobExp.years) return 0.7; // Slightly under-experienced
    if (candidateExp.years >= jobExp.years) return 1; // Meets or exceeds experience
  }

  return 0.5; // Default if no clear match
}

function generateTechnicalQuestions(jobTitle, isFrontend, isBackend, isFullstack, userInfo) {
  const questions = isFrontend ? [
    {
      question: `Explain the Virtual DOM in React and how it improves performance compared to direct DOM manipulation`,
      explanation: "This assesses your deep understanding of React's core architecture and optimization strategies, which is crucial for building performant user interfaces.",
      suggestedAnswer: `The Virtual DOM is a lightweight, in-memory JavaScript representation of the actual DOM elements. Here's how it works step-by-step:

1. **Initial Render**: When a React component mounts, it creates a Virtual DOM tree representing the UI.
2. **State/Props Change**: When state or props change, React creates a brand-new Virtual DOM tree.
3. **Diffing Algorithm**: React compares the new Virtual DOM with the old one (reconciliation), finding the minimal set of changes needed.
4. **Batch Updates**: Instead of updating the DOM one element at a time, React batches these updates for efficiency.
5. **Real DOM Update**: Only the specific changed parts are updated in the real DOM.

**Why this matters**: DOM operations are extremely slow compared to JavaScript operations. The Virtual DOM minimizes these expensive DOM manipulations, making React apps feel fast and responsive even with complex interfaces.

**Example**: In my previous role at TechCorp, we had a dashboard with 100+ real-time updating components. By optimizing our render methods and leveraging React.memo, useMemo, and useCallback, we reduced our average component re-render time from 120ms to 15ms, making the entire application feel snappy even under heavy load.`
    },
    {
      question: `How would you optimize a web application's Core Web Vitals (LCP, FID, CLS) for production?`,
      explanation: "Core Web Vitals are critical for user experience and SEO, so interviewers want to know you can build performant, user-friendly applications.",
      suggestedAnswer: `Optimizing Core Web Vitals requires a holistic approach:

**Largest Contentful Paint (LCP) - Target: <2.5s**
- Optimize images: Use WebP/AVIF formats, implement responsive images with srcset, lazy-load below-the-fold images
- Serve static assets via CDN with edge caching
- Remove unused CSS and JavaScript (tree shaking, code splitting)
- Implement server-side rendering or static site generation

**First Input Delay (FID) - Target: <100ms**
- Code splitting to reduce initial JS bundle size
- Defer non-critical JavaScript
- Use Web Workers for heavy computations
- Optimize third-party scripts (load asynchronously, lazy-load)

**Cumulative Layout Shift (CLS) - Target: <0.1**
- Always set width and height attributes on images
- Reserve space for dynamic content and ads
- Avoid inserting content above existing content without user interaction
- Use transform animations instead of top/left

**Measuring Success**:
- Use Lighthouse for audits
- Implement Real User Monitoring (RUM) tools like Sentry or New Relic
- Continuously monitor performance in production

**Results from Past Experience**: At my last job, we improved LCP from 3.8s to 1.2s, FID from 280ms to 60ms, and CLS from 0.25 to 0.05 within 2 months. These improvements increased our organic search traffic by 40% and reduced bounce rate by 18%.`
    },
    {
      question: `Compare and contrast state management solutions: Context API + useReducer, Redux Toolkit, Zustand, and React Query/SWR`,
      explanation: "This evaluates your architectural decision-making skills and knowledge of the modern React ecosystem.",
      suggestedAnswer: `Choosing the right state management depends on your app's complexity and needs:

**Context API + useReducer**
- Best for: Small to medium apps, specific feature modules
- Pros: Built into React, no extra dependencies, simple setup
- Cons: Can cause unnecessary re-renders if not optimized, no devtools, no middleware support

**Redux Toolkit (RTK)**
- Best for: Large, complex apps with many state interactions, teams
- Pros: Predictable state updates, excellent devtools, middleware ecosystem, RTK Query for server state
- Cons: More boilerplate (though RTK reduces this), steeper learning curve

**Zustand**
- Best for: Small to medium apps, when you need something simpler than Redux
- Pros: Minimal API, excellent performance, no provider wrapping, great TypeScript support
- Cons: Less ecosystem than Redux, smaller community

**React Query/SWR**
- Best for: Server state management (API calls, caching, synchronization)
- Pros: Automatic caching, background updates, pagination/load more support, dedupes requests
- Cons: Not for local UI state

**My Recommendation**: Use React Query/SWR for server state, and Zustand or Context API for local UI state. Reserve Redux Toolkit for very large applications with complex state workflows.

**Real-World Example**: For an e-commerce dashboard I built, we used RTK Query for all API data and Zustand for cart state and UI preferences. This hybrid approach gave us the best of both worlds: excellent server state management with minimal boilerplate for local state.`
    },
    {
      question: `How do you approach CSS architecture and styling in large applications? Compare CSS Modules, CSS-in-JS, and Tailwind CSS.`,
      explanation: "This checks if you can write maintainable CSS at scale, which is a common pain point in large applications.",
      suggestedAnswer: `Here's my approach to scalable CSS architecture:

**CSS Architecture Principles**:
- Consistent naming conventions (BEM, SUIT CSS)
- Component-scoped styles to avoid specificity wars
- Design tokens for colors, spacing, typography
- Responsive design from the start

**Styling Approaches**:

**CSS Modules**
- Pros: Scoped by default, no build tool lock-in, familiar CSS syntax
- Cons: No dynamic styles without CSS variables, no dead code elimination
- Best for: Teams that want to stick close to standard CSS

**CSS-in-JS (Styled Components, Emotion)**
- Pros: Scoped styles, dynamic styling with props, critical CSS extraction
- Cons: Runtime overhead (mostly negligible now), can complicate SSR
- Best for: Component libraries, apps with complex theming needs

**Tailwind CSS**
- Pros: Extremely fast development, excellent tree-shaking, consistent design
- Cons: Steep learning curve for teams new to utility-first, large HTML class attributes
- Best for: Most modern applications, especially when paired with a component library

**My Current Preference**: Tailwind CSS with components for repeated patterns. I've found it to be the fastest approach for building and maintaining large applications, and it pairs wonderfully with React.

**Pro Tip**: No matter which approach you choose, invest in a good design system with clear tokens and components. This will make your UI consistent and your team much more productive.`
    },
    {
      question: `Walk me through your frontend testing strategy. What tools do you use and what do you test?`,
      explanation: "Testing is crucial for maintaining code quality, especially on teams. Interviewers want to know you take testing seriously.",
      suggestedAnswer: `My testing philosophy follows the **Testing Trophy** approach (a modern take on the Testing Pyramid):

**Testing Tools I Use**:
- Unit tests: Jest + React Testing Library
- Integration tests: React Testing Library + MSW (Mock Service Worker)
- E2E tests: Playwright (or Cypress)
- Accessibility: axe-core + manual testing
- Visual regression: Chromatic

**What I Test (in order of priority)**:

1. **Critical User Paths** (E2E): Login, signup, checkout, core features users rely on
2. **Component Behavior** (Integration): Do components work together as expected?
3. **Complex Logic** (Unit): Custom hooks, utility functions, edge cases
4. **Accessibility**: Can all users use the app with assistive technologies?
5. **Visual**: Do components look correct across breakpoints?

**Testing Principles**:
- Test behavior, not implementation
- Make tests fast and reliable (avoid sleeps!)
- Keep tests maintainable and readable
- Mock external dependencies (APIs, timers)

**Coverage**: I aim for 80%+ coverage on critical code, but value quality of tests over raw coverage numbers.

**Real-World Impact**: On a team I led, we implemented this strategy and reduced production bugs by 65%. Our test suite ran in under 5 minutes, giving us confidence to ship multiple times per week.`
    }
  ] : isBackend ? [
    {
      question: `What are RESTful API design best practices, and how have you applied them in real projects?`,
      explanation: "This assesses your ability to design intuitive, scalable APIs that frontend developers love to work with.",
      suggestedAnswer: `Here are RESTful API design best practices I always follow:

**Nouns Over Verbs**
- Good: GET /api/v1/users, POST /api/v1/orders
- Bad: GET /api/getUsers, POST /api/createOrder

**HTTP Methods Correctly**
- GET: Retrieve resources
- POST: Create new resources
- PUT: Update entire resource
- PATCH: Update partial resource
- DELETE: Remove resource

**Proper Status Codes**
- 200 OK: Success
- 201 Created: Resource created
- 204 No Content: Success with no response body
- 400 Bad Request: Invalid input
- 401 Unauthorized: Missing/invalid credentials
- 403 Forbidden: No permission
- 404 Not Found: Resource doesn't exist
- 500 Internal Server Error: Server error

**Other Important Practices**:
- Version your API (/api/v1/, /api/v2/)
- Support filtering, sorting, and pagination
- Rate limiting to prevent abuse
- Consistent error response format
- HATEOAS (optional, but useful)
- Comprehensive documentation (OpenAPI/Swagger)

**Real-World Example**: I designed an e-commerce API used by 5 frontend teams. By following these practices, our API was intuitive to use, reduced support questions, and scaled to handle 100K+ requests per minute during peak sales periods.`
    },
    {
      question: `How would you design and optimize a database schema for a large-scale application? Walk me through your process.`,
      explanation: "Database performance is often the bottleneck in applications. This tests your ability to design for scale.",
      suggestedAnswer: `Here's my process for designing and optimizing database schemas:

**Step 1: Understand Requirements**
- Analyze query patterns (what gets read most, written most?)
- Identify business entities and relationships
- Define SLA requirements (response time targets, uptime needs)

**Step 2: Design Schema**
- Normalize to eliminate redundancy (3NF is a good default)
- But denormalize read-heavy data for performance
- Choose appropriate data types (don't use VARCHAR(255) for everything!)
- Design for the query patterns you expect

**Step 3: Optimize Queries**
- Create composite indexes for frequent filter combinations
- Avoid N+1 queries (use joins, eager loading)
- Use EXPLAIN ANALYZE to understand query plans
- Select only the columns you need

**Step 4: Scale the Database**
- Read replicas for heavy read workloads
- Sharding for very large datasets
- Connection pooling
- Caching frequent queries (Redis, Memcached)

**Step 5: Monitor & Iterate**
- Track slow queries
- Monitor database metrics (CPU, memory, I/O)
- Continuously refine based on real-world usage

**Real-World Success Story**: At FinTech Startup, our database was struggling with report generation queries taking 30+ seconds. By adding composite indexes, rewriting a few problematic queries, and implementing Redis caching for reports, we reduced query time to under 500ms. This made our users happy and saved us $10K/month in database costs!`
    },
    {
      question: `Explain your approach to authentication and authorization in backend systems. What security considerations do you keep in mind?`,
      explanation: "Security is critical. Interviewers want to know you can build systems that protect user data.",
      suggestedAnswer: `Here's my comprehensive approach to auth:

**Authentication (Who You Are)**
- Email/password with bcrypt (or better, Argon2) hashing
- JWT with refresh tokens for stateless auth
- OAuth2/OpenID Connect for third-party logins (Google, GitHub, etc.)
- Passwordless options (magic links, OTP via email/SMS)

**Authorization (What You Can Do)**
- Role-Based Access Control (RBAC) for most applications
- Attribute-Based Access Control (ABAC) for complex requirements
- Always validate permissions on the server (never trust the client!)

**Security Best Practices**
- Always use HTTPS (TLS 1.3)
- Short-lived access tokens (15-60 mins) with long-lived refresh tokens
- Store refresh tokens securely (HTTP-only, Secure cookies)
- Rate limiting on auth endpoints to prevent brute-force attacks
- CSRF protection for state-changing requests
- Regularly rotate secrets (API keys, JWT secrets)
- Implement account lockout after failed attempts
- Audit logs for sensitive operations

**What I've Built**: I implemented a comprehensive auth system for a SaaS product with 100K+ users, supporting multiple login methods, RBAC with 5 custom roles, and all the security best practices listed above. We never had a security breach, and our users enjoyed a seamless auth experience.`
    },
    {
      question: `How do you design systems for scalability and high availability?`,
      explanation: "This evaluates your system design skills - can you build systems that keep working even under heavy load?",
      suggestedAnswer: `Designing scalable, highly available systems requires a layered approach:

**Stateless Applications**
- Any server can handle any request (no server-specific state)
- Store session data in Redis or similar
- This makes horizontal scaling easy

**Load Balancing**
- Distribute traffic across servers (Nginx, AWS ALB, Cloudflare)
- Health checks to remove unhealthy instances automatically
- Evenly distribute load

**Caching**
- Redis for frequent, slow-changing data
- CDN for static assets
- Application-level caching
- Cache invalidation strategy is crucial!

**Database Scaling**
- Read replicas for read-heavy workloads
- Sharding for very large datasets
- Consider managed databases (AWS RDS, Aurora) for reduced operational burden

**High Availability**
- Multiple Availability Zones (AZs)
- Automated failover
- Circuit breakers to prevent cascading failures
- Graceful degradation (some features fail, core stays up)

**Monitoring & Observability**
- Metrics (Prometheus, DataDog)
- Logs (ELK stack, Loki)
- Tracing (Jaeger, Zipkin)
- Alerts for anomalies

**Real-World Example**: I helped migrate a monolithic app to a microservices architecture on Kubernetes. We achieved 99.99% uptime and could handle 10x our previous traffic volume.`
    },
    {
      question: `What backend technologies have you learned recently, and how have you applied them?`,
      explanation: "This shows you're curious and continuously learning - important in fast-moving tech.",
      suggestedAnswer: `I'm always learning new technologies! Here are some of my recent explorations:

**tRPC**
- End-to-end type-safe APIs without schema definition or code generation
- Perfect for TypeScript monorepos
- Used in personal project: Cut frontend/backend integration time in half

**Prisma ORM**
- Modern, type-safe ORM for TypeScript/Node.js
- Intuitive schema language, great migrations
- Used in production: Replaced our old ORM, reduced database-related bugs by 40%

**Serverless & Edge Functions**
- Vercel Edge Functions, Cloudflare Workers
- Ultra-low latency for specific use cases
- Applied to: Authentication middleware, A/B testing, personalization

**What's Next**: I'm currently learning more about event-driven architectures with Kafka, as I believe this pattern will be crucial for the next product I build.

**Learning Philosophy**: I don't learn technologies just for fun. I learn them to solve specific problems. I always start with a small project to validate the technology solves the problem well before considering it for production.`
    }
  ] : [
    {
      question: `Walk me through your experience with the core technologies for ${jobTitle} roles. What's the most complex system you've built?`,
      explanation: "This question assesses your real-world experience and depth of understanding.",
      suggestedAnswer: `I've worked as a ${jobTitle} for 4+ years, across startups and large enterprises. Here are my core competencies:

**Technical Stack**:
- Languages: JavaScript/TypeScript, Python, Go
- Frontend: React, Next.js, Tailwind CSS
- Backend: Node.js, Express, FastAPI
- Databases: PostgreSQL, MongoDB, Redis
- Cloud: AWS, Vercel, Docker
- Tools: Git, GitHub Actions, Jira

**Most Complex System**:
I led development of a real-time analytics dashboard at DataFlow Inc., serving 500+ enterprise customers. Here's what we built:

- Real-time data ingestion pipeline handling 1M+ events/minute
- Custom visualization engine with 20+ chart types
- Role-based access control (RBAC) with 12 custom roles
- Alerting system with 500K+ active alerts
- Comprehensive API serving 100K+ requests/minute

**Challenges Overcome**:
- We initially struggled with real-time updates at scale - solved by switching to WebSocket connections with Redis pub/sub
- Our first database schema had poor query performance - fixed with composite indexes and strategic denormalization

**Impact**:
- Reduced customer churn by 25%
- Grew NPS from 35 to 72
- Won "Product of the Year" in our category

This project taught me the importance of starting simple, measuring everything, and iterating based on real user feedback.`
    },
    {
      question: `Tell me about a time you solved a really challenging technical problem. Walk me through your process.`,
      explanation: "This is all about your problem-solving approach. Can you work through tough problems systematically?",
      suggestedAnswer: `Let me tell you about a time I solved a major performance issue that was blocking our product launch:

**The Problem**:
Our new feature was supposed to launch in 3 weeks, but we discovered that one core flow was taking 45 seconds to load. Unacceptable!

**My Process**:

1. **Measure, Don't Guess**
   - I used APM tools to profile the issue
   - Discovered: 120+ database queries (N+1 hell!) and unoptimized API responses

2. **Formulate Hypotheses**
   - Hypothesis 1: We're fetching too much data per request
   - Hypothesis 2: Missing database indexes
   - Hypothesis 3: No caching for frequent queries

3. **Test & Validate**
   - Added database logs - found 80+ unindexed queries
   - Used EXPLAIN ANALYZE - confirmed table scans on large tables
   - Checked cache - we weren't caching anything!

4. **Implement Solutions**
   - Fixed the N+1 queries with proper joins/eager loading
   - Added composite indexes for frequent filter combinations
   - Implemented Redis caching for the 10 most frequent queries
   - Added pagination and reduced response size

5. **Measure Impact**
   - From 45 seconds to 1.2 seconds! 37.5x improvement
   - Database load dropped by 80%
   - Feature launched on time to great reviews

6. **Prevent Recurrence**
   - Added performance tests to CI/CD pipeline
   - Created documentation for database best practices
   - Held a team workshop on query optimization

**Key Takeaway**: Always measure before optimizing. Guesses waste time. Data drives solutions.`
    },
    {
      question: `How do you ensure code quality and maintainability in the teams you work on?`,
      explanation: "This shows you care about long-term health of codebases and can work well on teams.",
      suggestedAnswer: `Here's my approach to code quality:

**Defining Standards**
- Style guides: ESLint, Prettier, Black, gofmt - enforced in CI
- Architectural principles documented and agreed to by the team
- Design systems and component libraries for consistency

**Preventing Bad Code from Merging**
- 100% of code reviewed by at least one other person
- Automated tests must pass (unit, integration, E2E)
- Linting and type checking enforced
- Security scanning (e.g., Snyk)

**Keeping Code Healthy Over Time**
- Regular refactoring sprints (1 day every 2 weeks)
- Tech debt tracked and prioritized
- Documentation: READMEs, architecture docs, inline comments for complex logic
- Pairing and knowledge sharing

**Positive Team Culture**
- Code reviews are collaborative, not adversarial
- We celebrate learning from mistakes
- Everyone on the team is encouraged to suggest improvements

**Results**: At my last company, we reduced bugs in production by 70% and increased team velocity by 35% over 18 months by following these practices.`
    },
    {
      question: `Explain a complex technical concept in simple terms to someone non-technical.`,
      explanation: "Great engineers can communicate with non-technical stakeholders. This tests that skill.",
      suggestedAnswer: `Let's explain how the internet works using the analogy of a postal service:

**Imagine you want to send a letter to your friend in another city.**

1. **You (Your Computer)**: Write the letter and put your friend's address on it.
2. **Mail Carrier (Your Wi-Fi/ISP)**: Takes your letter to the local post office.
3. **Local Post Office (DNS Server)**: Looks up the exact location of your friend's city post office.
4. **Postal Route (Internet Routers)**: Your letter is passed from post office to post office, getting closer to its destination.
5. **Friend's Post Office (Server)**: Receives your letter and sends it to your friend's house.
6. **Your Friend (Server Response)**: Reads your letter and writes one back.
7. **Return Journey**: The whole process happens in reverse!

**What about Data Packets?**
If you have a big package, the postal service breaks it into smaller, easy-to-deliver envelopes. Your friend then puts them back together. This is exactly how your computer sends big files over the internet - as small data packets!

**Why This Matters**: This analogy helps non-technical people understand why sometimes websites are slow (maybe "postal route" is congested), or why a website might be "down" (maybe their "house" is being renovated!).

This skill is crucial because it helps me collaborate with product managers, designers, and executives to build great products together.`
    },
    {
      question: `Tell me about a time you learned something completely new and applied it successfully.`,
      explanation: "This shows you're adaptable and can pick up new skills quickly - essential in our industry.",
      suggestedAnswer: `Here's a time I went from zero experience with machine learning to shipping an ML feature in production:

**The Situation**:
Our product team wanted a feature that could suggest email responses to users. No one on the team had ML experience.

**My Learning Journey**:

1. **Week 1: Foundations**
   - Completed Andrew Ng's Machine Learning course on Coursera
   - Read introductory books and blog posts
   - Built simple toy models in Python

2. **Week 2: Project Planning**
   - Defined scope: Focus on 3 common email response types
   - Researched approaches: Started with simple rule-based, then moved to fine-tuning a pre-trained model
   - Got buy-in from leadership for a 4-week experiment

3. **Week 3-4: Building & Integrating**
   - Used Hugging Face transformers (pre-trained BERT model)
   - Fine-tuned on our anonymized user email data
   - Built a simple API and integrated with our app

4. **Launch!**
   - A/B tested to 10% of users
   - 45% of users found the suggestions helpful!
   - Rolled out to everyone

**Results**:
- Feature increased user engagement by 22%
- Saved users an average of 5 minutes/day
- I became our team's go-to person for ML-related questions

**Key Takeaway**: Don't be afraid to jump into the deep end! Break big problems into small steps, learn by doing, and start small. You don't need to be an expert to make an impact.`
    }
  ];
  
  return questions;
}

function generateBehavioralQuestions() {
  return [
    {
      question: `Tell me about a time you worked under extremely tight deadlines. How did you manage, and what was the outcome?`,
      starGuidance: `**S (Situation)**: At e-commerce startup "ShopFast," we were acquired by a major retailer. We had only 3 weeks to completely rebuild our checkout flow to integrate with their systems before Black Friday - our busiest time of year. To make matters worse, our lead developer left for another job 2 days after the acquisition was announced.

**T (Task)**: I needed to step up as tech lead, coordinate the remaining 4 developers, redesign the checkout architecture, integrate with new systems, and ship it all without bugs during our highest-traffic period.

**A (Action)**:
- First, I worked with product to ruthlessly prioritize: cut 40% of non-essential features
- Next, I held a quick architecture session and divided work based on each person's strengths
- I implemented daily 15-minute standups in the morning and 10-minute check-ins at the end of the day to remove blockers fast
- I communicated transparently with stakeholders - we didn't hit every stretch goal, but kept everyone aligned on what was realistic
- I personally took on the most critical integration with the payment processor, working extra hours while making sure the team didn't burn out
- We paired extensively on complex parts, and implemented automated tests for every critical flow

**R (Result)**:
- We launched on time and without critical bugs!
- Black Friday checkout conversion was actually 15% higher than the previous year
- The team kept morale high and we had a great celebration after launch
- Our retail partners were impressed and gave our team a special bonus
- This experience taught me that clear communication, smart prioritization, and supporting your team can make miracles happen under pressure`
    },
    {
      question: `Describe a time you had a significant disagreement with a team member about a technical decision. How did you resolve it?`,
      starGuidance: `**S (Situation)**: My teammate Priya and I had opposing views on the database for our new feature. She wanted to use Cassandra because it's highly scalable for our projected growth. I wanted to stick with PostgreSQL because our team already knew it, and we weren't sure if Cassandra's scalability would actually be needed.

**T (Task)**: We needed to resolve this without damaging our working relationship, and make the right decision for the company.

**A (Action)**:
- Instead of arguing, I scheduled a dedicated 1-hour meeting just for this, no distractions
- We both came prepared with pros/cons lists, and examples of companies with similar use cases using both
- I asked Priya to explain her concerns first, and really listened without interrupting
- She asked me questions, and I clearly articulated my concerns about learning curves and operational complexity
- Instead of "all or nothing," we proposed a compromise: use PostgreSQL now, but design our data layer so we could switch to Cassandra later if needed
- We agreed on clear metrics to decide if we need to switch in the future (e.g., if we hit 100K writes per second)
- We presented our joint proposal to the team, who agreed

**R (Result)**:
- We launched successfully on PostgreSQL, and it performed great
- 2 years later, we hadn't hit our scaling threshold, saving us months of engineering time
- Priya and I actually became closer collaborators after this - we learned we work best together when we take the time to understand each other's perspectives
- We started a "disagree and commit" norm on the team, and this became an example for how to handle conflict constructively`
    },
    {
      question: `Tell me about a major project or initiative you worked on that failed. What did you learn, and how did you apply those lessons later?`,
      starGuidance: `**S (Situation)**: I was the tech lead for a complete rewrite of our legacy reporting system at "DataVision." We spent 6 months planning and executing what we thought would be a massive improvement: new architecture, modern tech stack, beautiful UI.

**T (Task)**: Deliver a system that was faster, easier to use, and would reduce support tickets by 50%.

**A (Action)**:
- We went with a "big bang" rewrite approach instead of incrementally improving
- We assumed we knew all user requirements without enough validation
- We didn't involve end-users enough during development
- We cut corners on testing to hit our deadline

**A (What Happened)**: When we launched it was a disaster!
- Users hated the new UI - they couldn't find their favorite features
- Some critical reports were missing
- Performance was actually worse than the old system
- Support tickets increased 300% instead of decreasing
- We had to roll back after 1 week

**R (Result & Lessons Learned)**:
- We conducted a no-blame post-mortem with the entire team and users
- Key lessons:
  1. Always involve users early and often (build in public!)
  2. Iterate incrementally - don't do big bang rewrites
  3. Testing is non-negotiable
  4. Perfect is the enemy of good - ship small and improve

**How I Applied This Later**:
- My next project, we used a different approach: we launched a minimum viable version to 10% of users in 4 weeks, then improved it based on feedback every week
- That project was a massive success: 100% adoption on launch day, NPS increased by 40, support tickets dropped
- I'm now a huge advocate for iterative development and user-centric design. That failure made me a much better engineer and leader.`
    },
    {
      question: `Describe a time you took initiative beyond your job description to solve a problem or improve something.`,
      starGuidance: `**S (Situation)**: At "FlowTech," I noticed our team was spending 15-20 hours per week on repetitive manual tasks: running the same reports, checking the same dashboards, updating the same spreadsheets. This was taking time away from building features that actually moved the needle for users.

**T (Task)**: I wanted to fix this, even though it wasn't my assigned responsibility. My goal was to save the team at least 10 hours per week.

**A (Action)**:
- First, I spent a week documenting every repetitive task the team was doing
- Then, I prioritized them based on time saved vs. effort to automate
- Over the next 3 weekends (and some evenings), I built 3 automation scripts in Python:
  1. A script that generates our weekly performance report automatically
  2. A bot that monitors our dashboards and alerts us only if something is wrong
  3. A tool that auto-updates our project tracker from GitHub
- I created simple documentation and held a 30-minute training with the team
- I set up monitoring so we could track how much time we were saving
- I shared the results with my manager and the rest of the company

**R (Result)**:
- We saved 18 hours per week immediately - that's almost a full person!
- Within 6 months, other teams adopted our scripts, saving the company ~100 hours per week total
- I got recognized at the all-hands meeting and given a $2,500 bonus
- This led to a company-wide initiative around process automation
- I learned that great things happen when you solve problems even when they're not "your job." You don't need permission to make things better!`
    },
    {
      question: `Tell me about a time you had to learn a brand-new technology or skill very quickly to solve a problem.`,
      starGuidance: `**S (Situation)**: At "HealthCare App," our main backend developer suddenly gave notice and had her last day in 2 weeks. We had a critical HIPAA-compliant API integration that needed to be completed in 3 weeks - using Go, a language I had never written before!

**T (Task)**: I needed to go from zero Go experience to shipping a production-quality HIPAA-compliant API in 3 weeks.

**A (Action)**:
- First, I blocked my calendar almost entirely for focused learning for 3 days
- I took a high-quality online course on Udemy focused on Go for backend development
- I reached out to my network and found a mentor who was a Go expert - had 2 quick calls with him
- I built a small throwaway project (a todo app API) to practice the basics
- I found similar Go projects on GitHub and studied their patterns
- I used TDD (Test-Driven Development) to help me learn - writing tests first forced me to understand how the language works
- I documented everything I was learning in a personal wiki
- I committed frequently and had my remaining teammates review my code even more than usual

**R (Result)**:
- We shipped the API integration on time - 1 day early, actually!
- The code was solid, well-tested, and actually became a reference in our team
- We passed our HIPAA audit with flying colors
- I became the team's go-to person for Go
- Later, I gave a lunch-and-learn to the company about "learning new tech quickly"
- This experience made me much more confident: I now know I can learn almost anything quickly if I focus and use the right strategies`
    }
  ];
}

function generateSkillGaps(jobTitle, isFrontend, isBackend, isFullstack) {
  const gaps = isFrontend ? [
    { skill: 'Advanced System Architecture for Large-Scale SPAs', severity: 'high' },
    { skill: 'WebGL/3D Graphics (Three.js, React Three Fiber)', severity: 'medium' },
    { skill: 'Edge Computing & Vercel Edge Functions', severity: 'medium' },
    { skill: 'WebAssembly and WASM Integration', severity: 'low' }
  ] : isBackend ? [
    { skill: 'Kubernetes & Production Container Orchestration', severity: 'high' },
    { skill: 'Distributed Systems & Consensus Algorithms', severity: 'high' },
    { skill: 'Advanced GraphQL & Federation at Scale', severity: 'medium' },
    { skill: 'Event-Driven Architectures with Kafka', severity: 'medium' }
  ] : [
    { skill: 'System Design for High-Scale Applications', severity: 'high' },
    { skill: 'Advanced Cloud Infrastructure (AWS/GCP/Azure)', severity: 'high' },
    { skill: 'DevOps & SRE Practices', severity: 'medium' },
    { skill: 'Domain-Specific Technologies', severity: 'low' }
  ];
  return gaps;
}

function generatePreparationPlan(jobTitle, isFrontend, isBackend, isFullstack) {
  return [
    {
      day: 1,
      tasks: [
        'Deep dive into the job description - highlight every single requirement',
        'Research the company: product, business model, recent news, tech stack, culture',
        'Prepare your "why this company?" story - be specific!',
        'Draft 7-8 STAR stories for common behavioral questions',
        'Review your resume highlights - be ready to elaborate on every bullet point with numbers'
      ]
    },
    {
      day: 2,
      tasks: [
        `Study core ${isFrontend ? 'frontend' : isBackend ? 'backend' : 'relevant'} concepts: data structures, algorithms, system design basics`,
        'Practice explaining complex technical concepts simply to a friend',
        'Review past projects and prepare detailed talking points about your contributions',
        'Go through 10-15 common interview questions for this role and outline answers',
        'Do a self-assessment against the job requirements - where are your gaps?'
      ]
    },
    {
      day: 3,
      tasks: [
        'Practice behavioral questions OUT LOUD - record yourself and review!',
        'Do a full mock interview with a friend or mentor - ask for honest feedback',
        'Prepare thoughtful, specific questions to ask the interviewer',
        'Research your interviewers on LinkedIn (if you know who they are)',
        'Plan how to explain any employment gaps or transitions positively'
      ]
    },
    {
      day: 4,
      tasks: [
        'Review your STAR stories - refine them to be more concise and impactful',
        'Prepare concrete examples of your work and achievements with metrics',
        'Remind yourself of numbers: revenue, users, time saved, performance improvements',
        'Go back to the job description - make sure you have stories for all requirements',
        'Do a quick refresher on key technical topics, but don\'t cram everything!'
      ]
    },
    {
      day: 5,
      tasks: [
        'Light review only - don\'t learn new material',
        'Plan interview day logistics: test tech, quiet space, good lighting, water nearby',
        'Prepare your environment: professional background, no distractions',
        'Get a good night\'s sleep (7-9 hours) - this is one of the most important things!',
        'Plan something relaxing for before the interview: go for a walk, meditate, listen to music'
      ]
    }
  ];
}

function generateATSOptimizedResumeHtml(jobTitle, userInfo) {
  const name = "Your Name Here";
  const email = "professional@email.com";
  const phone = "(555) 123-4567";
  const linkedin = "linkedin.com/in/yourprofile";
  const github = "github.com/yourusername";
  const location = "City, State (Remote)";
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ATS-Optimized Resume - ${name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', 'Arial', sans-serif; 
            line-height: 1.6; 
            color: #1f2937; 
            background: #f8fafc; 
            padding: 40px; 
        }
        .resume { 
            max-width: 850px; 
            margin: 0 auto; 
            background: white; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.1); 
            padding: 60px 70px; 
        }
        .header { 
            text-align: center; 
            margin-bottom: 40px; 
            padding-bottom: 25px; 
            border-bottom: 4px solid #667eea; 
        }
        .header h1 { 
            font-size: 42px; 
            font-weight: 800; 
            color: #1f2937; 
            margin-bottom: 8px; 
            letter-spacing: -0.5px;
        }
        .header .title { 
            font-size: 22px; 
            color: #667eea; 
            font-weight: 700; 
            margin-bottom: 18px; 
        }
        .contact { 
            color: #4b5563; 
            font-size: 16px; 
            display: flex; 
            justify-content: center; 
            gap: 20px; 
            flex-wrap: wrap; 
        }
        .contact a { 
            color: #4b5563; 
            text-decoration: none; 
        }
        .section { 
            margin-bottom: 35px; 
        }
        .section-title { 
            font-size: 20px; 
            font-weight: 800; 
            color: #1f2937; 
            margin-bottom: 18px; 
            padding-bottom: 8px; 
            border-bottom: 2px solid #e5e7eb; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .experience-item { 
            margin-bottom: 28px; 
        }
        .experience-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            margin-bottom: 8px;
        }
        .job-title { 
            font-weight: 800; 
            font-size: 18px; 
            color: #1f2937; 
        }
        .company { 
            font-weight: 700; 
            color: #667eea; 
            font-size: 16px;
        }
        .date-location { 
            color: #6b7280; 
            font-size: 15px; 
            font-weight: 500;
        }
        ul { 
            margin-left: 24px; 
            color: #374151; 
            margin-top: 12px;
        }
        li { 
            margin-bottom: 10px; 
            font-size: 16px;
        }
        .skills-grid { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 10px; 
        }
        .skill-category { 
            font-weight: 700; 
            color: #1f2937; 
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="resume">
        <div class="header">
            <h1>${name}</h1>
            <div class="title">${jobTitle}</div>
            <div class="contact">
                <span>📧 ${email}</span>
                <span>📱 ${phone}</span>
                <span>📍 ${location}</span>
            </div>
            <div class="contact" style="margin-top: 8px;">
                <span>🔗 <a href="https://${linkedin}">${linkedin}</a></span>
                <span>💻 <a href="https://${github}">${github}</a></span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Professional Summary</div>
            <p style="color: #374151; font-size: 16px;">
                Results-driven ${jobTitle.toLowerCase()} with 5+ years of experience designing, developing, and shipping high-quality software products. 
                ${userInfo ? userInfo.substring(0, 350).replace(/\n/g, ' ') : 'Proven track record of improving performance, reducing bugs, and leading teams to deliver features users love. Passionate about clean code, user-centric design, and continuous learning.'}
            </p>
        </div>

        <div class="section">
            <div class="section-title">Core Competencies</div>
            <div class="skills-grid">
                <div>
                    <span class="skill-category">Technical Skills:</span>
                    <p>JavaScript, TypeScript, Python, React, Next.js, Node.js, Express, PostgreSQL, MongoDB, Redis, Docker</p>
                </div>
                <div>
                    <span class="skill-category">Tools & Methods:</span>
                    <p>Git, GitHub, CI/CD, Agile/Scrum, TDD, Code Review, REST APIs, GraphQL, Cloud Computing</p>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Professional Experience</div>
            
            <div class="experience-item">
                <div class="experience-header">
                    <div>
                        <div class="job-title">Senior ${jobTitle}</div>
                        <div class="company">TechFlow Inc. • San Francisco, CA</div>
                    </div>
                    <div class="date-location">Jan 2022 – Present</div>
                </div>
                <ul>
                    <li>Led development of a real-time dashboard used by 500+ enterprise customers, improving user engagement by 45%</li>
                    <li>Architected and implemented scalable microservices architecture, reducing latency by 60% and increasing throughput by 3x</li>
                    <li>Mentored a team of 5 junior developers, conducting code reviews and technical interviews</li>
                    <li>Established coding standards and CI/CD pipelines, reducing production bugs by 70%</li>
                </ul>
            </div>

            <div class="experience-item">
                <div class="experience-header">
                    <div>
                        <div class="job-title">${jobTitle}</div>
                        <div class="company">StartupX • New York, NY</div>
                    </div>
                    <div class="date-location">Jun 2019 – Dec 2021</div>
                </div>
                <ul>
                    <li>Built and maintained core product features from scratch, growing the user base from 10K to 100K+</li>
                    <li>Optimized database queries and implemented caching, improving application performance by 65%</li>
                    <li>Collaborated with product and design teams to ship user-centric features every 2 weeks</li>
                    <li>Implemented automated testing strategies, achieving 85% test coverage</li>
                </ul>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Education</div>
            <div class="experience-item" style="margin-bottom: 0;">
                <div class="experience-header">
                    <div>
                        <div class="job-title">Bachelor of Science in Computer Science</div>
                        <div class="company">University of Technology</div>
                    </div>
                    <div class="date-location">2015 – 2019</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Key Projects & Achievements</div>
            <ul>
                <li>Delivered a critical feature under a tight 3-week deadline, resulting in $250K+ in additional revenue</li>
                <li>Received "Employee of the Quarter" 3 times for outstanding contributions</li>
                <li>Open-sourced an internal tool that now has 2.5K+ stars on GitHub</li>
                <li>Speaker at 3 industry conferences on modern development practices</li>
            </ul>
        </div>
    </div>
</body>
</html>`;
}

module.exports = router;
