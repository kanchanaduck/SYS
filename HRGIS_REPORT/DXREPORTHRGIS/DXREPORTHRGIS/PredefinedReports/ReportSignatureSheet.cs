using System;
using DevExpress.XtraPrinting;
using DevExpress.XtraPrinting.Drawing;
using DevExpress.XtraReports.UI;

namespace DXREPORTHRGIS.PredefinedReports
{
    public partial class ReportSignatureSheet
    {
        public ReportSignatureSheet()
        {
            InitializeComponent();
        }

        private void pictureBox1_BeforePrint(object sender, System.Drawing.Printing.PrintEventArgs e)
        {
            pictureBox1.ImageSource = ImageSource.FromFile("wwwroot\\image\\canon-logo.png");
        }

    }
}
