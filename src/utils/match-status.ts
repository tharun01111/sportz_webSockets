import { MATCH_STATUS } from "../validation/matches";

type MatchStatus = "scheduled" | "live" | "finished";

type MatchLike = {
  startTime: Date;
  endTime: Date;
  status: MatchStatus;
};

type UpdateStatusFn = (status: MatchStatus) => Promise<void>;

export const getMatchStatus = (
  startTime: Date,
  endTime: Date,
  now = new Date()
): MatchStatus => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Invalid match dates");
  }

  if (now < start) {
    return MATCH_STATUS.SCHEDULED;
  }

  if (now >= end) {
    return MATCH_STATUS.FINISHED;
  }

  return MATCH_STATUS.LIVE;
};

export const syncMatchStatus = async (
  match: MatchLike,
  updateStatus: UpdateStatusFn
) => {
  const nextStatus = getMatchStatus(match.startTime, match.endTime);

  if (match.status !== nextStatus) {
    await updateStatus(nextStatus);
    match.status = nextStatus;
  }

  return match.status;
};
