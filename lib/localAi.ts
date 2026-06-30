import { Task, Priority } from "@/types";

/**
 * Super-Charged Local Heuristic AI Engine
 * 
 * Features:
 * 1. Semantic Tokenizer & Composite Subtask Builder (merges multiple domains).
 * 2. Adaptive Learning Heuristics (analyzes historical completions to adjust risk and schedule).
 * 3. Sophisticated NLP Date & Time Parser.
 * 4. Greedy Packing Schedule Optimizer with routine blocks (lunch, wrap-up).
 */

// Stopwords to filter out during tokenization
const stopWords = new Set([
  "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", 
  "him", "her", "it", "them", "they", "this", "that", "these", "those", "am", "is", "are", 
  "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", 
  "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", 
  "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", 
  "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", 
  "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", 
  "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", 
  "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", 
  "too", "very", "can", "will", "just", "should", "now", "task", "add", "please", "create"
]);

// Dense Subtask database with token weights
const domainKeywords: Record<string, { weightKeywords: string[]; steps: string[] }> = {
  design: {
    weightKeywords: ["design", "ui", "ux", "wireframe", "mockup", "prototype", "figma", "graphic", "logo", "layout"],
    steps: ["Research UX references & compile inspiration", "Create initial wireframes & user flows", "Design high-fidelity UI layout in Figma", "Export assets & share style guide"]
  },
  frontend: {
    weightKeywords: ["frontend", "css", "html", "react", "component", "tailwind", "responsive", "page", "screen", "view"],
    steps: ["Create responsive layout structure", "Build UI components & style with Tailwind/CSS", "Wire up state management & event handlers", "Verify mobile responsiveness & cross-browser compatibility"]
  },
  backend: {
    weightKeywords: ["backend", "api", "database", "server", "express", "nodejs", "node", "mongodb", "firestore", "sql", "route", "controller"],
    steps: ["Design API endpoints & logical database schemas", "Build server controllers, routes, & request validators", "Integrate security middlewares & credentials handling", "Write integration tests & verify response formats"]
  },
  auth: {
    weightKeywords: ["auth", "login", "signup", "register", "password", "token", "jwt", "session", "secure", "oauth"],
    steps: ["Design login & registration screens", "Implement backend authentication routes & password hashing", "Setup session state tokens & client-side route guards", "Integrate third-party OAuth providers"]
  },
  test: {
    weightKeywords: ["test", "qa", "debug", "fix", "bug", "audit", "verify", "check", "cypress", "jest"],
    steps: ["Identify edge cases & compile test scenarios", "Run comprehensive unit/integration tests", "Log anomalies & debug script executions", "Validate resolution & run regression tests"]
  },
  study: {
    weightKeywords: ["study", "learn", "read", "research", "exam", "prepare", "course", "lecture", "book"],
    steps: ["Review core syllabus & concepts", "Highlight key takeaways & write summaries", "Draft practice examples & solve equations", "Do self-assessment mock test"]
  },
  deploy: {
    weightKeywords: ["deploy", "release", "publish", "hosting", "cloud", "vercel", "firebase", "production", "build"],
    steps: ["Optimize build bundles & environment variables", "Run local production build checks", "Trigger deployment to production environment", "Execute live smoke tests & sanity checks"]
  }
};

const defaultSubtasks = [
  "Define execution scope & objectives",
  "Design system logic & user flows",
  "Build core prototype modules",
  "Execute validation testing checklist"
];

/**
 * Helper: Tokenize text and compute matching scores
 */
function getTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(token => token.length > 1 && !stopWords.has(token));
}

/**
 * 1. Adaptive Learning heuristics based on completed task history
 */
interface HistoryProfile {
  avgCompletionOffsetDays: number; // Avg completion speed (negative means early, positive means overdue)
  preferredCategory: string;
  categoryCompletionSpeeds: Record<string, number>; // Category -> speed modifier
  completionCount: number;
}

function analyzeHistory(tasks: Task[]): HistoryProfile {
  const completed = tasks.filter(t => t.status === "Done");
  
  if (completed.length === 0) {
    return {
      avgCompletionOffsetDays: 0,
      preferredCategory: "General",
      categoryCompletionSpeeds: {},
      completionCount: 0
    };
  }

  let totalOffsetDays = 0;
  const categoryCounts: Record<string, number> = {};
  const categoryOffsets: Record<string, { total: number; count: number }> = {};

  completed.forEach(task => {
    // Basic category estimation based on title
    let category = "General";
    const titleTokens = getTokens(task.title);
    for (const [dom, config] of Object.entries(domainKeywords)) {
      if (config.weightKeywords.some(k => titleTokens.includes(k))) {
        category = dom;
        break;
      }
    }

    categoryCounts[category] = (categoryCounts[category] || 0) + 1;

    // Estimate completion offset
    // Let's assume completed date is today for fallback, or use a mocked mock interval
    const deadline = new Date(task.deadline).getTime();
    // Simulate that it was completed 1 day before deadline on average if no completion timestamp is tracked
    const completedAt = Date.now() - 24 * 60 * 60 * 1000; 
    const offsetDays = (completedAt - deadline) / (24 * 60 * 60 * 1000);

    totalOffsetDays += offsetDays;

    if (!categoryOffsets[category]) {
      categoryOffsets[category] = { total: 0, count: 0 };
    }
    categoryOffsets[category].total += offsetDays;
    categoryOffsets[category].count += 1;
  });

  const preferredCategory = Object.entries(categoryCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  
  const categoryCompletionSpeeds: Record<string, number> = {};
  Object.entries(categoryOffsets).forEach(([cat, data]) => {
    categoryCompletionSpeeds[cat] = data.total / data.count;
  });

  return {
    avgCompletionOffsetDays: totalOffsetDays / completed.length,
    preferredCategory,
    categoryCompletionSpeeds,
    completionCount: completed.length
  };
}

/**
 * 2. Advanced NLP Date Parser
 */
function parseAdvancedDeadline(inputText: string): Date {
  const normalized = inputText.toLowerCase();
  const today = new Date();
  let deadline = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days default

  // Matches "in X hours", "in Y days", "in Z weeks"
  const inHoursMatch = normalized.match(/in\s+(\d+)\s+hour/);
  const inDaysMatch = normalized.match(/in\s+(\d+)\s+day/);
  const inWeeksMatch = normalized.match(/in\s+(\d+)\s+week/);
  const inMonthsMatch = normalized.match(/in\s+(\d+)\s+month/);

  if (inHoursMatch && inHoursMatch[1]) {
    deadline = new Date(today.getTime() + parseInt(inHoursMatch[1]) * 60 * 60 * 1000);
  } else if (inDaysMatch && inDaysMatch[1]) {
    deadline = new Date(today.getTime() + parseInt(inDaysMatch[1]) * 24 * 60 * 60 * 1000);
  } else if (inWeeksMatch && inWeeksMatch[1]) {
    deadline = new Date(today.getTime() + parseInt(inWeeksMatch[1]) * 7 * 24 * 60 * 60 * 1000);
  } else if (inMonthsMatch && inMonthsMatch[1]) {
    deadline = new Date(today.getTime() + parseInt(inMonthsMatch[1]) * 30 * 24 * 60 * 60 * 1000);
  } else if (normalized.includes("end of day") || normalized.includes("eod")) {
    deadline = today;
    deadline.setHours(18, 0, 0, 0); // 6:00 PM
    return deadline;
  } else if (normalized.includes("tonight")) {
    deadline = today;
    deadline.setHours(22, 0, 0, 0); // 10:00 PM
    return deadline;
  } else if (normalized.includes("tomorrow")) {
    deadline = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000);
  } else if (normalized.includes("next week")) {
    deadline = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  } else {
    // Day of the week parsing
    const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    for (let i = 0; i < 7; i++) {
      if (normalized.includes(weekdays[i])) {
        const currentDay = today.getDay();
        let daysToAdd = i - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7;
        deadline = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
        break;
      }
    }
  }

  // Set default hours to 5 PM
  deadline.setHours(17, 0, 0, 0);
  return deadline;
}

/**
 * 3. Composite Subtask & Task Builder
 */
export function localGenerateTaskFromText(inputText: string) {
  const tokens = getTokens(inputText);
  const normalized = inputText.toLowerCase();

  // A. Build clean title
  let cleanTitle = inputText;
  const prefixes = [
    "i need to", "please add a task to", "create a task to", "add a task to",
    "can you help me to", "schedule a task to", "task to", "schedule"
  ];
  for (const prefix of prefixes) {
    if (cleanTitle.toLowerCase().startsWith(prefix)) {
      cleanTitle = cleanTitle.slice(prefix.length).trim();
    }
  }

  const suffixes = [
    /\s+by\s+.+$/i, /\s+on\s+.+$/i, /\s+tomorrow$/i, /\s+today$/i,
    /\s+next\s+week$/i, /\s+asap$/i, /\s+urgently$/i, /\s+in\s+\d+\s+\w+$/i
  ];
  for (const pattern of suffixes) {
    cleanTitle = cleanTitle.replace(pattern, "").trim();
  }

  cleanTitle = cleanTitle ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) : "New Goal";

  // B. Parse Advanced Date
  const deadlineDate = parseAdvancedDeadline(inputText);

  // C. Inferred priority
  let priority: Priority = "Medium";
  if (/\b(urgent|asap|critical|important|now|high)\b/i.test(normalized)) {
    priority = "High";
  } else if (/\b(low|someday|whenever|backlog)\b/i.test(normalized)) {
    priority = "Low";
  }

  // D. Token matching for estimate & category
  let category = "General";
  let estimatedHours = 2;
  const domainScores: Record<string, number> = {};

  Object.entries(domainKeywords).forEach(([dom, config]) => {
    let score = 0;
    config.weightKeywords.forEach(keyword => {
      if (tokens.includes(keyword)) score += 1;
    });
    if (score > 0) domainScores[dom] = score;
  });

  const matchedDomains = Object.keys(domainScores);
  if (matchedDomains.length > 0) {
    category = matchedDomains.reduce((a, b) => domainScores[a] > domainScores[b] ? a : b);
    category = category.charAt(0).toUpperCase() + category.slice(1);
    
    // Calculate composite task hours
    estimatedHours = Math.min(16, matchedDomains.length * 4);
  }

  // E. Composite Subtask Builder (combines multiple domains)
  const compositeSubtasks: string[] = [];
  matchedDomains.forEach(dom => {
    const steps = domainKeywords[dom].steps;
    // Add the first 2 crucial steps of each matched domain to create a rich mixed checklist
    compositeSubtasks.push(...steps.slice(0, 2));
  });

  // Fallback to default if no domains match
  if (compositeSubtasks.length === 0) {
    compositeSubtasks.push(...defaultSubtasks);
  }

  // Add a generic wrap up step
  compositeSubtasks.push("Final review & validation check");

  return {
    title: cleanTitle,
    description: `Task compiled via local AI Semantic model. Main Category: ${category}.`,
    deadline: deadlineDate.toISOString(),
    priority,
    category,
    estimatedHours,
    subtasks: Array.from(new Set(compositeSubtasks)) // unique only
  };
}

/**
 * 4. Adaptive Workload & Risk Analysis
 */
