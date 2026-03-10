import { useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import AddUserModal from "../components/users/AddUserModal";
import OutlineButton from "../components/common/OutlineButton";
import PrimaryButton from "../components/common/PrimaryButton";
import SearchInput from "../components/common/SearchInput";
import SegmentedTabs from "../components/common/SegmentedTabs";
import TablePagination from "../components/common/TablePagination";
import SectionCard from "../components/common/SectionCard";
import AppShell from "../components/layouts/AppShell";
import PageHeader from "../components/layouts/PageHeader";
import UserActivityTable from "../components/users/UserActivityTable";
import UsersTable from "../components/users/UsersTable";
import { userActivityRecords, userRecords } from "../data/users";
import type { UserTab } from "../types/users";

function UsersPage() {
  const [activeTab, setActiveTab] = useState<UserTab>("users");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const isUsersTab = activeTab === "users";

  return (
    <AppShell>
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Users" />

        {isUsersTab ? (
          <div className="pt-2">
            <PrimaryButton
              label="Add user"
              icon={UserPlus}
              onClick={() => setIsAddUserOpen(true)}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-8">
        <SectionCard allowOverflow>
          <div className="flex flex-col gap-4 border-b border-[#EAECF0] px-5 py-3 lg:flex-row lg:items-center lg:justify-between">
            <SegmentedTabs
              items={[
                { label: "Users", value: "users" },
                { label: "Activity Log", value: "activity-log" },
              ]}
              activeValue={activeTab}
              onChange={(value) => setActiveTab(value as UserTab)}
            />

            <SearchInput className="w-full lg:w-74" />
          </div>

          {isUsersTab ? (
            <>
              <UsersTable users={userRecords} />

              <div className="px-5 py-4">
                <OutlineButton
                  label="Add user"
                  icon={Plus}
                  onClick={() => setIsAddUserOpen(true)}
                />
              </div>

              <TablePagination
                pageLabel="Page 1 of 1"
                disablePrevious
                disableNext
              />
            </>
          ) : (
            <>
              <UserActivityTable records={userActivityRecords} />
              <TablePagination pageLabel="Page 1 of 10" />
            </>
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

export default UsersPage;