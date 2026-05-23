import Section from "@/components/ui/atoms/Section";
import Skeleton from "@/components/ui/atoms/Skeleton";

const EventDetailLoading = () => {
  return (
    <main className="bg-page-gradient pb-24 md:pb-16">
      {/* Title */}
      <Section as="div" className="pt-24 md:pt-28">
        <div className="col-span-full space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      </Section>

      {/* Gallery */}
      <Section as="div" className="mt-4">
        <div className="col-span-full">
          {/* Desktop: 1 big + 2 small */}
          <div className="hidden md:grid md:grid-cols-3 md:grid-rows-2 gap-1 rounded-2xl overflow-hidden aspect-3/1">
            <Skeleton className="col-span-2 row-span-2 rounded-none h-full" />
            <Skeleton className="rounded-none h-full" />
            <Skeleton className="rounded-none h-full" />
          </div>
          {/* Mobile: single image */}
          <Skeleton className="md:hidden aspect-[4/3] w-full rounded-2xl" />
        </div>
      </Section>

      {/* Content + Sidebar */}
      <Section as="div" className="mt-8">
        {/* Left column */}
        <div className="col-span-4 md:col-span-5 lg:col-span-8 space-y-5">
          {/* Detail section card */}
          <div className="rounded-xl border border-stroke-default bg-white p-5 space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-full" rows={3} rowClassName="h-3" />
          </div>
          {/* Package options card */}
          <div className="rounded-xl border border-stroke-default bg-white p-5 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>

        {/* Right column: Sidebar */}
        <div className="col-span-4 md:col-span-3 lg:col-span-4">
          <div className="rounded-xl border border-stroke-default bg-white p-5 space-y-4 md:sticky md:top-28">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </Section>
    </main>
  );
};

EventDetailLoading.displayName = "EventDetailLoading";
export default EventDetailLoading;
