using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace BTCPayServer.Plugins.OpenSimulator.Data;

public class OpenSimulatorData
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public string Id { get; set; }
    public string StoreId { get; set; }
    public string AvatarName { get; set; }
    public string AvatarId { get; set; }
    [Url]
    public string AvatarHomeURL { get; set; }
    public string ObjectName { get; set; }
    public string ObjectId { get; set; }
    public string ObjectRegion { get; set; }
    public string ObjectLocation { get; set; }
    [Url]
    public string ObjectURL { get; set; }
    public bool ObjectAuthorization { get; set; }
    
    public DateTimeOffset Timestamp { get; set; }

    public string Secret { get; set; }

}
