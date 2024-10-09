import { Prisma, PrismaClient } from "@prisma/client";
import { BaseService } from "./base-service";

export class WithPrismaService extends BaseService {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  public async execute(boardIds: number[]) {
    const getTime = Date.now();
    const boards = await this.prisma.board.findMany({
      where: {
        id: {
          in: boardIds,
        },
      },
      select: {
        id: true,
        actions: {
          select: {
            actionId: true,
            action: {
              select: {
                tasks: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
        doneTasks: {
          select: {
            taskId: true,
          },
        },
      },
    });
    const getTimeEnd = Date.now();
    console.log(`get took ${getTimeEnd - getTime}`);

    const logicTime = Date.now();
    const data: {
      boardId: number;
      totalActions: number;
      actionsDone: number;
      totalTasks: number;
      tasksDone: number;
    }[] = [];

    for (const board of boards) {
      let actionsDone = 0;
      let totalTasks = 0;

      const doneTasks = new Set(board.doneTasks.map(({ taskId }) => taskId));
      const tasksDone = doneTasks.size;
      const totalActions = board.actions.length;

      for (const { action } of board.actions) {
        totalTasks += action.tasks.length;
        if (action.tasks.every((task) => doneTasks.has(task.id))) {
          actionsDone++;
        }
      }
      data.push({
        actionsDone,
        tasksDone,
        totalActions,
        totalTasks,
        boardId: board.id,
      });
    }

    const values = data.map(
      ({ boardId, totalActions, actionsDone, totalTasks, tasksDone }) =>
        Prisma.sql`(${boardId}, ${totalActions}, ${actionsDone}, ${totalTasks}, ${tasksDone})`
    );
    const logicTimeEnd = Date.now();
    console.log(`logic took ${logicTimeEnd - logicTime}`);

    const updateTime = Date.now();

    await this.prisma.$executeRaw`
    MERGE INTO boards AS target
    USING (VALUES ${Prisma.join(values)}) AS source (boardId, totalActions, actionsDone, totalTasks, tasksDone)
    ON target.id = source.boardId
    WHEN MATCHED THEN
      UPDATE SET 
        target.totalActions = source.totalActions,
        target.actionsDone = source.actionsDone,
        target.totalTasks = source.totalTasks,
        target.tasksDone = source.tasksDone;
    `;
    const updateTimeEnd = Date.now();
    console.log(`update took ${updateTimeEnd - updateTime}`);
  }
}
