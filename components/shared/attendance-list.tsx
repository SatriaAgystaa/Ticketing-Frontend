"use client";

import { Users } from "lucide-react";

interface AttendanceListProps {
  attendees: { name: string; avatar_url: string | null }[];
  totalCount: number;
}

export function AttendanceList({ attendees, totalCount }: AttendanceListProps) {
  if (totalCount === 0) return null;

  const displayCount = Math.min(attendees.length, 5);
  const remaining = totalCount - displayCount;

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {attendees.slice(0, displayCount).map((attendee, i) => (
          <div
            key={i}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-600"
          >
            {attendee.avatar_url ? (
              <img
                src={attendee.avatar_url}
                alt={attendee.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              attendee.name.charAt(0).toUpperCase()
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <Users className="h-4 w-4" />
        <span>
          {totalCount} orang {remaining > 0 ? "akan hadir" : "hadir"}
        </span>
      </div>
    </div>
  );
}