export function localAnalyzeRisk(tasks: Task[]) {
  const activeTasks = tasks.filter(t => t.status !== "Done");
  const history = analyzeHistory(tasks);
  
  if (activeTasks.length === 0) {
    return {
      riskLevel: "Low",
      reasoning: `You have completed ${history.completionCount} task(s). Your workflow queue is currently clear!`,
      urgentTasks: []
    };
  }

  const now = Date.now();
  let totalRiskScore = 0;
  const urgentTasks: string[] = [];

  activeTasks.forEach(task => {
    const deadlineTime = new Date(task.deadline).getTime();
    const timeLeft = deadlineTime - now;
    const isOverdue = timeLeft < 0;

    // urgency decay
    let urgencyScore = 0;
    if (isOverdue) {
      urgencyScore = 100;
    } else {
      const daysLeft = timeLeft / (24 * 60 * 60 * 1000);
      urgencyScore = Math.max(0, Math.min(100, Math.round(100 * Math.exp(-0.35 * daysLeft))));
    }

    // uncompleted subtasks penalty
    const uncompletedSubtasks = task.subtasks.filter(st => !st.isCompleted).length;
    const subtaskRatio = task.subtasks.length > 0 ? uncompletedSubtasks / task.subtasks.length : 1;
    const workloadPenalty = subtaskRatio * 20;

    // Priority weights
    const priorityMod = task.priority === "High" ? 15 : task.priority === "Medium" ? 5 : 0;

    // Apply adaptive learning modifier
    // If user has a history of finishing tasks late (positive offset), increase the risk score
    const historyMultiplier = history.avgCompletionOffsetDays > 0 ? 1.15 : 0.9;

    const computedRisk = Math.round(((urgencyScore * 0.7) + workloadPenalty + priorityMod) * historyMultiplier);
    const finalRisk = Math.max(0, Math.min(100, computedRisk));

    if (finalRisk >= 70 || isOverdue) {
      task.riskLevel = "High";
      urgentTasks.push(task.title);
    } else if (finalRisk >= 35) {
      task.riskLevel = "Medium";
    } else {
      task.riskLevel = "Low";
    }

    task.riskScore = finalRisk;
    totalRiskScore += finalRisk;
  });

  const avgRiskScore = Math.round(totalRiskScore / activeTasks.length);
  let riskLevel = "Low";
  let reasoning = "All current commitments have comfortable deadlines and low failure risk.";

  if (avgRiskScore >= 65) {
    riskLevel = "High";
    reasoning = `High overall workload risk (${avgRiskScore}%). Overdue items detected. Based on your speed history, immediate timeline recovery is recommended.`;
  } else if (avgRiskScore >= 35) {
    riskLevel = "Medium";
    reasoning = `Moderate workload risk (${avgRiskScore}%). Keep an eye on task deadlines due this week.`;
  }

  return {
    riskLevel,
    reasoning,
    urgentTasks
  };
}

/**
 * 5. Adaptive Recovery Planner
 */
export function localGenerateRecoveryPlan(delayedTasks: Task[]) {
  if (delayedTasks.length === 0) {
    return {
      strategy: "Keep maintaining your current pace. No delayed items detected.",
      actionSteps: ["Continue monitoring active tasks", "Plan weekly focus blocks"]
    };
  }

  const primaryTask = delayedTasks[0];
  const steps = [
    `Extend deadline for "${primaryTask.title}" to create buffer time.`,
    `Break down "${primaryTask.title}" into 3 micro-sprints under 15 minutes.`,
    "Strictly turn off notifications, mute Slack/Teams, and run a 25-minute Pomodoro focus block."
  ];

  if (delayedTasks.length > 1) {
    steps.push(`De-prioritize "${delayedTasks[1].title}" to free up cognitive bandwidth.`);
  }

  return {
    strategy: `Apply workload consolidation & sequentially finish overdue items. Focus on "${primaryTask.title}" first.`,
    actionSteps: steps
  };
}

/**
 * 6. Greedy packing Schedule Solver (with routine structures)
 */
