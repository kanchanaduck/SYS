using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace DXREPORTHRGIS.Controllers
{
    public class ReportController : Controller
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

        public IActionResult XtraReport1()
        {
            return View();
        }
    }
}
