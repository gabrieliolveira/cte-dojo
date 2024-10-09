import { PrismaClient } from "@prisma/client";

export async function validateAnswer({
  boardIds,
  prisma,
}: {
  boardIds: number[];
  prisma: PrismaClient;
}) {
  const boards = await prisma.board.findMany({
    where: {
      id: {
        in: boardIds,
      },
    },
    select: {
      id: true,
      actionsDone: true,
      tasksDone: true,
      totalActions: true,
      totalTasks: true,
      actions: {
        select: {
          action: {
            select: {
              id: true,
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

  let hasError = false;

  for (const board of boards) {
    const doneTasksSet = new Set(board.doneTasks.map((t) => t.taskId));

    if (board.totalActions != board.actions.length) {
      hasError = true;
      console.log(
        `board with id ${board.id} has ${board.actions.length} actions but totalActions = ${board.totalActions}`
      );
    }
    const totalTasks = board.actions.reduce((sum, { action }) => {
      return sum + action.tasks.length;
    }, 0);

    if (totalTasks != board.totalTasks) {
      hasError = true;
      console.log(
        `board with id ${board.id} has ${totalTasks} tasks but totalTasks = ${board.totalTasks}`
      );
    }

    const doneTasks = board.doneTasks.length;

    if (doneTasks != board.tasksDone) {
      hasError = true;
      console.log(
        `board with id ${board.id} has ${doneTasks} tasks but doneTasks = ${board.tasksDone}`
      );
    }

    const doneActions = board.actions.filter(({ action }) => {
      return action.tasks.every((task) => doneTasksSet.has(task.id));
    }).length;

    if (doneActions != board.actionsDone) {
      hasError = true;
      console.log(
        `board with id ${board.id} has ${doneActions} done actions but actionsDone = ${board.actionsDone}`
      );
    }

    if (hasError) {
      console.log("Service não está correto!");
    } else {
      console.log("Service está correto!");
    }
  }
}