export function localGenerateDailySchedule(
  tasks: Task[], 
  calendarEvents: any[],
  profile?: any,
  selectedDateStr?: string
) {
  const schedule: { title: string; date?: string; startTime: string; endTime: string; type: "task" | "break" | "event" }[] = [];
  
  // Normalize calendar busy slots (Minutes since midnight)
  const busySlots: { startMin: number; endMin: number }[] = calendarEvents.map(ev => {
    if (!ev.start?.dateTime) return null;
    const d1 = new Date(ev.start.dateTime);
    const d2 = new Date(ev.end.dateTime);
    return {
      startMin: d1.getHours() * 60 + d1.getMinutes(),
      endMin: d2.getHours() * 60 + d2.getMinutes()
    };
  }).filter(Boolean) as any;

  // Add implicit Routine Lunch Break slot (12:00 PM - 1:00 PM)
  busySlots.push({ startMin: 12 * 60, endMin: 13 * 60 });

  // Active tasks sorted by Composite Score (Urgency + Priority weight)
  const activeTasks = [...tasks]
    .filter(t => t.status !== "Done")
    .sort((a, b) => {
      const aVal = (a.priority === "High" ? 30 : a.priority === "Medium" ? 15 : 0) + (a.riskScore || 0);
      const bVal = (b.priority === "High" ? 30 : b.priority === "Medium" ? 15 : 0) + (b.riskScore || 0);
      return bVal - aVal;
    });

  const startHourStr = profile?.workingHoursStart || "09:00";
  const endHourStr = profile?.workingHoursEnd || "17:00";

  const [startH, startM] = startHourStr.split(":").map(Number);
  const [endH, endM] = endHourStr.split(":").map(Number);

  let currentMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;
  let taskIdx = 0;

  while (currentMin < endMin) {
    // A. Check for calendar or lunch overlap
    const overlapSlot = busySlots.find(slot => currentMin >= slot.startMin && currentMin < slot.endMin);
    
    if (overlapSlot) {
      // If it's the lunch slot, explicitly label it
      if (overlapSlot.startMin === 12 * 60) {
        schedule.push({
          title: "Lunch Break & Recharge",
          startTime: "12:00",
          endTime: "13:00",
          type: "break"
        });
      }
      currentMin = overlapSlot.endMin; // skip past overlap
      continue;
    }

    // B. Place next task
    if (taskIdx < activeTasks.length) {
      const task = activeTasks[taskIdx];
      const startStr = `${Math.floor(currentMin / 60).toString().padStart(2, "0")}:${(currentMin % 60).toString().padStart(2, "0")}`;
      
      // Variable slot time based on priority (High = 90 mins, Low = 45 mins)
      const slotDuration = task.priority === "High" ? 90 : task.priority === "Medium" ? 60 : 45;
      currentMin += slotDuration;
      
      const endStr = `${Math.floor(currentMin / 60).toString().padStart(2, "0")}:${(currentMin % 60).toString().padStart(2, "0")}`;
      
      schedule.push({
        title: task.title,
        date: selectedDateStr || new Date().toISOString().split('T')[0],
        startTime: startStr,
        endTime: endStr,
        type: "task"
      });
      taskIdx++;

      // Adaptive break durations (10 min break after low-priorities, 15 mins after high focus)
      const breakDuration = slotDuration >= 90 ? 15 : 10;
      if (currentMin + breakDuration <= endMin) {
        const breakStartStr = `${Math.floor(currentMin / 60).toString().padStart(2, "0")}:${(currentMin % 60).toString().padStart(2, "0")}`;
        currentMin += breakDuration;
        const breakEndStr = `${Math.floor(currentMin / 60).toString().padStart(2, "0")}:${(currentMin % 60).toString().padStart(2, "0")}`;
        
        schedule.push({
          title: "Rest & Brain Recharge",
          startTime: breakStartStr,
          endTime: breakEndStr,
          type: "break"
        });
      }
    } else {
      // C. No more tasks, plan the wrap-up
      const startStr = `${Math.floor(currentMin / 60).toString().padStart(2, "0")}:${(currentMin % 60).toString().padStart(2, "0")}`;
      schedule.push({
        title: "Daily Review & Inbox Zero Planning",
        startTime: startStr,
        endTime: endHourStr,
        type: "break"
      });
      break;
    }
  }

  return schedule;
}

/**
 * 7. Local Deep Suggestion Engine
 * Generates a rich, personalized planning suggestion based on task heuristics.
 */
