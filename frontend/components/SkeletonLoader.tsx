import React from 'react';

export const CardSkeleton = () => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl animate-pulse space-y-4">
    <div className="h-4 w-1/3 rounded-md bg-white/10" />
    <div className="h-8 w-1/2 rounded-md bg-white/10" />
    <div className="h-2 w-full rounded-full bg-white/10" />
  </div>
);

export const ChatSkeleton = () => (
  <div className="space-y-4 animate-pulse p-4">
    <div className="flex justify-start">
      <div className="h-16 w-3/4 rounded-2xl bg-white/10" />
    </div>
    <div className="flex justify-end">
      <div className="h-12 w-2/3 rounded-2xl bg-purple-600/30" />
    </div>
    <div className="flex justify-start">
      <div className="h-20 w-4/5 rounded-2xl bg-white/10" />
    </div>
  </div>
);
