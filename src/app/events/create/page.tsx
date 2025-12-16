import { CreateEventForm } from "~/app/_components/create-event-form";

export default function CreateEventPage() {
    return (
        <main className="min-h-screen bg-gray-950">
            <div className="mx-auto max-w-4xl px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-2 text-4xl font-bold text-white">
                        Create New Event
                    </h1>
                    <p className="text-gray-400">
                        Add a new event to your calendar
                    </p>
                </div>

                {/* Form */}
                <CreateEventForm />
            </div>
        </main>
    );
}
