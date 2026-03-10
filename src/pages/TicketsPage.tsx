import { useState } from "react";
import { TicketPlus } from "lucide-react";
import PrimaryButton from "../components/common/PrimaryButton";
import SegmentedTabs from "../components/common/SegmentedTabs";
import AppShell from "../components/layouts/AppShell";
import PageHeader from "../components/layouts/PageHeader";

import AddTicketPlaceholder from "../components/tickets/AddTicketPlaceholder";
import TicketEventCard from "../components/tickets/TicketEventCard";
import TicketsEmptyState from "../components/tickets/TicketsEmptyState";
import { ticketEvents } from "../data/tickets";
import type { TicketTab } from "../types/tickets";

type TicketsPageProps = {
  showFilledState?: boolean;
};

function TicketsPage({ showFilledState = false }: TicketsPageProps) {
  const [activeTab, setActiveTab] = useState<TicketTab>("upcoming");

  return (
    <AppShell>
      <div className="flex items-start justify-between gap-4">
        <div>
          <PageHeader title="Tickets" />
          <div className="mt-4">
            <SegmentedTabs
              items={[
                { label: "Upcoming", value: "upcoming" },
                { label: "Past", value: "past" },
              ]}
              activeValue={activeTab}
              onChange={(value) => setActiveTab(value as TicketTab)}
            />
          </div>
        </div>

        {showFilledState ? (
          <div className="pt-10">
            <PrimaryButton label="Add ticket" icon={TicketPlus} />
          </div>
        ) : null}
      </div>

      {!showFilledState ? (
        <div className="mt-6">
          <TicketsEmptyState />
        </div>
      ) : (
        <div className="mt-6 border-t border-[#E5E7EB] pt-8">
          <TicketEventCard event={ticketEvents[0]} />

          <div className="mt-5">
            <AddTicketPlaceholder />
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default TicketsPage;