import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON Database File Path
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Ensure DB directory and file exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

interface LocalDB {
  users: any[];
  sessions: any[];
  questions: any[];
}

function loadDB(): LocalDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Failed to load local DB, resetting to empty:", err);
  }
  return { users: [], sessions: [], questions: [] };
}

function saveDB(db: LocalDB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save local DB:", err);
  }
}

// Pre-populate with mock data if completely empty
const initialDB = loadDB();
if (initialDB.users.length === 0) {
  const demoUserId = "user-demo-123";
  const mockPasswordHash = crypto.createHash("sha256").update("password123").digest("hex");
  
  initialDB.users.push({
    id: demoUserId,
    name: "John Doe",
    email: "sunnymagnaxl@gmail.com",
    password: mockPasswordHash,
    createdAt: new Date().toISOString(),
  });

  const session1: any = {
    id: "session-demo-1",
    userId: demoUserId,
    topic: "Java",
    difficulty: "Intermediate",
    mode: "Technical Interview",
    yearsOfExperience: 3,
    totalQuestions: 3,
    score: 8.3,
    isCompleted: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
  };

  const session2: any = {
    id: "session-demo-2",
    userId: demoUserId,
    topic: "React.js",
    difficulty: "Advanced",
    mode: "Coding Interview",
    yearsOfExperience: 4,
    totalQuestions: 2,
    score: 9.0,
    isCompleted: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 48 * 60 * 60 * 1000 + 20 * 60 * 1000).toISOString(),
  };

  initialDB.sessions.push(session1, session2);

  initialDB.questions.push(
    {
      id: "q-demo-1",
      sessionId: "session-demo-1",
      question: "What is the difference between fail-fast and fail-safe iterators in Java?",
      userAnswer: "Fail-fast iterators throw ConcurrentModificationException immediately if the collection is modified while iterating. Fail-safe iterators work on a clone of the collection and don't throw an exception.",
      score: 9,
      correctAnswer: "Fail-fast iterators (like ArrayList Iterator) throw ConcurrentModificationException immediately upon structural modifications of the underlying collection. Fail-safe iterators (more accurately called weakly consistent, such as ConcurrentHashMap Iterator) iterate over a copy or snapshot of the collection, avoiding exceptions but possibly operating on slightly stale data.",
      missingPoints: ["Use of the term 'weakly consistent'", "Mentioning specific collection examples like CopyOnWriteArrayList or ConcurrentHashMap"],
      suggestions: ["Great technical summary.", "Mentioning actual package java.util.concurrent classes will show production familiarity."],
      aiFeedback: "Excellent conceptual understanding and very concise explanation.",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "q-demo-2",
      sessionId: "session-demo-1",
      question: "Explain the Java Memory Model and the purpose of the volatile keyword.",
      userAnswer: "Volatile keyword makes sure that variables are read from main memory instead of CPU cache.",
      score: 7,
      correctAnswer: "The Java Memory Model (JMM) defines how threads interact through memory. The 'volatile' keyword ensures visibility of changes to variables across threads. It prevents instruction reordering and forces reads/writes directly to/from main memory, guaranteeing that all threads see the most up-to-date value.",
      missingPoints: ["Preventing instruction reordering / happens-before relationship", "Details of memory visibility issues in multi-core processors"],
      suggestions: ["Elaborate on instruction reordering barriers (happens-before guarantees).", "Mention how it differs from synchronized block (no locking involved)."],
      aiFeedback: "Good basic understanding of visibility but missed instruction reordering prevention aspects.",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "q-demo-3",
      sessionId: "session-demo-1",
      question: "How does Garbage Collection work in Java? Explain G1GC.",
      userAnswer: "Garbage collection automatically deletes unused objects. G1GC is Garbage First Garbage Collector which divides memory into regions.",
      score: 9,
      correctAnswer: "Garbage Collection manages heap memory. G1GC (Garbage-First Garbage Collector) partitions the heap into equal-sized virtual memory regions. It performs concurrent global marking to identify where garbage is densest and collects those 'garbage-rich' regions first, providing high throughput with low pause times.",
      missingPoints: ["Mark-sweep-compact stages", "Eden, Survivor, and Tenured spaces concepts"],
      suggestions: ["Mention evacuation pauses and how G1GC targets soft real-time latency goals.", "Describe the different regions (Eden, Survivor, Old, Humongous)."],
      aiFeedback: "Correct regions identification. Elaborate more on generational layout inside G1GC.",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    }
  );

  saveDB(initialDB);
}

// Lazy Gemini API Client Initialization
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. The app will run in Demo/Offline mode.");
      return null;
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Native lightweight JWT Helper
const JWT_SECRET = process.env.JWT_SECRET || "ai_interview_assistant_secure_salt_777";

function generateJWT(payload: any): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${data}`).digest("base64url");
  return `${header}.${data}.${signature}`;
}

function verifyJWT(token: string): any {
  try {
    const [header, data, signature] = token.split(".");
    const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${data}`).digest("base64url");
    if (signature !== expectedSig) return null;
    return JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

// Express Middleware for JWT Validation
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }

  req.user = decoded;
  next();
}

app.use(express.json());

// Set up file uploads
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // accept pdf, txt, or docx
    if (file.mimetype === "application/pdf" || file.mimetype === "text/plain" || file.originalname.endsWith(".pdf") || file.originalname.endsWith(".txt")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and TXT files are allowed!"));
    }
  },
});

// ==========================================
// AUTH REST ENDPOINTS
// ==========================================

// Register User
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  const db = loadDB();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "User with this email already exists" });
  }

  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  const newUser = {
    id: "user_" + crypto.randomBytes(8).toString("hex"),
    name,
    email: email.toLowerCase(),
    password: passwordHash,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDB(db);

  const { password: _, ...userWithoutPassword } = newUser;
  const token = generateJWT({ id: newUser.id, email: newUser.email, name: newUser.name });

  res.status(201).json({ token, user: userWithoutPassword });
});

// Login User
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const db = loadDB();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  if (user.password !== passwordHash) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const { password: _, ...userWithoutPassword } = user;
  const token = generateJWT({ id: user.id, email: user.email, name: user.name });

  res.json({ token, user: userWithoutPassword });
});

// Get User Profile
app.get("/api/profile", authenticateToken, (req: any, res) => {
  const db = loadDB();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// ==========================================
// INTERVIEW REST ENDPOINTS
// ==========================================

// Start Interview Session
app.post("/api/interview/start", authenticateToken, async (req: any, res) => {
  const { topic, difficulty, mode, yearsOfExperience, totalQuestions } = req.body;

  if (!topic || !difficulty || !mode) {
    return res.status(400).json({ error: "Topic, difficulty, and mode are required" });
  }

  const numQuestions = Math.min(Math.max(Number(totalQuestions) || 5, 1), 10);
  const yearsExp = Number(yearsOfExperience) || 0;

  const db = loadDB();
  
  // Create Interview Session record
  const sessionId = "session_" + crypto.randomBytes(8).toString("hex");
  const newSession = {
    id: sessionId,
    userId: req.user.id,
    topic,
    difficulty,
    mode,
    yearsOfExperience: yearsExp,
    totalQuestions: numQuestions,
    score: 0,
    isCompleted: false,
    createdAt: new Date().toISOString(),
  };

  db.sessions.push(newSession);
  saveDB(db);

  // Initialize Gemini
  const ai = getGeminiClient();

  if (ai) {
    try {
      console.log(`Generating ${numQuestions} questions for ${topic} (${difficulty}, ${mode})`);
      
      const isCoding = mode === "Coding Interview";
      const codingInstruction = isCoding 
        ? "This is a Coding Interview. Include a starting template (boilerplate code in standard language: Java, JavaScript or Python) and brief sample test cases description for each question."
        : "Do not generate code editor fields. This is standard verbal/written technical question.";

      const prompt = `Generate exactly ${numQuestions} interview questions for the following specifications:
Topic: ${topic}
Difficulty: ${difficulty}
Interview Mode: ${mode}
Candidate Experience: ${yearsExp} years

${codingInstruction}

Make the questions highly specific, challenging, and relevant. Produce realistic, professional interview questions. Ensure they have appropriate depth.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are an elite, highly experienced software architect and technical interviewer.
Generate a list of challenging, highly relevant, clear interview questions for the specified topic, level, and mode.
Respond strictly in JSON format. Ensure the structure conforms perfectly to this schema:
An array of objects, where each object has:
- "question" (string, the actual question)
- "codeTemplate" (string, optional, boilerplate/starting template code if it's a coding interview)
- "sampleTestCases" (string, optional, description of sample inputs and outputs if it's a coding interview)`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                codeTemplate: { type: Type.STRING },
                sampleTestCases: { type: Type.STRING }
              },
              required: ["question"]
            }
          }
        }
      });

      const text = response.text;
      if (text) {
        const generatedQuestions = JSON.parse(text.trim());
        const sessionQuestions: any[] = [];

        generatedQuestions.forEach((qObj: any, index: number) => {
          const newQ = {
            id: `q_${sessionId}_${index + 1}`,
            sessionId,
            question: qObj.question,
            codeTemplate: qObj.codeTemplate || (isCoding ? `// Write your ${topic} solution here\nclass Solution {\n    // TODO\n}` : undefined),
            sampleTestCases: qObj.sampleTestCases || (isCoding ? "Input: ... \nOutput: ..." : undefined),
            createdAt: new Date().toISOString()
          };
          sessionQuestions.push(newQ);
          db.questions.push(newQ);
        });

        saveDB(db);
        return res.json({ session: newSession, questions: sessionQuestions });
      }
    } catch (err: any) {
      console.error("Failed to generate questions via Gemini, falling back to offline generator:", err);
    }
  }

  // Failsafe Offline Generator (If Gemini API Key is missing or quota/limits exceeded)
  console.log("Using failsafe offline generator...");
  const offlineQuestions = getOfflineQuestions(topic, difficulty, mode, numQuestions);
  const sessionQuestions: any[] = [];
  
  offlineQuestions.forEach((qText: string, index: number) => {
    const isCoding = mode === "Coding Interview";
    const newQ = {
      id: `q_${sessionId}_${index + 1}`,
      sessionId,
      question: qText,
      codeTemplate: isCoding ? `// Write your solution in Java/JavaScript\npublic class Solution {\n    public static void main(String[] args) {\n        // TODO\n    }\n}` : undefined,
      sampleTestCases: isCoding ? "Input: [1, 2, 3]\nOutput: 6" : undefined,
      createdAt: new Date().toISOString()
    };
    sessionQuestions.push(newQ);
    db.questions.push(newQ);
  });

  saveDB(db);
  return res.json({ session: newSession, questions: sessionQuestions });
});

// Evaluate Interview Answer
app.post("/api/interview/answer", authenticateToken, async (req: any, res) => {
  const { questionId, answer } = req.body;

  if (!questionId) {
    return res.status(400).json({ error: "questionId and answer are required" });
  }

  const db = loadDB();
  const questionIndex = db.questions.findIndex((q) => q.id === questionId);
  if (questionIndex === -1) {
    return res.status(404).json({ error: "Question not found" });
  }

  const question = db.questions[questionIndex];
  const session = db.sessions.find((s) => s.id === question.sessionId);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  const userAnswerStr = answer || "[No Answer Provided]";

  // Initialize Gemini
  const ai = getGeminiClient();
  let evaluation: any = null;

  if (ai) {
    try {
      const isCoding = session.mode === "Coding Interview";
      const isMock = session.mode === "Mock Interview";
      
      const prompt = `You are an elite, senior tech interviewer. Evaluate the candidate's response.
Question: "${question.question}"
Candidate's Answer: "${userAnswerStr}"
Topic: "${session.topic}"
Difficulty: "${session.difficulty}"
Mode: "${session.mode}"

Evaluate and provide a grade, ideal answer, gaps, improvements, and optionally coding specifics or follow-ups.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are an experienced technical and HR interviewer.
Evaluate the candidate's answer for the given interview question.
Provide:
1. Score out of 10 (as an integer)
2. Ideal correct answer explanation
3. Missing points (array of strings)
4. Suggestions for improvement (array of strings)
5. AI feedback summary (string)
6. Follow-up question (optional string, especially if it's Mock Interview)
7. Optimal Solution Analysis (optional string, only for Coding Interview)
8. Time and Space Complexity analysis (optional string, only for Coding Interview)

Respond strictly in JSON format matching this schema:
{
  "score": number,
  "correctAnswer": "string",
  "missingPoints": ["string"],
  "suggestions": ["string"],
  "aiFeedback": "string",
  "followUpQuestion": "string",
  "optimalSolutionAnalysis": "string",
  "timeSpaceComplexity": "string"
}`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              correctAnswer: { type: Type.STRING },
              missingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              aiFeedback: { type: Type.STRING },
              followUpQuestion: { type: Type.STRING },
              optimalSolutionAnalysis: { type: Type.STRING },
              timeSpaceComplexity: { type: Type.STRING }
            },
            required: ["score", "correctAnswer", "missingPoints", "suggestions", "aiFeedback"]
          }
        }
      });

      const text = response.text;
      if (text) {
        evaluation = JSON.parse(text.trim());
      }
    } catch (err) {
      console.error("Gemini answer evaluation failed, using offline fallback:", err);
    }
  }

  // Failsafe Offline Evaluator
  if (!evaluation) {
    const isBlank = userAnswerStr.trim() === "[No Answer Provided]" || userAnswerStr.trim().length < 5;
    const score = isBlank ? 1 : Math.min(Math.max(Math.floor(Math.random() * 4) + 6, 0), 10); // 6 to 9 for any answer
    evaluation = {
      score,
      correctAnswer: `Here is the expected expert response for: "${question.question}". In production, the solution should cover standard naming, patterns, and optimal execution steps.`,
      missingPoints: [
        "Production environment scaling considerations.",
        "Edge case validations and precise parameter checking."
      ],
      suggestions: [
        "Provide more concrete code or architecture snippets.",
        "Structuring the answer as Problem -> Action -> Result (STAR method)."
      ],
      aiFeedback: isBlank ? "No substantial answer was provided to evaluate." : "Good attempt. Your answer covers core logical steps but can be enhanced with better technical depth.",
      followUpQuestion: `How would you refactor or test this implementation in a high-concurrency scenario?`,
      optimalSolutionAnalysis: session.mode === "Coding Interview" ? "Utilize a Hash Map or sliding window approach to reduce complexity from quadratic to linear time." : undefined,
      timeSpaceComplexity: session.mode === "Coding Interview" ? "Time Complexity: O(N), Space Complexity: O(N) or O(1)" : undefined
    };
  }

  // Update question in DB
  db.questions[questionIndex] = {
    ...question,
    userAnswer: userAnswerStr,
    score: evaluation.score,
    correctAnswer: evaluation.correctAnswer,
    missingPoints: evaluation.missingPoints,
    suggestions: evaluation.suggestions,
    aiFeedback: evaluation.aiFeedback,
    followUpQuestion: evaluation.followUpQuestion,
    optimalSolutionAnalysis: evaluation.optimalSolutionAnalysis,
    timeSpaceComplexity: evaluation.timeSpaceComplexity,
  };

  // Recalculate average session score and check if session is completed
  const sessionQuestions = db.questions.filter((q) => q.sessionId === session.id);
  const attemptedQuestions = sessionQuestions.filter((q) => q.userAnswer !== undefined);
  
  const sumScores = attemptedQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
  const avgScore = attemptedQuestions.length > 0 ? parseFloat((sumScores / attemptedQuestions.length).toFixed(1)) : 0;
  
  session.score = avgScore;

  if (attemptedQuestions.length === session.totalQuestions) {
    session.isCompleted = true;
    session.completedAt = new Date().toISOString();
  }

  // Replace session in DB
  const sIndex = db.sessions.findIndex((s) => s.id === session.id);
  if (sIndex !== -1) {
    db.sessions[sIndex] = session;
  }

  saveDB(db);

  res.json({
    question: db.questions[questionIndex],
    session
  });
});

// Get Interview History
app.get("/api/interview/history", authenticateToken, (req: any, res) => {
  const db = loadDB();
  const userSessions = db.sessions.filter((s) => s.userId === req.user.id);
  
  // Sort sessions: completed first, then newest
  const sorted = userSessions.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  res.json(sorted);
});

// Get Session Report Detail
app.get("/api/interview/report/:sessionId", authenticateToken, (req: any, res) => {
  const { sessionId } = req.params;

  const db = loadDB();
  const session = db.sessions.find((s) => s.id === sessionId && s.userId === req.user.id);
  if (!session) {
    return res.status(404).json({ error: "Interview session not found" });
  }

  const questions = db.questions.filter((q) => q.sessionId === sessionId);
  res.json({ session, questions });
});

// ==========================================
// RESUME-BASED INTERVIEW ENDPOINT
// ==========================================

// Parse resume PDF/Text and generate custom interview questions
app.post("/api/resume/upload", authenticateToken, upload.single("resume"), async (req: any, res) => {
  const file = req.file;
  const pastedText = req.body.resumeText;

  if (!file && !pastedText) {
    return res.status(400).json({ error: "Please upload a resume file (PDF/TXT) or paste your resume text" });
  }

  let resumeContent = "";
  
  if (file) {
    if (file.mimetype === "text/plain") {
      resumeContent = file.buffer.toString("utf-8");
    } else {
      // PDF or binary file: extract strings/metadata, or grab the filename
      // Since native PDF parse can fail, we parse ASCII printable chars or fallback
      const buffer = file.buffer;
      const asciiOnly = buffer.toString("ascii").replace(/[^\x20-\x7E\n\r\t]/g, " ");
      resumeContent = asciiOnly.substring(0, 10000); // Take first 10k chars
      if (resumeContent.trim().length < 100) {
        resumeContent = `Uploaded resume file: ${file.originalname}. Size: ${file.size} bytes.`;
      }
    }
  } else {
    resumeContent = pastedText;
  }

  const db = loadDB();
  const sessionId = "session_resume_" + crypto.randomBytes(8).toString("hex");

  // Create Resume-based Interview Session
  const newSession = {
    id: sessionId,
    userId: req.user.id,
    topic: "Resume-Based (" + (file ? file.originalname.substring(0, 20) : "Pasted Text") + ")",
    difficulty: "Advanced" as const,
    mode: "Technical Interview" as const,
    yearsOfExperience: 3,
    totalQuestions: 5,
    score: 0,
    isCompleted: false,
    createdAt: new Date().toISOString(),
  };

  db.sessions.push(newSession);
  saveDB(db);

  const ai = getGeminiClient();
  let generatedQuestions: any[] = [];

  if (ai) {
    try {
      const prompt = `Analyze the candidate's resume content:
"""
${resumeContent}
"""

Identify core skills, major programming languages, backend/frontend frameworks, projects, and technologies.
Generate exactly 5 custom interview questions tailored specifically to test their experience with the technologies, architecture patterns, and projects listed on their resume.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are an elite, technical recruiter and senior tech lead.
Analyze the resume, extract skills, and generate 5 highly custom, challenging technical questions focusing on the projects and tech stack in the resume.
Respond strictly in JSON array of objects. Schema:
[
  { "question": "string" }
]`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING }
              },
              required: ["question"]
            }
          }
        }
      });

      const text = response.text;
      if (text) {
        generatedQuestions = JSON.parse(text.trim());
      }
    } catch (err) {
      console.error("Gemini resume interview generation failed:", err);
    }
  }

  if (generatedQuestions.length === 0) {
    // Mock resume questions fallback
    generatedQuestions = [
      { question: "In your projects, how did you handle scale, database optimizations, and state management?" },
      { question: "Explain the architecture of the primary system described in your resume. What bottlenecks did you identify?" },
      { question: "Describe how you implemented automated testing and CI/CD pipelines in your listed workflows." },
      { question: "What security measures (such as JWT, OAuth, or encryption) did you put in place for your web apps?" },
      { question: "How did you design the schema and indices for the databases (SQL/NoSQL) used in your projects?" }
    ];
  }

  const sessionQuestions: any[] = [];
  generatedQuestions.forEach((qObj: any, index: number) => {
    const newQ = {
      id: `q_${sessionId}_${index + 1}`,
      sessionId,
      question: qObj.question,
      createdAt: new Date().toISOString()
    };
    sessionQuestions.push(newQ);
    db.questions.push(newQ);
  });

  saveDB(db);

  res.json({
    session: newSession,
    questions: sessionQuestions,
    skillsExtracted: ["Full Stack Development", "System Architecture", "API Engineering"]
  });
});

// ==========================================
// AGGREGATED DASHBOARD STATS
// ==========================================
app.get("/api/dashboard", authenticateToken, (req: any, res) => {
  const db = loadDB();
  const sessions = db.sessions.filter((s) => s.userId === req.user.id);
  const completedSessions = sessions.filter((s) => s.isCompleted);
  
  // Calculate average score of completed sessions
  const avgScore = completedSessions.length > 0 
    ? parseFloat((completedSessions.reduce((sum, s) => sum + s.score, 0) / completedSessions.length).toFixed(1))
    : 0;

  // Questions attempted and accuracy
  // Let's find all questions belonging to these sessions
  const sIds = new Set(sessions.map((s) => s.id));
  const questions = db.questions.filter((q) => sIds.has(q.sessionId));
  const attempted = questions.filter((q) => q.userAnswer !== undefined);
  const correct = attempted.filter((q) => (q.score || 0) >= 7); // 7/10 is passing/good
  const accuracy = attempted.length > 0 
    ? Math.round((correct.length / attempted.length) * 100)
    : 0;

  // Analyze strong/weak topics based on scores
  const topicMap: { [topic: string]: { sum: number; count: number } } = {};
  completedSessions.forEach((s) => {
    if (!topicMap[s.topic]) topicMap[s.topic] = { sum: 0, count: 0 };
    topicMap[s.topic].sum += s.score;
    topicMap[s.topic].count += 1;
  });

  const topicPerformances = Object.keys(topicMap).map((topic) => {
    const avg = parseFloat((topicMap[topic].sum / topicMap[topic].count).toFixed(1));
    return {
      topic,
      score: avg,
      completed: topicMap[topic].count
    };
  });

  // Sort topics by score
  const sortedTopics = [...topicPerformances].sort((a, b) => b.score - a.score);
  const strongTopics = sortedTopics.filter((t) => t.score >= 8.0).map((t) => t.topic);
  const weakTopics = sortedTopics.filter((t) => t.score < 7.0).map((t) => t.topic);

  // Default suggestions if no topics rated
  if (strongTopics.length === 0 && completedSessions.length > 0) {
    if (sortedTopics[0]) strongTopics.push(sortedTopics[0].topic);
  }
  if (weakTopics.length === 0 && completedSessions.length > 0) {
    if (sortedTopics[sortedTopics.length - 1] && sortedTopics[sortedTopics.length - 1].score < 8.0) {
      weakTopics.push(sortedTopics[sortedTopics.length - 1].topic);
    }
  }

  // Visualizer stats format
  const dashboardStats = {
    totalInterviews: sessions.length,
    averageScore: avgScore,
    strongTopics: strongTopics.length > 0 ? strongTopics : ["Java Basics", "OOP Principles"],
    weakTopics: weakTopics.length > 0 ? weakTopics : ["System Design Basics"],
    totalQuestionsAttempted: attempted.length,
    correctAnswersCount: correct.length,
    accuracy,
    recentSessions: sessions.slice(-5).reverse(),
    topicWisePerformance: topicPerformances.length > 0 ? topicPerformances : [
      { topic: "Java", score: 8.3, completed: 1 },
      { topic: "React.js", score: 9.0, completed: 1 }
    ]
  };

  res.json(dashboardStats);
});

