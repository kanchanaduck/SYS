export class Settings {
    public static IMG_GAROON: string = 'http://cptsvs522/cbgrn/grn/image/customimg/emp_pic/';
    public static REPORT_URL: string = 'http://cptsvs527/HRGIS-REPORT/';
    public static status: any =  {
      wait: "Wait",
      approved: "Approved",
      center_app: "Center approved"
    }
    public static role: any =  {
      committee: "COMMITTEE",
      approver: "APPROVER",
      center: "CENTER"
    }
    public static level: any =  {
      department: "department",
      division: "division"
    }
    public static text: any =  {
      all: "All",
      committee_only: "Can only be used by committee.", // ใช้งานได้แค่ committee
      delete: "Delete data success.", // เมื่อกดลบข้อมูลสำเร็จ
      duplication: "Data is already exists.", // เมื่อมีข้อมูลซ้ำ
      invalid_department: "Please select staff in your own organization.", // เมื่อพนักงานคนนั้นไม่ได้อยู่ใน orgnization เดียวกับ committee
      invalid_course: "Course no in your own organization.", // เมื่อ course no ไม่ได้อยู่ในแผนกของคุณ
      not_found: "Data not found.", // เมื่อค้นหาข้อมูลไม่พบ
      not_sendmail: "No data, can't send e-mail.", // ไม่พบข้อมูล ไม่สามารถส่งเมล์ได้
      success: "Update data success.", // เมื่อกดบันทึกข้อมูลสำเร็จ
      score_incorrect: "Score should be between 0 and 100.", // เมื่อกรอกคะแนนไม่ได้อยู่ในช่วง 0-100
      unequal_band: "This band is not allowed.",  // เมื่อพนักงานคนนั้นไม่ได้อยู่ใน band ของการตั้งค่า course
      wait: "Wait"
    }
    public static headers: any = {
      headers: {
        Authorization: 'Bearer ' + sessionStorage.getItem('token_hrgis'),
        'Content-Type': 'application/json'
      },
    }
}