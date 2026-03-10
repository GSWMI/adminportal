import { ArrowUpDown } from "lucide-react";
import type { UserActivityRecord } from "../../types/users";

type UserActivityTableProps = {
  records: UserActivityRecord[];
};

function UserActivityTable({ records }: UserActivityTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-225">
        <thead>
          <tr className="h-11 border-b border-[#EAECF0] text-left">
            <th className="px-5 text-[14px] font-medium text-[#6B7280]">
              <div className="flex items-center gap-1">
                User <ArrowUpDown size={14} />
              </div>
            </th>

            <th className="px-2 text-[14px] font-medium text-[#6B7280]">
              <div className="flex items-center gap-1">
                Activity <ArrowUpDown size={14} />
              </div>
            </th>

            <th className="px-5 text-[14px] font-medium text-[#6B7280]">
              <div className="flex items-center gap-1">
                Timestamp <ArrowUpDown size={14} />
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-b border-[#EAECF0]">
              <td className="px-5 py-5 text-[16px] font-semibold text-[#1F2430]">
                {record.user}
              </td>

              <td className="px-2 py-5 text-[16px] font-medium text-[#1F2430]">
                {record.activity}
              </td>

              <td className="px-5 py-5 text-[16px] text-[#5D6470]">
                {record.timestamp}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserActivityTable;