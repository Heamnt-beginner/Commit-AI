"use server";

import { GoogleGenAI, Type } from "@google/genai";
import { Task } from "@/types";
import { localGenerateDailySchedule } from "@/lib/localAi";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateDailySchedule(
  tasks: Task[], 
  calendarEvents: Record<string, unknown>[],
  profile?: { profession: string; workingHoursStart: string; workingHoursEnd: string; customInstructions: string },
  selectedDateStr?: string
) {
  const startHour = profile?.workingHoursStart || "09:00";
  const endHour = profile?.workingHoursEnd || "17:00";
  const professionContext = profile?.profession ? `The user is a ${profile.profession}.` : "";
  const customContext = profile?.customInstructions ? `Strictly follow these custom constraints: "${profile.customInstructions}".` : "";

  const systemInstruction = `
    You are an AI Calendar Optimizer for Commit AI.
    Your job is to take a list of active tasks and existing calendar events, and generate a schedule.
    ${professionContext}
    The schedule should block out time between ${startHour} and ${endHour}.
    Do not overlap with existing calendar events.
    Assign high priority tasks earlier in the day.
    ${customContext}
    
    Return a JSON array of objects representing the schedule blocks.
    Each block should have:
    - title: string (the name of the task or block)
    - date: string (YYYY-MM-DD format, representing which day the block is assigned to)
    - startTime: string (HH:MM format, e.g., "09:00")
    - endTime: string (HH:MM format, e.g., "10:30")
    - type: string (must be "task" or "break" or "event")
    
    The schedule is being generated for the timeframe starting on ${selectedDateStr || new Date().toISOString().split('T')[0]}.
    Assign the "date" field accordingly. If the task spans multiple days, assign the respective dates.
  `;

  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("No API key");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: JSON.stringify({ tasks, calendarEvents, profile }),
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              date: { type: Type.STRING },
              startTime: { type: Type.STRING },
              endTime: { type: Type.STRING },
              type: { type: Type.STRING }
            },
            required: ["title", "date", "startTime", "endTime", "type"]
          },
          description: "Optimized daily schedule blocks"
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    const blocks = JSON.parse(text);
    (blocks as unknown as { isFallback?: boolean }).isFallback = false;
    return blocks;
  } catch (error: unknown) {
    console.warn("⚠️ Gemini Schedule Generation failed. Falling back to local schedule optimizer...", error);
    const blocks = localGenerateDailySchedule(tasks, calendarEvents, profile, selectedDateStr);
    (blocks as unknown as { isFallback?: boolean }).isFallback = true;
    return blocks;
  }
}
