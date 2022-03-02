USE [HRGIS]
GO

/****** Object:  View [dbo].[V_CHART_CENTER]    Script Date: 2/28/2022 10:19:18 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO








ALTER   VIEW [dbo].[V_CHART_CENTER] as 
	SELECT left(course_no, 7) as course_no, tcr.emp_no, te.dept_code, te.dept_abb,(SELECT COUNT(tb.emp_no)
	FROM (SELECT tcr.emp_no FROM [HRGIS].[dbo].[tr_course_registration] tcr
	left join tb_employee tr on tcr.emp_no = tr.emp_no
	where YEAR(register_at) = YEAR(GETDATE())
	and (last_status = 'Center approved' or (last_status = 'Continuous')) and tr.dept_abb = te.dept_abb GROUP BY left(course_no, 7),tcr.emp_no) as tb) as total
	FROM [HRGIS].[dbo].[tr_course_registration] tcr
	left join tb_employee te on tcr.emp_no = te.emp_no
	where YEAR(register_at) = YEAR(GETDATE())
	and (last_status = 'Center approved' or (last_status = 'Continuous'))
	GROUP BY left(course_no, 7),tcr.emp_no, te.dept_code, te.dept_abb
	
GO


