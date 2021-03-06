USE [HRGIS]
GO

/****** Object:  StoredProcedure [dbo].[update_employee]    Script Date: 5/6/2022 4:49:52 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE [dbo].[update_employee]
	
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	MERGE tb_employee AS Target
    USING tb_employee_temp AS Source
    ON Source.emp_no = Target.emp_no
    
    -- For Inserts
    WHEN NOT MATCHED THEN
        INSERT ([emp_no]
           ,[old_emp_no]
           ,[title_name_en]
           ,[firstname_en]
           ,[lastname_en]
           ,[title_name_th]
           ,[firstname_th]
           ,[lastname_th]
           ,[sex_en]
           ,[sex_th]
           ,[center_code]
           ,[center_name]
           ,[div_code]
           ,[div_abb]
           ,[div_name]
           ,[dept_code]
           ,[dept_abb]
           ,[dept_name]
           ,[wc_code]
           ,[wc_abb]
           ,[wc_name]
           ,[band]
           ,[position_code]
           ,[position_name_en]
           ,[position_name_th]
           ,[entrance_date]
           ,[probation_date]
           ,[resign_date]
		   ,[employed_status]
           ,[birthday]
           ,[id_card_no]
           ,[rfid_no]
           ,[email]
           ,[email_active_date]
           ,[email_active]
		   ) 
        VALUES (
			Source.emp_no,
			Source.old_emp_no,
			Source.title_name_en,
			Source.firstname_en,
			Source.lastname_en,
			Source.title_name_th,
			Source.firstname_th,
			Source.lastname_th,
			Source.sex_en,
			Source.sex_th,
			Source.center_code,
			Source.center_name,
			Source.div_code,
			Source.div_abb,
			Source.div_name,
			Source.dept_code,
			Source.dept_abb,
			Source.dept_name,
			Source.wc_code,
			Source.wc_abb,
			Source.wc_name,
			Source.band,
			Source.position_code,
			Source.position_name_en,
			Source.position_name_th,
			Source.entrance_date,
			Source.probation_date,
			Source.resign_date,
			Source.employed_status,
			Source.birthday,
			Source.id_card_no,
			Source.rfid_no,
			Source.email,
			Source.email_active_date,
			Source.email_active
		)
    
    -- For Updates
    WHEN MATCHED THEN UPDATE SET
        Target.emp_no = Source.emp_no,
		Target.old_emp_no = Source.old_emp_no, 
		Target.title_name_en = Source.title_name_en,
		Target.firstname_en = Source.firstname_en,
		Target.lastname_en = Source.lastname_en,
		Target.title_name_th = Source.title_name_th,
		Target.firstname_th = Source.firstname_th,
		Target.lastname_th = Source.lastname_th,
		Target.sex_en = Source.sex_en,
		Target.sex_th = Source.sex_th,
		Target.center_code = Source.center_code,
		Target.center_name = Source.center_name,
		Target.div_code = Source.div_code,
		Target.div_abb = Source.div_abb,
		Target.div_name = Source.div_name,
		Target.dept_code = Source.dept_code,
		Target.dept_abb = Source.dept_abb,
		Target.dept_name = Source.dept_name,
		Target.wc_code = Source.wc_code,
		Target.wc_abb = Source.wc_abb,
		Target.wc_name = Source.wc_name,
		Target.band = Source.band,
		Target.position_code = Source.position_code,
		Target.position_name_en = Source.position_name_en,
		Target.position_name_th = Source.position_name_th,
		Target.entrance_date = Source.entrance_date,
		Target.probation_date = Source.probation_date,
		Target.resign_date = Source.resign_date,
		Target.employed_status = Source.employed_status,
		Target.birthday = Source.birthday,
		Target.id_card_no = Source.id_card_no,
		Target.rfid_no = Source.rfid_no,
		Target.email = Source.email,
		Target.email_active_date = Source.email_active_date,
		Target.email_active = Source.email_active;

	--delete from tb_employee where emp_no in (select old_emp_no from tb_employee_temp);


	--INSERT INTO [dbo].[tb_hrms]
 --          ([desciption]
 --          ,[updated_by]
 --          ,[updated_at])
 --    VALUES
 --          ('UPDATE EMPLOYEE'
 --          ,'HRGIS'
 --          ,GETDATE());

END
GO


