"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Calendar as CalendarIcon, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  ZoomIn,
  ZoomOut,
  Wand2
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useTaskStore } from "@/store/useTaskStore";
import { useUserStore } from "@/store/useUserStore";
import { generateDailySchedule } from "@/app/actions/calendar";
import { 
  format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, 
  startOfMonth, endOfMonth, isSameDay, isSameMonth, subMonths, 
  addMonths, subWeeks, addWeeks, subDays, startOfDay, endOfDay
} from 'date-fns';
import { CustomizerModal } from "@/components/calendar/CustomizerModal";
import { useSound } from "@/hooks/useSound";

export default function CalendarIntegrationView() {
  const [viewType, setViewType] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [zoomLevel, setZoomLevel] = useState(40); // pixels per hour
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  
  // Initialize token from sessionStorage on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem('commit-ai-gcal-token');
    if (savedToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGoogleToken(savedToken);
    }
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [calendarEvents, setCalendarEvents] = useState<Record<string, any>[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const [showFallbackToast, setShowFallbackToast] = useState(false);
  const [showTokenWarning, setShowTokenWarning] = useState(false);
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  
  const { playSparkle } = useSound();
  const { tasks, scheduleBlocks, setScheduleBlocks } = useTaskStore();
  const { profession, workingHoursStart, workingHoursEnd, customInstructions, updateProfile } = useUserStore();

  const handleConnectCalendar = async () => {
    setIsConnecting(true);
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
    provider.addScope('https://www.googleapis.com/auth/calendar.events');

    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (token) {
        setGoogleToken(token);
        sessionStorage.setItem('commit-ai-gcal-token', token);
        await fetchEvents(token, selectedDate);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to Google Calendar.");
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchEvents = useCallback(async (token: string, date: Date) => {
    try {
      let timeMin = startOfDay(date);
      let timeMax = endOfDay(date);

      if (viewType === 'Week') {
        timeMin = startOfWeek(date);
        timeMax = endOfWeek(date);
      } else if (viewType === 'Month') {
        timeMin = startOfMonth(date);
        timeMax = endOfMonth(date);
      }
      
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        setGoogleToken(null);
        sessionStorage.removeItem('commit-ai-gcal-token');
        return;
      }
      
      const data = await response.json();
      if (data.items) {
        setCalendarEvents(data.items);
      }
    } catch (e) {
      console.error(e);
    }
  }, [viewType]);

  useEffect(() => {
    if (googleToken) {
      fetchEvents(googleToken, selectedDate);
    }
  }, [selectedDate, viewType, googleToken, fetchEvents]);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const activeTasks = tasks.filter(t => t.status !== 'Done');
      const blocks = await generateDailySchedule(activeTasks, calendarEvents, {
        profession,
        workingHoursStart,
        workingHoursEnd,
        customInstructions
      }, selectedDate.toISOString().split('T')[0]);
      
      if (viewType === 'Month') {
        setShowTokenWarning(true);
      }

      setScheduleBlocks([
        ...scheduleBlocks.filter((oldBlock: { date?: string }) => 
          !blocks.some((newBlock: { date?: string }) => newBlock.date === oldBlock.date)
        ),
        ...blocks
      ]);
      playSparkle();
      
      if ((blocks as { isFallback?: boolean }).isFallback) {
        setShowFallbackToast(true);
        setTimeout(() => setShowFallbackToast(false), 5000);
      }
    } catch (e: unknown) {
      console.error(e);
      alert("Failed to generate schedule.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCustomizerConfirm = async (instruction: string) => {
    updateProfile({ customInstructions: instruction });
    setIsOptimizing(true);
    try {
      const activeTasks = tasks.filter(t => t.status !== 'Done');
      const blocks = await generateDailySchedule(activeTasks, calendarEvents, {
        profession,
        workingHoursStart,
        workingHoursEnd,
        customInstructions: instruction
      }, selectedDate.toISOString().split('T')[0]);
      
      setScheduleBlocks([
        ...scheduleBlocks.filter((oldBlock: { date?: string }) => 
          !blocks.some((newBlock: { date?: string }) => newBlock.date === oldBlock.date)
        ),
        ...blocks
      ]);
      playSparkle();
    } catch (e: unknown) {
      console.error("Failed to apply customization", e);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleExportToCalendar = async () => {
    if (!googleToken || scheduleBlocks.length === 0) return;
    setIsExporting(true);
    setExportSuccess(false);

    try {
      for (const block of scheduleBlocks) {
        if (block.type !== 'task' && block.type !== 'break') continue;
        
        const eventDate = block.date ? block.date : selectedDate.toISOString().split('T')[0];
        
        const event = {
          summary: `[Commit AI] ${block.title}`,
          start: {
            dateTime: `${eventDate}T${block.startTime}:00`,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: `${eventDate}T${block.endTime}:00`,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          description: "Generated by Commit AI Optimizer",
          colorId: block.type === 'break' ? '2' : '9',
        };

        await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${googleToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event)
        }).then(res => {
          if (res.status === 401) {
            setGoogleToken(null);
            sessionStorage.removeItem('commit-ai-gcal-token');
            throw new Error("Token expired");
          }
        });
      }
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
      await fetchEvents(googleToken, selectedDate);
    } catch (err) {
      console.error(err);
      alert("Failed to export schedule to Google Calendar.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrev = () => {
    if (viewType === 'Day') setSelectedDate(subDays(selectedDate, 1));
    else if (viewType === 'Week') setSelectedDate(subWeeks(selectedDate, 1));
    else setSelectedDate(subMonths(selectedDate, 1));
  };

  const handleNext = () => {
    if (viewType === 'Day') setSelectedDate(addDays(selectedDate, 1));
    else if (viewType === 'Week') setSelectedDate(addWeeks(selectedDate, 1));
    else setSelectedDate(addMonths(selectedDate, 1));
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 100));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 20));

  const headerDateString = viewType === 'Month' 
    ? format(selectedDate, 'MMMM yyyy') 
    : viewType === 'Week' 
      ? `${format(startOfWeek(selectedDate), 'MMM d')} - ${format(endOfWeek(selectedDate), 'MMM d, yyyy')}`
      : format(selectedDate, 'EEEE, MMMM d');

  const getTimeStyle = (start: string, end: string) => {
    try {
      const parseTime = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return Math.round((h * 60 + m) * (zoomLevel / 60));
      };
      const top = parseTime(start);
      const height = parseTime(end) - top;
      return { top: `${top}px`, height: `${Math.max(20, height)}px` };
    } catch {
      return { top: '0px', height: `${zoomLevel}px` };
    }
  };

  const getEventStyle = (dateTime: string, endDateTime: string) => {
    try {
      const d1 = new Date(dateTime);
      const d2 = new Date(endDateTime);
      const top = Math.round((d1.getHours() * 60 + d1.getMinutes()) * (zoomLevel / 60));
      const height = Math.round((d2.getHours() * 60 + d2.getMinutes()) * (zoomLevel / 60)) - top;
      return { top: `${top}px`, height: `${Math.max(20, height)}px` };
    } catch {
      return { top: '0px', height: `${zoomLevel}px` };
    }
  };

  const miniCalStart = startOfWeek(startOfMonth(selectedDate));
  const miniCalEnd = endOfWeek(endOfMonth(selectedDate));
  const miniCalDays = eachDayOfInterval({ start: miniCalStart, end: miniCalEnd });

  const renderTimelineColumn = (date: Date) => {
    const isTodayStr = isSameDay(date, new Date());
    const eventsForDay = calendarEvents.filter(e => e.start?.dateTime && isSameDay(new Date(e.start.dateTime), date));
    const blocksForDay = scheduleBlocks.filter(b => {
      if (!b.date) return isSameDay(date, selectedDate);
      return isSameDay(new Date(b.date), date);
    });

    return (
      <div className="flex-1 relative border-r border-border/40 min-w-[120px]">
        {viewType === 'Week' && (
          <div className={`sticky top-0 z-30 p-2 text-center border-b border-border/40 ${isTodayStr ? 'bg-primary/10' : 'bg-background/90 backdrop-blur'}`}>
            <p className={`text-[10px] font-heading font-bold uppercase tracking-wider ${isTodayStr ? 'text-primary' : 'text-muted-foreground'}`}>
              {format(date, 'EEE')}
            </p>
            <p className={`text-lg font-bold ${isTodayStr ? 'text-primary' : 'text-foreground'}`}>
              {format(date, 'd')}
            </p>
          </div>
        )}
        
        <div className="relative w-full" style={{ height: `${24 * zoomLevel}px` }}>
          {Array.from({ length: 24 }).map((_, i) => {
            if (viewType === 'Day') {
              return (
                <div key={i} className="absolute left-0 right-0 flex items-start gap-4" style={{ top: `${i * zoomLevel}px`, height: `${zoomLevel}px` }}>
                  <div className="w-[50px] text-[10px] font-heading font-semibold text-[#908fa0] text-right pr-2 select-none pt-0.5">
                    {String(i).padStart(2, '0')}:00
                  </div>
                  <div className="flex-1 h-px bg-border/20 mt-2"></div>
                </div>
              );
            } else {
              return (
                <div key={`grid-${i}`} className="absolute left-0 right-0 h-px bg-border/20" style={{ top: `${i * zoomLevel}px` }}></div>
              );
            }
          })}

          <div className={`absolute right-0 top-0 bottom-0 ${viewType === 'Day' ? 'left-[70px]' : 'left-0'}`}>
            {eventsForDay.map((ev, i) => {
              if (!ev.start?.dateTime) return null;
              const style = getEventStyle(ev.start.dateTime, ev.end.dateTime);
              return (
                <div key={`cal-${i}`} className="absolute left-1 right-1 bg-[#89ceff]/10 border border-[#89ceff]/30 rounded-lg p-1.5 z-10 overflow-hidden" style={style}>
                  <p className="text-[9px] font-bold text-[#89ceff] truncate leading-tight">{ev.summary}</p>
                </div>
              );
            })}

            {blocksForDay.map((block, i) => {
              const style = getTimeStyle(block.startTime, block.endTime);
              return (
                <div key={`ai-${i}`} className="absolute left-1 right-1 bg-primary/10 border border-primary/30 rounded-lg p-1.5 z-20 shadow-lg overflow-hidden" style={style}>
                  <p className="text-[9px] font-bold text-primary truncate leading-tight">{block.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="flex flex-col h-full w-full bg-background/50">
        {showTokenWarning && (
          <div className="bg-primary/20 border-b border-primary/30 p-3 text-center flex flex-col items-center justify-center relative shrink-0 z-20">
            <p className="text-xs font-bold text-primary mb-1">Gemini Plan Paused (Token Threshold)</p>
            <p className="text-[10px] text-primary/80">
              Generating an entire month could exhaust your tokens in one go. I have generated 3-4 days for now. 
              Click continue when you feel necessary.
            </p>
            <button className="mt-2 bg-primary text-[#1000a9] text-[10px] font-bold px-4 py-1.5 rounded flex items-center gap-1 hover:bg-primary/90">
              <Wand2 className="w-3 h-3" /> Continue Generation (5-10 Days)
            </button>
          </div>
        )}
        <div className="grid grid-cols-7 border-b border-border shrink-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-[10px] font-heading font-bold uppercase text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 auto-rows-[minmax(80px,1fr)] min-h-0 overflow-y-auto w-full">
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, selectedDate);
            const isTodayStr = isSameDay(day, new Date());
            const eventsForDay = calendarEvents.filter(e => e.start?.dateTime && isSameDay(new Date(e.start.dateTime), day));
            const blocksForDay = scheduleBlocks.filter(b => {
              if (!b.date) return isSameDay(day, selectedDate);
              return isSameDay(new Date(b.date), day);
            });

            return (
              <div 
                key={i} 
                onClick={() => {
                  setSelectedDate(day);
                  setViewType('Day');
                }}
                className={`border-r border-b border-border/40 p-1 flex flex-col min-h-[80px] cursor-pointer hover:bg-white/5 transition-colors ${isCurrentMonth ? '' : 'bg-black/20 opacity-50'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${isTodayStr ? 'bg-primary text-[#1000a9]' : 'text-foreground'}`}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="flex-1 mt-1 space-y-1 overflow-hidden">
                  {eventsForDay.slice(0, 2).map((ev, idx) => (
                    <div key={`ev-${idx}`} className="bg-white/10 text-[#89ceff] text-[8px] font-bold px-1 rounded truncate">
                      {format(new Date(ev.start.dateTime), 'h:mm a')} {ev.summary}
                    </div>
                  ))}
                  {blocksForDay.slice(0, 3).map((block, idx) => (
                    <div key={`blk-${idx}`} className="bg-primary/20 text-primary text-[8px] font-bold px-1 rounded truncate">
                      {block.startTime} {block.title}
                    </div>
                  ))}
                  {(eventsForDay.length + blocksForDay.length) > 5 && (
                    <div className="text-[8px] text-muted-foreground font-semibold px-1">
                      +{(eventsForDay.length + blocksForDay.length) - 5} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-75px)] min-h-0 pb-2 overflow-hidden">
      
      <header className="flex justify-between items-center shrink-0 mb-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground tracking-tight">Calendar Hub</h2>
          <p className="text-[10px] text-muted-foreground">Bi-directional Google sync & smart AI blocking.</p>
        </div>
        <button 
          onClick={() => setIsCustomizerOpen(true)}
          className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 px-4 py-2 rounded-xl text-xs font-bold font-heading flex items-center gap-2 transition-all"
        >
          <Wand2 className="w-4 h-4" />
          Customize Schedule
        </button>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden">
        
        <div className="col-span-12 lg:col-span-9 flex flex-col h-full min-h-0 rounded-xl overflow-hidden bg-card/40 border border-border">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0 bg-background/40">
            <div className="flex items-center gap-3">
              <h3 className="font-heading text-lg font-bold text-foreground min-w-[180px]">{headerDateString}</h3>
              <div className="flex gap-0.5 bg-white/5 rounded-lg border border-white/10 p-0.5">
                <button onClick={handlePrev} className="p-1 hover:bg-white/10 rounded transition-colors text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={handleNext} className="p-1 hover:bg-white/10 rounded transition-colors text-muted-foreground hover:text-foreground">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {viewType !== 'Month' && (
                <div className="flex items-center gap-1 bg-white/5 rounded-lg border border-white/10 p-0.5">
                  <button onClick={handleZoomOut} className="p-1.5 hover:bg-white/10 rounded text-muted-foreground hover:text-foreground transition-colors" title="Zoom Out">
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-muted-foreground w-8 text-center">{zoomLevel}px</span>
                  <button onClick={handleZoomIn} className="p-1.5 hover:bg-white/10 rounded text-muted-foreground hover:text-foreground transition-colors" title="Zoom In">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex bg-[#353437]/50 rounded-lg p-0.5 shrink-0 border border-white/5">
                {(['Day', 'Week', 'Month'] as const).map(vt => (
                  <button 
                    key={vt}
                    onClick={() => setViewType(vt)}
                    className={`px-3 py-1.5 rounded-md font-heading text-[10px] font-bold transition-all ${viewType === vt ? 'bg-primary text-[#1000a9] shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {vt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar relative min-h-0 flex bg-background/20">
            {viewType === 'Month' ? (
              renderMonthView()
            ) : viewType === 'Week' ? (
              <div className="flex flex-1 min-w-max">
                <div className="w-[50px] shrink-0 border-r border-border/40 relative bg-background/80 z-20" style={{ height: `${24 * zoomLevel}px` }}>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="absolute left-0 right-0 text-[10px] font-heading font-semibold text-[#908fa0] text-right pr-2 pt-0.5" style={{ top: `${i * zoomLevel}px` }}>
                      {String(i).padStart(2, '0')}:00
                    </div>
                  ))}
                </div>
                {eachDayOfInterval({ start: startOfWeek(selectedDate), end: endOfWeek(selectedDate) }).map(day => (
                  <div key={day.toISOString()} className="flex-1 min-w-[120px]">
                    {renderTimelineColumn(day)}
                  </div>
                ))}
              </div>
            ) : (
              renderTimelineColumn(selectedDate)
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 h-full min-h-0 overflow-y-auto custom-scrollbar pr-1">
          
          <div className="rounded-xl p-4 bg-background/60 border border-border shrink-0">
            <div className="flex justify-between items-center mb-3">
              <span className="font-heading text-xs font-bold">{format(selectedDate, 'MMMM yyyy')}</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['S','M','T','W','T','F','S'].map((d, idx) => <span key={idx} className="text-[9px] font-bold text-muted-foreground">{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {miniCalDays.map((day, i) => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, selectedDate);
                return (
                  <button 
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={`h-7 w-7 mx-auto rounded-full text-[10px] font-semibold flex items-center justify-center transition-all
                      ${isSelected ? 'bg-primary text-[#1000a9]' : 'hover:bg-white/10'} 
                      ${!isCurrentMonth && !isSelected ? 'text-muted-foreground/40' : 'text-foreground'}
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl p-4 bg-card/60 border border-border flex flex-col gap-3 relative shrink-0">
            <div className="ai-shimmer absolute inset-0 pointer-events-none opacity-10"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center border border-border shrink-0">
                <CalendarIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h4 className="font-heading text-xs font-bold text-foreground truncate">Google Calendar</h4>
                <p className="text-[10px] text-muted-foreground truncate">
                  {googleToken ? "Synced & active" : "Sync busy/free slots"}
                </p>
              </div>
            </div>
            <button 
              onClick={handleConnectCalendar}
              disabled={isConnecting || !!googleToken}
              className="mt-1 w-full bg-foreground text-background py-2 rounded-lg font-heading text-[10px] font-bold hover:bg-foreground/90 transition-colors disabled:opacity-50 uppercase tracking-wider"
            >
              {isConnecting ? "Connecting..." : googleToken ? "Connected" : "Connect Account"}
            </button>
          </div>

          <div className="rounded-xl p-4 bg-background/60 border border-primary/20 shadow-[0_0_15px_rgba(192,193,255,0.02)] flex flex-col gap-3 shrink-0">
            <div>
              <div className="flex items-center gap-1.5 text-primary mb-1.5">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span className="font-heading text-[10px] uppercase font-bold tracking-wider">AI Optimizer</span>
              </div>
              <h4 className="font-heading text-lg font-bold text-[#4edea3]">
                {scheduleBlocks.length > 0 ? "Optimized" : "--"}
              </h4>
            </div>
            
            <div className="flex flex-col gap-2 mt-1">
              <button 
                onClick={handleOptimize}
                disabled={isOptimizing || !googleToken}
                className="w-full text-[#4edea3] border border-[#4edea3]/30 hover:bg-[#4edea3]/10 py-2 rounded-lg font-heading text-[10px] font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 uppercase tracking-wider"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Optimizing...</span>
                  </>
                ) : "Generate Schedule"}
              </button>
              
              {scheduleBlocks.length > 0 && googleToken && (
                <button 
                  onClick={handleExportToCalendar}
                  disabled={isExporting}
                  className="w-full bg-[#1000a9] text-white border border-primary/30 hover:bg-primary py-2 rounded-lg font-heading text-[10px] font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 uppercase tracking-wider"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Syncing...</span>
                    </>
                  ) : exportSuccess ? (
                    "Synced Successfully!"
                  ) : (
                    "Sync to G-Calendar"
                  )}
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {showFallbackToast && (
        <div className="fixed bottom-6 right-6 z-[999] bg-[#1c1b1d] border border-primary/30 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-sm">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-sm font-bold animate-pulse">wifi_off</span>
          </div>
          <div>
            <p className="font-heading text-xs font-bold text-foreground">Local AI Active</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Gemini rate limit reached. Offline heuristic model running.</p>
          </div>
        </div>
      )}

      <CustomizerModal 
        isOpen={isCustomizerOpen} 
        onClose={() => setIsCustomizerOpen(false)}
        onConfirm={handleCustomizerConfirm} 
      />
    </div>
  );
}
