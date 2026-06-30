"use server";

import { GoogleGenAI, Type } from "@google/genai";
import { localGenerateTaskFromText } from "@/lib/localAi";

export async function generateTaskFromPrompt(prompt: string, userApiKey?: string) {
  const today = new Date();
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentWeekday = weekdays[today.getDay()];
  const currentDateStr = today.toISOString().split('T')[0];
  const currentTimeStr = today.toTimeString().split(' ')[0];

  const systemInstruction = `
    You are an AI Task Understanding Agent for Commit AI.
    Your job is to parse the user's natural language goal input into a structured productivity task.

    CRITICAL DATE CALCULATIONS:
    - Current Date: ${currentDateStr}
    - Current Weekday: ${currentWeekday}
    - Current Time: ${currentTimeStr}
    
    Rules for calculating the target deadline:
    1. If the user mentions a specific day (e.g., "Sunday" or "by Sunday"):
       - Note that today is ${currentWeekday} (${currentDateStr}).
       - If they say "Sunday" and today is Sunday, they likely mean the next Sunday (July 5, 2026), or if the timeline is short and they are writing in the morning, they might mean today. Determine the most logical upcoming occurrence.
       - If they say "by Friday", calculate the exact date of the upcoming Friday.
    2. If they specify a time duration (e.g., "in 2 weeks", "by next month"), calculate the offset relative to ${currentDateStr}.
    3. If no specific time of day is mentioned, default the deadline time to 5:00 PM (17:00).
    4. Format the final deadline strictly as a valid ISO 8601 string (e.g., YYYY-MM-DDTHH:mm:ss.sssZ).

    Rules for priority (Urgency Assessment):
    - "High": Deadline is less than 48 hours away, or user expresses high urgency ("ASAP", "critical", "urgent").
    - "Medium": Deadline is between 2 to 5 days away.
    - "Low": Deadline is more than 5 days away.

    Subtasks:
    - Break down the goal into distinct, chronological, actionable steps (subtasks) as required by the actual process.

    Return ONLY a JSON object that matches the requested schema.
  `;

  const apiKey = userApiKey || process.env.GEMINI_API_KEY;

  try {
    if (!apiKey) {
      throw new Error("No API key");
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Clear, concise goal title." },
            description: { type: Type.STRING, description: "Brief context or overview of the goal." },
            deadline: { type: Type.STRING, description: "Estimated completion date (ISO 8601 string, YYYY-MM-DD)." },
            priority: { 
              type: Type.STRING, 
              enum: ["Low", "Medium", "High"],
              description: "Urgency of the task." 
            },
            subtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Key actionable items required to achieve the goal."
            }
          },
          required: ["title", "description", "deadline", "priority", "subtasks"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return { ...JSON.parse(text), isFallback: false };
  } catch (error) {
    console.warn("⚠️ Remote Gemini API failed. Switching to Local AI Fallback Engine...", error);
    return { ...localGenerateTaskFromText(prompt), isFallback: true };
  }
}

export async function generateSubtasks(title: string, description: string, userApiKey?: string): Promise<string[]> {
  const systemInstruction = `
    You are an AI Task Breakdown Agent for Commit AI.
    Your job is to break down a larger task into actionable subtasks as required by the actual process.
    Return ONLY a JSON array of strings representing the subtasks.
  `;

  const apiKey = userApiKey || process.env.GEMINI_API_KEY;

  try {
    if (!apiKey) throw new Error("No API key");

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Task: ${title}\nDescription: ${description || "No description provided."}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of actionable subtasks"
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text);
  } catch {
    console.warn("⚠️ Gemini Subtask generation failed. Using local template matching...");
    const normalized = (title + " " + description).toLowerCase();
    const subtaskTemplates: Record<string, string[]> = {
      design: ["Research design patterns", "Create initial wireframes", "Refine Visual Style", "Collect feedback", "Export final assets"],
      code: ["Setup repository", "Draft core functionality", "Write unit tests", "Refine code", "Deploy to staging"],
      develop: ["Analyze requirements", "Build backend APIs", "Implement frontend UI", "QA Testing"],
      study: ["Review textbooks & notes", "Outline summary topics", "Solve practice problems", "Take mock test"]
    };
    for (const [key, list] of Object.entries(subtaskTemplates)) {
      if (normalized.includes(key)) return list;
    }
    return ["Define success criteria", "Execute core steps", "Verify final result"];
  }
}

