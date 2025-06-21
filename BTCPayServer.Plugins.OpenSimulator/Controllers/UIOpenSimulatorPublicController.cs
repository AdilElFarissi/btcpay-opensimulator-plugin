using System;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using BTCPayServer.Abstractions.Extensions;
using BTCPayServer.Client.Models;
using BTCPayServer.Controllers;
using BTCPayServer.Controllers.Greenfield;
using BTCPayServer.Services.Invoices;
using BTCPayServer.Services.Stores;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using NicolasDorier.RateLimits;
using BTCPayServer.Plugins.OpenSimulator.Models;
using BTCPayServer.Plugins.OpenSimulator.Services;
using BTCPayServer.HostedServices;
using BTCPayServer.Services.Rates;
using System.Collections.Generic;
using BTCPayServer.Data;
using System.Linq;
using BTCPayServer.Payments;
using BTCPayServer.Payouts;

namespace BTCPayServer.Plugins.OpenSimulator.Controllers
{
    public class UIOpenSimulatorPublicController : Controller
    {
        public UIOpenSimulatorPublicController(UIInvoiceController invoiceController,
            StoreRepository storeRepository, OpenSimulatorService openSimService, PullPaymentHostedService pullPaymentService, CurrencyNameTable currencyNameTable, IEnumerable<IPayoutHandler> payoutHandlers, LinkGenerator linkGenerator)
        {
            _InvoiceController = invoiceController;
            _StoreRepository = storeRepository;
            _OpenSimulatorService = openSimService;
            _currencyNameTable = currencyNameTable;
            _linkGenerator = linkGenerator;
        }

        private readonly UIInvoiceController _InvoiceController;
        private readonly StoreRepository _StoreRepository;
        private readonly OpenSimulatorService _OpenSimulatorService;
        private readonly CurrencyNameTable _currencyNameTable;
        private readonly LinkGenerator _linkGenerator;


        [HttpPost]
        [Route("opensim/authorization")]
        [IgnoreAntiforgeryToken]
        [EnableCors(CorsPolicies.All)]
        
        public async Task<IActionResult> OpenSimHandle([FromForm(Name = "action")] string action, [FromHeader] OpenSimAuthorizationData obj ,CancellationToken cancellationToken)
        {
            var store = await _StoreRepository.FindStore(obj.StoreId);
            if (store == null)
                return Json(new {
                    ospError = "Invalid store"
                });

            if (obj == null || string.IsNullOrEmpty(obj.AvatarId) || !Request.Headers.ContainsKey("x-secondlife-shard"))
                return Json(new {
                    ospError = "This endpoint interact only with 3D objects from the OpenSimulator virtual worlds using LSL scripts."
                    });
            
            var count = await _OpenSimulatorService.GetPendingAuthorizationsCount(obj.StoreId, obj.AvatarId);
            if ( obj != null && count >= 3)
                return Json(new {
                    ospError = "Limits: You have already 3 objects waiting your authorization. Please, authorize or delete this 3 objects and retry."
                    });

            if (string.IsNullOrEmpty(action))
                return Json(new {
                    ospError = "Missing (action) parameter."
                    });
            
            switch(action){
                case "register":
                    try
                    {
                        var e = await _OpenSimulatorService.CheckIfExists(obj.StoreId, obj.AvatarId, obj.ObjectId);
                        if( e == null){
                            var registred = await _OpenSimulatorService.AddNewObjectAuthorization(obj);
                            e = await _OpenSimulatorService.CheckIfExists(obj.StoreId, obj.AvatarId, obj.ObjectId);
                            if(registred && e != null){
                                return Json(new {
                                    status = "success",
                                    authorized = e.ObjectAuthorization.ToString()
                                    });
                            } 
                            else {
                                return Json(new {
                                    status = "fail",
                                    authorized = "False"
                                    });
                            }
                        }
                        else {
                            return Json(new {
                                status = "registred",
                                authorized = e.ObjectAuthorization.ToString()
                                });
                        }
                    }
                    catch (ArgumentNullException e)
                    { 
                        return Json(new {
                            ospError = e.Message
                        });
                    }
                    catch (OperationCanceledException e)
                    { 
                        return Json(new {
                            ospError = e.Message
                        });
                    }

                case "check":
                    try
                    {
                        var o = await _OpenSimulatorService.CheckIfExists(obj.StoreId, obj.AvatarId, obj.ObjectId);
                        if(o != null && o.ObjectId != null){
                            return Json(new {
                                status = "registred",
                                authorized = o.ObjectAuthorization.ToString()
                            });
                        }
                        else {
                            return Json(new {
                                status = "unknown"
                            });
                        }
                    }
                    catch (ArgumentNullException e)
                    { 
                        return Json(new {
                            ospError = e.Message
                        });
                    }
                    catch (OperationCanceledException e)
                    { 
                        return Json(new {
                            ospError = e.Message
                        });
                    }

                default:
                    return Ok();
            } 
        }

        [HttpGet]
        [IgnoreAntiforgeryToken]
        [EnableCors(CorsPolicies.All)]
        [Route("opensim/invoices")]
        public async Task<IActionResult> OpenSimInvoiceHandle(OpenSimulatorInvoiceModel model)
        {
            return await OpenSimInvoiceHandle(model, null, CancellationToken.None);
        }

        [HttpPost]
        [Route("opensim/invoices")]
        [IgnoreAntiforgeryToken]
        [EnableCors(CorsPolicies.All)]
        [RateLimitsFilter(ZoneLimits.PublicInvoices, Scope = RateLimitsScope.RemoteAddress)]
        public async Task<IActionResult> OpenSimInvoiceHandle([FromForm] OpenSimulatorInvoiceModel model, [FromHeader] OpenSimAuthorizationData obj ,CancellationToken cancellationToken)
        {
            var store = await _StoreRepository.FindStore(model.StoreId);
            if (store == null)
                return Json(new {
                    ospError = "Invalid store"
                });

            var a = await _OpenSimulatorService.isAuthorized(obj.StoreId, obj.AvatarId, obj.ObjectId, obj.AvatarHomeURL, obj.ObjectURL);
            if(a == null)
               return Json(new {
                    ospError = "This avatar or object is not authorized to create invoices in this store."
                });

            if (model == null || (model.Price is decimal v ? v <= 0 : false))
                return Json(new {
                    ospError = "Price must be greater than 0"
                });

            if (model.PosData is not null && model.PosData.Length > 500 )
                return Json(new {
                    ospError = "PosData must be under 500 characters"
                });

            if (string.IsNullOrEmpty(model.ServerIpn))
                return Json(new {
                    ospError = "Missing LSL script endpoint URL"
                });
                
            if (string.IsNullOrEmpty(model.OrderId))
                return Json(new {
                    ospError = "Missing the Order ID"
                    });

            InvoiceEntity invoice = null;
            try
            {
                invoice = await _InvoiceController.CreateInvoiceCoreRaw(new CreateInvoiceRequest()
                {
                    Amount = model.Price,
                    Currency = model.Currency,
                    Metadata = new InvoiceMetadata()
                    {
                        ItemDesc = model.CheckoutDesc,
                        OrderId = model.OrderId,
                        PosDataLegacy = model.PosData
                    }.ToJObject(),
                    Checkout = new ()
                    {
                        RedirectURL = model.BrowserRedirect
                        ?? store?.StoreWebsite,
                        DefaultPaymentMethod = model.DefaultPaymentMethod
                    }
                }, store, HttpContext.Request.GetAbsoluteRoot(),
                entityManipulator: (entity) =>
                {
                    entity.NotificationEmail = model.NotifyEmail;
                    entity.NotificationURLTemplate = model.ServerIpn;
                    entity.FullNotifications = true;
                },
                cancellationToken: cancellationToken);
            
            }
            catch (BitpayHttpException e)
            {
                return Json(new{
                        ospError = e.Message
                    });
            }

            var url = GreenfieldInvoiceController.ToModel(invoice, _linkGenerator, _currencyNameTable, HttpContext.Request).CheckoutLink;
            if (!string.IsNullOrEmpty(model.CheckoutQueryString))
            {
                var additionalParamValues = HttpUtility.ParseQueryString(model.CheckoutQueryString);
                var uriBuilder = new UriBuilder(url);
                var paramValues = HttpUtility.ParseQueryString(uriBuilder.Query);
                paramValues.Add(additionalParamValues);
                uriBuilder.Query = paramValues.ToString()!;
                url = uriBuilder.Uri.AbsoluteUri;
            }

            return Json(new
                {
                    InvoiceId = invoice.Id,
                    InvoiceUrl = url
                });
        }
    }
}
