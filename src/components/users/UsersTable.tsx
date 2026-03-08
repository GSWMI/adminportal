import { ArrowUpDown } from "lucide-react";
import ActionMenu from "../common/ActionMenu";
import type { UserRecord } from "../../types/users";

type UsersTableProps = {
  users: UserRecord[];
};

function UsersTable({ users }: UsersTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="h-[44px] border-b border-[#EAECF0] text-left">
            <th className="px-5 text-[14px] font-medium text-[#6B7280]">
              <div className="flex items-center gap-1">
                User <ArrowUpDown size={14} />
              </div>
            </th>

            <th className="px-2 text-[14px] font-medium text-[#6B7280]">
              <div className="flex items-center gap-1">
                Last active <ArrowUpDown size={14} />
              </div>
            </th>

            <th className="px-2 text-[14px] font-medium text-[#6B7280]">
              <div className="flex items-center gap-1">
                Role <ArrowUpDown size={14} />
              </div>
            </th>

            <th className="px-5" />
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-[#EAECF0]">
              <td className="px-5 py-5 text-[16px] font-semibold text-[#1F2430]">
                {user.name}
              </td>

              <td className="px-2 py-5 text-[16px] text-[#5D6470]">
                {user.lastActive}
              </td>

              <td className="px-2 py-5">
                <span className="inline-flex rounded-full border border-[#D0D5DD] bg-white px-3 py-1 text-[14px] font-medium text-[#4B5563]">
                  {user.role}
                </span>
              </td>

              <td className="px-5 py-5 text-right">
                <ActionMenu
                  items={[
                    {
                      label: "View details",
                      onClick: () => {
                        console.log("View details:", user.id);
                      },
                    },
                    {
                      label: "Remove user",
                      onClick: () => {
                        console.log("Remove user:", user.id);
                      },
                    },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTable;