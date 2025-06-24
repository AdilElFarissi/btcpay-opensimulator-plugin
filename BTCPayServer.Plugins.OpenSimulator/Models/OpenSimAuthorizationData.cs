using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace BTCPayServer.Plugins.OpenSimulator.Models;

public class OpenSimAuthorizationData
{
    public string Id { get; set; }
    [Required]
    [FromHeader(Name = "x-opensim-store-id")]
    public string StoreId { get; set; }
    [Required]
    [FromHeader(Name = "x-secondlife-owner-name")]
    public string AvatarName { get; set; }
    [Required]
    [FromHeader(Name = "x-secondlife-owner-key")]
    public string AvatarId { get; set; }

    [Url]
    [Required]
    [FromHeader(Name = "x-opensim-owner-home-url")]
    public string AvatarHomeURL { get; set; }
    [Required]
    [FromHeader(Name = "x-secondlife-object-name")]
    public string ObjectName { get; set; }

    [Required]
    [FromHeader(Name = "x-secondlife-object-key")]
    public string ObjectId { get; set; }
    [Required]
    [FromHeader(Name = "x-secondlife-region")]
    public string ObjectRegion { get; set; }
    [Required]
    [FromHeader(Name = "x-secondlife-local-position")]
    public string ObjectLocation { get; set; }

    [Url]
    [Required]
    [FromHeader(Name = "x-opensim-object-host-url")]
    public string ObjectURL { get; set; }

    public bool ObjectAuthorization { get; set; }

    public string Task { get; set; }

    public DateTimeOffset Timestamp { get; set; }
    
}
