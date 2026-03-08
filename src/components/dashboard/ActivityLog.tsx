import { ExternalLink, MoreVertical } from "lucide-react";
import type { ActivityItem } from "../../types/dashboard";

type ActivityLogProps = {
  activities: ActivityItem[];
};

function ActivityLog({ activities }: ActivityLogProps) {
  return (
    <div>
      <div className="flex justify-end px-5 py-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-[10px] border border-[#D0D5DD] bg-white px-4 py-2 text-[16px] font-semibold text-[#1E497E] shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
        >
          View all
          <ExternalLink size={18} />
        </button>
      </div>

      <div className="border-t border-[#EAECF0]">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={`flex items-start justify-between px-5 py-4 ${
              index !== 0 ? "border-t border-[#EAECF0]" : ""
            }`}
          >
            <div>
              <p className="text-[16px] font-medium text-[#1F2430]">
                {activity.title}
              </p>
              <p className="mt-1 text-[14px] text-[#5D6470]">{activity.time}</p>
            </div>

            <button type="button" className="mt-1 text-[#98A2B3]">
              <MoreVertical size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivityLog;