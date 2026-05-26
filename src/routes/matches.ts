import { Request, Response, Router } from "express";
import { createMatchSchema, listMatchesQuerySchema } from "../validation/matches";
import { db } from "../db/db";
import { getMatchStatus } from "../utils/match-status";
import { matches } from "../db/schema";
import { desc } from "drizzle-orm";

export const matchRouter = Router();

const MAX_LIMIT = 100;

matchRouter.get('/', async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);

  if(!parsed.success) 
    return res.status(400).json({ error: 'Invalid query' , details: JSON.stringify(parsed.error)});

  const limit = Math.min(parsed.data.limit ?? 50 , MAX_LIMIT);

  try {
    const data = await db
    .select()
    .from(matches)
    .orderBy((desc(matches.createdAt)))
    .limit(limit);

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Failed to list matches" + error });
  }
});

matchRouter.post('/', async (req: Request, res: Response) => {
  const parsed = createMatchSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid payload',
      details: JSON.stringify(parsed.error)
    });
  }

  const { data: { startTime, endTime, homeScore, awayScore } } = parsed;
  const start = new Date(startTime);
  const end = new Date(endTime);

  try {
    const inserted = await db.insert(matches).values({
      ...parsed.data,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      homeScore: homeScore ?? 0,
      awayScore: awayScore ?? 0,
      status: getMatchStatus(start, end)
    }).returning();

    const [match] = inserted;

    res.status(201).json({ data: match });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to create match',
      details: JSON.stringify(err)
    });
  }
});