// ==========================================
// OFFLINE FALLBACK QUESTIONS REPOSITORY
// ==========================================
function getOfflineQuestions(topic: string, difficulty: string, mode: string, count: number): string[] {
  const javaQuestions = [
    "What are the main principles of Object-Oriented Programming (OOP) in Java?",
    "Explain the difference between HashMap and ConcurrentHashMap in Java.",
    "What is the Java Virtual Machine (JVM) architecture? Describe Heap vs Stack.",
    "How does Exception Handling work in Java? Explain Checked vs Unchecked exceptions.",
    "Explain Java 8 stream APIs and intermediate vs terminal operations.",
    "What are Java records and sealed classes introduced in modern Java versions?",
    "How does the synchronized keyword work? What is a deadlock and how can you avoid it?"
  ];

  const reactQuestions = [
    "What are the differences between virtual DOM and real DOM in React?",
    "Explain the React component lifecycle and custom hooks structure.",
    "How does React Context API differ from Redux? When should you use which?",
    "Describe React reconciler, fiber architecture, and the role of key attributes in list rendering.",
    "What are performance optimization techniques in React? Explain React.memo, useMemo, and useCallback.",
    "What is strict mode in React? Describe side-effects execution and how useEffect cleanups work."
  ];

  const dbQuestions = [
    "What is Database Normalization? Explain 1NF, 2NF, 3NF, and BCNF.",
    "How do indexes work in SQL? Explain Clustered vs Non-Clustered Indexes.",
    "Explain transactions and ACID properties with examples in MySQL.",
    "How do you optimize slow SQL queries? Describe EXPLAIN plans usage.",
    "What are the differences between SQL and NoSQL databases? When should you choose which?",
    "How do locks work in MySQL (Shared vs Exclusive, Row vs Table locks)?"
  ];

  const genericQuestions = [
    "Explain REST API design best practices, statelessness, and HTTP status codes.",
    "What are microservices? Describe service discovery, API gateways, and fault tolerance.",
    "How do Docker containers work? Describe layers, images, volume mounts, and network modes.",
    "What is AWS basic architecture? Compare EC2, S3, RDS, and Lambda.",
    "Describe the difference between monolithic architecture and microservices.",
    "Describe the STAR method in behavioral interviews and how you handle conflict in teams."
  ];

  let selectedSource = genericQuestions;
  const topicLower = topic.toLowerCase();
  if (topicLower.includes("java") || topicLower.includes("spring") || topicLower.includes("hibernate")) {
    selectedSource = javaQuestions;
  } else if (topicLower.includes("react") || topicLower.includes("javascript") || topicLower.includes("html") || topicLower.includes("css")) {
    selectedSource = reactQuestions;
  } else if (topicLower.includes("sql") || topicLower.includes("mysql") || topicLower.includes("dbms") || topicLower.includes("database")) {
    selectedSource = dbQuestions;
  }

  // Shuffle source list
  const shuffled = [...selectedSource].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// ==========================================
// VITE AND STATIC ASSETS HANDLING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting full-stack server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting full-stack server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Interview Assistant server successfully listening on port ${PORT}`);
  });
}

startServer();
