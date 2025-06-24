using System.ComponentModel.DataAnnotations;
using BTCPayServer.ModelBinders;
using BTCPayServer.Models.StoreViewModels;
using BTCPayServer.Validation;
using Microsoft.AspNetCore.Mvc;

namespace BTCPayServer.Plugins.OpenSimulator.Models
{
    public class OpenSimulatorInvoiceModel
    {
        [ModelBinder(BinderType = typeof(InvariantDecimalModelBinder))]
        public decimal? Price { get; set; }
        [Required]
        public string Currency { get; set; }
        public string DefaultPaymentMethod { get; set; }
        public PaymentMethodOptionViewModel.Format[] PaymentMethods { get; set; }
        public string CheckoutDesc { get; set; }
        public string OrderId { get; set; }
        [Url]
        public string ServerIpn { get; set; }
        [Url]
        public string BrowserRedirect { get; set; }
        [MailboxAddress]
        public string NotifyEmail { get; set; }

        public string StoreId { get; set; }

        public string CheckoutQueryString { get; set; }

        public string PosData { get; set; }

    }
}