export async function calculateTaskRisk(task: {
  title: string;
  deadline: string;
  progress: number;
  subtasks: { isCompleted: boolean }[];
}, userApiKey?: string) {
  const systemInstruction = `
    You are a Risk Assessment Agent for Commit AI.
    Calculate a deadline risk score (0-100) and risk level (Low, Medium, High) for the given task.
    Consider:
    1. Urgency: How close is the deadline (current date: ${new Date().toISOString()}) relative to the task state?
    2. Workload: How many subtasks are left?
    3. Progress: Current progress percentage.
    Return ONLY a JSON object matching the requested schema.
  `;

  const prompt = JSON.stringify(task);
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;

  try {
    if (!apiKey) throw new Error("No API key");

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.INTEGER, description: "Risk score from 0 to 100." },
            riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            analysis: { type: Type.STRING, description: "1-2 sentence explanation of the risk calculation." }
          },
          required: ["riskScore", "riskLevel", "analysis"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text);
  } catch {
    console.warn("⚠️ Gemini Risk calculation failed. Using local heuristic risk assessment...");
    const now = Date.now();
    const deadlineTime = new Date(task.deadline).getTime();
    const timeLeft = deadlineTime - now;
    const isOverdue = timeLeft < 0;
    
    let riskScore = 20;
    let riskLevel = "Low";
    let analysis = "Task progress is steady and deadline is comfortable.";

    if (isOverdue) {
      riskScore = 95;
      riskLevel = "High";
      analysis = "Task is currently overdue. Immediate action required.";
    } else if (timeLeft < 24 * 60 * 60 * 1000) {
      riskScore = 85;
      riskLevel = "High";
      analysis = "Task is due within 24 hours. Immediate focus block recommended.";
    } else if (timeLeft < 3 * 24 * 60 * 60 * 1000) {
      riskScore = 60;
      riskLevel = "Medium";
      analysis = "Deadline is approaching. Allocate time today to ensure success.";
    }

    return { riskScore, riskLevel, analysis };
  }
}

export async function generateRecoveryPlan(task: {
  title: string;
  description: string;
  deadline: string;
  progress: number;
  subtasks: { id: string; title: string; isCompleted: boolean }[];
}, userApiKey?: string) {
  const systemInstruction = `
    You are a Recovery Agent for Commit AI.
    The user's task is delayed or has missed its deadline.
    Generate a concise alternative recovery plan with clear, actionable steps (bullet points) to get them back on track.
    Format the response in clear Markdown. Keep it brief (under 150 words).
  `;

  const prompt = JSON.stringify(task);
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;

  try {
    if (!apiKey) throw new Error("No API key");

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction
      }
    });

    return response.text || "No recovery plan could be generated.";
  } catch {
    console.warn("⚠️ Gemini Recovery Plan generation failed. Using local recovery templates...");
    return `### AI Fallback Recovery Plan\n\n- Move the overdue deadline of **"${task.title}"** to a realistic future window.\n- Allocate a 25-minute Pomodoro session today to kickstart the remaining steps.\n- De-prioritize non-urgent commitments to regain progress.`;
  }
}

export async function chatWithAi(
  messages: { role: "user" | "model"; content: string }[],
  activeTasks: Record<string, unknown>[],
  userApiKey?: string
) {
  const systemInstruction = `
    You are an intelligent, productivity-focused AI Coach inside Commit AI.
    Your goal is to help the user manage their tasks, optimize their schedule, and boost focus.

    Here is the list of their active tasks in JSON format:
    ${JSON.stringify(activeTasks)}

    Rules:
    1. Be friendly, encouraging, and productivity-focused. Keep replies concise and formatting clean.
    2. Answer questions directly using the task list context above. Recommend which tasks to prioritize based on deadlines and risk.
    3. If the user asks to create or schedule a new task (e.g. "add a task to read science chapters by Thursday"):
       - You should include a special tag at the very end of your response: [CREATE_TASK: {"title": "Title", "description": "Description", "deadline": "YYYY-MM-DD", "priority": "High/Medium/Low"}]
       - This will trigger the app's UI to present a task preview to the user.
       - Fill in the JSON metadata based on the user request. For dates, resolve relative days based on the current date: ${new Date().toISOString().split('T')[0]}.
  `;

  const contents = messages.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;

  try {
    if (!apiKey) throw new Error("No API key");

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction
      }
    });

    return response.text || "No response received.";
  } catch {
    console.warn("⚠️ Gemini Chat Coach failed. Running on Local AI Heuristic Mode...");
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const normalized = lastUserMessage.toLowerCase();
    
    // Check if user is trying to add a task
    if (normalized.includes("add") || normalized.includes("create") || normalized.includes("schedule") || normalized.includes("plan")) {
      const parsedTask = localGenerateTaskFromText(lastUserMessage);
      const proposal = {
        title: parsedTask.title,
        description: parsedTask.description,
        deadline: parsedTask.deadline.split("T")[0],
        priority: parsedTask.priority
      };
      return `I am currently running on local fallback intelligence. I've processed your request to schedule this task. [CREATE_TASK: ${JSON.stringify(proposal)}]`;
    }

    return "Hello! I am currently running on Local AI Heuristic Mode because the main Gemini API limit has been reached. How can I help you manage your active commitments today? Make sure to focus on your overdue and high-priority tasks first!";
  }
}
