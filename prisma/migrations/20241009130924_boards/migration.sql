BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[boards] (
    [id] INT NOT NULL IDENTITY(1,1),
    [totalActions] INT NOT NULL CONSTRAINT [boards_totalActions_df] DEFAULT 0,
    [totalTasks] INT NOT NULL CONSTRAINT [boards_totalTasks_df] DEFAULT 0,
    [actionsDone] INT NOT NULL CONSTRAINT [boards_actionsDone_df] DEFAULT 0,
    [tasksDone] INT NOT NULL CONSTRAINT [boards_tasksDone_df] DEFAULT 0,
    CONSTRAINT [boards_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[actions] (
    [id] INT NOT NULL IDENTITY(1,1),
    [deletedAt] DATETIME2,
    CONSTRAINT [actions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[action_board_mappers] (
    [actionId] INT NOT NULL,
    [boardId] INT NOT NULL,
    CONSTRAINT [action_board_mappers_pkey] PRIMARY KEY CLUSTERED ([actionId],[boardId])
);

-- CreateTable
CREATE TABLE [dbo].[done_tasks_boards] (
    [taskId] INT NOT NULL,
    [boardId] INT NOT NULL,
    CONSTRAINT [done_tasks_boards_pkey] PRIMARY KEY CLUSTERED ([taskId],[boardId])
);

-- CreateTable
CREATE TABLE [dbo].[tasks] (
    [id] INT NOT NULL IDENTITY(1,1),
    [actionId] INT NOT NULL,
    CONSTRAINT [tasks_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[action_board_mappers] ADD CONSTRAINT [action_board_mappers_actionId_fkey] FOREIGN KEY ([actionId]) REFERENCES [dbo].[actions]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[action_board_mappers] ADD CONSTRAINT [action_board_mappers_boardId_fkey] FOREIGN KEY ([boardId]) REFERENCES [dbo].[boards]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[done_tasks_boards] ADD CONSTRAINT [done_tasks_boards_boardId_fkey] FOREIGN KEY ([boardId]) REFERENCES [dbo].[boards]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[done_tasks_boards] ADD CONSTRAINT [done_tasks_boards_taskId_fkey] FOREIGN KEY ([taskId]) REFERENCES [dbo].[tasks]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[tasks] ADD CONSTRAINT [tasks_actionId_fkey] FOREIGN KEY ([actionId]) REFERENCES [dbo].[actions]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
