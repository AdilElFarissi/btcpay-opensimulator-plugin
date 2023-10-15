

$("#SectionNav .nav .nav-link").on("click", function(e){
    if($(this).attr("id") != "SectionNav-Index"){
        e.preventDefault();
        $("#SectionNav .nav .nav-link").removeClass("active");
        $(".osPage").hide();
        $(this).addClass("active");
        $("#"+ $(this).attr("id") +"Page").show();
    }
});

function getItemHtml(item, action){
    var actionBadges = '';
    var authorizationHtml = '';
    var vData = item.ObjectLocation.replace("(","").replace(")","").split(",");
    var vector2Path = parseInt(vData[0]) +"/"+ parseInt(vData[1]) +"/"+ parseInt(vData[2]);
    var teleportLink = "hop://" + item.ObjectURL.replace("http://","").replace("https://","")+ "/" + encodeURI(item.ObjectRegion.split("(")[0].trim()) +"/"+ vector2Path +"/teleport";    
    var dataSet = 'data-id="'+ item.Id +'" data-storeId="'+ StoreId +'" data-avatarId="'+ item.AvatarId +'" data-objectId="'+ item.ObjectId +'" data-objectname="'+ item.ObjectName +'"';
    if(action == "Remove"){
        actionBadges = '<td style="text-align:right;"><a href="'+ teleportLink +'" target="_blank"><span class="badge badge-settled">Teleport</span></a><button type="submit" class="badge badge-invalid formSubmit" '+ dataSet +' data-task="remove">Remove</button><a class="badge badge-info showDetails" data-bs-toggle="collapse" aria-expanded="false" href="#details_'+ item.Id +'" data-details="details_'+ item.Id +'" style="width:22px;margin-right:0;"><i class="fa fa-info"></i></a></td>';
    }else if(action == "Authorize"){
        actionBadges = '<td style="text-align:right;"><button type="submit" class="badge badge-invalid formSubmit" '+ dataSet +' data-task="remove">Remove</button><button type="submit" class="badge badge-processing formSubmit" '+ dataSet +' data-task="authorize">Authorize</button><a class="badge badge-info showDetails" data-bs-toggle="collapse" aria-expanded="false" href="#details_'+ item.Id +'" data-details="details_'+ item.Id +'" style="width:22px;margin-right:0;"><i class="fa fa-info"></i></a></td>';
    }
    authorizationHtml += '<tr id="'+ item.Id +'">';
    authorizationHtml += '<td style="width: 180px;">'+ item.AvatarName +'</td>'; 
    authorizationHtml += '<td style="width: 180px;">'+ item.ObjectName +'</td>';
    authorizationHtml += '<td><a href="'+teleportLink+'" target="_blank">'+ item.ObjectRegion.split("(")[0].trim() +' @ '+ vector2Path +'</a></td>';
    authorizationHtml += actionBadges;
    authorizationHtml += '</tr>';
    authorizationHtml += '<tr id="details_'+ item.Id +'" class="objectDetails collapse">';
    authorizationHtml += '<td colspan="4" style="padding:2px 10px;font-size:0.92em;"><div style="margin-top:-25px;">';
    authorizationHtml += '<table class="table table-hover mb-0">';    
    authorizationHtml += '<tbody style="background-color:rgba(255, 255, 255, 0.1);">';
    authorizationHtml += '<tr><td style="width:150px;">Avatar UUID :</td><td>'+ item.AvatarId +'</td><td style="width:150px;">Object UUID :</td><td>'+ item.ObjectId +'</td></tr>';
    authorizationHtml += '<tr><td style="width:150px;">Avatar Home URL :</td><td>'+ item.AvatarHomeURL +'</td><td style="width:150px;">Object Origin URL :</td><td>'+ item.ObjectURL +'</td></tr>';
    authorizationHtml += '<tr><td style="width:150px;">'+ (item.ObjectAuthorization ? "Authorization" : "Request") +' Date :</td><td>'+ item.Timestamp.split("T")[0] +' @ '+ item.Timestamp.split("T")[1].split(".")[0] +'</td><td style="width:150px;">Status :</td><td>'+ (item.ObjectAuthorization ? "Authorized." : "Waiting authorization.") +'</td></tr>';
    authorizationHtml += '</tbody>';
    authorizationHtml += '</table>'; 
    authorizationHtml += '</div></td>';          
    authorizationHtml += '</tr>';
    return authorizationHtml;
}

function LoadAutorizations(){     
    if(osModel.length == 0){
        $("#authorizedObjects tbody, #pendingAutorizations tbody").html('<tr><td>No data to display.</td></tr>');
    }else{
        var pendingAutorizationsHtml = '';
        var authorizedObjectsHtml = '';
    
        osModel.forEach(item => {
            if(item.ObjectAuthorization){
                authorizedObjectsHtml += getItemHtml(item, "Remove");
            }
            else{
                pendingAutorizationsHtml += getItemHtml(item, "Authorize");
            }
        });

        if(authorizedObjectsHtml == ""){
            $("#authorizedObjects tbody").html('<tr><td>No data to display.</td></tr>');
        }else{
            $("#authorizedObjects tbody").html(authorizedObjectsHtml);
        }
        if(pendingAutorizationsHtml == ""){
            $("#pendingAutorizations tbody").html('<tr><td>No data to display.</td></tr>');
        }else{
            $("#pendingAutorizations tbody").html(pendingAutorizationsHtml);
        }
    }
}
LoadAutorizations();


$(".showDetails").on("click", function(){
    $(".objectDetails").removeClass("show");
    !$(this).attr("aria-expanded") ? $("#"+ $(this).attr("data-details")).addClass("show") : $(".objectDetails").removeClass("show");
});

var form;
$(".formSubmit").on("click", function(e){
    e.preventDefault();
    $("#itemId").val(e.target.dataset.id);
    $("#itemAvatarId").val(e.target.dataset.avatarid);
    $("#itemObjectId").val(e.target.dataset.objectid);
    $("#itemTask").val(e.target.dataset.task);
    var authorizationModalHtml = "";
    authorizationModalHtml += "Do you want to " + e.target.dataset.task +" this object ?<br>";
    authorizationModalHtml += "<table class='table' style='border:none;'>";
    authorizationModalHtml += "<tr style='border:none;'><td style='width:180px;border:none;'>Object Name :</td><td style='border:none;'>"+ e.target.dataset.objectname +"</td></tr>";
    authorizationModalHtml += "<tr><td style='width:180px;'>Object UUID :</td><td>"+ e.target.dataset.objectid +"</td></tr>";
    authorizationModalHtml += "</table>";
    $("#authorizationModal-modal-body").html(authorizationModalHtml);
    $("#authorizationModalBtn").removeClass("badge-processing").removeClass("badge-invalid").addClass(e.target.dataset.task == "remove" ? "badge-invalid" : "badge-processing").html(e.target.dataset.task == "remove" ? "Remove" : "Authorize");
    form = new FormData(e.target.form);
    $("#authorizationModal").modal("show");
    
});

var reload = false;
$("#authorizationModalBtn").on("click", () =>{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            reload = true;
            $("#authorizationModalBtn").hide();
            $(".cancelOrClose").html("Close");
            $("#authorizationModal-modal-body").html(JSON.parse(this.responseText).statusDesc);
        }
    };
    xhttp.open('POST', window.location.href, true);
    xhttp.send(form);
});

$("#authorizationModal").on("hide.bs.modal", () =>{
    if(reload){
    window.location.reload();
    }
});

$("#scriptsNav li").on("click", function(e){
    if($(this).attr("id") != "SectionNav-Index"){
        e.preventDefault();
        $("#scriptsNav li").removeClass("bg-yellow");
        $(".osScriptBox").hide();
        $(this).addClass("bg-yellow");
        $("#"+ $(this).attr("id") +"Box").show();
    }
});

