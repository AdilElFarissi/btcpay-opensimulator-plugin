using BTCPayServer.Payments;

namespace BTCPayServer.Plugins.OpenSimulator.Models;
public class OpenSimulatorWithdrawalData
    {
        public string StoreId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public PaymentMethodId[] PaymentMethodId { get; set; }
        public string Destination { get; set; }
    }