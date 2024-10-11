import { PrismaClient } from "@prisma/client";
import { BaseService } from "./base-service";

/*
Escreva sua solução nesse Service
*/
export class RefactoredService extends BaseService {
	constructor(prisma: PrismaClient) {
		super(prisma);
	}

	public async execute(boardIds: number[]) {
		const results = await Promise.all(
			boardIds.map(async (boardId) => {
				return this.prisma.$queryRaw`
          WITH 
          actionCount AS (
              SELECT abm.boardId, COUNT(*) AS totalActions
              FROM action_board_mappers abm
              WHERE abm.boardId = ${boardId}
              GROUP BY abm.boardId
          ),
          taskCount AS (
              SELECT abm.boardId, COUNT(t.id) AS totalTasks
              FROM action_board_mappers abm
              JOIN tasks t ON t.actionId = abm.actionId
              WHERE abm.boardId = ${boardId}
              GROUP BY abm.boardId
          ),
          doneTasks AS (
              SELECT dtb.boardId, COUNT(*) AS tasksDone
              FROM done_tasks_boards dtb
              WHERE dtb.boardId = ${boardId}
              GROUP BY dtb.boardId
          ),
          completedActions AS (
              SELECT abm.boardId, COUNT(DISTINCT abm.actionId) AS actionsDone
              FROM action_board_mappers abm
              LEFT JOIN tasks t ON t.actionId = abm.actionId
              LEFT JOIN done_tasks_boards dtb 
                  ON dtb.taskId = t.id AND dtb.boardId = abm.boardId
              WHERE abm.boardId = ${boardId}
              GROUP BY abm.boardId
              HAVING COUNT(t.id) > 0 AND COUNT(t.id) = COUNT(dtb.taskId)
          )
          UPDATE boards
          SET 
            totalActions = ISNULL(ac.totalActions, 0),
            totalTasks = ISNULL(tc.totalTasks, 0),
            tasksDone = ISNULL(dt.tasksDone, 0),
            actionsDone = ISNULL(ca.actionsDone, 0)
          FROM actionCount ac
          LEFT JOIN taskCount tc ON tc.boardId = ac.boardId
          LEFT JOIN doneTasks dt ON dt.boardId = ac.boardId
          LEFT JOIN completedActions ca ON ca.boardId = ac.boardId
          WHERE boards.id = ac.boardId;
				`;
			})
		);
	}
}
