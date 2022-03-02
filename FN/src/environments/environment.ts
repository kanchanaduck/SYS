// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  API_URL: 'https://localhost:5001/api/',
  img_garoon: 'http://cptsvs522/cbgrn/grn/image/customimg/emp_pic/',
  status: {
    wait: "Wait",
    approved: "Approved",
    center_app: "Center approved"
  },
  role: {
    committee: "COMMITTEE",
    approver: "APPROVER",
    center: "CENTER"
  },
  level: {
    department: "department",
    division: "division"
  },
  call: "8005",
  text: {
    all: "All",
    delete: "Delete data success.", // เมื่อกดลบข้อมูลสำเร็จ
    duplication: "Data is already exists", // เมื่อมีข้อมูลซ้ำ
    invalid_department: "Please select staff in your own organization.", // เมื่อพนักงานคนนั้นไม่ได้อยู่ใน orgnization เดียวกับ committee
    not_found: "Data not found.", // เมื่อค้นหาข้อมูลไม่พบ
    success: "Update data success.", // เมื่อกดบันทึกข้อมูลสำเร็จ
    score_incorrect: "Score should be between 0 and 100", // เมื่อกรอกคะแนนไม่ได้อยู่ในช่วง 0-100
    unequal_band: "This band is not allowed.",  // เมื่อพนักงานคนนั้นไม่ได้อยู่ใน band ของการตั้งค่า course
    wait: "Wait"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

// ng build --baseHref=/HRGIS_TEST/
// ng build --prod --base-href=/HRGIS_TEST/
// npm uninstall

// API_URL: 'https://localhost:5001/api/',
// API_URL: 'http://cptsvs531:5000/api-hrgis/api/',