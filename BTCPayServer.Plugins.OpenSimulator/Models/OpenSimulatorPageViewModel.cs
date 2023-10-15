using System.Collections.Generic;
using BTCPayServer.Plugins.OpenSimulator.Data;

namespace BTCPayServer.Plugins.OpenSimulator.Models;
public class OpenSimulatorPageViewModel
{
    public List<OpenSimulatorData> Data { get; set; }
    public string StoreID { get; set; }
    public string StoreDefaultPaymetMethod { get; set; }
    public string StoreDefaultCurrency { get; set; }
    public string ServerIP { get; set; }
}