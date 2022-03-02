USE [HRGIS]
GO

/****** Object:  View [dbo].[V_SENDMAIL]    Script Date: 2/22/2022 5:31:01 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO








CREATE   VIEW [dbo].[V_SENDMAIL] as 
	SELECT tbs.emp_no, tbs.role, tbs.org_code
	, te.email, te.title_name_en
	, case when te.band = N'JP' then te.lastname_en else te.firstname_en end as firstname_en
	, case when te.band = N'JP' then te.firstname_en else te.lastname_en end as lastname_en
	, te.band, te.position_name_en, te.dept_abb, te.div_abb
	, case when te.band = N'JP' 
	 then te.title_name_en + te.lastname_en + ' ' + LEFT(te.firstname_en,1) + '. ('+ te.dept_abb +')' 
	 else te.title_name_en + te.firstname_en + ' ' + LEFT(te.lastname_en,1) + '. ('+ te.dept_abb +')'  end as fullname
	FROM [HRGIS].[dbo].[tr_stakeholder] tbs
	left join tb_employee te on tbs.emp_no = te.emp_no
GO


