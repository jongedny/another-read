// Another Read - Event Management App
import { CreateEvent } from "~/app/_components/create-event";
import { EventList } from "~/app/_components/event-list";
import { api, HydrateClient } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  void api.event.getAll.prefetch();

  return (
    <HydrateClient>
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-1/4 top-0 h-96 w-96 animate-pulse-slow rounded-full bg-purple-500/20 blur-3xl"></div>
          <div className="absolute -right-1/4 top-1/3 h-96 w-96 animate-pulse-slow rounded-full bg-pink-500/20 blur-3xl" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-0 left-1/3 h-96 w-96 animate-pulse-slow rounded-full bg-blue-500/20 blur-3xl" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-start px-4 py-16">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-6xl font-extrabold text-transparent sm:text-7xl">
              Event Manager
            </h1>
            <p className="text-xl text-gray-400">
              Create and track your events with style
            </p>
          </div>

          {/* Navigation */}
          <div className="mb-8">
            <a
              href="/books"
              className="rounded-lg bg-purple-500/20 px-6 py-3 text-purple-400 transition-all hover:bg-purple-500/30"
            >
              📚 View Book Library →
            </a>
          </div>

          {/* Create Event Form */}
          <div className="mb-12 w-full">
            <CreateEvent />
          </div>

          {/* Event List */}
          <div className="w-full">
            <EventList />
          </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500">
              Built with{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text font-semibold text-transparent">
                T3 Stack
              </span>
            </p>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
