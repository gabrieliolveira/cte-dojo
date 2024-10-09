import { PrismaClient } from "@prisma/client";
import { BaseService } from "./base-service";

/*
Service encontrado no pesquisa que precisa ser refatorado

Obs: Fazendo testes descobri que a contagem de actionsDone nesse Service está errada
*/
export class UpdateTotalBoardStatusService extends BaseService {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  public async execute(boardIds: number[]) {
    for (const boardId of boardIds) {
      await this.prisma.$executeRaw`
        UPDATE boards SET 
          totalActions = (
            SELECT COUNT(*) from action_board_mappers m
            JOIN actions a ON a.id = m.actionId
            where m.boardId = ${boardId}
          ),
          totalTasks = (
              SELECT COUNT(t.id) from action_board_mappers m
              JOIN actions a ON a.id = m.actionId
              JOIN tasks t ON t.actionId = a.id
              WHERE m.boardId = ${boardId}
          ), 
          actionsDone = (
              SELECT COUNT(*)
              FROM (
              SELECT t.actionId
              FROM action_board_mappers m
              JOIN tasks t ON t.actionId = m.actionId
              LEFT JOIN done_tasks_boards d ON t.id = d.taskId AND d.boardId = ${boardId}
              WHERE m.boardId = ${boardId}
              GROUP BY t.actionId
              HAVING COUNT(t.id) = COUNT(d.taskId)
              ) AS task_comparison
          ),
          tasksDone = (
            SELECT COUNT(t.id) from action_board_mappers m
            JOIN actions a ON a.id = m.actionId
            JOIN tasks t ON t.actionId = a.id
            JOIN done_tasks_boards td ON td.taskId = t.id AND td.boardId = m.boardId
            WHERE m.boardId = ${boardId}
          )
        WHERE id = ${boardId};
      `;
    }
  }
}
