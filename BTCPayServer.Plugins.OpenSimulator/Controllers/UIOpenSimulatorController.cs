using System.Threading.Tasks;
using BTCPayServer.Abstractions.Constants;
using BTCPayServer.Client;
using BTCPayServer.Data;
using BTCPayServer.Plugins.OpenSimulator.Models;
using BTCPayServer.Plugins.OpenSimulator.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace BTCPayServer.Plugins.OpenSimulator;

[Route("stores")]
    [Authorize(AuthenticationSchemes = AuthenticationSchemes.Cookie)]
    [Authorize(Policy = Policies.CanModifyStoreSettings, AuthenticationSchemes = AuthenticationSchemes.Cookie)]
    [AutoValidateAntiforgeryToken]
public class UIOpenSimulatorController : Controller
{
    private readonly OpenSimulatorService _OpenSimulatorService;

    public UIOpenSimulatorController(OpenSimulatorService OpenSimService)
    {
        _OpenSimulatorService = OpenSimService;
    }

    [HttpGet("{storeId}/plugins/opensim")]
    public async Task<IActionResult> Index()
    {
        var data = await _OpenSimulatorService.GetAuthorizations(HttpContext.GetCurrentStoreId());

        return View(new OpenSimulatorPageViewModel { 
            Data = data,
            StoreID = HttpContext.GetCurrentStoreId(),
            StoreDefaultPaymetMethod = HttpContext.GetStoreData().GetDefaultPaymentId()?.ToStringNormalized(),
            StoreDefaultCurrency = HttpContext.GetStoreData().GetStoreBlob().DefaultCurrency,
            ServerIP = HttpContext.Connection.LocalIpAddress.ToString()
            });
    }

    [HttpPost("{storeId}/plugins/opensim")]
    public async Task<IActionResult> AuthorizationsManager([FromForm] OpenSimAuthorizationFormData model)
    {
        if(string.IsNullOrEmpty(model.Id))
            ModelState.AddModelError("Store", "Missing Id parameter.");

        if(string.IsNullOrEmpty(model.StoreId) || HttpContext.GetCurrentStoreId() != model.StoreId)
            ModelState.AddModelError("Store", "Missing or invalid StoreId parameter.");
        
        if(string.IsNullOrEmpty(model.AvatarId))
            ModelState.AddModelError("Store", "Missing AvatarId parameter.");

        if(string.IsNullOrEmpty(model.ObjectId))
            ModelState.AddModelError("Store", "Missing ObjectId parameter.");
        
        if (string.IsNullOrEmpty(model.Task))
            ModelState.AddModelError("Store", "Missing Task parameter.");

        if (!ModelState.IsValid)
            return View();
    
        if(model.Task == "remove"){
            var a = await _OpenSimulatorService.RemoveObjectAuthorization(model);
            if(a > 0){
                return Json(new{
                    status = "removed",
                    statusDesc = "Authorization successfully removed."
                });
            }else{
                return Json(new{
                    status = "failed to remove",
                    statusDesc = "The removal of the authorization for object UUID : "+ model.ObjectId +" failed."
                    });
            }

        }else if(model.Task == "authorize"){
            var auth = await _OpenSimulatorService.AuthorizeObject(model);
            if(auth > 0){
                return Json(new{
                    status = "authorized",
                    statusDesc = "Authorization successfully done."
                });
            }else{
                return Json(new{
                    status = "failed to authorize",
                    statusDesc = "The authorization for object UUID : "+ model.ObjectId +" failed."
                    });
            }
        }
        return null;
    }
}

