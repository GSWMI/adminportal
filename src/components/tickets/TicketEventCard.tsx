import { CalendarDays, MapPin } from "lucide-react";
import ActionMenu from "../common/ActionMenu";
import type { TicketEvent } from "../../types/tickets";
import TicketActionPill from "./TicketActionPill";

type TicketEventCardProps = {
  event: TicketEvent;
};

function TicketEventCard({ event }: TicketEventCardProps) {
  return (
    <div className="rounded-[16px] border border-[#D9D9D9] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-start gap-4">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="h-[228px] w-[228px] rounded-[16px] object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-[20px] font-semibold text-[#1F2430]">
                {event.title}
              </h2>

              <p className="mt-3 max-w-[760px] text-[16px] leading-[1.45] text-[#5D6470]">
                {event.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-6 text-[16px] text-[#2A2F3A]">
                <div className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-[#6B7280]" />
                  <span className="font-medium">{event.startDate}</span>
                  <span className="text-[#98A2B3]">–</span>
                  <span className="font-medium">{event.endDate}</span>
                </div>

                <div className="flex items-center gap-2 text-[#3867D6]">
                  <MapPin size={18} />
                  <span className="font-medium">{event.location}</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-4">
                <TicketActionPill label="Attendees" />
                <TicketActionPill label="Meal tickets" />
                <TicketActionPill label="Accommodation tickets" />
                <TicketActionPill label="Transport tickets" />
              </div>
            </div>

            <ActionMenu
              items={[
                {
                  label: "View details",
                  onClick: () => {
                    console.log("View event:", event.id);
                  },
                },
                {
                  label: "Archive event",
                  onClick: () => {
                    console.log("Archive event:", event.id);
                  },
                },
                {
                  label: "Close registration",
                  onClick: () => {
                    console.log("Close registration:", event.id);
                  },
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketEventCard;