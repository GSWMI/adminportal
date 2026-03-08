import { Download } from "lucide-react";
import PrimaryButton from "../components/common/PrimaryButton";
import RecordsEmptyState from "../components/common/RecordsEmptyState";
import SectionCard from "../components/common/SectionCard";
import AppShell from "../components/layouts/AppShell";
import PageHeader from "../components/layouts/PageHeader";
import TransactionsTable from "../components/transactions/TransactionsTable";
import TransactionsToolbar from "../components/transactions/TransactionsToolbar";
import { transactionRecords } from "../data/transactions";
import TablePagination from "../components/common/TablePagination";

type TransactionsPageProps = {
  showFilledState?: boolean;
};

function TransactionsPage({
  showFilledState = false,
}: TransactionsPageProps) {
  return (
    <AppShell>
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Transactions" />

        {showFilledState ? (
          <div className="pt-[8px]">
            <PrimaryButton label="Export" icon={Download} />
          </div>
        ) : null}
      </div>

      {!showFilledState ? (
        <div className="mt-6">
          <RecordsEmptyState message="No transaction records yet" />
        </div>
      ) : (
        <div className="mt-8">
          <SectionCard title="" allowOverflow>
            <TransactionsToolbar />
            <TransactionsTable records={transactionRecords} />
             <TablePagination pageLabel="Page 1 of 1" />
          </SectionCard>
        </div>
      )}
    </AppShell>
  );
}

export default TransactionsPage;