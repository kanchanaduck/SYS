USE [HRGIS]
GO

/****** Object:  View [dbo].[V_COUNT_ATTENDEE]    Script Date: 2/21/2022 6:12:18 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO






CREATE   VIEW [dbo].[V_COUNT_ATTENDEE] as 
	SELECT tc.course_no, tc.course_name_th, tc.course_name_en, tc.date_start, tc.date_end, tc.place
    , tr.emp_no, tr.pre_test_score, tr.pre_test_grade, tr.post_test_score, tr.post_test_grade, tr.last_status
    , te.title_name_en
    , case when te.band = 'JP' then te.lastname_en else te.firstname_en end as firstname_en
    , case when te.band = 'JP' then te.firstname_en else te.lastname_en end as lastname_en
    , te.title_name_th
    , case when te.band = 'JP' then te.lastname_th else te.firstname_th end as firstname_th
    , case when te.band = 'JP' then te.firstname_th else te.lastname_th end as lastname_th
    , te.band, te.position_name_en, te.dept_abb, te.div_abb
    FROM tr_course tc
    left join tr_course_registration tr on tc.course_no = tr.course_no
    left join tb_employee te on tr.emp_no = te.emp_no
	
GO


