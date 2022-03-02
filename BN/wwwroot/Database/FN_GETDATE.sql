USE [HRGIS]
GO

/****** Object:  UserDefinedFunction [dbo].[FN_GETDATE]    Script Date: 2/21/2022 6:11:46 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE FUNCTION [dbo].[FN_GETDATE]
(	
	@StartDate DATE, @EndDate DATE
)
RETURNS TABLE 
AS
RETURN 
(
	WITH ListDates(AllDates) AS
	(   SELECT @StartDate AS DATE
		UNION ALL
		SELECT DATEADD(DAY,1,AllDates)
		FROM ListDates 
		WHERE AllDates < @EndDate
	)

	SELECT [1] as date_1, [2] as date_2, [3] as date_3, (DATEDIFF(D, @StartDate, @EndDate) + 1) as DateDiffs from (
		SELECT AllDates, ROW_NUMBER() OVER(ORDER BY AllDates ASC) AS Row# FROM ListDates GROUP BY AllDates
	)as tb
	pivot(
		MIN(AllDates) for Row# in ([1],[2],[3])
	)as piv 
)
GO