function updateTipjarScript (){
    var tipjarHtml = '';
    tipjarHtml += '/* BTCPay Server Crypto Tip-jar Script for OpenSimulator Plugin v0.1.1.\n\n';
    
    tipjarHtml += 'THIS SCRIPT IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n';
    tipjarHtml += 'IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, \n';
    tipjarHtml += 'FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n';
    tipjarHtml += 'AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n';
    tipjarHtml += 'LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n';
    tipjarHtml += 'OUT OF OR IN CONNECTION WITH THE SCRIPT OR THE USE OR OTHER DEALINGS IN THE SCRIPT.\n\n';
    
    tipjarHtml += 'By Adil El Farissi (aka: Web Rain inOSG) Under the same license as BTCPay. */\n\n';
    
    tipjarHtml += '/* Change the following to your BTCPay server instance URL and storeID. */\n';
    tipjarHtml += 'string BTCPayServerURL = "'+ window.location.origin +'";\n';
    tipjarHtml += 'string storeID = "'+ StoreId +'";\n\n';
    tipjarHtml += '/* Set your BTCPay server\'s IP address.\n(Accept the incoming notifications only from this IP) */\n';
    tipjarHtml += 'string allowedHttpInIP = "'+ IP +'";\n\n';
    
    tipjarHtml += '/* The cryptocurrency code (ticker) of the crypto that you want to recive as \n';
    tipjarHtml += 'payment. This value depend on your BTCPay server settings and Altcoins support...\n';
    tipjarHtml += 'Default is Bitcoin "BTC", If your BTCPay instance support Litecoin \n';
    tipjarHtml += 'Dogecoin and Monero you can set "LTC" or "DOGE" or "XMR"... (Cryptos only here!) */\n';
    tipjarHtml += 'string defaultPaymentMethod = "'+ $("#tjDefaultPaymentMethod").val().trim().toUpperCase() +'";\n\n';
    
    tipjarHtml += '/* If you want to recive notifications by Email, set it here or leave empty. */\n';
    tipjarHtml += 'string notificationEmail = "'+ $("#tjNotificationEmail").val().trim() +'";\n\n';
    
    tipjarHtml += '/* If you want to redirect your user to a webpage after a payment, set an URL \n';
    tipjarHtml += 'here or leave empty. You can add here some GET parameters to pass data to the \n';
    tipjarHtml += 'destination... eg, avatar name or UUID... */\n';
    tipjarHtml += 'string redirectURL = "'+ $("#tjRedirectURL").val().trim() +'";\n\n';
    
    tipjarHtml += '/* Advanced Options: Specify additional query string parameters that should be\n';
    tipjarHtml += 'appended to the checkout page once the invoice is created. For example,lang=da-DK \n';
    tipjarHtml += 'would load the checkout page in Danish by default. */\n';
    tipjarHtml += 'string checkoutQueryString = "'+ $("#tjCheckoutQueryString").val().trim() +'";\n\n';
    
    tipjarHtml += '/* If set to TRUE will inform you if you when you recive donations in the chat. */\n';
    tipjarHtml += 'integer notifications = '+ $("#tjChatNotification").val() +';\n\n';
    
    tipjarHtml += '/*** The following don\'t need change ***/\n';
    tipjarHtml += 'key authorizationRequest_id = NULL_KEY;\n';
    tipjarHtml += 'key IPNEndpointRequest_id = NULL_KEY;\n';
    tipjarHtml += 'key requestInvoice_id = NULL_KEY;\n';
    tipjarHtml += 'key requestRates_id = NULL_KEY;\n';
    tipjarHtml += 'string IPNEndpointURL = "";\n';
    tipjarHtml += 'string orderID = ""; \n';
    tipjarHtml += 'string currency = "";\n';
    tipjarHtml += 'string price = "0";\n';
    tipjarHtml += 'key avatar = NULL_KEY;\n';
    tipjarHtml += 'integer active = FALSE;\n';
    tipjarHtml += 'string invoiceID = "";\n';
    tipjarHtml += 'string invoiceURL = "";\n';
    tipjarHtml += 'integer channel;\n';
    tipjarHtml += 'integer CListener;\n';
    tipjarHtml += 'integer isWaitingAmount = FALSE;\n';
    tipjarHtml += 'integer isOutOfService = FALSE;\n';
    tipjarHtml += 'string txStatus = "";\n';
    tipjarHtml += 'string errorLog = "";\n';
    tipjarHtml += 'integer isAuthorized = FALSE;\n';
    tipjarHtml += 'integer isStartupChek = TRUE;\n';
    tipjarHtml += 'integer monitorCount = 0;\n';
    tipjarHtml += 'string emptyJson = llJsonGetValue("{}",["-"]);\n\n';

    tipjarHtml += 'reset(){\n';
    tipjarHtml += '    requestInvoice_id = NULL_KEY;\n';
    tipjarHtml += '    requestRates_id = NULL_KEY;\n';
    tipjarHtml += '    IPNEndpointRequest_id = NULL_KEY;\n';
    tipjarHtml += '    currency = "";\n';
    tipjarHtml += '    price = "0";\n';
    tipjarHtml += '    orderID = ""; \n';
    tipjarHtml += '    avatar = NULL_KEY;\n';
    tipjarHtml += '    active = FALSE;\n';
    tipjarHtml += '    invoiceID = "";\n';
    tipjarHtml += '    invoiceURL = "";\n';
    tipjarHtml += '    llReleaseURL(IPNEndpointURL);\n';
    tipjarHtml += '    IPNEndpointURL = "";\n';
    tipjarHtml += '    llListenRemove(CListener);\n';
    tipjarHtml += '    isWaitingAmount = FALSE;\n';
    tipjarHtml += '    txStatus = "";\n';
    tipjarHtml += '    llSetTimerEvent(0);\n';
    tipjarHtml += '    monitorCount = 0;\n';
    tipjarHtml += '    if (!isOutOfService){\n';
    tipjarHtml += '       llSetText(osKey2Name(llGetOwner()) + "\'s Crypto Tip-Jar\\nPowered By BTCPay Server\\n>>> Click To Donate <<<",<1,1,0>, 1.0);\n';
    tipjarHtml += '    }\n';
    tipjarHtml += '    else{\n';
    tipjarHtml += '       llSetText("Out Of Service!",<1,0,0>, 1.0); \n';
    tipjarHtml += '    }\n';
    tipjarHtml += '}\n\n';

    tipjarHtml += 'integer verifyCert(){\n';
    tipjarHtml += '    integer verify = TRUE;\n';
    tipjarHtml += '    if(osStringIndexOf(BTCPayServerURL,"https://127.0.0.1",0) > -1 || osStringIndexOf(BTCPayServerURL,"https://localhost",0) > -1){\n';
    tipjarHtml += '        verify = FALSE;\n';
    tipjarHtml += '    }\n';
    tipjarHtml += '    return verify;\n';
    tipjarHtml += '}\n\n';

    tipjarHtml += 'authorization(string action){\n';
    tipjarHtml += '    authorizationRequest_id = llHTTPRequest(\n';
    tipjarHtml += '        BTCPayServerURL +"/opensim/authorization",\n';
    tipjarHtml += '        [\n';
    tipjarHtml += '            HTTP_METHOD,"POST",\n';
    tipjarHtml += '            HTTP_MIMETYPE,"application/x-www-form-urlencoded",\n';
    tipjarHtml += '            HTTP_BODY_MAXLENGTH,16384,\n';
    tipjarHtml += '            HTTP_VERIFY_CERT,verifyCert(),\n';
    tipjarHtml += '            HTTP_CUSTOM_HEADER,"x-opensim-store-id",storeID,\n';
    tipjarHtml += '            HTTP_CUSTOM_HEADER,"x-opensim-owner-home-url", osGetAvatarHomeURI(llGetOwner()),\n';
    tipjarHtml += '            HTTP_CUSTOM_HEADER,"x-opensim-object-host-url", osGetGridHomeURI()\n';
    tipjarHtml += '        ],\n';
    tipjarHtml += '        "action=" + action );\n';
    tipjarHtml += '}\n\n';

    tipjarHtml += 'requestCurrentRate(){\n';
    tipjarHtml += '    requestRates_id = llHTTPRequest(\n';
    tipjarHtml += '        BTCPayServerURL +"/api/rates?storeId="+ storeID +"&currencyPairs="+ defaultPaymentMethod +"_"+ currency,\n';
    tipjarHtml += '        [\n';
    tipjarHtml += '            HTTP_METHOD,"GET",\n';
    tipjarHtml += '            HTTP_MIMETYPE,"application/json",\n';
    tipjarHtml += '            HTTP_BODY_MAXLENGTH,16384,\n';
    tipjarHtml += '            HTTP_VERIFY_CERT,verifyCert()\n';
    tipjarHtml += '        ],"");\n';
    tipjarHtml += '}\n\n';

    tipjarHtml += 'requestInvoice(){\n';
    tipjarHtml += '    string formData = "";\n';
    tipjarHtml += '    formData += "storeId="+  llEscapeURL(storeID);\n';
    tipjarHtml += '    formData += "&price="+  llEscapeURL(price);\n';
    tipjarHtml += '    formData += "&currency="+  llEscapeURL(currency);\n';
    tipjarHtml += '    formData += "&defaultPaymentMethod="+  llEscapeURL(defaultPaymentMethod);\n';
    tipjarHtml += '    formData += "&orderId="+  llEscapeURL(orderID);\n';
    tipjarHtml += '    formData += "&checkoutDesc="+  llEscapeURL("Thank you "+ osKey2Name(avatar) +" for your donation.");\n';
    tipjarHtml += '    formData += "&serverIpn="+  llEscapeURL(IPNEndpointURL);   \n';
    tipjarHtml += '    if (redirectURL != ""){\n';
    tipjarHtml += '        formData += "&browserRedirect="+ llEscapeURL(redirectURL);\n';
    tipjarHtml += '    }\n';
    tipjarHtml += '    if (notificationEmail != ""){\n';
    tipjarHtml += '        formData += "&notifyEmail="+ llEscapeURL(notificationEmail);\n';
    tipjarHtml += '    }\n';
    tipjarHtml += '    if (checkoutQueryString != ""){\n';
    tipjarHtml += '        formData += "&checkoutQueryString="+ llEscapeURL(checkoutQueryString);\n';
    tipjarHtml += '    }\n';
    tipjarHtml += '    string posData =  "{\n';
    tipjarHtml += '                    \'AppType\':\'Tip-Jar\',\n';
    tipjarHtml += '                    \'DonatorName\':\'"+ osKey2Name(avatar) +"\',\n';
    tipjarHtml += '                    \'DonatorUUID\':\'"+ (string)avatar +"\',\n';
    tipjarHtml += '                    \'ObjectName\':\'"+ llGetObjectName() +"\',\n';
    tipjarHtml += '                    \'ObjectUUID\':\'"+ llGetKey() +"\' \n';
    tipjarHtml += '                    }";\n';
    tipjarHtml += '    formData += "&posData=" +  llEscapeURL(posData);\n';
    tipjarHtml += '    \n';
    tipjarHtml += '    requestInvoice_id = llHTTPRequest(\n';
    tipjarHtml += '        BTCPayServerURL +"/opensim/invoices",\n';
    tipjarHtml += '        [\n';
    tipjarHtml += '            HTTP_METHOD,"POST",\n';
    tipjarHtml += '            HTTP_MIMETYPE,"application/x-www-form-urlencoded",\n';
    tipjarHtml += '            HTTP_BODY_MAXLENGTH,16384,\n';
    tipjarHtml += '            HTTP_VERIFY_CERT,verifyCert(),\n';
    tipjarHtml += '            HTTP_CUSTOM_HEADER,"x-opensim-store-id",storeID,\n';
    tipjarHtml += '            HTTP_CUSTOM_HEADER,"x-opensim-owner-home-url", osGetAvatarHomeURI(llGetOwner()),\n';
    tipjarHtml += '            HTTP_CUSTOM_HEADER,"x-opensim-object-host-url", osGetGridHomeURI()\n';
    tipjarHtml += '        ],\n';
    tipjarHtml += '        formData );\n';
    tipjarHtml += '}\n\n';

    tipjarHtml += 'showDonationBox(){\n';
    tipjarHtml += '    llDialog(avatar,"\\nPlease select the amount in "+ currency +" to donate.\\nYou can set a Custom amount by clicking the [Custom] button. The amount will be automatically calculated in " + defaultPaymentMethod +" to send as donation.",["100 "+ currency,"Custom","Close","10 " + currency,"25 " + currency,"50 " + currency],channel);\n';
    tipjarHtml += '}\n\n';

    tipjarHtml += 'default{\n\n';

    tipjarHtml += '    state_entry(){\n';
    tipjarHtml += '        authorization("check");     \n';
    tipjarHtml += '    }\n\n';

    tipjarHtml += '    touch_start(integer a){\n';
    tipjarHtml += '        if(llDetectedKey(0) == llGetOwner()){\n';
    tipjarHtml += '            channel = ((integer)llFrand(123456.0) +1) * -1;\n';
    tipjarHtml += '            CListener = llListen( channel, "", "", "");\n';
    tipjarHtml += '            avatar = llGetOwner();\n';
    tipjarHtml += '            active = TRUE;\n';
    tipjarHtml += '            isStartupChek = FALSE;\n';
    tipjarHtml += '            authorization("check");\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '        else{\n';
    tipjarHtml += '            llInstantMessage(llDetectedKey(0),"You are not the owner of this item!");\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '    }\n\n';

    tipjarHtml += '    listen(integer channel, string name, key id, string Box){\n';
    tipjarHtml += '        if(active && avatar == llGetOwner() && Box == "Register"){\n';
    tipjarHtml += '           authorization("register");\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '    }\n\n';

    tipjarHtml += '    http_response(key id, integer status, list metaData, string Response){\n';
    tipjarHtml += '        if (status == 200 ){\n';
    tipjarHtml += '            if (id == authorizationRequest_id){\n';
    tipjarHtml += '                if(osStringIndexOf(Response,"ospError",0) == -1){\n';
    tipjarHtml += '                    string authStatus = llJsonGetValue(Response,["status"]);\n';
    tipjarHtml += '                    string authorized = llJsonGetValue(Response,["authorized"]);\n';
    tipjarHtml += '                    if(authStatus == "registred" && authorized == "True"){\n';
    tipjarHtml += '                        isAuthorized = TRUE;\n';
    tipjarHtml += '                        reset();\n';
    tipjarHtml += '                        state authorized;\n';
    tipjarHtml += '                    }\n';
    tipjarHtml += '                    else if(authStatus == "registred" && authorized == "False"){\n';
    tipjarHtml += '                        isAuthorized = FALSE;\n';
    tipjarHtml += '                        llSetText("Out Of Service\\nMissing Authorization",<1,0,0>,1.0);\n';
    tipjarHtml += '                        if(active && avatar == llGetOwner() && !isStartupChek){\n';
    tipjarHtml += '                            llLoadURL(llGetOwner(),"\\nThis object is registred and waiting your authorization.\\n\\nPlease open this page and authorize this object. When done, click this object again to enable it...", BTCPayServerURL + "/stores/" + storeID + "/plugins/opensim");\n';
    tipjarHtml += '                            active = FALSE;\n';
    tipjarHtml += '                            llSetTimerEvent(5);\n';
    tipjarHtml += '                        }\n';
    tipjarHtml += '                    }\n';
    tipjarHtml += '                    else if(authStatus == "success" && authorized == "False"){\n';
    tipjarHtml += '                        isAuthorized = FALSE;\n';
    tipjarHtml += '                        llSetText("Out Of Service\\nMissing Authorization",<1,0,0>,1.0);\n';
    tipjarHtml += '                        if(active && avatar == llGetOwner() && !isStartupChek){\n';
    tipjarHtml += '                            llLoadURL(llGetOwner(),"\\nThis object is registred and waiting your authorization.\\n\\nPlease open this page and authorize this object. When done, click this object again to enable it...", BTCPayServerURL + "/stores/" + storeID + "/plugins/opensim");\n';
    tipjarHtml += '                            active = FALSE;\n';
    tipjarHtml += '                            llSetTimerEvent(5);\n';
    tipjarHtml += '                        }\n';
    tipjarHtml += '                    }\n';
    tipjarHtml += '                    else if(authStatus == "unknown"){\n';
    tipjarHtml += '                        isAuthorized = FALSE;\n';
    tipjarHtml += '                        llSetText("Out Of Service\\nUnknown Object",<1,0,0>,1.0);\n';
    tipjarHtml += '                        if(active && avatar == llGetOwner() && !isStartupChek){\n';
    tipjarHtml += '                            llDialog(llGetOwner(),"\\nThis object is not linked to your BTCPay store yet!\\n\\nPlease, click [Register] to start the linking and authorization process...",["Register","Cancel"],channel);\n';
    tipjarHtml += '                        }\n';
    tipjarHtml += '                    }\n';
    tipjarHtml += '                    else if(active && authStatus == "fail" && authorized == "False"){\n';
    tipjarHtml += '                        isAuthorized = FALSE;\n';
    tipjarHtml += '                        llSetText("Out Of Service\\nFatal Error",<1,0,0>,1.0);\n';
    tipjarHtml += '                        if(avatar == llGetOwner() && !isStartupChek){\n';
    tipjarHtml += '                            llLoadURL(llGetOwner(),"\\nThis object failed to register!\\n\\nPlease open this page and investigate the problem and try again...", BTCPayServerURL + "/stores/" + storeID + "/plugins/opensim");\n';
    tipjarHtml += '                        }\n';
    tipjarHtml += '                    }\n';
    tipjarHtml += '                }\n';
    tipjarHtml += '                else{\n';
    tipjarHtml += '                    llSetText("Out Of Service\\nFatal Error",<1,0,0>,1.0);\n';
    tipjarHtml += '                    llOwnerSay("\\nError: \\n" + llJsonGetValue(Response,["ospError"]));\n';
    tipjarHtml += '                }\n';
    tipjarHtml += '            }\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '    }\n\n';

    tipjarHtml += '    timer(){\n';
    tipjarHtml += '        if(!active && monitorCount < 12){\n';
    tipjarHtml += '            authorization("check");\n';
    tipjarHtml += '            monitorCount++;\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '        else if(monitorCount >= 12){\n';
    tipjarHtml += '            llSetTimerEvent(0);\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '    }\n';
    tipjarHtml += '}\n\n';

    tipjarHtml += 'state authorized{\n\n';

    tipjarHtml += '    state_entry(){\n';
    tipjarHtml += '        llSetText(osKey2Name(llGetOwner()) +"\'s Crypto Tip-Jar\\nPowered By BTCPay Server\\n>>> Click To Donate <<<",<1,1,0>, 1.0);\n';
    tipjarHtml += '    }\n\n';

    tipjarHtml += '    touch_start(integer n){\n';
    tipjarHtml += '        channel = ((integer)llFrand(123456.0) +1) * -1;\n';
    tipjarHtml += '        CListener = llListen( channel, "", "", "");\n';
    tipjarHtml += '        if (isOutOfService){\n';
    tipjarHtml += '            if (llDetectedKey(0) == llGetOwner()){\n';
    tipjarHtml += '                avatar = llGetOwner();\n';
    tipjarHtml += '                llOwnerSay("\\nWarning: This Tip-Jar is OUT OF SERVICE!\\n");\n';
    tipjarHtml += '                llOwnerSay(errorLog);\n';
    tipjarHtml += '                llDialog(avatar,"\\nWarning: This Tip-Jar is OUT OF SERVICE!\\n[Reset]: Click to make available.\\n[Log Error]: Click to view the saved error.\\n[Close]: Close this box without enabling the Tip-jat",["Reset","Log Error","Close"],channel);\n';
    tipjarHtml += '            }\n';
    tipjarHtml += '            llInstantMessage(llDetectedKey(0),"\\nWarning: This Tip-Jar is OUT OF SERVICE!\\nPlease contact "+ osKey2Name(llGetOwner())+" for support.");\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '        else{\n';
    tipjarHtml += '            if (avatar == NULL_KEY){\n';
    tipjarHtml += '                avatar = llDetectedKey(0);\n';
    tipjarHtml += '                authorization("check");\n';
    tipjarHtml += '            }\n';
    tipjarHtml += '            else if (avatar != llDetectedKey(0)){\n';
    tipjarHtml += '                llInstantMessage(llDetectedKey(0), "This device is in use!/nPlease wait...");\n';
    tipjarHtml += '            }\n';
    tipjarHtml += '            else if (active && avatar == llDetectedKey(0) && txStatus != ""){\n';
    tipjarHtml += '                llInstantMessage(avatar, "\\nTransaction in progress!\\nYour invoice ID is:\\n"+ invoiceID +"\\nInvoice page at:\\n"+ invoiceURL +"\\nPlease wait...");\n';
    tipjarHtml += '                llLoadURL(avatar, "Click to open the payment page.\\nYour invoice ID is : "+ invoiceID +"\\nThank you for your donation!", invoiceURL);\n';
    tipjarHtml += '            }\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '    }\n\n';

    tipjarHtml += '    http_request(key id, string method, string body){\n';
    tipjarHtml += '        if (id == IPNEndpointRequest_id && method == URL_REQUEST_GRANTED){\n';
    tipjarHtml += '            IPNEndpointURL = body;\n';
    tipjarHtml += '            llHTTPResponse(id, 200, "");\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '        else if (llGetHTTPHeader(id, "x-remote-ip") == allowedHttpInIP && osStringIndexOf(llJsonGetValue(body,["url"]), BTCPayServerURL,0) > -1){\n';
    tipjarHtml += '            string invoiceOrderId = llJsonGetValue(body, ["orderId"]);\n';
    tipjarHtml += '            string invoiceId = llJsonGetValue(body, ["id"]);\n';
    tipjarHtml += '            string invoiceStatus = llJsonGetValue(body, ["status"]);\n';
    tipjarHtml += '            if (method == "POST" && invoiceOrderId == orderID && invoiceId == invoiceID){\n';
    tipjarHtml += '                if(invoiceStatus == "expired" || invoiceStatus == "invalid"){\n';
    tipjarHtml += '                    llInstantMessage(avatar, "Operation Fail!\\nInvoice ID: "+ invoiceID +" status is "+ invoiceStatus +".\\nPlease try again or contact "+ osKey2Name(llGetOwner()) +" and provide your invoice ID: \\n"+ invoiceID +"\\nif you did a payment.");\n';
    tipjarHtml += '                    if (notifications){\n';
    tipjarHtml += '                        llOwnerSay("\\nWarning: Invoice ID:\\n"+ invoiceID +" Fail!\\nStatus is "+ invoiceStatus);\n';
    tipjarHtml += '                    }\n';
    tipjarHtml += '                    llHTTPResponse(id, 200, "");\n';
    tipjarHtml += '                    reset();\n';
    tipjarHtml += '                }\n';
    tipjarHtml += '                else if (invoiceStatus == "paid"){\n';
    tipjarHtml += '                    llSetText("Processing...\\nWaiting Peers Confirmation",<1,1,0>, 1.0);\n';
    tipjarHtml += '                    llInstantMessage(avatar, "\\nThank you for your donation.\\nInvoice ID: "+ invoiceID +" is paid and in wait of the usual confirmations.");\n';
    tipjarHtml += '                    if (notifications){\n';
    tipjarHtml += '                        llOwnerSay("\\n"+ osKey2Name(avatar) +" donated "+ price +" "+ currency +"!\\nYou have recived: "+ llJsonGetValue(body, ["btcPrice"]) +" "+ defaultPaymentMethod +".\\nInvoice ID: "+ invoiceID +" Paid (waiting confirmations).");\n';
    tipjarHtml += '                    }\n';
    tipjarHtml += '                    txStatus = "paid";\n';
    tipjarHtml += '                    llSetTimerEvent(60);\n';
    tipjarHtml += '                    llHTTPResponse(id, 200, "");\n';
    tipjarHtml += '                }\n';
    tipjarHtml += '                else if (invoiceStatus == "confirmed" || invoiceStatus == "complete"){\n';
    tipjarHtml += '                    llInstantMessage(avatar, "\\nThank you for your donation.\\nInvoice ID: "+ invoiceID +" was fully paid and confirmed.");\n';
    tipjarHtml += '                    if (notifications == TRUE){\n';
    tipjarHtml += '                        llOwnerSay("\\nInvoice ID: " + invoiceID +" Confirmed.");\n';
    tipjarHtml += '                    }\n';
    tipjarHtml += '                    llHTTPResponse(id, 200, "");\n';
    tipjarHtml += '                    reset();\n';
    tipjarHtml += '                }\n';
    tipjarHtml += '            }\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '        llHTTPResponse(id, 200, "");\n';
    tipjarHtml += '    }\n\n';

    tipjarHtml += '    http_response(key id, integer status, list metaData, string Response){\n';
    tipjarHtml += '        if (status == 200 ){\n';
    tipjarHtml += '            if (id == authorizationRequest_id){\n';
    tipjarHtml += '                if(osStringIndexOf(Response,"ospError",0) == -1){\n';
    tipjarHtml += '                    string authStatus = llJsonGetValue(Response,["status"]);\n';
    tipjarHtml += '                    string authorized = llJsonGetValue(Response,["authorized"]);\n';
    tipjarHtml += '                    if(authStatus == "unknown" || authorized == "False"){\n';
    tipjarHtml += '                        isAuthorized = FALSE;\n';
    tipjarHtml += '                        reset();\n';
    tipjarHtml += '                        state default;\n';
    tipjarHtml += '                    }\n';
    tipjarHtml += '                    else if(authStatus == "registred" && authorized == "True"){\n';
    tipjarHtml += '                        isAuthorized = TRUE;\n';
    tipjarHtml += '                        llDialog(avatar,"\\nThank you "+ osKey2Name(avatar) +" for your donation.\\nPlease select the currency for the calculation of the " + defaultPaymentMethod +" to send as donation.\\nIf you select "+ defaultPaymentMethod +" you can manually set an amount in "+ defaultPaymentMethod +".",[defaultPaymentMethod,"Close"," ","USD","EUR","GBP"],channel);\n';
    tipjarHtml += '                        IPNEndpointRequest_id = llRequestURL();\n';
    tipjarHtml += '                        orderID = "tip_"+ avatar;\n';
    tipjarHtml += '                        active = TRUE;\n';
    tipjarHtml += '                        llSetText("Processing...",<1,1,0>, 1.0);\n';
    tipjarHtml += '                        txStatus = "new";\n';
    tipjarHtml += '                        llSetTimerEvent(120);\n';
    tipjarHtml += '                    }\n';
    tipjarHtml += '                }\n';
    tipjarHtml += '                else{\n';
    tipjarHtml += '                    isOutOfService = TRUE;\n';
    tipjarHtml += '                    llOwnerSay("Error:\\n" + llJsonGetValue(Response,["ospError"]));\n';
    tipjarHtml += '                    reset();\n';
    tipjarHtml += '                }\n';
    tipjarHtml += '            }\n';
    tipjarHtml += '            else if (id == requestRates_id){\n';
    tipjarHtml += '                string rateJson = llJsonGetValue(Response, [0]);\n';
    tipjarHtml += '                if(rateJson != emptyJson){\n';
    tipjarHtml += '                    string currencyName = llJsonGetValue(rateJson, ["name"]);\n';
    tipjarHtml += '                    string rate =  llJsonGetValue(rateJson, ["rate"]);\n';
    tipjarHtml += '                    float cryptoAmount = (float)price / (float)rate;\n';
    tipjarHtml += '                    llDialog(avatar,"\\nThank you for donating " + price +" "+ currencyName +"s.\\n\\nAt the current rate of " + rate +" "+ currency +" per "+ defaultPaymentMethod +", this do ~"+ (string)cryptoAmount + " " + defaultPaymentMethod +".\\n\\nDo you have enough coins in your wallet ?",["Yes","Close"],channel);\n';
    tipjarHtml += '                }\n';
    tipjarHtml += '                else{\n';
    tipjarHtml += '                    llDialog(avatar,"\\nThank you "+ osKey2Name(avatar) +" for your donation.\\nSeems there is a problem with the data source of the currency rates needed for the calculation of the " + defaultPaymentMethod +" to send.\\n\\nPlease, click "+ defaultPaymentMethod +" to manually set an amount in "+ defaultPaymentMethod +".",[defaultPaymentMethod,"Close"],channel);             \n';
    tipjarHtml += '                }            \n';
    tipjarHtml += '            }\n';
    tipjarHtml += '            else if (id == requestInvoice_id){\n';
    tipjarHtml += '                if (osStringIndexOf(Response,"ospError",0) > -1){\n';
    tipjarHtml += '                    if(osStringIndexOf(Response,"ERR_RATE_UNAVAILABLE",0) > -1){\n';
    tipjarHtml += '                        llDialog(avatar,"\\nThank you "+ osKey2Name(avatar) +" for your donation.\\nSeems there is a problem with the data source of the currency rates needed for the calculation of the " + defaultPaymentMethod +" to send.\\n\\nPlease, click "+ defaultPaymentMethod +" to manually set an amount in "+ defaultPaymentMethod +".",[defaultPaymentMethod,"Close"],channel);             \n';
    tipjarHtml += '                    }\n';
    tipjarHtml += '                    else{\n';
    tipjarHtml += '                        llSetText("Out of Service !",<1,0,0>, 1.0);\n';
    tipjarHtml += '                        isOutOfService = TRUE;\n';
    tipjarHtml += '                        llOwnerSay("\\nDetected problem with BTCPay server!. This Tip-Jar is OUT OF SERVICE.\\nWarning: "+ llJsonGetValue(Response, ["ospError"]) +"\\nStatus :"+ status);\n';
    tipjarHtml += '                        errorLog = Response;\n';
    tipjarHtml += '                        reset();\n';
    tipjarHtml += '                    }\n';
    tipjarHtml += '                }\n';
    tipjarHtml += '                else {\n';
    tipjarHtml += '                    invoiceID = llJsonGetValue(Response, ["invoiceId"]);\n';
    tipjarHtml += '                    invoiceURL = llJsonGetValue(Response, ["invoiceUrl"]);\n';
    tipjarHtml += '                    if(invoiceID != emptyJson && invoiceURL != emptyJson){\n';
    tipjarHtml += '                        llLoadURL(avatar, "Click to open the payment page.\\nYour invoice ID is : "+ invoiceID +"\\nThank you for your donation!", invoiceURL);\n';
    tipjarHtml += '                        llSetText("Processing...\\nWaiting Your Payment",<1,1,0>, 1.0);\n';
    tipjarHtml += '                    }\n';
    tipjarHtml += '                    else{\n';
    tipjarHtml += '                        llSetText("Out of Service !",<1,0,0>, 1.0);\n';
    tipjarHtml += '                        isOutOfService = TRUE;\n';
    tipjarHtml += '                        llOwnerSay("\\nDetected problem with BTCPay server!. This Tip-Jar is OUT OF SERVICE.\\nWarning: "+ Response +"\\nStatus :"+ status);\n';
    tipjarHtml += '                        errorLog = Response;\n';
    tipjarHtml += '                        reset();\n';
    tipjarHtml += '                    }\n';
    tipjarHtml += '                }\n';
    tipjarHtml += '            }\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '        else if (status != 200){\n';
    tipjarHtml += '            llSetText("Out of Service !",<1,0,0>, 1.0);\n';
    tipjarHtml += '            isOutOfService = TRUE;\n';
    tipjarHtml += '            llOwnerSay("\\nDetected problem with BTCPay server!. This Tip-Jar is OUT OF SERVICE.\\nStatus :"+ status +"\\nError:\\n"+ llJsonGetValue(Response, ["ospError"]));\n';
    tipjarHtml += '            errorLog = Response;\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '    }\n\n';

    tipjarHtml += '    listen(integer channel, string name, key id, string Box){\n';
    tipjarHtml += '        if (Box == "Close"){ reset();}\n';
    tipjarHtml += '        else if (Box == "USD" || Box == "EUR" || Box == "GBP"){\n';
    tipjarHtml += '            currency = Box; \n';
    tipjarHtml += '            showDonationBox();\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '        else if (Box == defaultPaymentMethod){\n';
    tipjarHtml += '            currency = defaultPaymentMethod;\n';
    tipjarHtml += '            isWaitingAmount = TRUE;\n';
    tipjarHtml += '            llTextBox(avatar,"Please, type an amount of "+ defaultPaymentMethod +" and click [Submit] button.", channel);\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '        else if (Box == "10 " + currency || Box == "25 " + currency || Box == "50 " + currency || Box == "100 " + currency){\n';
    tipjarHtml += '            list l = llParseString2List(Box, " ",[]);\n';
    tipjarHtml += '            price = llList2String(l,0);\n';
    tipjarHtml += '            requestCurrentRate();\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '        else if (Box == "Custom"){\n';
    tipjarHtml += '            isWaitingAmount = TRUE;\n';
    tipjarHtml += '            llTextBox(avatar,"Please, type an amount of "+ currency +" and click [Submit] button.", channel);\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '        else if (Box != "" && isWaitingAmount){\n';
    tipjarHtml += '            if(osRegexIsMatch(Box, "^[0-9|.]+$") == 0 || (float)Box <= 0){\n';
    tipjarHtml += '                llTextBox(avatar,"Please, type only a number greater than "+ (string)(float)0 +" and click [Submit] button.", channel);\n';
    tipjarHtml += '            }\n';
    tipjarHtml += '            else{\n';
    tipjarHtml += '                price = (string)(float)Box;\n';
    tipjarHtml += '                if(currency != defaultPaymentMethod){\n';
    tipjarHtml += '                    isWaitingAmount = FALSE;\n';
    tipjarHtml += '                    requestCurrentRate();           \n';
    tipjarHtml += '                }\n';
    tipjarHtml += '                else{\n';
    tipjarHtml += '                    requestInvoice();\n';
    tipjarHtml += '                }  \n';
    tipjarHtml += '            }\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '        else if (Box == "Yes"){\n';
    tipjarHtml += '            requestInvoice();\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '        else if (Box == "Reset" && isOutOfService && avatar == llGetOwner()){\n';
    tipjarHtml += '            isOutOfService = FALSE;\n';
    tipjarHtml += '            reset();\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '        else if (Box == "Log Error" && avatar == llGetOwner()){\n';
    tipjarHtml += '            if (errorLog == ""){\n';
    tipjarHtml += '                llOwnerSay("No errors to log");\n';
    tipjarHtml += '            }\n';
    tipjarHtml += '            else{\n';
    tipjarHtml += '                llOwnerSay(errorLog);\n';
    tipjarHtml += '            }\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '    }\n\n';

    tipjarHtml += '    timer(){\n';
    tipjarHtml += '        if(active && invoiceID == "" && txStatus == "new"){\n';
    tipjarHtml += '            llInstantMessage(avatar,"\\nOperation timeout!\\nPlease click the Tip-Jar again to retry.");\n';
    tipjarHtml += '            reset();\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '        else if (active && txStatus == "paid"){\n';
    tipjarHtml += '            llInstantMessage(avatar,"\\nTransaction in progress...\\nWaiting peers confirmations.");\n';
    tipjarHtml += '            llSetTimerEvent(60);\n';
    tipjarHtml += '        }\n';
    tipjarHtml += '    }\n';
    tipjarHtml += '}\n';
    
    // Do not use .html(...) here or the script will not work inWorld!
    $("#tipjarScriptCode").text(tipjarHtml);
}
updateTipjarScript();

$("#tjNotificationEmail, #tjRedirectURL, #tjCheckoutQueryString, #tjChatNotification, #tjDefaultPaymentMethod").on("input", ()=>{
    if($("#tjDefaultPaymentMethod").val().trim().toUpperCase() == ""){
        $("#tjDefaultPaymentMethod").val(defaultPaymentMethod);
        updateTipjarScript();
    }
    updateTipjarScript();
});
//[TODO]: populating this from the data source response after requesting the available pairs
// of only the selected Payment Method (supported by BTCPay/store)... and building the options
// with the fiat data or keys fiat part...
$(".vDisplayCurrency, .rbDisplayCurrency").html('<option value="'+ defaultCurrency +'">'+ defaultCurrency +' (Default)</option><option value="USD">USD - US Dollar</option><option value="EUR">EUR - Euro</option><option value="CHF">CHF - Swiss Franc</option><option value="GBP">GBP - Pound Sterling</option><option value="CAD">CAD - Canadian Dollar</option><option value="AUD">AUD - Australian Dollar</option><option value="JPY">JPY - Japanese Yen</option><option value="" disabled>----------------------</option><option value="BTC">BTC - Bitcoin</option><option value="SATS">SATS - Satoshi</option><option value="" disabled>----------------------</option><option value="AED">AED - UAE Dirham</option><option value="AFN">AFN - Afghan Afghani</option><option value="ALL">ALL - Albanian Lek</option><option value="AMD">AMD - Armenian Dram</option><option value="ANG">ANG - Netherlands Antillean Guilder</option><option value="AOA">AOA - Angolan Kwanza</option><option value="ARS">ARS - Argentine Peso</option><option value="AUD">AUD - Australian Dollar</option><option value="AWG">AWG - Aruban Florin</option><option value="AZN">AZN - Azerbaijani Manat</option><option value="BAM">BAM - Convertible Mark</option><option value="BBD">BBD - Barbadian Dollar</option><option value="BDT">BDT - Bangladeshi Taka</option><option value="BGN">BGN - Bulgarian Lev</option><option value="BHD">BHD - Bahraini Dinar</option><option value="BIF">BIF - Burundian Franc</option><option value="BMD">BMD - Bermudian Dollar</option><option value="BND">BND - Brunei Dollar</option><option value="BOB">BOB - Bolivian Boliviano</option><option value="BOV">BOV - Bolivian Mvdol</option><option value="BRL">BRL - Brazilian Real</option><option value="BSD">BSD - Bahamian Dollar</option><option value="BTN">BTN - Bhutanese Ngultrum</option><option value="BWP">BWP - Botswana Pula</option><option value="BYN">BYN - Belarusian Ruble</option><option value="BYR">BYR - Belarusian Ruble</option><option value="BZD">BZD - Belize Dollar</option><option value="CDF">CDF - Congolese Franc</option><option value="CHE">CHE - WIR Euro</option><option value="CHW">CHW - WIR Franc</option><option value="CLF">CLF - Unidad de Fomento</option><option value="CLP">CLP - Chilean Peso</option><option value="COP">COP - Colombian Peso</option><option value="COU">COU - Unidad de Valor Real</option><option value="CRC">CRC - Costa Rican Colon</option><option value="CUC">CUC - Peso Convertible</option><option value="CUP">CUP - Cuban Peso</option><option value="CVE">CVE - Cape Verdean Escudo</option><option value="CZK">CZK - Czech Koruna</option><option value="DJF">DJF - Djiboutian Franc</option><option value="DKK">DKK - Danish Krone</option><option value="DOP">DOP - Dominican Peso</option><option value="DZD">DZD - Algerian Dinar</option><option value="EGP">EGP - Egyptian Pound</option><option value="ERN">ERN - Eritrean Nakfa</option><option value="FJD">FJD - Fijian Dollar</option><option value="FKP">FKP - Falkland Islands Pound</option><option value="GEL">GEL - Georgian Lari</option><option value="GHS">GHS - Ghanaian Cedi</option><option value="GIP">GIP - Gibraltar Pound</option><option value="GMD">GMD - Gambian Dalasi</option><option value="GNF">GNF - Guinean Franc</option><option value="GTQ">GTQ - Guatemalan Quetzal</option><option value="GYD">GYD - Guyanese Dollar</option><option value="HKD">HKD - Hong Kong Dollar</option><option value="HNL">HNL - Honduran Lempira</option><option value="HRK">HRK - Croatian Kuna</option><option value="HTG">HTG - Haitian Gourde</option><option value="HUF">HUF - Hungarian Forint</option><option value="IDR">IDR - Indonesian Rupiah</option><option value="ILS">ILS - New Israeli Shekel</option><option value="INR">INR - Indian Rupee</option><option value="IQD">IQD - Iraqi Dinar</option><option value="IRR">IRR - Iranian Rial</option><option value="ISK">ISK - Icelandic Krona</option><option value="JMD">JMD - Jamaican Dollar</option><option value="JOD">JOD - Jordanian Dinar</option><option value="KES">KES - Kenyan Shilling</option><option value="KGS">KGS - Kyrgyzstani Som</option><option value="KHR">KHR - Cambodian Riel</option><option value="KMF">KMF - Comorian Franc</option><option value="KPW">KPW - North Korean Won</option><option value="KRW">KRW - South Korean Won</option><option value="KWD">KWD - Kuwaiti Dinar</option><option value="KYD">KYD - Cayman Islands Dollar</option><option value="KZT">KZT - Kazakhstani Tenge</option><option value="LAK">LAK - Lao Kip</option><option value="LBP">LBP - Lebanese Pound</option><option value="LKR">LKR - Sri Lankan Rupee</option><option value="LRD">LRD - Liberian Dollar</option><option value="LSL">LSL - Lesotho Loti</option><option value="LYD">LYD - Libyan Dinar</option><option value="MAD">MAD - Moroccan Dirham</option><option value="MDL">MDL - Moldovan Leu</option><option value="MGA">MGA - Malagasy Ariary</option><option value="MKD">MKD - Macedonian Denar</option><option value="MMK">MMK - Myanmar Kyat</option><option value="MNT">MNT - Mongolian Tugrik</option><option value="MOP">MOP - Macanese Pataca</option><option value="MRO">MRO - Mauritanian Ouguiya</option><option value="MUR">MUR - Mauritian Rupee</option><option value="MVR">MVR - Maldivian Rufiyaa</option><option value="MWK">MWK - Malawian Kwacha</option><option value="MXN">MXN - Mexican Peso</option><option value="MXV">MXV - Mexican Unidad de Inversion (UDI)</option><option value="MYR">MYR - Malaysian Ringgit</option><option value="MZN">MZN - Mozambican Metical</option><option value="NAD">NAD - Namibian dollar</option><option value="NGN">NGN - Nigerian Naira</option><option value="NIO">NIO - Nicaraguan Cordoba</option><option value="NOK">NOK - Norwegian Krone</option><option value="NPR">NPR - Nepalese Rupee</option><option value="NZD">NZD - New Zealand Dollar</option><option value="OMR">OMR - Omani Rial</option><option value="PAB">PAB - Panamanian Balboa</option><option value="PEN">PEN - Peruvian Sol</option><option value="PGK">PGK - Papua New Guinean Kina</option><option value="PHP">PHP - Philippine Peso</option><option value="PKR">PKR - Pakistani Rupee</option><option value="PLN">PLN - Polish Zloty</option><option value="PYG">PYG - Paraguayan Guarani</option><option value="QAR">QAR - Qatari Rial</option><option value="RON">RON - Romanian Leu</option><option value="RSD">RSD - Serbian Dinar</option><option value="RUB">RUB - Russian Ruble</option><option value="RWF">RWF - Rwandan Franc</option><option value="SAR">SAR - Saudi Riyal</option><option value="SBD">SBD - Solomon Islands Dollar</option><option value="SCR">SCR - Seychellois Rupee</option><option value="SDG">SDG - Sudanese Pound</option><option value="SEK">SEK - Swedish Krona</option><option value="SGD">SGD - Singapore Dollar</option><option value="SHP">SHP - Saint Helena Pound</option><option value="SLL">SLL - Sierra Leonean Leone</option><option value="SOS">SOS - Somali Shilling</option><option value="SRD">SRD - Surinamese Dollar</option><option value="SSP">SSP - South Sudanese Pound</option><option value="STD">STD - São Tomé and Príncipe sDobra</option><option value="SVC">SVC - Salvadoran Colon</option><option value="SYP">SYP - Syrian Pound</option><option value="SZL">SZL - Swazi Lilangeni</option><option value="THB">THB - Thai Baht</option><option value="TJS">TJS - Tajikistani Somoni</option><option value="TMT">TMT - Turkmenistani Manat</option><option value="TND">TND - Tunisian Dinar</option><option value="TOP">TOP - Tongan paʻanga</option><option value="TRY">TRY - Turkish Lira</option><option value="TTD">TTD - Trinidad and Tobago Dollar</option><option value="TWD">TWD - New Taiwan Dollar</option><option value="TZS">TZS - Tanzanian Shilling</option><option value="UAH">UAH - Ukrainian Hryvnia</option><option value="UGX">UGX - Ugandan Shilling</option><option value="USN">USN - US Dollar (Next day)</option><option value="UYI">UYI - Uruguay Peso en Unidades Indexadas (URUIURUI)</option><option value="UYU">UYU - Uruguayan Peso</option><option value="UZS">UZS - Uzbekistani Sum</option><option value="VEF">VEF - Venezuelan Bolívar</option><option value="VND">VND - Vietnamese Dong</option><option value="VUV">VUV - Vanuatu Vatu</option><option value="WST">WST - Samoan Tala</option><option value="XAF">XAF - CFA Franc BEAC</option><option value="XCD">XCD - East Caribbean Dollar</option><option value="XOF">XOF - CFA Franc BCEAO</option><option value="XPF">XPF - CFP Franc</option><option value="YER">YER - Yemeni Rial</option><option value="ZAR">ZAR - South African Rand</option><option value="ZMW">ZMW - Zambian Kwacha</option><option value="ZWL">ZWL - Zimbabwean Dollar</option>');

function updateVendorScript(){
    var vendorHtml = '';
    vendorHtml += '/* BTCPay Server Single Product Vendor Script for OpenSimulator Plugin v0.1.1.\n\n';

    vendorHtml += 'THIS SCRIPT IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n';
    vendorHtml += 'IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, \n';
    vendorHtml += 'FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n';
    vendorHtml += 'AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n';
    vendorHtml += 'LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n';
    vendorHtml += 'OUT OF OR IN CONNECTION WITH THE SCRIPT OR THE USE OR OTHER DEALINGS IN THE SCRIPT.\n\n';

    vendorHtml += 'By Adil El Farissi (aka: Web Rain inOSG) Under the same license as BTCPay. */\n\n';

    vendorHtml += '/* Change the following to your BTCPay server instance URL and storeID. */\n';
    vendorHtml += 'string BTCPayServerURL = "'+ window.location.origin +'";\n';
    vendorHtml += 'string storeID = "'+ StoreId +'";\n\n';

    vendorHtml += '/* Set your BTCPay server\'s IP address.\n(Accept the incoming notifications only from this IP) */\n';
    vendorHtml += 'string allowedHttpInIP = "'+ IP +'";\n\n';

    vendorHtml += '/* Set the fiat or crypto currency to display eg, USD or EUR... if set to the \n';
    vendorHtml += 'same as defaultPaymentMethod, the invoice will be in cryptos only. */\n';
    vendorHtml += 'string currency = "'+ $("#vDisplayCurrency").val().trim().toUpperCase() +'";\n\n';

    vendorHtml += '/* Set the product price in "currency" */\n';
    vendorHtml += 'string price = "'+ $("#vItemPrice").val().trim() +'";\n\n';

    vendorHtml += '/* The cryptocurrency code (ticker) of the crypto that you want to recive as \n';
    vendorHtml += 'payment. This value depend on your BTCPay server settings and Altcoins \n';
    vendorHtml += 'support... Default is Bitcoin "BTC", If your BTCPay instance support Litecoin \n';
    vendorHtml += 'Dogecoin and Monero you can set "LTC" or "DOGE" or "XMR"... (Cryptos only here!)*/\n';
    vendorHtml += 'string defaultPaymentMethod = "'+ $("#vDefaultPaymentMethod").val().trim().toUpperCase() +'";\n\n';

    vendorHtml += '/* Set some infos about the product to sale. 100 to 150 characters */\n';
    vendorHtml += 'string productDescription = "";\n\n';

    vendorHtml += '/* If you want to recive notifications by Email, set it here or leave empty.*/\n';
    vendorHtml += 'string notificationEmail = "'+ $("#vNotificationEmail").val().trim() +'";\n\n';

    vendorHtml += '/* If you want to redirect your user to a webpage after a payment, set an URL \n';
    vendorHtml += 'here or leave empty. You can add here some GET parameters to pass data to the \n';
    vendorHtml += 'destination... eg, avatar name or UUID...*/\n';
    vendorHtml += 'string redirectURL = "'+ $("#vRedirectURL").val().trim() +'";\n\n';

    vendorHtml += '/*Advanced Options: Specify additional query string parameters that should be \n';
    vendorHtml += 'appended to the checkout page once the invoice is created. For example, \n';
    vendorHtml += 'lang=da-DK would load the checkout page in Danish by default.*/\n';
    vendorHtml += 'string checkoutQueryString = "'+ $("#vCheckoutQueryString").val().trim() +'";\n\n';

    vendorHtml += '/* If set to TRUE will inform you about the recived payments in the chat.*/\n';
    vendorHtml += 'integer notifications = '+ $("#vChatNotification").val().trim() +';\n\n';

    vendorHtml += '/* Show or hide the text over the item. */\n';
    vendorHtml += 'integer showHoverText = '+ $("#vShowHoverText").val().trim() +';\n\n';

    vendorHtml += '/*** The following don\'t need change ***/\n';
    vendorHtml += 'key authorizationRequest_id = NULL_KEY;\n';
    vendorHtml += 'key IPNEndpointRequest_id = NULL_KEY;\n';
    vendorHtml += 'key requestInvoice_id = NULL_KEY;\n';
    vendorHtml += 'key requestRates_id = NULL_KEY;\n';
    vendorHtml += 'string IPNEndpointURL = "";\n';
    vendorHtml += 'string orderID = "";\n';
    vendorHtml += 'key avatar = NULL_KEY;\n';
    vendorHtml += 'integer active = FALSE;\n';
    vendorHtml += 'string invoiceID = "";\n';
    vendorHtml += 'string invoiceURL = "";\n';
    vendorHtml += 'string productName = "";\n';
    vendorHtml += 'integer channel;\n';
    vendorHtml += 'integer CListener;\n';
    vendorHtml += 'integer isOutOfService = FALSE;\n';
    vendorHtml += 'string errorLog = "";\n';
    vendorHtml += 'string txStatus = "";\n';
    vendorHtml += 'integer isAuthorized = FALSE;\n';
    vendorHtml += 'integer isStartupChek = TRUE;\n';
    vendorHtml += 'integer monitorCount = 0;\n';
    vendorHtml += 'string emptyJson = llJsonGetValue("{}",["-"]);\n\n';

    vendorHtml += 'reset(){\n';
    vendorHtml += '    requestInvoice_id = NULL_KEY;\n';
    vendorHtml += '    IPNEndpointRequest_id = NULL_KEY;\n';
    vendorHtml += '    orderID = "";\n';
    vendorHtml += '    avatar = NULL_KEY;\n';
    vendorHtml += '    active = FALSE;\n';
    vendorHtml += '    invoiceID = "";\n';
    vendorHtml += '    invoiceURL = "";\n';
    vendorHtml += '    txStatus = "";\n';
    vendorHtml += '    llReleaseURL(IPNEndpointURL);\n';
    vendorHtml += '    IPNEndpointURL = "";\n';
    vendorHtml += '    llListenRemove(CListener);\n';
    vendorHtml += '    llSetTimerEvent(0);\n';
    vendorHtml += '    monitorCount = 0;\n';
    vendorHtml += '    if(!isOutOfService){\n';
    vendorHtml += '        if(showHoverText){\n';
    vendorHtml += '            llSetText(productName +" Vendor\\nPowered By BTCPay Server\\n>>> Click To Buy <<<\\nPrice: "+ price +" "+ currency+"\\nPayment With: "+defaultPaymentMethod,<1,1,0>, 1.0);\n';
    vendorHtml += '        }\n';
    vendorHtml += '        else{\n';
    vendorHtml += '            llSetText("",<1,1,0>, 1.0);\n';
    vendorHtml += '        }\n';
    vendorHtml += '    }\n';
    vendorHtml += '    else{\n';
    vendorHtml += '       llSetText("Out Of Service!",<1,0,0>, 1.0);\n';
    vendorHtml += '    }\n';
    vendorHtml += '}\n\n';

    vendorHtml += 'integer verifyCert(){\n';
    vendorHtml += '    integer verify = TRUE;\n';
    vendorHtml += '    if(osStringIndexOf(BTCPayServerURL,"https://127.0.0.1",0) > -1 || osStringIndexOf(BTCPayServerURL,"https://localhost",0) > -1){\n';
    vendorHtml += '        verify = FALSE;\n';
    vendorHtml += '    }\n';
    vendorHtml += '    return verify;\n';
    vendorHtml += '}\n\n';

    vendorHtml += 'authorization(string action){\n';
    vendorHtml += '    authorizationRequest_id = llHTTPRequest(\n';
    vendorHtml += '        BTCPayServerURL +"/opensim/authorization",\n';
    vendorHtml += '        [\n';
    vendorHtml += '            HTTP_METHOD,"POST",\n';
    vendorHtml += '            HTTP_MIMETYPE,"application/x-www-form-urlencoded",\n';
    vendorHtml += '            HTTP_BODY_MAXLENGTH,16384,\n';
    vendorHtml += '            HTTP_VERIFY_CERT,verifyCert(),\n';
    vendorHtml += '            HTTP_CUSTOM_HEADER,"x-opensim-store-id",storeID,\n';
    vendorHtml += '            HTTP_CUSTOM_HEADER,"x-opensim-owner-home-url", osGetAvatarHomeURI(llGetOwner()),\n';
    vendorHtml += '            HTTP_CUSTOM_HEADER,"x-opensim-object-host-url", osGetGridHomeURI()\n';
    vendorHtml += '        ],\n';
    vendorHtml += '        "action=" + action );\n';
    vendorHtml += '}\n\n';

    vendorHtml += 'requestCurrentRate(){\n';
    vendorHtml += '    requestRates_id = llHTTPRequest(\n';
    vendorHtml += '        BTCPayServerURL +"/api/rates?storeId="+ storeID +"&currencyPairs="+ defaultPaymentMethod +"_"+ currency,\n';
    vendorHtml += '        [\n';
    vendorHtml += '            HTTP_METHOD,"GET",\n';
    vendorHtml += '            HTTP_MIMETYPE,"application/json",\n';
    vendorHtml += '            HTTP_BODY_MAXLENGTH,16384,\n';
    vendorHtml += '            HTTP_VERIFY_CERT,verifyCert()\n';
    vendorHtml += '        ],"");\n';
    vendorHtml += '}\n\n';

    vendorHtml += 'requestInvoice(){\n';
    vendorHtml += '    string formData = "";\n';
    vendorHtml += '    formData += "storeId="+ llEscapeURL(storeID);\n';
    vendorHtml += '    formData += "&price="+ llEscapeURL(price);\n';
    vendorHtml += '    formData += "&currency="+ llEscapeURL(currency);\n';
    vendorHtml += '    formData += "&defaultPaymentMethod="+ llEscapeURL(defaultPaymentMethod);\n';
    vendorHtml += '    formData += "&orderId="+ llEscapeURL(orderID);\n';
    vendorHtml += '    formData += "&checkoutDesc="+  llEscapeURL("Thank you "+ osKey2Name(avatar) +" for purchasing:"+ productName +".");\n';
    vendorHtml += '    formData += "&serverIpn="+ llEscapeURL(IPNEndpointURL);\n';
    vendorHtml += '    if(redirectURL != ""){\n';
    vendorHtml += '        formData += "&browserRedirect="+ llEscapeURL(redirectURL);\n';
    vendorHtml += '    }\n';
    vendorHtml += '    if(notificationEmail != ""){\n';
    vendorHtml += '        formData += "&notifyEmail="+ llEscapeURL(notificationEmail);\n';
    vendorHtml += '    }\n';
    vendorHtml += '    if(checkoutQueryString != ""){\n';
    vendorHtml += '        formData += "&checkoutQueryString="+ llEscapeURL(checkoutQueryString);\n';
    vendorHtml += '    }\n';
    vendorHtml += '    string posData =  "{\n';
    vendorHtml += '                    \'AppType\':\'Vendor\',\n';
    vendorHtml += '                    \'BuyerName\':\'"+ osKey2Name(avatar) +"\',\n';
    vendorHtml += '                    \'BuyerUUID\':\'"+ (string)avatar +"\',\n';
    vendorHtml += '                    \'ObjectName\':\'"+ llGetObjectName() +"\',\n';
    vendorHtml += '                    \'ObjectUUID\':\'"+ llGetKey() +"\' \n';
    vendorHtml += '                    }";\n';
    vendorHtml += '    formData += "&posData=" +  llEscapeURL(posData);\n';
    vendorHtml += '    \n';
    vendorHtml += '    requestInvoice_id = llHTTPRequest(\n';
    vendorHtml += '        BTCPayServerURL +"/opensim/invoices",\n';
    vendorHtml += '        [\n';
    vendorHtml += '            HTTP_METHOD,"POST",\n';
    vendorHtml += '            HTTP_MIMETYPE,"application/x-www-form-urlencoded",\n';
    vendorHtml += '            HTTP_BODY_MAXLENGTH,16384,\n';
    vendorHtml += '            HTTP_VERIFY_CERT,verifyCert(),\n';
    vendorHtml += '            HTTP_CUSTOM_HEADER,"x-opensim-store-id",storeID,\n';
    vendorHtml += '            HTTP_CUSTOM_HEADER,"x-opensim-owner-home-url", osGetAvatarHomeURI(llGetOwner()),\n';
    vendorHtml += '            HTTP_CUSTOM_HEADER,"x-opensim-object-host-url", osGetGridHomeURI()\n';
    vendorHtml += '        ], \n';
    vendorHtml += '        formData );\n';
    vendorHtml += '}\n\n';

    vendorHtml += 'default{\n\n';

    vendorHtml += '    state_entry(){\n';
    vendorHtml += '        authorization("check"); \n';
    vendorHtml += '    }\n\n';

    vendorHtml += '    touch_start(integer a){\n';
    vendorHtml += '        if(llDetectedKey(0) == llGetOwner()){\n';
    vendorHtml += '            channel = ((integer)llFrand(123456.0) +1) * -1;\n';
    vendorHtml += '            CListener = llListen( channel, "", "", "");\n';
    vendorHtml += '            avatar = llGetOwner();\n';
    vendorHtml += '            active = TRUE;\n';
    vendorHtml += '            isStartupChek = FALSE;\n';
    vendorHtml += '            authorization("check");\n';
    vendorHtml += '        }\n';
    vendorHtml += '        else{\n';
    vendorHtml += '            llInstantMessage(llDetectedKey(0),"You are not the owner of this item!");\n';
    vendorHtml += '        }\n';
    vendorHtml += '    }\n\n';

    vendorHtml += '    listen(integer channel, string name, key id, string Box){\n';
    vendorHtml += '        if(active && avatar == llGetOwner() && Box == "Register"){\n';
    vendorHtml += '           authorization("register");\n';
    vendorHtml += '        }\n';
    vendorHtml += '    }\n\n';

    vendorHtml += '    http_response(key id, integer status, list metaData, string Response){\n';
    vendorHtml += '        if(status == 200 ){\n';
    vendorHtml += '            if(id == authorizationRequest_id){\n';
    vendorHtml += '                if(osStringIndexOf(Response,"ospError",0) == -1){\n';
    vendorHtml += '                    string authStatus = llJsonGetValue(Response,["status"]);\n';
    vendorHtml += '                    string authorized = llJsonGetValue(Response,["authorized"]);\n';
    vendorHtml += '                    if(authStatus == "registred" && authorized == "True"){\n';
    vendorHtml += '                        isAuthorized = TRUE;\n';
    vendorHtml += '                        reset();\n';
    vendorHtml += '                        state authorized;\n';
    vendorHtml += '                    }\n';
    vendorHtml += '                    else if(authStatus == "registred" && authorized == "False"){\n';
    vendorHtml += '                        isAuthorized = FALSE;\n';
    vendorHtml += '                        llSetText("Out Of Service\\nMissing Authorization",<1,0,0>,1.0);\n';
    vendorHtml += '                        if(active && avatar == llGetOwner() && !isStartupChek){\n';
    vendorHtml += '                            llLoadURL(llGetOwner(),"\\nThis object is registred and waiting your authorization.\\n\\nPlease open this page and authorize this object. When done, click this object again to enable it...", BTCPayServerURL + "/stores/" + storeID + "/plugins/opensim");\n';
    vendorHtml += '                            active = FALSE;\n';
    vendorHtml += '                            llSetTimerEvent(5);\n';
    vendorHtml += '                        }\n';
    vendorHtml += '                    }\n';
    vendorHtml += '                    else if(authStatus == "success" && authorized == "False"){\n';
    vendorHtml += '                        isAuthorized = FALSE;\n';
    vendorHtml += '                        llSetText("Out Of Service\\nMissing Authorization",<1,0,0>,1.0);\n';
    vendorHtml += '                        if(active && avatar == llGetOwner() && !isStartupChek){\n';
    vendorHtml += '                            llLoadURL(llGetOwner(),"\\nThis object is registred and waiting your authorization.\\n\\nPlease open this page and authorize this object. When done, click this object again to enable it...", BTCPayServerURL + "/stores/" + storeID + "/plugins/opensim");\n';
    vendorHtml += '                            active = FALSE;\n';
    vendorHtml += '                            llSetTimerEvent(5);\n';
    vendorHtml += '                        }\n';
    vendorHtml += '                    }\n';
    vendorHtml += '                    else if(authStatus == "unknown"){\n';
    vendorHtml += '                        isAuthorized = FALSE;\n';
    vendorHtml += '                        llSetText("Out Of Service\\nUnknown Object",<1,0,0>,1.0);\n';
    vendorHtml += '                        if(active && avatar == llGetOwner() && !isStartupChek){\n';
    vendorHtml += '                            llDialog(llGetOwner(),"\\nThis object is not linked to your BTCPay store yet!\\n\\nPlease, click [Register] to start the linking and authorization process...",["Register","Cancel"],channel);\n';
    vendorHtml += '                        }\n';
    vendorHtml += '                    }\n';
    vendorHtml += '                    else if(active && authStatus == "fail" && authorized == "False"){\n';
    vendorHtml += '                        isAuthorized = FALSE;\n';
    vendorHtml += '                        llSetText("Out Of Service\\nFatal Error",<1,0,0>,1.0);\n';
    vendorHtml += '                        if(avatar == llGetOwner() && !isStartupChek){\n';
    vendorHtml += '                            llLoadURL(llGetOwner(),"\\nThis object failed to register!\\n\\nPlease open this page and investigate the problem and try again...", BTCPayServerURL + "/stores/" + storeID + "/plugins/opensim");\n';
    vendorHtml += '                        }\n';
    vendorHtml += '                    }\n';
    vendorHtml += '                }\n';
    vendorHtml += '                else{\n';
    vendorHtml += '                    llSetText("Out Of Service\\nFatal Error",<1,0,0>,1.0);\n';
    vendorHtml += '                    llOwnerSay("\\nError: \\n" + llJsonGetValue(Response,["ospError"]));\n';
    vendorHtml += '                }\n';
    vendorHtml += '            }\n';
    vendorHtml += '        }\n';
    vendorHtml += '    }\n\n';

    vendorHtml += '    timer(){\n';
    vendorHtml += '        if(!active && monitorCount < 12){\n';
    vendorHtml += '            authorization("check");\n';
    vendorHtml += '            monitorCount++;\n';
    vendorHtml += '        }\n';
    vendorHtml += '        else if(monitorCount >= 12){\n';
    vendorHtml += '            llSetTimerEvent(0);\n';
    vendorHtml += '        }\n';
    vendorHtml += '    }\n';
    vendorHtml += '}\n\n';

    vendorHtml += 'state authorized{\n\n';

    vendorHtml += '    state_entry(){\n';
    vendorHtml += '        if((float)price <= 0){\n';
    vendorHtml += '            isOutOfService = TRUE;\n';
    vendorHtml += '            llOwnerSay("\\nPrice must be greater than "+(float)0+".");\n';
    vendorHtml += '            reset();\n';
    vendorHtml += '        }\n';
    vendorHtml += '       productName = llGetInventoryName(INVENTORY_OBJECT,0);\n';
    vendorHtml += '       if(productName == ""){\n';
    vendorHtml += '           isOutOfService = TRUE;\n';
    vendorHtml += '           llOwnerSay("\\nMissing item to sell!.\\nPlease place an item to sell inside the content of this object.");\n';
    vendorHtml += '            reset();\n';
    vendorHtml += '        }\n';
    vendorHtml += '        else{\n';
    vendorHtml += '            if(showHoverText){\n';
    vendorHtml += '            llSetText(productName +" Vendor\\nPowered By BTCPay Server\\n>>> Click To Buy <<<\\nPrice: "+ price +" "+ currency+"\\nPayment With: "+defaultPaymentMethod,<1,1,0>, 1.0);\n';
    vendorHtml += '            }\n';
    vendorHtml += '            else{\n';
    vendorHtml += '                llSetText("",<1,1,0>, 1.0);\n';
    vendorHtml += '            }\n';
    vendorHtml += '        }\n';
    vendorHtml += '        if (productDescription == ""){\n';
    vendorHtml += '            productDescription = llGetObjectDesc();\n';
    vendorHtml += '        }\n';
    vendorHtml += '    }\n\n';

    vendorHtml += '    changed(integer change){\n';
    vendorHtml += '        productName = "";\n';
    vendorHtml += '        productName = llGetInventoryName(INVENTORY_OBJECT,0);\n';
    vendorHtml += '        if(productName == ""){\n';
    vendorHtml += '           isOutOfService = TRUE;\n';
    vendorHtml += '           llOwnerSay("\\nMissing item to sell!.\\nPlease place an item to sell inside the content of this object.");\n';
    vendorHtml += '           reset();\n';
    vendorHtml += '        }\n';
    vendorHtml += '        else if(showHoverText){\n';
    vendorHtml += '           llSetText(productName +" Vendor\\nPowered By BTCPay Server\\n>>> Click To Buy <<<\\nPrice: "+ price +" "+ currency+"\\nPayment With: "+defaultPaymentMethod,<1,1,0>, 1.0);\n';
    vendorHtml += '        }\n';
    vendorHtml += '        else{\n';
    vendorHtml += '           llSetText("",<1,1,0>, 1.0);\n';
    vendorHtml += '        }\n';
    vendorHtml += '    }\n\n';

    vendorHtml += '    touch_start(integer n){\n';
    vendorHtml += '        channel = ((integer)llFrand(123456.0) +1) * -1;\n';
    vendorHtml += '        CListener = llListen( channel, "", "", "");\n';
    vendorHtml += '        productName = llGetInventoryName(INVENTORY_OBJECT,0);\n';
    vendorHtml += '        if((float)price <= 0){\n';
    vendorHtml += '            isOutOfService = TRUE;\n';
    vendorHtml += '            llOwnerSay("\\nPrice must be greater than "+(float)0+".");\n';
    vendorHtml += '        }\n';
    vendorHtml += '        if(productName == ""){\n';
    vendorHtml += '           isOutOfService = TRUE;\n';
    vendorHtml += '           llOwnerSay("\\nMissing item to sell!.\\nPlease place an item to sell inside the content of this object.");\n';
    vendorHtml += '        }\n';
    vendorHtml += '        if(isOutOfService){\n';
    vendorHtml += '            if (llDetectedKey(0) == llGetOwner()){\n';
    vendorHtml += '                avatar = llGetOwner();\n';
    vendorHtml += '                llOwnerSay("\\nWarning: This vendor is OUT OF SERVICE!");\n';
    vendorHtml += '                llDialog(avatar,"\\nWarning: This Vendor is OUT OF SERVICE!\\n[Reset]: Click to make available.\\n[Log Error]: Click to view the saved error.\\n[Close]: Close this box without enabling the vendor.",["Reset","Log Error","Close"],channel);\n';
    vendorHtml += '            }\n';
    vendorHtml += '            llInstantMessage(llDetectedKey(0),"\\nWarning: This vendor is OUT OF SERVICE!\\nPlease contact "+ osKey2Name(llGetOwner())+" for support.");\n';
    vendorHtml += '        }\n';
    vendorHtml += '        else if(!isOutOfService){\n';
    vendorHtml += '            if(avatar == NULL_KEY){\n';
    vendorHtml += '                authorization("check");\n';
    vendorHtml += '                avatar = llDetectedKey(0);\n';
    vendorHtml += '                llInstantMessage(avatar, "\\nProduct Name:\\n" + productName + ".\\nPrice: "+ price +" "+ currency +".\\nPayment With: "+ defaultPaymentMethod +".\\n\\nProduct Description:\\n" + productDescription);\n';
    vendorHtml += '            }\n';
    vendorHtml += '            else if(avatar != llDetectedKey(0)){ \n';
    vendorHtml += '                llInstantMessage(llDetectedKey(0), "This device is in use!/nPlease wait...");\n';
    vendorHtml += '            }\n';
    vendorHtml += '            else if(active && avatar == llDetectedKey(0) && txStatus != ""){\n';
    vendorHtml += '                llInstantMessage(avatar, "\\nTransaction in progress in wait of your payment...");\n';
    vendorHtml += '                llLoadURL(avatar, "Click to open the payment page.\\nYour invoice ID is : "+ invoiceID +"\\nThank you for your purchase!", invoiceURL);\n';
    vendorHtml += '            }\n';
    vendorHtml += '        }\n';
    vendorHtml += '    }\n\n';

    vendorHtml += '    http_request(key id, string method, string body){\n';
    vendorHtml += '        if (id == IPNEndpointRequest_id && method == URL_REQUEST_GRANTED){\n';
    vendorHtml += '            IPNEndpointURL = body;\n';
    vendorHtml += '            llHTTPResponse(id, 200, "");\n';
    vendorHtml += '        }\n';
    vendorHtml += '        else if(llGetHTTPHeader(id, "x-remote-ip") == allowedHttpInIP && osStringIndexOf(llJsonGetValue(body,["url"]), BTCPayServerURL,0) > -1){\n';
    vendorHtml += '            string invoiceOrderId = llJsonGetValue(body, ["orderId"]);\n';
    vendorHtml += '            string invoiceId = llJsonGetValue(body, ["id"]);\n';
    vendorHtml += '            string invoiceStatus = llJsonGetValue(body, ["status"]);\n';
    vendorHtml += '            if (method == "POST" && invoiceOrderId == orderID &&  invoiceId == invoiceID){\n';
    vendorHtml += '                if(invoiceStatus == "expired" || invoiceStatus == "invalid"){\n';
    vendorHtml += '                    llInstantMessage(avatar, "Operation Fail!\\nInvoice ID: "+ invoiceID +" status is "+ invoiceStatus +".\\nPlease try again or contact "+ osKey2Name(llGetOwner()) +" and provide your invoice ID: \\n"+ invoiceID +"\\nif you did a payment.");\n';
    vendorHtml += '                    if(notifications){\n';
    vendorHtml += '                        llOwnerSay("\\nWarning: Invoice ID: "+ invoiceID +" expired!\\n"+ osKey2Name(avatar) +" did not pay in time...");\n';
    vendorHtml += '                    }\n';
    vendorHtml += '                    llHTTPResponse(id, 200, "");\n';
    vendorHtml += '                    reset();\n';
    vendorHtml += '                }\n';
    vendorHtml += '                else if(invoiceStatus == "paid"){\n';
    vendorHtml += '                    llSetText("Processing...\\nWaiting Peers Confirmation",<1,1,0>, 1.0);\n';
    vendorHtml += '                    llInstantMessage(avatar, "\\nThank you for your purchase.\\nInvoice ID: "+ invoiceID +" is paid and in wait of the usual confirmations.");\n';
    vendorHtml += '                    if(notifications){\n';
    vendorHtml += '                        llOwnerSay("\\n"+ osKey2Name(avatar) +" purchased "+ productName +" for "+ price +" "+ currency +"!\\nYou have recived: "+ llJsonGetValue(body, ["btcPrice"]) +" "+ defaultPaymentMethod +".\\nInvoice ID: "+ invoiceID +" Paid (waiting confirmations).");\n';
    vendorHtml += '                    }\n';
    vendorHtml += '                    txStatus = "paid";\n';
    vendorHtml += '                    llSetTimerEvent(60);\n';
    vendorHtml += '                    llHTTPResponse(id, 200, "");\n';
    vendorHtml += '                }\n';
    vendorHtml += '                else if(invoiceStatus == "confirmed" || invoiceStatus == "complete"){\n';
    vendorHtml += '                    llInstantMessage(avatar, "\\nThank you for your purchase!\\nInvoice ID: "+ invoiceID +" was fully paid and confirmed.");\n';
    vendorHtml += '                    llGiveInventory(avatar, productName);\n';
    vendorHtml += '                    if(notifications){\n';
    vendorHtml += '                        llOwnerSay("\\nInvoice ID: " + invoiceID +" Confirmed.");\n';
    vendorHtml += '                    }\n';
    vendorHtml += '                    llHTTPResponse(id, 200, "");\n';
    vendorHtml += '                    reset();\n';
    vendorHtml += '                }\n';
    vendorHtml += '            }\n';
    vendorHtml += '        }\n';
    vendorHtml += '        llHTTPResponse(id, 200, "");\n';
    vendorHtml += '    }\n\n';

    vendorHtml += '    http_response(key id, integer status, list metaData, string Response){\n';
    vendorHtml += '        if(status == 200 ){\n';
    vendorHtml += '            if(id == authorizationRequest_id){\n';
    vendorHtml += '                if(osStringIndexOf(Response,"ospError",0) == -1){\n';
    vendorHtml += '                    string authStatus = llJsonGetValue(Response,["status"]);\n';
    vendorHtml += '                    string authorized = llJsonGetValue(Response,["authorized"]);\n';
    vendorHtml += '                    if(authStatus == "unknown" || authorized == "False"){\n';
    vendorHtml += '                        isAuthorized = FALSE;\n';
    vendorHtml += '                        reset();\n';
    vendorHtml += '                        state default;\n';
    vendorHtml += '                    }\n';
    vendorHtml += '                    else if(authStatus == "registred" && authorized == "True"){\n';
    vendorHtml += '                        isAuthorized = TRUE;\n';
    vendorHtml += '                        llDialog(avatar,"\\nThank you for purchasing: "+ productName +".\\n\\nProduct Description:\\n"+ productDescription +"\\nPrice: "+ price +" "+ currency +"\\n\\nPlease click [Buy] to confirm, click [Close] to cancel or [Infos] for more informations.\\n the amount of " + defaultPaymentMethod +" to send will be automatically calculated and displayed on the invoice box.",["Buy","Close"],channel);\n';
    vendorHtml += '                        IPNEndpointRequest_id = llRequestURL();\n';
    vendorHtml += '                        orderID = "sale_"+ (string)llGenerateKey();\n';
    vendorHtml += '                        active = TRUE;\n';
    vendorHtml += '                        llSetText("Processing...",<1,1,0>, 1.0);\n';
    vendorHtml += '                        txStatus = "new";\n';
    vendorHtml += '                        llSetTimerEvent(120);\n';
    vendorHtml += '                    }\n';
    vendorHtml += '                }\n';
    vendorHtml += '                else{\n';
    vendorHtml += '                    isOutOfService = TRUE;\n';
    vendorHtml += '                    llOwnerSay("\\nError:\\n" + llJsonGetValue(Response,["ospError"]));\n';
    vendorHtml += '                    errorLog = Response;\n';
    vendorHtml += '                    reset();\n';
    vendorHtml += '                }\n';
    vendorHtml += '            }\n';
    vendorHtml += '            else if (id == requestRates_id){\n';
    vendorHtml += '                string rateJson = llJsonGetValue(Response, [0]);\n';
    vendorHtml += '                if(rateJson != emptyJson){\n';
    vendorHtml += '                    string currencyName = llJsonGetValue(rateJson, ["name"]);\n';
    vendorHtml += '                    string rate =  llJsonGetValue(rateJson, ["rate"]);\n';
    vendorHtml += '                    float cryptoAmount = (float)price / (float)rate;\n';
    vendorHtml += '                    llDialog(avatar,"\\nThank you for purchase!\\nThe price " + price +" "+ currencyName +"s at the current rate of " + rate +" "+ currency +" per "+ defaultPaymentMethod +", this do ~"+ (string)cryptoAmount + " " + defaultPaymentMethod +".\\n\\nDo you have enough coins in your wallet ?",["Yes","Close"],channel);\n';
    vendorHtml += '                }\n';
    vendorHtml += '                else{\n';
    vendorHtml += '                    llInstantMessage(avatar,"\\nThere is a problem with the BTCPay server: The rates data source is unavailable!.\\nPlease try again after some minutes...");\n';
    vendorHtml += '                    llOwnerSay("\\nDetected problem with BTCPay server!.\\nError:\\nRates data source is unavailable.\\nStatus :"+ status);\n';
    vendorHtml += '                    reset();            \n';
    vendorHtml += '                }            \n';
    vendorHtml += '            }\n';
    vendorHtml += '            else if(id == requestInvoice_id){\n';
    vendorHtml += '                if(osStringIndexOf(Response,"ospError",0) > -1 || osStringIndexOf(Response,"ERR_RATE_UNAVAILABLE",0) > -1){\n';
    vendorHtml += '                    llOwnerSay("\\nDetected problem with BTCPay server!. This vendor is OUT OF SERVICE.\\nError:\\n"+ llJsonGetValue(Response, ["ospError"]) +"\\nStatus :"+ status);\n';
    vendorHtml += '                    errorLog = Response;\n';
    vendorHtml += '                    llSetText("Out of Service !",<1,0,0>, 1.0);\n';
    vendorHtml += '                    isOutOfService = TRUE;\n';
    vendorHtml += '                    reset();\n';
    vendorHtml += '                }\n';
    vendorHtml += '                else{\n';
    vendorHtml += '                    invoiceID = llJsonGetValue(Response, ["invoiceId"]);\n';
    vendorHtml += '                    invoiceURL = llJsonGetValue(Response, ["invoiceUrl"]);\n';
    vendorHtml += '                    if(invoiceID != emptyJson && invoiceURL != emptyJson){\n';
    vendorHtml += '                        llLoadURL(avatar, "Click to open the payment page.\\nYour invoice ID is : "+ invoiceID +"\\nThank you for your purchase!", invoiceURL);\n';
    vendorHtml += '                        llSetText("Processing...\\nWaiting Your Payment",<1,1,0>, 1.0);\n';
    vendorHtml += '                    }\n';
    vendorHtml += '                    else{\n';
    vendorHtml += '                        llSetText("Out of Service !",<1,0,0>, 1.0);\n';
    vendorHtml += '                        isOutOfService = TRUE;\n';
    vendorHtml += '                        llOwnerSay("\\nDetected problem with BTCPay server!. This Tip-Jar is OUT OF SERVICE.\\nWarning: "+ Response +"\\nStatus :"+ status);\n';
    vendorHtml += '                        errorLog = Response;\n';
    vendorHtml += '                        reset();\n';
    vendorHtml += '                    }\n';
    vendorHtml += '                }\n';
    vendorHtml += '            }\n';
    vendorHtml += '        }\n';
    vendorHtml += '    }\n\n';

    vendorHtml += '    listen(integer channel, string name, key id, string Box){\n';
    vendorHtml += '        if (Box == "Close"){ reset();}\n';
    vendorHtml += '        else if (!isOutOfService && Box == "Buy"){\n';
    vendorHtml += '            if (currency != defaultPaymentMethod){\n';
    vendorHtml += '                requestCurrentRate();   \n';
    vendorHtml += '            }\n';
    vendorHtml += '            else{\n';
    vendorHtml += '                requestInvoice();\n';
    vendorHtml += '            }\n';
    vendorHtml += '        }\n';
    vendorHtml += '        else if (!isOutOfService && Box == "Yes"){\n';
    vendorHtml += '            requestInvoice();\n';
    vendorHtml += '        }\n';
    vendorHtml += '        else if(Box == "Reset" && isOutOfService && avatar == llGetOwner()){\n';
    vendorHtml += '            if((float)price <= 0){\n';
    vendorHtml += '                isOutOfService = TRUE;\n';
    vendorHtml += '                llOwnerSay("\\nError:\\nPrice must be greater than "+(float)0);\n';
    vendorHtml += '                llDialog(avatar,"\\nWarning: This Vendor is OUT OF SERVICE!\\nPrice must be greater than "+(float)0+".\\n[Reset]: Click to make available.\\n[Log Error]: Click to view the saved error.\\n[Close]: Close this box without enabling the vendor.",["Reset","Log Error","Close"],channel);\n';
    vendorHtml += '            }\n';
    vendorHtml += '            else if(productName == ""){\n';
    vendorHtml += '                isOutOfService = TRUE;\n';
    vendorHtml += '                llOwnerSay("\\nError:\\nMissing item to sell!.\\nPlease place an item to sell inside the content of this object.");\n';
    vendorHtml += '                llDialog(avatar,"\\nWarning: This Vendor is OUT OF SERVICE!\\n[Reset]: Click to make available.\\n[Log Error]: Click to view the saved error.\\n[Close]: Close this box without enabling the vendor.",["Reset","Log Error","Close"],channel);\n';
    vendorHtml += '            }\n';
    vendorHtml += '            else if(isOutOfService){\n';
    vendorHtml += '                isOutOfService = FALSE;\n';
    vendorHtml += '                reset();\n';
    vendorHtml += '            }\n';
    vendorHtml += '        }\n';
    vendorHtml += '        else if(Box == "Log Error" && avatar == llGetOwner()){\n';
    vendorHtml += '            if(errorLog == ""){\n';
    vendorHtml += '                llOwnerSay("No errors to log");\n';
    vendorHtml += '            }\n';
    vendorHtml += '            else{\n';
    vendorHtml += '                llOwnerSay(errorLog);\n';
    vendorHtml += '            }\n';
    vendorHtml += '        }\n';
    vendorHtml += '    }\n\n';

    vendorHtml += '    timer(){\n';
    vendorHtml += '        if(active && invoiceID == "" && txStatus == "new"){\n';
    vendorHtml += '            llInstantMessage(avatar,"\\nOperation timeout!\\nPlease click the vendor again to retry.");\n';
    vendorHtml += '            reset();\n';
    vendorHtml += '        }\n';
    vendorHtml += '        else if(active && txStatus == "paid"){\n';
    vendorHtml += '            llInstantMessage(avatar,"\\nTransaction in progress...\\nWaiting peers confirmations.");\n';
    vendorHtml += '            llSetTimerEvent(60);\n';
    vendorHtml += '        }\n';
    vendorHtml += '    }\n';
    vendorHtml += '}\n';

    $("#priceCurrency").html($("#vDisplayCurrency").val());
    // Do not use .html(...) here or the script will not work inWorld!
    $("#vendorScriptCode").text(vendorHtml);
}
updateVendorScript();

$("#vDisplayCurrency, #vItemPrice, #vNotificationEmail, #vRedirectURL, #vCheckoutQueryString, #vChatNotification, #vDefaultPaymentMethod, #vShowHoverText").on("input", ()=>{
    $("#priceCurrency").html($("#vDisplayCurrency").val());
    if($("#vDefaultPaymentMethod").val() == ""){
        $("#vDefaultPaymentMethod").val(defaultPaymentMethod);
        updateVendorScript();
    }
    if($("#vItemPrice").val() == 0 || !$("#vItemPrice").val()){
        $("#vItemPrice").css("background-color","#f00");
    }
    else{
        $("#vItemPrice").css("background-color","#fff");
    }
    updateVendorScript();
});

function updateRentalBoxScript(){
    var rentalBoxHtml = '';
    rentalBoxHtml += '/* BTCPay Server Parcels Rental Script for OpenSimulator Plugin v0.1.1.\n\n';

    rentalBoxHtml += 'THIS SCRIPT IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n';
    rentalBoxHtml += 'IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, \n';
    rentalBoxHtml += 'FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n';
    rentalBoxHtml += 'AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n';
    rentalBoxHtml += 'LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n';
    rentalBoxHtml += 'OUT OF OR IN CONNECTION WITH THE SCRIPT OR THE USE OR OTHER DEALINGS IN THE SCRIPT.\n\n';

    rentalBoxHtml += 'By Adil El Farissi (aka: Web Rain inOSG) Under the same license as BTCPay. */\n\n';

    rentalBoxHtml += '/* Change the following to your BTCPay server instance URL and storeID. */\n';
    rentalBoxHtml += 'string BTCPayServerURL = "'+ window.location.origin +'";\n';
    rentalBoxHtml += 'string storeID = "'+ StoreId +'";\n\n';

    rentalBoxHtml += '/* Set your BTCPay server\'s IP address.\n(Accept the incoming notifications only from this IP) */\n';
    rentalBoxHtml += 'string allowedHttpInIP = "'+ IP +'";\n\n';

    rentalBoxHtml += '/* Set the parcel X and Y position (Z is not important). You can get this values\n';
    rentalBoxHtml += 'by placing your avatar in the center of the parcel and select/copy the position\n';
    rentalBoxHtml += 'from the address bar in the top side of your viewer and replace () by <>*/\n';
    rentalBoxHtml += 'vector parcelPosition = <'+ $("#rbParcelPosition-x").val() +', '+ $("#rbParcelPosition-y").val() +', 21.0>;\n\n';

    rentalBoxHtml += '/* Set the parcel or estate name. If empty, will display the region name. */\n';
    rentalBoxHtml += 'string parcelName = "";\n\n';

    rentalBoxHtml += '/* Set some words to describe your services and options in the purchase blue box. */\n';
    rentalBoxHtml += 'string parcelDescription = "";\n\n';

    rentalBoxHtml += '/* Set the fiat or crypto currency to display eg, USD or LTC... if set to the same as \n';
    rentalBoxHtml += 'defaultPaymentMethod, the invoice will be in cryptos only. */\n';
    rentalBoxHtml += 'string currency = "'+ $("#rbDisplayCurrency").val() +'";\n\n';

    rentalBoxHtml += '/* Set the parcel rental price in "currency" per month. */\n';
    rentalBoxHtml += 'string price = "'+ $("#rbRentalPrice").val() +'";\n\n';

    rentalBoxHtml += '/* The cryptocurrency code (ticker) of the crypto that you want to recive as \n';
    rentalBoxHtml += 'payment. This value depend on your BTCPay server settings and Altcoins \n';
    rentalBoxHtml += 'support... Default is Bitcoin "BTC", If your BTCPay instance support Litecoin \n';
    rentalBoxHtml += 'Dogecoin and Monero you can set "LTC" or "DOGE" or "XMR"... (Cryptos only here!)*/\n';
    rentalBoxHtml += 'string defaultPaymentMethod = "'+ $("#rbDefaultPaymentMethod").val().trim().toUpperCase() +'";\n\n';

    rentalBoxHtml += '/* If you want to recive notifications by Email, set it here or leave empty.*/\n';
    rentalBoxHtml += 'string notificationEmail = "'+ $("#rbNotificationEmail").val().trim() +'";\n\n';

    rentalBoxHtml += '/* If you want to redirect your user to a webpage after a payment, set an URL \n';
    rentalBoxHtml += 'here or leave empty. You can add here some GET parameters to pass data to the \n';
    rentalBoxHtml += 'destination... eg, avatar name or UUID...*/\n';
    rentalBoxHtml += 'string redirectURL = "'+ $("#rbRedirectURL").val().trim() +'";\n\n';

    rentalBoxHtml += '/*Advanced Options: Specify additional query string parameters that should be \n';
    rentalBoxHtml += 'appended to the checkout page once the invoice is created. For example, \n';
    rentalBoxHtml += 'lang=da-DK would load the checkout page in Danish by default.*/ \n';
    rentalBoxHtml += 'string checkoutQueryString = "'+ $("#rbCheckoutQueryString").val().trim() +'";\n\n';

    rentalBoxHtml += '/* Default: TRUE. if set to TRUE will inform you if you when you recive payments in the chat.*/\n';
    rentalBoxHtml += 'integer notifications = '+ $("#rbChatNotification").val().trim() +';\n\n';

    
    rentalBoxHtml += '/*** The following don\'t need change ***/\n';
    rentalBoxHtml += 'key authorizationRequest_id = NULL_KEY;\n';
    rentalBoxHtml += 'key IPNEndpointRequest_id = NULL_KEY;\n';
    rentalBoxHtml += 'key requestInvoice_id = NULL_KEY;\n';
    rentalBoxHtml += 'key requestRates_id = NULL_KEY;\n';
    rentalBoxHtml += 'string IPNEndpointURL = "";\n';
    rentalBoxHtml += 'string orderID = ""; \n';
    rentalBoxHtml += 'key avatar = NULL_KEY;\n';
    rentalBoxHtml += 'key m_avatar = NULL_KEY;\n';
    rentalBoxHtml += 'integer active = FALSE;\n';
    rentalBoxHtml += 'string invoiceID = "";\n';
    rentalBoxHtml += 'string invoiceURL = "";\n';
    rentalBoxHtml += 'integer channel;\n';
    rentalBoxHtml += 'integer CListener;\n';
    rentalBoxHtml += 'integer isOutOfService = FALSE;\n';
    rentalBoxHtml += 'string errorLog = "";\n';
    rentalBoxHtml += 'string txStatus = "";\n';
    rentalBoxHtml += 'integer expireAt = 0;\n';
    rentalBoxHtml += 'string periode = "";\n';
    rentalBoxHtml += 'list m_data = [];\n';
    rentalBoxHtml += 'integer rented = 0;\n';
    rentalBoxHtml += 'integer extend = FALSE;\n';
    rentalBoxHtml += 'integer dayInSeconds = 86400;\n';
    rentalBoxHtml += 'integer warned = FALSE;\n';
    rentalBoxHtml += 'integer warningTimes = 0;\n';
    rentalBoxHtml += 'string totalToPay = "0";\n';
    rentalBoxHtml += 'integer isAuthorized = FALSE;\n';
    rentalBoxHtml += 'integer isStartupChek = TRUE;\n';
    rentalBoxHtml += 'integer monitorCount = 0;\n';
    rentalBoxHtml += 'string emptyJson = llJsonGetValue("{}",["-"]);\n\n';

    rentalBoxHtml += 'reset(){\n';
    rentalBoxHtml += '    requestInvoice_id = NULL_KEY;\n';
    rentalBoxHtml += '    IPNEndpointRequest_id = NULL_KEY;\n';
    rentalBoxHtml += '    orderID = ""; \n';
    rentalBoxHtml += '    avatar = NULL_KEY;\n';
    rentalBoxHtml += '    active = FALSE;\n';
    rentalBoxHtml += '    invoiceID = "";\n';
    rentalBoxHtml += '    invoiceURL = "";\n';
    rentalBoxHtml += '    txStatus = "";\n';
    rentalBoxHtml += '    llReleaseURL(IPNEndpointURL);\n';
    rentalBoxHtml += '    IPNEndpointURL = "";\n';
    rentalBoxHtml += '    llListenRemove(CListener);\n';
    rentalBoxHtml += '    llSetTimerEvent(0);\n';
    rentalBoxHtml += '    if(isOutOfService){\n';
    rentalBoxHtml += '        llSetText("Out Of Service!",<1,0,0>, 1.0);\n';
    rentalBoxHtml += '    }\n';
    rentalBoxHtml += '    else if(!isOutOfService && rented == 0 ){\n';
    rentalBoxHtml += '        llSetText(parcelName +" Rental Box\\nPowered By BTCPay Server\\n>>> Click To Rent <<<\\nPrice: "+ price +" "+ currency+" Per Month\\nPayment With: "+defaultPaymentMethod,<1,1,0>, 1.0);\n';
    rentalBoxHtml += '    }\n';
    rentalBoxHtml += '    else if(!isOutOfService && rented == 1){\n';
    rentalBoxHtml += '        llSetText("Owned By:\\n"+ osKey2Name(m_avatar),<1,1,0>, 1.0);\n';
    rentalBoxHtml += '    }\n';
    rentalBoxHtml += '}\n\n';

    rentalBoxHtml += 'integer verifyCert(){\n';
    rentalBoxHtml += '    integer verify = TRUE;\n';
    rentalBoxHtml += '    if(osStringIndexOf(BTCPayServerURL,"https://127.0.0.1",0) > -1 || osStringIndexOf(BTCPayServerURL,"https://localhost",0) > -1){\n';
    rentalBoxHtml += '        verify = FALSE;\n';
    rentalBoxHtml += '    }\n';
    rentalBoxHtml += '    return verify;\n';
    rentalBoxHtml += '}\n\n';

    rentalBoxHtml += 'authorization(string action){\n';
    rentalBoxHtml += '    authorizationRequest_id = llHTTPRequest(\n';
    rentalBoxHtml += '        BTCPayServerURL+"/opensim/authorization",\n';
    rentalBoxHtml += '        [\n';
    rentalBoxHtml += '            HTTP_METHOD,"POST",\n';
    rentalBoxHtml += '            HTTP_MIMETYPE,"application/x-www-form-urlencoded",\n';
    rentalBoxHtml += '            HTTP_BODY_MAXLENGTH,16384,\n';
    rentalBoxHtml += '            HTTP_VERIFY_CERT,verifyCert(),\n';
    rentalBoxHtml += '            HTTP_CUSTOM_HEADER,"x-opensim-store-id",storeID,\n';
    rentalBoxHtml += '            HTTP_CUSTOM_HEADER,"x-opensim-owner-home-url", osGetAvatarHomeURI(llGetOwner()),\n';
    rentalBoxHtml += '            HTTP_CUSTOM_HEADER,"x-opensim-object-host-url", osGetGridHomeURI()\n';
    rentalBoxHtml += '        ],\n';
    rentalBoxHtml += '        "action=" + action );\n';
    rentalBoxHtml += '}\n\n';

    rentalBoxHtml += 'requestCurrentRate(){\n';
    rentalBoxHtml += '    requestRates_id = llHTTPRequest(\n';
    rentalBoxHtml += '        BTCPayServerURL +"/api/rates?storeId="+ storeID +"&currencyPairs="+ defaultPaymentMethod +"_"+ currency,\n';
    rentalBoxHtml += '        [\n';
    rentalBoxHtml += '            HTTP_METHOD,"GET",\n';
    rentalBoxHtml += '            HTTP_MIMETYPE,"application/json",\n';
    rentalBoxHtml += '            HTTP_BODY_MAXLENGTH,16384,\n';
    rentalBoxHtml += '            HTTP_VERIFY_CERT,verifyCert()\n';
    rentalBoxHtml += '        ],"");\n';
    rentalBoxHtml += '}\n\n';

    rentalBoxHtml += 'requestInvoice(){\n';
    rentalBoxHtml += '    string formData = "";\n';
    rentalBoxHtml += '    formData += "storeId="+ storeID;\n';
    rentalBoxHtml += '    formData += "&price="+ totalToPay;\n';
    rentalBoxHtml += '    formData += "&currency="+ currency;\n';
    rentalBoxHtml += '    formData += "&defaultPaymentMethod="+ defaultPaymentMethod;\n';
    rentalBoxHtml += '    formData += "&orderId="+ orderID;\n';
    rentalBoxHtml += '    formData += "&checkoutDesc="+  llEscapeURL("Thank you "+ osKey2Name(avatar) +" for purchasing:"+ parcelName +".");\n';
    rentalBoxHtml += '    formData += "&serverIpn="+ llEscapeURL(IPNEndpointURL);   \n';
    rentalBoxHtml += '    if(redirectURL != ""){\n';
    rentalBoxHtml += '        formData += "&browserRedirect="+ llEscapeURL(redirectURL);\n';
    rentalBoxHtml += '    }\n';
    rentalBoxHtml += '    if(notificationEmail != ""){\n';
    rentalBoxHtml += '        formData += "&notifyEmail="+ llEscapeURL(notificationEmail);\n';
    rentalBoxHtml += '    }\n';
    rentalBoxHtml += '    if(checkoutQueryString != ""){\n';
    rentalBoxHtml += '        formData += "&checkoutQueryString="+ llEscapeURL(checkoutQueryString);\n';
    rentalBoxHtml += '    }\n';
    rentalBoxHtml += '    string posData = "{\n';
    rentalBoxHtml += '                    \'AppType\':\'Rental Box\',\n';
    rentalBoxHtml += '                    \'RenterName\':\'"+ osKey2Name(avatar) +"\',\n';
    rentalBoxHtml += '                    \'RenterUUID\':\'"+ (string)avatar +"\',\n';
    rentalBoxHtml += '                    \'ObjectName\':\'"+ llGetObjectName() +"\',\n';
    rentalBoxHtml += '                    \'ObjectUUID\':\'"+ llGetKey() +"\' \n';
    rentalBoxHtml += '                    }";\n';
    rentalBoxHtml += '    formData += "&posData=" +  llEscapeURL(posData);\n';
    rentalBoxHtml += '    \n';
    rentalBoxHtml += '    requestInvoice_id = llHTTPRequest(\n';
    rentalBoxHtml += '        BTCPayServerURL+"/opensim/invoices",\n';
    rentalBoxHtml += '        [\n';
    rentalBoxHtml += '          HTTP_METHOD,"POST",\n';
    rentalBoxHtml += '          HTTP_MIMETYPE,"application/x-www-form-urlencoded",\n';
    rentalBoxHtml += '          HTTP_BODY_MAXLENGTH,16384,\n';
    rentalBoxHtml += '          HTTP_VERIFY_CERT,verifyCert(),\n';
    rentalBoxHtml += '          HTTP_CUSTOM_HEADER,"x-opensim-store-id",storeID,\n';
    rentalBoxHtml += '          HTTP_CUSTOM_HEADER,"x-opensim-owner-home-url", osGetAvatarHomeURI(llGetOwner()),\n';
    rentalBoxHtml += '          HTTP_CUSTOM_HEADER,"x-opensim-object-host-url", osGetGridHomeURI()\n';
    rentalBoxHtml += '        ],\n';
    rentalBoxHtml += '        formData );\n';
    rentalBoxHtml += '}\n\n';

    rentalBoxHtml += 'showConfirmBox(){\n';
    rentalBoxHtml += '    string ext = "";\n';
    rentalBoxHtml += '    if(extend){\n';
    rentalBoxHtml += '        ext = "extend your rental of this parcel by a periode of";\n';
    rentalBoxHtml += '    }\n';
    rentalBoxHtml += '    else{\n';
    rentalBoxHtml += '        ext = "rent this parcel for a periode of";\n';
    rentalBoxHtml += '    }\n';
    rentalBoxHtml += '    llDialog(avatar,"\\nThank you for your rental.\\nPlease confirm that you want to "+ ext +" "+ periode +".\\nPrice: "+ totalToPay +" "+ currency, ["I Confirm","Close"], channel);\n';
    rentalBoxHtml += '}\n\n';

    rentalBoxHtml += 'string formatTime(integer time){\n';
    rentalBoxHtml += '    integer days = time / dayInSeconds; \n';
    rentalBoxHtml += '    integer curtime = (time / dayInSeconds) - (time % dayInSeconds); \n';
    rentalBoxHtml += '    integer hours = curtime / 3600; \n';
    rentalBoxHtml += '    integer minutes = (curtime % 3600) / 60; \n';
    rentalBoxHtml += '    integer seconds = curtime % 60; \n';
    rentalBoxHtml += '    return (string)llAbs(days) + " days, " + (string)llAbs(hours) + " hours, " + (string)llAbs(minutes) + " minutes, " + (string)llAbs(seconds) + " seconds"; \n';
    rentalBoxHtml += '}\n\n';

    rentalBoxHtml += 'saveData(){\n';
    rentalBoxHtml += '    m_data = [m_avatar,expireAt,rented];\n';
    rentalBoxHtml += '    llSetObjectDesc(llList2CSV(m_data));\n';
    rentalBoxHtml += '}\n\n';

    rentalBoxHtml += 'loadData(){\n';
    rentalBoxHtml += '    m_data = llCSV2List(llGetObjectDesc()); \n';
    rentalBoxHtml += '    m_avatar = llList2Key(m_data,0);\n';
    rentalBoxHtml += '    expireAt = (integer) llList2String(m_data,1);\n';
    rentalBoxHtml += '    rented = (integer) llList2String(m_data,2);\n';
    rentalBoxHtml += '}\n\n';

    rentalBoxHtml += 'default{\n\n';

    rentalBoxHtml += '    state_entry(){\n';
    rentalBoxHtml += '        authorization("check");\n';
    rentalBoxHtml += '        if(parcelName == ""){\n';
    rentalBoxHtml += '            parcelName = llList2String(llGetParcelDetails(parcelPosition,[PARCEL_DETAILS_NAME]),0);\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '    }\n\n';

    rentalBoxHtml += '    touch_start(integer a){\n';
    rentalBoxHtml += '        if(llDetectedKey(0) == llGetOwner()){\n';
    rentalBoxHtml += '            channel = ((integer)llFrand(123456.0) +1) * -1;\n';
    rentalBoxHtml += '            CListener = llListen( channel, "", "", "");\n';
    rentalBoxHtml += '            avatar = llGetOwner();\n';
    rentalBoxHtml += '            active = TRUE;\n';
    rentalBoxHtml += '            isStartupChek = FALSE;\n';
    rentalBoxHtml += '            authorization("check");\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else{\n';
    rentalBoxHtml += '            llInstantMessage(llDetectedKey(0),"You are not the owner of this item!");\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '    }\n\n';

    rentalBoxHtml += '    listen(integer channel, string name, key id, string Box){\n';
    rentalBoxHtml += '        if(active && avatar == llGetOwner() && Box == "Register"){\n';
    rentalBoxHtml += '           authorization("register");\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '    }\n\n';

    rentalBoxHtml += '    http_response(key id, integer status, list metaData, string Response){\n';
    rentalBoxHtml += '        if(status == 200 ){\n';
    rentalBoxHtml += '            if(id == authorizationRequest_id){\n';
    rentalBoxHtml += '                if(osStringIndexOf(Response,"ospError",0) == -1){\n';
    rentalBoxHtml += '                    string authStatus = llJsonGetValue(Response,["status"]);\n';
    rentalBoxHtml += '                    string authorized = llJsonGetValue(Response,["authorized"]);\n';
    rentalBoxHtml += '                    if(authStatus == "registred" && authorized == "True"){\n';
    rentalBoxHtml += '                        isAuthorized = TRUE;\n';
    rentalBoxHtml += '                        reset();\n';
    rentalBoxHtml += '                        state authorized;\n';
    rentalBoxHtml += '                    }\n';
    rentalBoxHtml += '                    else if(authStatus == "registred" && authorized == "False"){\n';
    rentalBoxHtml += '                        isAuthorized = FALSE;\n';
    rentalBoxHtml += '                        llSetText("Out Of Service\\nMissing Authorization",<1,0,0>,1.0);\n';
    rentalBoxHtml += '                        if(active && avatar == llGetOwner() && !isStartupChek){\n';
    rentalBoxHtml += '                            llLoadURL(llGetOwner(),"\\nThis object is registred and waiting your authorization.\\n\\nPlease open this page and authorize this object. When done, click this object again to enable it...", BTCPayServerURL + "/stores/" + storeID + "/plugins/opensim");\n';
    rentalBoxHtml += '                            active = FALSE;\n';
    rentalBoxHtml += '                            llSetTimerEvent(5);\n';
    rentalBoxHtml += '                        }\n';
    rentalBoxHtml += '                    }\n';
    rentalBoxHtml += '                    else if(authStatus == "success" && authorized == "False"){\n';
    rentalBoxHtml += '                        isAuthorized = FALSE;\n';
    rentalBoxHtml += '                        llSetText("Out Of Service\\nMissing Authorization",<1,0,0>,1.0);\n';
    rentalBoxHtml += '                        if(active && avatar == llGetOwner() && !isStartupChek){\n';
    rentalBoxHtml += '                            llLoadURL(llGetOwner(),"\\nThis object is registred and waiting your authorization.\\n\\nPlease open this page and authorize this object. When done, click this object again to enable it...", BTCPayServerURL + "/stores/" + storeID + "/plugins/opensim");\n';
    rentalBoxHtml += '                            active = FALSE;\n';
    rentalBoxHtml += '                            llSetTimerEvent(5);\n';
    rentalBoxHtml += '                        }\n';
    rentalBoxHtml += '                    }\n';
    rentalBoxHtml += '                    else if(authStatus == "unknown"){\n';
    rentalBoxHtml += '                        isAuthorized = FALSE;\n';
    rentalBoxHtml += '                        llSetText("Out Of Service\\nUnknown Object",<1,0,0>,1.0);\n';
    rentalBoxHtml += '                        if(active && avatar == llGetOwner() && !isStartupChek){\n';
    rentalBoxHtml += '                            llDialog(llGetOwner(),"\\nThis object is not linked to your BTCPay store yet!\\n\\nPlease, click [Register] to start the linking and authorization process...",["Register","Cancel"],channel);\n';
    rentalBoxHtml += '                        }\n';
    rentalBoxHtml += '                    }\n';
    rentalBoxHtml += '                    else if(active && authStatus == "fail" && authorized == "False"){\n';
    rentalBoxHtml += '                        isAuthorized = FALSE;\n';
    rentalBoxHtml += '                        llSetText("Out Of Service\\nFatal Error",<1,0,0>,1.0);\n';
    rentalBoxHtml += '                        if(avatar == llGetOwner() && !isStartupChek){\n';
    rentalBoxHtml += '                            llLoadURL(llGetOwner(),"\\nThis object failed to register!\\n\\nPlease open this page and investigate the problem and try again...", BTCPayServerURL + "/stores/" + storeID + "/plugins/opensim");\n';
    rentalBoxHtml += '                        }\n';
    rentalBoxHtml += '                    }\n';
    rentalBoxHtml += '                }\n';
    rentalBoxHtml += '                else{\n';
    rentalBoxHtml += '                    llSetText("Out Of Service\\nFatal Error",<1,0,0>,1.0);\n';
    rentalBoxHtml += '                    llOwnerSay("\\nError: \\n" + llJsonGetValue(Response,["ospError"]));\n';
    rentalBoxHtml += '                }\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '    }\n\n';

    rentalBoxHtml += '    timer(){\n';
    rentalBoxHtml += '        if(!active && monitorCount < 12){\n';
    rentalBoxHtml += '            authorization("check");\n';
    rentalBoxHtml += '            monitorCount++;\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(monitorCount >= 12){\n';
    rentalBoxHtml += '            llSetTimerEvent(0);\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '    }\n';
    rentalBoxHtml += '}\n\n';

    rentalBoxHtml += 'state authorized{\n\n';

    rentalBoxHtml += '    state_entry(){\n';
    rentalBoxHtml += '        if(parcelName == ""){\n';
    rentalBoxHtml += '            parcelName = llList2String(llGetParcelDetails(parcelPosition,[PARCEL_DETAILS_NAME]),0);\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        if(extend){\n';
    rentalBoxHtml += '         llSetText("Processing...",<1,1,0>, 1.0);\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else{\n';
    rentalBoxHtml += '            llSetText(parcelName +" Rental Box\\nPowered By BTCPay Server\\n>>> Click To Rent <<<\\nPrice: "+ price +" "+ currency+" Per Month\\nPayment With: "+defaultPaymentMethod,<1,1,0>, 1.0);\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        if( llGetObjectDesc() == ""){  \n';
    rentalBoxHtml += '            saveData();\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else{\n';
    rentalBoxHtml += '            loadData();\n';
    rentalBoxHtml += '            if(rented == 0){\n';
    rentalBoxHtml += '                llSetText(parcelName +" Rental Box\\nPowered By BTCPay Server\\n>>> Click To Rent <<<\\nPrice: "+ price +" "+ currency+" Per Month\\nPayment With: "+defaultPaymentMethod,<1,1,0>, 1.0);\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            else if(!extend && rented == 1){\n';
    rentalBoxHtml += '                state rented;\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        if(llList2Key(llGetParcelDetails(parcelPosition,[PARCEL_DETAILS_OWNER]),0) == llGetOwner() && llGetParcelPrimCount(parcelPosition,0,FALSE) > 0){\n';
    rentalBoxHtml += '                llOwnerSay("\\nWarning:\\nParcel in "+ llGetRegionName()  + " @ " + (string)llGetPos() + " is not empty and may need a manual intervention...");\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        if(!isOutOfService && active && m_avatar != NULL_KEY && rented == 1 && extend){\n';
    rentalBoxHtml += '                avatar = m_avatar;\n';
    rentalBoxHtml += '                channel = (integer)(llFrand(123456.0) +1) * -1;\n';
    rentalBoxHtml += '                CListener = llListen( channel, "", "", "");\n';
    rentalBoxHtml += '                IPNEndpointRequest_id = llRequestURL();\n';
    rentalBoxHtml += '                orderID = (string)llGenerateKey();\n';
    rentalBoxHtml += '                llDialog(avatar,"\\nThank you for extending your rental.\\nPrice: "+ totalToPay +" "+ currency +" per month.\\n\\nPlease select a rental periode to start, click [Close] to cancel or [Infos] for more informations.\\n the amount of " + defaultPaymentMethod +" to send will be automatically calculated and displayed on the invoice page.",["1 Year","Infos","Close","1 Month","3 Months","6 Months"],channel);\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '    }\n\n';

    rentalBoxHtml += '    touch_start(integer n){\n';
    rentalBoxHtml += '        channel = (integer)(llFrand(123456.0) + 1) * -1;\n';
    rentalBoxHtml += '        CListener = llListen( channel, "", "", "");\n';
    rentalBoxHtml += '        if(isOutOfService){\n';
    rentalBoxHtml += '            if(llDetectedKey(0) == llGetOwner()){\n';
    rentalBoxHtml += '                avatar = llGetOwner();\n';
    rentalBoxHtml += '                llOwnerSay("\\nWarning: This rental box is OUT OF SERVICE!");\n';
    rentalBoxHtml += '                llDialog(avatar,"\\nWarning: This rental box is OUT OF SERVICE!\\n[Reset]: Click to make available.\\n[Log Error]: Click to view the saved error.\\n[Close]: Close this box without enabling the rental box.",["Reset","Log Error","Close"],channel);\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            llInstantMessage(llDetectedKey(0),"\\nWarning: This rental box is OUT OF SERVICE!\\nPlease contact "+ osKey2Name(llGetOwner())+" for support.");\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else{\n';
    rentalBoxHtml += '            if(avatar == NULL_KEY && rented == 0 && !extend){\n';
    rentalBoxHtml += '                avatar = llDetectedKey(0);\n';
    rentalBoxHtml += '                authorization("check");\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            else if(active && avatar != NULL_KEY && avatar != llDetectedKey(0)){ \n';
    rentalBoxHtml += '                llInstantMessage(llDetectedKey(0), "This device is in use!/nPlease wait...");\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            else if(active && avatar == llDetectedKey(0) && txStatus != ""){\n';
    rentalBoxHtml += '                llInstantMessage(avatar, "\\nTransaction in progress in wait of your payment...");\n';
    rentalBoxHtml += '                llLoadURL(avatar, "Click to open the payment page.\\nYour invoice ID is : "+ invoiceID +"\\nThank you for your purchase!", invoiceURL);\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '    }\n\n';

    rentalBoxHtml += '    http_request(key id, string method, string body){\n';
    rentalBoxHtml += '        if(id == IPNEndpointRequest_id && method == URL_REQUEST_GRANTED){\n';
    rentalBoxHtml += '            IPNEndpointURL = body;\n';
    rentalBoxHtml += '            llHTTPResponse(id, 200, "success");\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(llGetHTTPHeader(id, "x-remote-ip") == allowedHttpInIP && osStringIndexOf(llJsonGetValue(body,["url"]), BTCPayServerURL,0) > -1){\n';
    rentalBoxHtml += '            string invoiceOrderId = llJsonGetValue(body, ["orderId"]);\n';
    rentalBoxHtml += '            string invoiceId = llJsonGetValue(body, ["id"]);\n';
    rentalBoxHtml += '            string invoiceStatus = llJsonGetValue(body, ["status"]);\n';
    rentalBoxHtml += '            if(method == "POST" && invoiceOrderId == orderID &&  invoiceId == invoiceID){\n';
    rentalBoxHtml += '                if(invoiceStatus == "expired" || invoiceStatus == "invalid"){\n';
    rentalBoxHtml += '                    llInstantMessage(avatar, "Operation timeout!\\nInvoice ID: "+ invoiceID +" status is "+ invoiceStatus +".\\nPlease try again or contact "+ osKey2Name(llGetOwner()) +" and provide your invoice ID: \\n"+ invoiceID +"\\nif you did a payment.");\n';
    rentalBoxHtml += '                    if(notifications){\n';
    rentalBoxHtml += '                        llOwnerSay("\\nWarning: Invoice ID: "+ invoiceID +" expired!\\n"+ osKey2Name(avatar) +" did not pay in time...");\n';
    rentalBoxHtml += '                    }\n';
    rentalBoxHtml += '                    llHTTPResponse(id, 200, "success");\n';
    rentalBoxHtml += '                    reset();\n';
    rentalBoxHtml += '                }\n';
    rentalBoxHtml += '                else if(invoiceStatus == "paid"){\n';
    rentalBoxHtml += '                    llSetText("Processing...\\nWaiting Peers Confirmation",<1,1,0>, 1.0);\n';
    rentalBoxHtml += '                    llInstantMessage(avatar, "\\nThank you for your rental.\\nInvoice ID: "+ invoiceID +" is paid and in wait of the usual confirmations.");\n';
    rentalBoxHtml += '                    if(notifications){\n';
    rentalBoxHtml += '                        llOwnerSay("\\n"+ osKey2Name(avatar) +" rented "+ parcelName +" for "+ totalToPay +" "+ currency +"!\\nYou have recived: "+ llJsonGetValue(body, ["btcPrice"]) +" "+ defaultPaymentMethod +".\\nInvoice ID: "+ invoiceID +" Paid (waiting confirmations).");\n';
    rentalBoxHtml += '                    }\n';
    rentalBoxHtml += '                    txStatus = "paid";\n';
    rentalBoxHtml += '                    llSetTimerEvent(60);\n';
    rentalBoxHtml += '                    llHTTPResponse(id, 200, "success");\n';
    rentalBoxHtml += '                }\n';
    rentalBoxHtml += '                else if(invoiceStatus == "confirmed" || invoiceStatus == "complete"){\n';
    rentalBoxHtml += '                    llInstantMessage(avatar, "\\nThank you for your rental!\\nInvoice ID: "+ invoiceID +" was fully paid and confirmed.");\n';
    rentalBoxHtml += '                    m_avatar = avatar;\n';
    rentalBoxHtml += '                    rented = 1;\n';
    rentalBoxHtml += '                    saveData();\n';
    rentalBoxHtml += '                    if(!extend){\n';
    rentalBoxHtml += '                        osSetParcelDetails(parcelPosition,[PARCEL_DETAILS_OWNER,m_avatar]);\n';
    rentalBoxHtml += '                    }\n';
    rentalBoxHtml += '                    if(notifications){\n';
    rentalBoxHtml += '                        llOwnerSay("\\nInvoice ID: " + invoiceID +" Confirmed.");\n';
    rentalBoxHtml += '                        if(llList2Key(llGetParcelDetails(parcelPosition,[PARCEL_DETAILS_OWNER]),0) == m_avatar && !extend){\n';
    rentalBoxHtml += '                            llOwnerSay("\\nParcel: " + parcelName +" was successfully delivered to " +osKey2Name(m_avatar));\n';
    rentalBoxHtml += '                        }\n';
    rentalBoxHtml += '                    }\n';
    rentalBoxHtml += '                    llHTTPResponse(id, 200, "success");\n';
    rentalBoxHtml += '                    state rented;\n';
    rentalBoxHtml += '                }\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else{\n';
    rentalBoxHtml += '            llHTTPResponse(id, 403, "Access Denied!");\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '    }\n\n';

    rentalBoxHtml += '    http_response(key id, integer status, list metaData, string Response){\n';
    rentalBoxHtml += '        if(status == 200 ){\n';
    rentalBoxHtml += '            if(id == authorizationRequest_id){\n';
    rentalBoxHtml += '                if(osStringIndexOf(Response,"ospError",0) == -1){\n';
    rentalBoxHtml += '                    string authStatus = llJsonGetValue(Response,["status"]);\n';
    rentalBoxHtml += '                    string authorized = llJsonGetValue(Response,["authorized"]);\n';
    rentalBoxHtml += '                    if(authStatus == "unknown" || authorized == "False"){\n';
    rentalBoxHtml += '                        isAuthorized = FALSE;\n';
    rentalBoxHtml += '                        reset();\n';
    rentalBoxHtml += '                        state default;\n';
    rentalBoxHtml += '                    }\n';
    rentalBoxHtml += '                    else if(authStatus == "registred" && authorized == "True" && !isOutOfService && !active && avatar != NULL_KEY && invoiceID == "" && rented == 0 && !extend){\n';
    rentalBoxHtml += '                        isAuthorized = TRUE;\n';
    rentalBoxHtml += '                        llDialog(avatar,"\\nThank you for renting our parcel.\\nPrice: "+ price +" "+ currency +" per month.\\n\\nDescription: "+ parcelDescription +"\\n\\nPlease select a rental periode to start, click [Close] to cancel or [Infos] for more informations.\\nThe amount of " + defaultPaymentMethod +" to send will be automatically calculated and displayed on the invoice page.",["1 Year","Infos","Close","1 Month","3 Months","6 Months"],channel);\n';
    rentalBoxHtml += '                        IPNEndpointRequest_id = llRequestURL();\n';
    rentalBoxHtml += '                        orderID = "rental_"+ (string)llGenerateKey();\n';
    rentalBoxHtml += '                        active = TRUE;\n';
    rentalBoxHtml += '                        llSetText("Processing...",<1,1,0>, 1.0);\n';
    rentalBoxHtml += '                        txStatus = "new";\n';
    rentalBoxHtml += '                        llSetTimerEvent(120);\n';
    rentalBoxHtml += '                    }\n';
    rentalBoxHtml += '                }\n';
    rentalBoxHtml += '                else{\n';
    rentalBoxHtml += '                    isOutOfService = TRUE;\n';
    rentalBoxHtml += '                    llOwnerSay("\\nError:\\n" + llJsonGetValue(Response,["ospError"]));\n';
    rentalBoxHtml += '                    errorLog = Response;\n';
    rentalBoxHtml += '                    reset();\n';
    rentalBoxHtml += '                }\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            else if (id == requestRates_id){\n';
    rentalBoxHtml += '                string rateJson = llJsonGetValue(Response, [0]);\n';
    rentalBoxHtml += '                if(rateJson != emptyJson){\n';
    rentalBoxHtml += '                    string currencyName = llJsonGetValue(rateJson, ["name"]);\n';
    rentalBoxHtml += '                    string rate =  llJsonGetValue(rateJson, ["rate"]);\n';
    rentalBoxHtml += '                    float cryptoAmount = (float)totalToPay / (float)rate;\n';
    rentalBoxHtml += '                    string ext = "";\n';
    rentalBoxHtml += '                    if(extend){\n';
    rentalBoxHtml += '                        ext = "extend your rental of this parcel by a periode of";\n';
    rentalBoxHtml += '                    }\n';
    rentalBoxHtml += '                    else{\n';
    rentalBoxHtml += '                        ext = "rent this parcel for a periode of";\n';
    rentalBoxHtml += '                    }\n';
    rentalBoxHtml += '                    llDialog(avatar,"\\nThank you for your rental.\\nPlease confirm that you want to "+ ext +" "+ periode +".\\nPrice: "+ totalToPay +" "+ currencyName +"s at the current rate of " + rate +" "+ currency +" per "+ defaultPaymentMethod +", this do ~"+ (string)cryptoAmount + " " + defaultPaymentMethod +".\\n\\nDo you have enough coins in your wallet ?", ["I Confirm","Close"], channel);\n';
    rentalBoxHtml += '                }\n';
    rentalBoxHtml += '                else{\n';
    rentalBoxHtml += '                    llInstantMessage(avatar,"There is a problem with the BTCPay server: The rates data source is unavailable!.\\nPlease try again after some minutes...");\n';
    rentalBoxHtml += '                    llOwnerSay("\\nDetected problem with BTCPay server!.\\nError:\\nRates data source unavailable.\\nStatus :"+ status);\n';
    rentalBoxHtml += '                    if(extend){\n';
    rentalBoxHtml += '                        extend = FALSE;\n';
    rentalBoxHtml += '                        reset();\n';
    rentalBoxHtml += '                        state rented; \n';
    rentalBoxHtml += '                    }\n';
    rentalBoxHtml += '                    reset();          \n';
    rentalBoxHtml += '                }            \n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            if(id == requestInvoice_id){\n';
    rentalBoxHtml += '                invoiceID = llJsonGetValue(Response, ["invoiceId"]);\n';
    rentalBoxHtml += '                invoiceURL = llJsonGetValue(Response, ["invoiceUrl"]);\n';
    rentalBoxHtml += '                if(invoiceID == "" || invoiceURL == ""){\n';
    rentalBoxHtml += '                    llSetText("Out Of Service!",<1,0,0>, 1.0);\n';
    rentalBoxHtml += '                    isOutOfService = TRUE;\n';
    rentalBoxHtml += '                    llOwnerSay("\\nDetected problem with BTCPay server!. This rental box is OUT OF SERVICE.\\nWarning: Empty invoiceID or invoiceURL.\\nStatus :"+ status +"\\n"+ Response);\n';
    rentalBoxHtml += '                    errorLog = Response;\n';
    rentalBoxHtml += '                    reset();\n';
    rentalBoxHtml += '                }\n';
    rentalBoxHtml += '                else {\n';
    rentalBoxHtml += '                    llSetText("Processing...\\nWaiting Your Payment",<1,1,0>, 1.0);\n';
    rentalBoxHtml += '                    llLoadURL(avatar, "Click to open the payment page.\\nYour invoice ID is : "+ invoiceID +"\\nThank you for your purchase!", invoiceURL);\n';
    rentalBoxHtml += '                }\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '    }\n\n';

    rentalBoxHtml += '    listen(integer channel, string name, key id, string Box){\n';
    rentalBoxHtml += '        if(Box == "Close"){ \n';
    rentalBoxHtml += '            reset();\n';
    rentalBoxHtml += '            if(extend){\n';
    rentalBoxHtml += '                state rented;\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(Box == "1 Month"){\n';
    rentalBoxHtml += '            totalToPay = price;\n';
    rentalBoxHtml += '            periode = Box;\n';
    rentalBoxHtml += '            if(extend){\n';
    rentalBoxHtml += '                expireAt = expireAt + 2592000;\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            else{\n';
    rentalBoxHtml += '                expireAt = llGetUnixTime() + 2592000;\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            if (currency != defaultPaymentMethod){\n';
    rentalBoxHtml += '                requestCurrentRate();\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            else{\n';
    rentalBoxHtml += '                showConfirmBox();\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(Box == "3 Months"){\n';
    rentalBoxHtml += '            totalToPay = (string)((float)price * 3);\n';
    rentalBoxHtml += '            periode = Box;\n';
    rentalBoxHtml += '            if(extend){\n';
    rentalBoxHtml += '                expireAt = expireAt + 7776000;\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            else{\n';
    rentalBoxHtml += '                expireAt = llGetUnixTime() + 7776000;\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            if (currency != defaultPaymentMethod){\n';
    rentalBoxHtml += '                requestCurrentRate();\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            else{\n';
    rentalBoxHtml += '                showConfirmBox();\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(Box == "6 Months"){\n';
    rentalBoxHtml += '            totalToPay = (string)((float)price * 6);\n';
    rentalBoxHtml += '            periode = Box;\n';
    rentalBoxHtml += '            if(extend){\n';
    rentalBoxHtml += '                expireAt = expireAt + 15552000;\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            else{\n';
    rentalBoxHtml += '                expireAt = llGetUnixTime() + 15552000;\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            if (currency != defaultPaymentMethod){\n';
    rentalBoxHtml += '                requestCurrentRate();\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            else{\n';
    rentalBoxHtml += '                showConfirmBox();\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(Box == "1 Year"){\n';
    rentalBoxHtml += '            totalToPay = (string)((float)price * 12);\n';
    rentalBoxHtml += '            periode = Box;\n';
    rentalBoxHtml += '            if(extend){\n';
    rentalBoxHtml += '                expireAt = expireAt + 31104000;\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            else{\n';
    rentalBoxHtml += '                expireAt = llGetUnixTime() + 31104000;\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            if (currency != defaultPaymentMethod){\n';
    rentalBoxHtml += '                requestCurrentRate();\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            else{\n';
    rentalBoxHtml += '                showConfirmBox();\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(Box == "Infos"){\n';
    rentalBoxHtml += '            llGiveInventory(avatar, "Rental Infos And Guide");\n';
    rentalBoxHtml += '            reset();\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(Box == "I Confirm"){\n';
    rentalBoxHtml += '        requestInvoice();\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(Box == "Reset" && isOutOfService && avatar == llGetOwner()){\n';
    rentalBoxHtml += '            isOutOfService = FALSE;\n';
    rentalBoxHtml += '            reset();\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(Box == "Log Error" && avatar == llGetOwner()){\n';
    rentalBoxHtml += '            if(errorLog == ""){\n';
    rentalBoxHtml += '                llOwnerSay("No errors to log");\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            else{\n';
    rentalBoxHtml += '                llOwnerSay(errorLog);\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '    }\n\n';

    rentalBoxHtml += '    timer(){\n';
    rentalBoxHtml += '        if(active && invoiceID == "" && txStatus == "new"){\n';
    rentalBoxHtml += '            llInstantMessage(avatar,"\\nOperation timeout!\\nPlease click the rental box again to retry.");\n';
    rentalBoxHtml += '            reset();\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(active && txStatus == "paid"){\n';
    rentalBoxHtml += '            llInstantMessage(avatar,"\\nTransaction in progress...\\nWaiting peers confirmations.");\n';
    rentalBoxHtml += '            llSetTimerEvent(60);\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '    }\n';
    rentalBoxHtml += '}\n\n';

    rentalBoxHtml += 'state rented{\n\n';

    rentalBoxHtml += '    state_entry(){\n';
    rentalBoxHtml += '        loadData();\n';
    rentalBoxHtml += '        llSetText("Owned By:\\n"+ osKey2Name(m_avatar),<1,1,0>, 1.0);\n';
    rentalBoxHtml += '        llSetTimerEvent(3600);\n';
    rentalBoxHtml += '        if(active && !extend && rented == 1){\n';
    rentalBoxHtml += '            llInstantMessage (m_avatar,"\\nYour rental was succefully started.\\n\\nYou can setup and use your parcel starting from now!\\nPlease read the Security Settings notecard and apply the recommanded setting.\\n\\nWelcome to "+ llGetRegionName()+"\\nYour rental expire in:\\n"+ formatTime(expireAt - llGetUnixTime()));\n';
    rentalBoxHtml += '            llGiveInventory(m_avatar,"Security Settings");\n';
    rentalBoxHtml += '            reset();\n';
    rentalBoxHtml += '            llSetTimerEvent(3600);\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(active && extend && rented == 1){\n';
    rentalBoxHtml += '            llInstantMessage (m_avatar,"\\nYour rental was succefully extended.\\nYour rental expire in:\\n"+ formatTime(expireAt - llGetUnixTime()));\n';
    rentalBoxHtml += '            reset();\n';
    rentalBoxHtml += '            extend = FALSE;\n';
    rentalBoxHtml += '            llSetTimerEvent(3600);\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '    }\n\n';

    rentalBoxHtml += '    touch_start(integer a){\n';
    rentalBoxHtml += '        loadData();\n';
    rentalBoxHtml += '        channel = (integer)(llFrand(123456.0) + 1) * -1;\n';
    rentalBoxHtml += '        CListener = llListen( channel, "", "", "");\n';
    rentalBoxHtml += '        active = TRUE;\n';
    rentalBoxHtml += '        if(llDetectedKey(0) == llGetOwner()){\n';
    rentalBoxHtml += '            avatar = llGetOwner();\n';
    rentalBoxHtml += '            llDialog(llGetOwner(),"\\nRental Infos\\nRenter: "+ osKey2Name(m_avatar) +"\\nrental expire in:\\n"+ formatTime(expireAt - llGetUnixTime()),["Reset ","Extend","Close"],channel);\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(m_avatar != NULL_KEY && llDetectedKey(0) == m_avatar){\n';
    rentalBoxHtml += '            avatar = m_avatar;\n';
    rentalBoxHtml += '            llDialog(m_avatar,"\\nYour rental expire in:\\n"+ formatTime(expireAt - llGetUnixTime()) +"\\n\\nDo you want to extend your rental ?",["Extend","Close"],channel);\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if( llDetectedKey(0) != m_avatar || llDetectedKey(0) != llGetOwner()){\n';
    rentalBoxHtml += '            llInstantMessage(llDetectedKey(0),"\\nThis parcel is owned by "+ osKey2Name(m_avatar) +" for\\n"+ formatTime(expireAt - llGetUnixTime()));\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '    }\n\n';

    rentalBoxHtml += '    listen(integer channel, string name, key id, string Box){\n';
    rentalBoxHtml += '        if(Box == "Close"){\n';
    rentalBoxHtml += '            reset();\n';
    rentalBoxHtml += '            extend = FALSE;\n';
    rentalBoxHtml += '            llSetTimerEvent(3600);\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(Box == "Infos"){\n';
    rentalBoxHtml += '            llGiveInventory(avatar, "Rental Infos And Guide");\n';
    rentalBoxHtml += '            reset();\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(Box == "Extend" && avatar == m_avatar && avatar != llGetOwner()){\n';
    rentalBoxHtml += '            active = TRUE;\n';
    rentalBoxHtml += '            extend = TRUE;\n';
    rentalBoxHtml += '            totalToPay = price;\n';
    rentalBoxHtml += '            state authorized;\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(Box == "Extend" && avatar == llGetOwner()){\n';
    rentalBoxHtml += '            extend = TRUE;\n';
    rentalBoxHtml += '            llDialog(avatar,"\\nExtend this rental box time by...\\n",["1 Year","Infos","Close","1 Month","3 Months","6 Months"],channel);\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(Box != "" && avatar == llGetOwner() && extend){\n';
    rentalBoxHtml += '            if(Box == "1 Month"){\n';
    rentalBoxHtml += '                loadData();\n';
    rentalBoxHtml += '                llOwnerSay("\\nExtending expiration time by "+ Box +"! Old was in:\\n"+ formatTime(expireAt - llGetUnixTime()));\n';
    rentalBoxHtml += '                expireAt = expireAt + 2592000;\n';
    rentalBoxHtml += '                saveData();\n';
    rentalBoxHtml += '                llOwnerSay("\\nNew expiration time:\\n"+ formatTime(expireAt - llGetUnixTime()));\n';
    rentalBoxHtml += '                reset();\n';
    rentalBoxHtml += '                extend = FALSE;\n';
    rentalBoxHtml += '                llSetTimerEvent(3600);\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            else if(Box == "3 Months"){\n';
    rentalBoxHtml += '                loadData();\n';
    rentalBoxHtml += '                llOwnerSay("\\nExtending expiration time by "+ Box +"! Old was in:\\n"+ formatTime(expireAt - llGetUnixTime()));\n';
    rentalBoxHtml += '                expireAt = expireAt + 7776000;\n';
    rentalBoxHtml += '                saveData();\n';
    rentalBoxHtml += '                llOwnerSay("\\nNew expiration time:\\n"+ formatTime(expireAt - llGetUnixTime()));\n';
    rentalBoxHtml += '                reset();\n';
    rentalBoxHtml += '                extend = FALSE;\n';
    rentalBoxHtml += '                llSetTimerEvent(3600);\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            else if(Box == "6 Months"){\n';
    rentalBoxHtml += '                loadData();\n';
    rentalBoxHtml += '                llOwnerSay("\\nExtending expiration time by "+ Box +"! Old was in:\\n"+ formatTime(expireAt - llGetUnixTime()));\n';
    rentalBoxHtml += '                expireAt = expireAt + 15552000;\n';
    rentalBoxHtml += '                saveData();\n';
    rentalBoxHtml += '                llOwnerSay("\\nNew expiration time:\\n"+ formatTime(expireAt - llGetUnixTime()));\n';
    rentalBoxHtml += '                reset();\n';
    rentalBoxHtml += '                extend = FALSE;\n';
    rentalBoxHtml += '                llSetTimerEvent(3600);\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            else if(Box == "1 Year"){\n';
    rentalBoxHtml += '                loadData();\n';
    rentalBoxHtml += '                llOwnerSay("\\nExtending expiration time by "+ Box +"! Old was in:\\n"+ formatTime(expireAt - llGetUnixTime()));\n';
    rentalBoxHtml += '                expireAt = expireAt + 31104000;\n';
    rentalBoxHtml += '                saveData();\n';
    rentalBoxHtml += '                llOwnerSay("\\nNew expiration time:\\n"+ formatTime(expireAt - llGetUnixTime()));\n';
    rentalBoxHtml += '                reset();\n';
    rentalBoxHtml += '                extend = FALSE;\n';
    rentalBoxHtml += '                llSetTimerEvent(3600);\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(Box == "Confirm" && avatar == llGetOwner()){\n';
    rentalBoxHtml += '            loadData();\n';
    rentalBoxHtml += '            llOwnerSay("Old data for restoration\\n"+ llList2CSV(m_data));\n';
    rentalBoxHtml += '            llSetObjectDesc("");\n';
    rentalBoxHtml += '            reset();\n';
    rentalBoxHtml += '            osSetParcelDetails(parcelPosition,[PARCEL_DETAILS_OWNER,llGetOwner()]);\n';
    rentalBoxHtml += '            llResetScript();\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(Box == "Reset " && avatar == llGetOwner()){\n';
    rentalBoxHtml += '            llDialog(llGetOwner(),"\\nWARNING: Clicking [ Confirm ] will fully reset this rental box!\\n\\nDo you want to reset this rental box ?",["Confirm","Close"], channel);\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '    }\n\n';

    rentalBoxHtml += '    timer(){\n';
    rentalBoxHtml += '        loadData();\n';
    rentalBoxHtml += '        if(llGetUnixTime() < expireAt - dayInSeconds && !warned){\n';
    rentalBoxHtml += '            llInstantMessage(m_avatar,"\\nReminder:\\nYour rental in "+ llGetRegionName()  + " @ " + (string)llGetPos() + " will expire in:\\n"+ formatTime(expireAt - llGetUnixTime()));\n';
    rentalBoxHtml += '            warned = TRUE;\n';
    rentalBoxHtml += '            warningTimes = 1;\n';
    rentalBoxHtml += '            llSetTimerEvent(3600);\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(llGetUnixTime() < expireAt - (dayInSeconds / 2) && warned && warningTimes == 1){\n';
    rentalBoxHtml += '            llInstantMessage(m_avatar,"\\nReminder:\\nYour rental in "+ llGetRegionName()  + " @ " + (string)llGetPos() + " will expire in:\\n"+ formatTime(expireAt - llGetUnixTime()));\n';
    rentalBoxHtml += '            warningTimes = 2;\n';
    rentalBoxHtml += '            llSetTimerEvent(3600);\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '        else if(llGetUnixTime() >= expireAt && warned && warningTimes == 2){\n';
    rentalBoxHtml += '            llInstantMessage(m_avatar,"\\nWarning!:\\nYour rental in "+ llGetRegionName()  + " @ " + (string)llGetPos() + " expired!\\nYou still have 3 DAYS to renew your rental before the auto-return!");\n';
    rentalBoxHtml += '            llOwnerSay("\\nWarning!:\\nThe rental in "+ llGetRegionName()  + " @ " + (string)llGetPos() + " expired!");\n';
    rentalBoxHtml += '            llSetText("Owned By:\\n"+ osKey2Name(m_avatar) +"\\nExpired!",<1,0,0>, 1.0);\n';
    rentalBoxHtml += '            warningTimes = 3;\n';
    rentalBoxHtml += '            llSetTimerEvent(3600);\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '         else if(llGetUnixTime() >= expireAt + (dayInSeconds * 3) && warned && warningTimes == 3){\n';
    rentalBoxHtml += '            llInstantMessage(m_avatar,"\\nWarning!:\\nYour rental in "+ llGetRegionName()  + " @ " + (string)llGetPos() + " expired!\\nYour object will be auto-returned soon!/nSorry :(");\n';
    rentalBoxHtml += '            llOwnerSay("\\nWarning!:\\nThe rental in "+ llGetRegionName()  + " @ " + (string)llGetPos() + " passed 3 days after the expiration!\\nResetting this rental box...");\n';
    rentalBoxHtml += '            loadData();\n';
    rentalBoxHtml += '            llOwnerSay("Old data for restoration\\n"+ llList2CSV(m_data));\n';
    rentalBoxHtml += '            osSetParcelDetails(parcelPosition,[PARCEL_DETAILS_OWNER,llGetOwner()]);\n';
    rentalBoxHtml += '            if(llList2Key(llGetParcelDetails(parcelPosition,[PARCEL_DETAILS_OWNER]),0) == llGetOwner()){\n';
    rentalBoxHtml += '                llOwnerSay("Parcel in "+ llGetRegionName()  + " @ " + (string)llGetPos() + "was successfully reset and available to rent.");\n';
    rentalBoxHtml += '            }\n';
    rentalBoxHtml += '            llSetObjectDesc("");\n';
    rentalBoxHtml += '            reset();\n';
    rentalBoxHtml += '            state authorized;\n';
    rentalBoxHtml += '        }\n';
    rentalBoxHtml += '    }\n';
    rentalBoxHtml += '}\n';

    $("#rbPriceCurrency").html($("#rbDisplayCurrency").val());
    // Do not use .html(...) here or the script will not work inWorld!
    $("#rentalScriptCode").text(rentalBoxHtml);

}
updateRentalBoxScript();

$("#rbDisplayCurrency, #rbRentalPrice, #rbNotificationEmail, #rbRedirectURL, #rbCheckoutQueryString, #rbChatNotification, #rbDefaultPaymentMethod, #rbParcelPosition-x, #rbParcelPosition-y").on("input", ()=>{
    $("#rbPriceCurrency").html($("#rbDisplayCurrency").val());
    if($("#rbDefaultPaymentMethod").val() == ""){
        $("#rbDefaultPaymentMethod").val(defaultPaymentMethod);
        updateRentalBoxScript();
    }
    if($("#rbRentalPrice").val() == 0 || !$("#rbRentalPrice").val()){
        $("#rbRentalPrice").css("background-color","#f00");
    }
    else{
        $("#rbRentalPrice").css("background-color","#fff");
    }
    updateRentalBoxScript();
});

$(".doc-title").on("click", function(){
    $(".panel-collapse").removeClass("show");
    !$(this).attr("aria-expanded") ? $($(this).attr("href")).addClass("show") : $(".panel-collapse").removeClass("show");
});