import Image from "next/image";

function RootNotFound() {
  return (
    <html lang="zh-TW">
      <body>
        <main className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          <Image
            src="/images/event-camping.jpg"
            alt=""
            fill
            className="object-cover"
            priority
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-neutral-950/60"
            aria-hidden="true"
          />

          <span
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-[8rem] md:text-[12rem] text-white/10 pointer-events-none select-none leading-none"
            aria-hidden="true"
          >
            404
          </span>

          <div className="relative z-10 flex flex-col items-center gap-4">
            <h1 className="typo-heading text-2xl md:text-3xl text-white">
              走進了未知的山徑
            </h1>
            <p className="typo-body text-white/70 max-w-md">
              這條路似乎還沒有人走過，讓我們回到營地重新出發。
            </p>
            <div className="mt-4">
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-full px-8 py-3 border border-white/60 text-white hover:bg-white/10 hover:border-white transition-colors"
              >
                回到營地
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}

RootNotFound.displayName = "RootNotFound";
export default RootNotFound;
