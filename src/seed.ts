import { PrismaClient } from "@prisma/client";
import { SeedInput } from "./dto/seed.input";

function getRandomInt(min: number, max: number) {
  max += 1;
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

export async function seed({
  numberOfBoards = 10,
  prisma,
  maxIndividualActions,
  numberOfSharedActions,
  maxTasks,
  percentageOfDoneTasks,
}: SeedInput): Promise<number[]> {
  await prisma.doneTasksBoard.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.actionBoardMapper.deleteMany({});
  await prisma.action.deleteMany({});
  await prisma.board.deleteMany({});

  await prisma.board.createMany({
    data: Array(numberOfBoards).fill({}),
  });
  const boardIds = (await prisma.board.findMany({ select: { id: true } })).map(
    ({ id }) => id
  );

  let totalActions = numberOfSharedActions;

  let individualActionsByBoard = new Map(
    boardIds.map((boardId) => [boardId, getRandomInt(0, maxIndividualActions)])
  );

  individualActionsByBoard.forEach(
    (boardAction) => (totalActions += boardAction)
  );

  await prisma.action.createMany({
    data: Array(totalActions).fill({}),
  });

  const actionIds = (
    await prisma.action.findMany({ select: { id: true } })
  ).map(({ id }) => id);

  const actionBoardMappers: { boardId: number; actionId: number }[] = [];

  for (const actionId of actionIds) {
    if (numberOfSharedActions) {
      boardIds.forEach((boardId) =>
        actionBoardMappers.push({ boardId, actionId })
      );
      numberOfSharedActions--;
    } else {
      for (const [boardId, individualActions] of individualActionsByBoard) {
        if (individualActions) {
          actionBoardMappers.push({ boardId, actionId });
          if (individualActions == 1) {
            individualActionsByBoard.delete(boardId);
          } else {
            individualActionsByBoard.set(boardId, individualActions - 1);
          }
          break;
        }
      }
    }
  }

  await prisma.actionBoardMapper.createMany({
    data: actionBoardMappers,
  });

  const tasks: { actionId: number }[] = [];

  for (const actionId of actionIds) {
    const numberOfTasks = getRandomInt(0, maxTasks);
    for (let i = 0; i < numberOfTasks; i++) {
      tasks.push({ actionId });
    }
  }

  await prisma.task.createMany({
    data: tasks,
  });

  const tasksBoards = await prisma.$queryRaw<
    {
      boardId: number;
      taskId: number;
    }[]
  >`
  SELECT b.id AS boardId, t.id AS taskId FROM boards b
  JOIN action_board_mappers abm ON abm.boardId = b.id
  JOIN actions a ON a.id = abm.actionId
  JOIN tasks t ON t.actionId = a.id
  `;

  const doneTasks = tasksBoards.filter(
    () => getRandomInt(0, 100) < percentageOfDoneTasks
  );

  await prisma.doneTasksBoard.createMany({
    data: doneTasks,
  });

  return boardIds;
}
