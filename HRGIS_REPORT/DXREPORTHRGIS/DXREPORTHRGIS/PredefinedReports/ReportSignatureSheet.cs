using System;
using System.Globalization;
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

        private void label16_BeforePrint(object sender, System.Drawing.Printing.PrintEventArgs e)
        {
            DateTime sets =  DateTime.ParseExact(GetCurrentColumnValue("date_start").ToString(), "dd-MMM-yyyy", CultureInfo.InvariantCulture);
            label16.Text = sets.ToString().ToUpper();
        }

        //private void pictureBox1_BeforePrint(object sender, System.Drawing.Printing.PrintEventArgs e)
        //{
        //    pictureBox1.ImageSource = ImageSource.FromFile("wwwroot\\image\\canon-logo.png");
        //}


    }
}
