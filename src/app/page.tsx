// Another Read - Event Management App
import { CreateEvent } from "~/app/_components/create-event";
import { EventList } from "~/app/_components/event-list";
import { api, HydrateClient } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  void api.event.getAll.prefetch();

  return (
    <HydrateClient>
      <main className="min-h-screen bg-gray-950">
        <div className="mx-auto max-w-7xl px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="mb-2 text-4xl font-bold text-white">
              Events
            </h1>
            <p className="text-gray-400">
              Create and manage your events
            </p>
          </div>

          {/* Create Event Form */}
          <div className="mb-12">
            <CreateEvent />
          </div>

          {/* Event List */}
          <div>
            <EventList />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
