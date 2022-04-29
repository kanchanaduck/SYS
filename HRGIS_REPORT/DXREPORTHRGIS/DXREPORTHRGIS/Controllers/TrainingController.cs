using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DevExpress.AspNetCore.Reporting.QueryBuilder;
using DevExpress.AspNetCore.Reporting.QueryBuilder.Native.Services;
using DevExpress.AspNetCore.Reporting.ReportDesigner;
using DevExpress.AspNetCore.Reporting.ReportDesigner.Native.Services;
using DevExpress.AspNetCore.Reporting.WebDocumentViewer;
using DevExpress.AspNetCore.Reporting.WebDocumentViewer.Native.Services;
using Microsoft.AspNetCore.Mvc;

namespace DXREPORTHRGIS.Controllers
{
    public class CustomWebDocumentViewerController : WebDocumentViewerController
    {
        public CustomWebDocumentViewerController(IWebDocumentViewerMvcControllerService controllerService) : base(controllerService)
        {
        }
    }

    public class CustomReportDesignerController : ReportDesignerController
    {
        public CustomReportDesignerController(IReportDesignerMvcControllerService controllerService) : base(controllerService)
        {
        }
    }

    public class CustomQueryBuilderController : QueryBuilderController
    {
        public CustomQueryBuilderController(IQueryBuilderMvcControllerService controllerService) : base(controllerService)
        {
        }
    }
    public class TrainingController : Controller
    {
        public IActionResult SignatureSheet()
        {
            return View();
        }
        public IActionResult ConfirmationSheet()
        {
            return View();
        }
        public IActionResult Training()
        {
            return View();
        }
        public IActionResult Stakeholder()
        {
            return View();
        }

        public IActionResult Courses()
        {
            return View();
        }
        public IActionResult TrainerHistory()
        {
            return View();
        }
        public IActionResult CourseMap()
        {
            return View();
        }
        public IActionResult EmployeeTraining()
        {
            return View();
        }
        public IActionResult CourseTarget()
        {
            return View();
        }
        public IActionResult CourseCountTrainee()
        {
            return View();
        }
    }
}
