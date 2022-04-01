USE [HRGIS]
GO

/****** Object:  View [dbo].[V_GETREGISTRATION]    Script Date: 2/21/2022 6:13:51 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO




CREATE   VIEW [dbo].[V_GETREGISTRATION] as 
	SELECT tc.course_no, tc.course_name_th, tc.course_name_en
	, tc.date_start
	, tc.date_end
	, left(tc.time_in,5) as time_in, left(tc.time_out,5) as time_out, tc.place, tbo.org_code, tbo.org_abb
	, te.id_card_no, te.emp_no
	, te.title_name_en
	, case when te.band = N'JP' then te.lastname_en else te.firstname_en end as firstname_en
	, case when te.band = N'JP' then te.firstname_en else te.lastname_en end as lastname_en
	, te.title_name_th
	, case when te.band = N'JP' then te.lastname_th else te.firstname_th end as firstname_th
	, case when te.band = N'JP' then te.firstname_th else te.lastname_th end as lastname_th
	, case when te.title_name_th = N'นาย' then te.title_name_th else null end as title_name_th_male
	, case when te.title_name_th <> N'นาย' then te.title_name_th else null end as title_name_th_female
	, te.band, te.position_name_en, te.dept_abb, te.div_abb, tr.last_status
	, tr.pre_test_score, tr.pre_test_grade, tr.post_test_score, tr.post_test_grade
	, tbt.full_trainer
	, case when fnd.DateDiffs > 3 then null else fnd.date_1 end as date_1
	, case when fnd.DateDiffs > 3 then null else fnd.date_2 end as date_2
	, case when fnd.DateDiffs > 3 then null else fnd.date_3 end as date_3
	, fnd.DateDiffs
	FROM tr_course tc
	left join tb_organization tbo on tc.org_code = tbo.org_code
	left join tr_course_registration tr on tc.course_no = tr.course_no
	left join tb_employee te on tr.emp_no = te.emp_no
	left join (
	SELECT course_no ,full_trainer = STUFF(
				 (
					SELECT ',' + tb.full_trainer from (
						select CASE WHEN trt.trainer_type = 'Internal' THEN te.title_name_en + te.firstname_en + ' ' + LEFT(te.lastname_en,1) + ' ('+ te.dept_abb +')' 
								ELSE trt.title_name_en + trt.firstname_en + ' ' + LEFT(trt.lastname_en,1) + '.' END AS full_trainer
						FROM tr_course]  tc
						left join tr_course_trainer tt on tc.course_no = tt.course_no
						left join tr_trainer trt on tt.trainer_no = trt.trainer_no
						left join tb_employee te on trt.emp_no = te.emp_no
						where tc.course_no = tb1.course_no
					) tb
				  FOR XML PATH (''))
				 , 1, 1, '') from tr_course_trainer tb1 group by course_no) tbt on tc.course_no = tbt.course_no
	CROSS APPLY FN_GETDATE(tc.date_start, tc.date_end) as fnd
	where (tr.last_status = 'Approved')
	
GO


