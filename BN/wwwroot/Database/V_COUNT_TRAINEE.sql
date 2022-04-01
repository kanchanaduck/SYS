USE [HRGIS]
GO

/****** Object:  View [dbo].[V_COUNT_TRAINEE]    Script Date: 2/21/2022 6:12:48 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO





CREATE   VIEW [dbo].[V_COUNT_TRAINEE] as 
	SELECT tc.course_no, tc.course_name_th, tc.course_name_en, tc.date_start, tc.date_end, tc.place, tr.last_status
	, COUNT(tr.emp_no) as count_emp
    FROM tr_course tc
    left join tr_course_registration tr on tc.course_no = tr.course_no
	group by tc.course_no, tc.course_name_th, tc.course_name_en, tc.date_start, tc.date_end, tc.place, tr.last_status
	
GO


