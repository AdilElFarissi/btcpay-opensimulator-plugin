using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace BTCPayServer.Plugins.OpenSimulator.Models;

public class OpenSimAuthorizationFormData
{

    public string Id { get; set; }

    public string StoreId { get; set; }

    public string AvatarId { get; set; }

    public string ObjectId { get; set; }

    public bool ObjectAuthorization { get; set; }

    public DateTimeOffset Timestamp { get; set; }

    public string Secret { get; set; }

     public string Task { get; set; }
    
}