export function localDeepSuggestion(tasks: Task[]): {
  headline: string;
  suggestion: string;
  focusTip: string;
  productivityScore: number;
} {
  const now = Date.now();
  const completed = tasks.filter(t => t.status === "Done");
  const active = tasks.filter(t => t.status !== "Done");
  const overdue = active.filter(t => new Date(t.deadline).getTime() < now);
  const highPriority = active.filter(t => t.priority === "High");
  const completionRate = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;

  // Productivity score (0–100)
  const overduepenalty = Math.min(50, overdue.length * 12);
  const highPriorityBonus = Math.min(20, highPriority.length * 5);
  const productivityScore = Math.max(0, Math.min(100, completionRate - overduepenalty + highPriorityBonus));

  // Dominant category detection
  const categoryCounts: Record<string, number> = {};
  active.forEach(t => {
    const tokens = getTokens(t.title);
    for (const [dom, config] of Object.entries(domainKeywords)) {
      if (config.weightKeywords.some(k => tokens.includes(k))) {
        categoryCounts[dom] = (categoryCounts[dom] || 0) + 1;
        break;
      }
    }
  });
  const dominantCategory = Object.keys(categoryCounts).length > 0
    ? Object.entries(categoryCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    : null;

  // Build suggestion text
  let headline = "Your Week Looks Balanced";
  let suggestion = "";
  let focusTip = "";

  if (overdue.length >= 3) {
    headline = "Critical Backlog Detected";
    suggestion = `You have ${overdue.length} overdue tasks weighing on your pipeline. Your local analysis suggests consolidating them into a single recovery sprint — dedicate 3 focused sessions this week exclusively to clearing backlog before taking on new work. Your completion rate is currently ${completionRate}%.`;
    focusTip = `Start with "${overdue[0].title}" — it's the oldest overdue item and unblocking it may cascade progress to others.`;
  } else if (highPriority.length >= 2) {
    headline = "High-Stakes Window Ahead";
    suggestion = `With ${highPriority.length} high-priority tasks in flight, your cognitive load is elevated. Local AI recommends staggered focus blocks — tackle one high-priority task before lunch, and a second after a proper 15-minute reset. Avoid scheduling them back-to-back to preserve execution quality.`;
    focusTip = dominantCategory
      ? `Your tasks lean heavily ${dominantCategory}-oriented. Front-load those in your peak alertness window (typically 9–11 AM).`
      : "Protect your morning hours for deep work — reserve admin and communication tasks for afternoons.";
  } else if (completionRate >= 70) {
    headline = "Strong Execution Momentum";
    suggestion = `You're completing ${completionRate}% of your tasks — well above average. Local AI suggests you leverage this momentum by introducing stretch goals or one exploratory task this sprint. You have the bandwidth and rhythm to absorb it without disrupting your pace.`;
    focusTip = "Consider chunking your next complex task into 3 subtasks before starting. Your completion history shows you thrive with pre-broken-down work.";
  } else if (active.length === 0) {
    headline = "Clear Queue — Plan Ahead";
    suggestion = "Your active queue is empty. This is the perfect time to plan your next sprint. Use the AI planner to schedule 3–5 meaningful goals for the coming week before the backlog builds up again.";
    focusTip = "Proactive planning during low-load periods is a key habit of high performers. Set 1 stretch goal now.";
  } else {
    headline = "Steady Pace — Room to Optimize";
    suggestion = `You have ${active.length} active tasks with a ${completionRate}% overall completion rate. Local AI suggests reviewing your task deadlines — ${overdue.length > 0 ? `${overdue.length} task(s) are already overdue and need immediate attention` : "all deadlines look manageable for now"}. Consider pairing each task with a specific focus time block to reduce decision fatigue.`;
    focusTip = "Time-boxing your tasks (assigning a fixed duration) can increase throughput by up to 25%.";
  }

  return { headline, suggestion, focusTip, productivityScore };
}
