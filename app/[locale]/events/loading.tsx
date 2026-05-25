import Section from "@/components/ui/atoms/Section";
import Skeleton from "@/components/ui/atoms/Skeleton";

const EventsLoading = () => {
  return (
    <main className="bg-page-gradient min-h-screen">
      {/* Header area */}
      <div className="pt-24 pb-6">
        <Section as="div">
          <div className="col-span-full space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-48" />
          </div>
          <div className="col-span-full mt-4">
            <div className="space-y-4 pt-2">
              {/* Type filter chips */}
              <div className="hidden md:flex flex-wrap gap-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-12 w-24 rounded-full" />
                ))}
              </div>
              {/* Mobile: selector + search */}
              <div className="flex gap-3 md:hidden">
                <Skeleton className="h-10 flex-1 rounded-md" />
                <Skeleton className="h-10 flex-1 rounded-md" />
              </div>
              {/* Desktop: location selector + search */}
              <div className="hidden md:flex gap-3">
                <Skeleton className="h-10 w-40 rounded-md" />
                <Skeleton className="h-10 flex-1 rounded-md" />
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Card grid */}
      <Section as="div" className="pb-24">
        {/* Mobile: list cards */}
        <div className="col-span-full flex flex-col gap-3 sm:hidden">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
        {/* Desktop: card grid */}
        <div className="col-span-full hidden gap-6 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-neutral-100 bg-white overflow-hidden shadow-2xs"
            >
              <Skeleton className="aspect-4/3 w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-4 w-20 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
};

EventsLoading.displayName = "EventsLoading";
export default EventsLoading;
