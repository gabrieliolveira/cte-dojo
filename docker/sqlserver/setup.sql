USE master;
GO

IF DB_ID(N'$(SurveyDb)') IS NULL
BEGIN
    CREATE DATABASE $(SurveyDb);
    PRINT '***Database $(SurveyDb) created***'
END
ELSE
    PRINT 'Database $(SurveyDb) already exists, skipping...'
GO

-- Perform additional setup steps below
-- ...
