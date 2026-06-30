export default function HelpPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto h-screen">
      <h1 className="font-heading text-3xl font-bold mb-4">Help & Support</h1>
      <div className="glass-panel p-8 rounded-2xl h-full flex flex-col gap-4">
        <h2 className="text-xl font-semibold">How can we assist you today?</h2>
        <p className="text-muted-foreground mb-8">
          Welcome to the Commit AI Help Center. Browse our FAQs or contact support.
        </p>
        
        <div className="space-y-4">
          <div className="p-4 bg-surface-container-high rounded-lg">
            <h3 className="font-bold text-foreground">How do I create a task?</h3>
            <p className="text-muted-foreground text-sm mt-1">Click the &quot;New Task&quot; button in the sidebar or use the AI Assistant to generate one.</p>
          </div>
          <div className="p-4 bg-surface-container-high rounded-lg">
            <h3 className="font-bold text-foreground">Where are my settings?</h3>
            <p className="text-muted-foreground text-sm mt-1">Navigate to the Settings tab in the sidebar to update your preferences.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
