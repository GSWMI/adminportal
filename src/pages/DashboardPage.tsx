import { useState } from "react";
import { ExternalLink, TicketPlus, UserPlus } from "lucide-react";
import AddUserModal from "../components/users/AddUserModal";
import OutlineButton from "../components/common/OutlineButton";
import RecordsEmptyState from "../components/common/RecordsEmptyState";
import SectionCard from "../components/common/SectionCard";
import AppShell from "../components/layouts/AppShell";
import PageHeader from "../components/layouts/PageHeader";
import StatCard from "../components/dashboard/StatCard";
import TransactionsTable from "../components/transactions/TransactionsTable";
import { emptyStats, filledStats } from "../data/dashboard";
import { transactionRecords } from "../data/transactions";

type DashboardPageProps = {
  showFilledState?: boolean;
};

function DashboardPage({ showFilledState = false }: DashboardPageProps) {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const stats = showFilledState ? filledStats : emptyStats;
  const previewRecords = transactionRecords.slice(0, 7);

  return (
    <AppShell>
      <PageHeader title="Dashboard" />

      <div className="mt-7 grid grid-cols-3 gap-5">
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} />
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-[18px] font-semibold text-[#1F2430]">
          Quick actions
        </h2>

        <div className="mt-4 flex items-center gap-3">
          <OutlineButton label="Add ticket" icon={TicketPlus} />
          <OutlineButton
            label="Add user"
            icon={UserPlus}
            onClick={() => setIsAddUserOpen(true)}
          />
        </div>
      </div>

      <div className="mt-8">
        <SectionCard
          title="Transactions"
          action={
            showFilledState ? (
              <OutlineButton label="View all" icon={ExternalLink} />
            ) : undefined
          }
          allowOverflow
        >
          {showFilledState ? (
            <TransactionsTable records={previewRecords} />
          ) : (
            <RecordsEmptyState message="No records yet." />
          )}
        </SectionCard>
      </div>

      <AddUserModal
        open={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
      />
    </AppShell>
  );
}

export default DashboardPage;