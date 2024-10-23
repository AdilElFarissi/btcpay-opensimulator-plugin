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
            _pullPaymentService = pullPaymentService;
            _currencyNameTable = currencyNameTable;
            _payoutHandlers = payoutHandlers;
            _linkGenerator = linkGenerator;
        }

        private readonly UIInvoiceController _InvoiceController;
        private readonly StoreRepository _StoreRepository;
        private readonly OpenSimulatorService _OpenSimulatorService;
        private readonly PullPaymentHostedService _pullPaymentService;
        private readonly CurrencyNameTable _currencyNameTable;
        private readonly IEnumerable<IPayoutHandler> _payoutHandlers;
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
                        RedirectURL = model.BrowserRedirect ?? store?.StoreWebsite,
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

            var url = GreenfieldInvoiceController.ToModel(invoice, _linkGenerator, HttpContext.Request).CheckoutLink;
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

        [HttpPost("opensim/withdrawals")]
        [IgnoreAntiforgeryToken]
        [EnableCors(CorsPolicies.All)]
        [RateLimitsFilter(ZoneLimits.PublicInvoices, Scope = RateLimitsScope.RemoteAddress)]
        public async Task<IActionResult> OpenSimWithdrawalHandle([FromHeader] OpenSimAuthorizationData obj, OpenSimulatorWithdrawalData request)
        {
            var store = await _StoreRepository.FindStore(obj.StoreId);
            if (store == null)
                return Json(new {
                    ospError = "Invalid store"
                });

            var a = await _OpenSimulatorService.isAuthorized(obj.StoreId, obj.AvatarId, obj.ObjectId, obj.AvatarHomeURL, obj.ObjectURL);
            if(a == null)
               return Json(new {
                    ospError = "This avatar or object is not authorized to create invoices in this store."
                }); 
            if (request is null)
            {
                return Json(new {
                    ospError = "Missing body"
                });
            }

            if (request.Amount <= 0.0m)
            {
                return Json(new {
                    ospError = "The amount should more than 0."
                });
            }
            if (request.Name is String name && name.Length > 50)
            {
                return Json(new {
                    ospError = "The name should be maximum 50 characters."
                });
            }
            if (request.Currency is String currency)
            {
                request.Currency = currency.ToUpperInvariant().Trim();
                if (_currencyNameTable.GetCurrencyData(request.Currency, false) is null)
                {
                    return Json(new {
                    ospError = "Invalid currency"
                    });
                }
            }
            else
            {
                return Json(new {
                    ospError = "Currency field is required"
                    });
            }
            PaymentMethodId[] paymentMethods = null;
            if (request.PaymentMethodId is { } paymentMethodsStr)
            {
                paymentMethods = paymentMethodsStr.Select(s =>
                {
                    PaymentMethodId.TryParse(s.ToString(), out var pmi);
                    return pmi;
                }).ToArray();
                var supported = (await _payoutHandlers.GetSupportedPaymentMethods(HttpContext.GetStoreData())).ToArray();
                for (int i = 0; i < paymentMethods.Length; i++)
                {
                    if (!supported.Contains(paymentMethods[i]))
                    {
                        return Json(new {
                            ospError = "Invalid or unsupported payment method"
                        });
                    }
                }
            }
            else
            {
                return Json(new {
                    ospError = "payment method field is required"
                });
            }
            
            var ppId = await _pullPaymentService.CreatePullPayment(new CreatePullPayment()
            {
                Name = request.Name,
                Description = request.Description,
                Amount = request.Amount,
                Currency = request.Currency,
                StoreId = obj.StoreId,
                PaymentMethodIds = paymentMethods,
                AutoApproveClaims = false
            });
            var pp = await _pullPaymentService.GetPullPayment(ppId, false);
            if (pp is null)
            {
                return Json(new {
                    ospError = "Failed to create a pull payment"
                });
            }
            var ppBlob = pp.GetBlob();
            var paymentMethodId = ppBlob.SupportedPaymentMethods[0];
            var payoutHandler = _payoutHandlers.FindPayoutHandler(paymentMethodId);
            if (payoutHandler is null)
            {
                return Json(new {
                    ospError = "Invalid payment method"
                });
            }
            var destination = await payoutHandler.ParseAndValidateClaimDestination(paymentMethodId, request!.Destination, ppBlob, CancellationToken.None);
            if (destination.destination is null)
            {
                return Json(new {
                    ospError = "The destination is invalid for the specified payment"
                });
            }
            var result = await _pullPaymentService.Claim(new ClaimRequest()
            {
                Destination = destination.destination,
                PullPaymentId = pp.Id,
                Value = request.Amount,
                PaymentMethodId = paymentMethodId
            });
            if (result is null)
            {
                return Json(new {
                    ospError = "Failed to create a payout"
                });
            }
            return Json(new {
                PullPaymentId = pp.Id,
                ViewLink = _linkGenerator.GetUriByAction(
                                nameof(UIPullPaymentController.ViewPullPayment),
                                "UIPullPayment",
                                new { pullPaymentId = pp.Id },
                                Request.Scheme,
                                Request.Host,
                                Request.PathBase)
            });
        }
    }
}
