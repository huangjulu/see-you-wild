"use client";

import Skeleton from "@/components/ui/atoms/Skeleton";

const AdminDashboardSkeleton: React.FC = () => {
  return (
    <main className="flex flex-1 flex-col overflow-clip">
      {/* SummaryBar placeholder */}
      <div className="flex h-10 shrink-0 items-center border-b border-stroke-default bg-white px-6">
        <Skeleton className="h-4 w-48" />
      </div>

      {/* EventFilterBar placeholder */}
      <div className="flex shrink-0 items-center justify-between border-b border-stroke-default bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* EventGrid skeleton */}
      <div className="flex-1 overflow-y-auto p-4 grid gap-3 auto-rows-min content-start grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="flex gap-3 rounded-xl border border-stroke-default bg-white p-3 shadow-2xs"
          >
            <Skeleton className="size-14 shrink-0 rounded-lg" />
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

AdminDashboardSkeleton.displayName = "AdminDashboardSkeleton";
export default AdminDashboardSkeleton;
