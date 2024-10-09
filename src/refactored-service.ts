import { PrismaClient } from "@prisma/client";
import { BaseService } from "./base-service";

/*
Escreva sua solução nesse Service
*/
export class RefactoredService extends BaseService {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  public async execute(boardIds: number[]) {}
}
