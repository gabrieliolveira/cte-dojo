import { PrismaClient } from "@prisma/client";

export type SeedInput = {
  numberOfBoards: number;
  numberOfSharedActions: number;
  maxIndividualActions: number;
  maxTasks: number;
  percentageOfDoneTasks: number;
  prisma: PrismaClient;
};
