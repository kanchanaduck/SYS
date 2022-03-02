USE [HRGIS]
GO
/****** Object:  StoredProcedure [dbo].[course_map_temp]    Script Date: 2/25/2022 8:58:48 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[course_map] 
 @div_code nvarchar(5), @dept_code nvarchar(5), @employed_status nvarchar(20)
AS
BEGIN
DECLARE @cols AS NVARCHAR(MAX),
    @query  AS NVARCHAR(MAX),
	@employed_status_sql AS NVARCHAR(MAX);

	PRINT(@div_code)
	PRINT(@dept_code)

	IF (@employed_status='Employed')
		BEGIN
			set @employed_status_sql = 'AND (e.resign_date IS null OR e.resign_date >= GETDATE())'
		END
	ELSE IF (@employed_status='Resigned')
		BEGIN
			set @employed_status_sql = 'AND e.resign_date < GETDATE()'
		END
	ELSE
		BEGIN
			set @employed_status_sql = ''
		END
	PRINT(@employed_status_sql)

select @cols = STUFF((SELECT ',' + QUOTENAME(master_course_no)
                    from 
					(
						select SUBSTRING(r.course_no,0,8) as master_course_no
						,r.emp_no as emp_no, 1 as count_
						from tr_course_registration r
						inner join tb_employee e
						on r.emp_no=e.emp_no
					) t1
					group by master_course_no

            FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)') 
        ,1,1,'');

set @query = 'SELECT emp_no
				,title_name_en
				,firstname_en
				,lastname_en
				,div_abb
				,dept_abb
				,position_name_en
				,band
				, employed_status,
				' + @cols + '
from 
             (
			    select emp_no
				,title_name_en
				,firstname_en
				,lastname_en
				,div_abb
				,dept_abb
				,position_name_en
				,band
				,master_course_no
				,employed_status
				, count_ from
				(
					select SUBSTRING(r.course_no,0,8) as master_course_no
					,r.emp_no
					,e.title_name_en
					,e.firstname_en
					,e.lastname_en
					,e.div_abb
					,e.dept_abb
					,e.position_name_en
					,e.band
					,IIF((e.resign_date IS null OR e.resign_date >= GETDATE()),''Employed'',''Resigned'') as employed_status
					, 1 as count_
					from tr_course_registration r
					inner join tb_employee e
					on r.emp_no=e.emp_no
					where 1=1 '+@employed_status_sql+'
					AND (e.div_code='''+@div_code+''' or e.dept_code='''+@dept_code+''')
				) t1
            ) aaa
            pivot 
            (
                sum(count_)
                for master_course_no in (' + @cols + ')
            ) p ';



			print(@query);
			execute(@query);
END
