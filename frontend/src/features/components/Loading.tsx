// Small spinner for a part of a page
export const Loading = () => (
  <div className="flex items-center justify-center py-10">
    <div className="h-10 w-10 rounded-full border-4 border-sage-100 border-t-sage-600 motion-safe:animate-spin" />
  </div>
);

// Full page loading (while we check if the user is logged in)
export const GlobalLoading = () => (
  <div className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-paper">
    <div className="flex gap-2" aria-hidden="true">
      <span className="h-3 w-3 rounded-full bg-sage-400 motion-safe:animate-bounce" />
      <span className="h-3 w-3 rounded-full bg-butter-400 motion-safe:animate-bounce [animation-delay:0.2s]" />
      <span className="h-3 w-3 rounded-full bg-apricot-400 motion-safe:animate-bounce [animation-delay:0.4s]" />
    </div>
    <p className="font-medium text-espresso-500">Loading…</p>
  </div>
);
