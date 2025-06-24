using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BTCPayServer.Plugins.OpenSimulator.Data;
using BTCPayServer.Plugins.OpenSimulator.Models;
using Microsoft.EntityFrameworkCore;

namespace BTCPayServer.Plugins.OpenSimulator.Services;

public class OpenSimulatorService
{
    private readonly OpenSimulatorDbContextFactory _OpenSimDbContextFactory;

    public OpenSimulatorService(OpenSimulatorDbContextFactory OpenSimDbContextFactory)
    {
        _OpenSimDbContextFactory = OpenSimDbContextFactory;
    }

    public async Task <bool> AddNewObjectAuthorization(OpenSimAuthorizationData model)
    {
        await using var context = _OpenSimDbContextFactory.CreateContext();

        await context.Authorizations.AddAsync(new OpenSimulatorData { 
            StoreId = model.StoreId,
            AvatarName = model.AvatarName,
            AvatarId = model.AvatarId,
            AvatarHomeURL = model.AvatarHomeURL,
            ObjectName = model.ObjectName,
            ObjectId = model.ObjectId,
            ObjectRegion = model.ObjectRegion,
            ObjectLocation = model.ObjectLocation,
            ObjectURL = model.ObjectURL,
            ObjectAuthorization = false,
            Timestamp = DateTimeOffset.UtcNow,
            Secret = NBitcoin.RandomUtils.GetUInt256().ToString().Substring(0, 9) });
            var res = await context.SaveChangesAsync();
            if(res > 0){
                return true;
            }
            else{
                return false;
            }
            
    }

    public async Task <int> RemoveObjectAuthorization(OpenSimAuthorizationFormData model)
    {
        await using var context = _OpenSimDbContextFactory.CreateContext();
            var authorization = await context.FindAsync<OpenSimulatorData>(model.Id);
        if (authorization is not null)
            context.Remove(authorization);
            return await context.SaveChangesAsync();    
    }
    public async Task <int> AuthorizeObject(OpenSimAuthorizationFormData model)
    {
        
        await using var context = _OpenSimDbContextFactory.CreateContext();
        OpenSimulatorData osdModel = await context.Authorizations.Where(i => i.Id == model.Id && i.StoreId == model.StoreId && i.AvatarId == model.AvatarId && i.ObjectId == model.ObjectId).FirstOrDefaultAsync();
            if (string.IsNullOrEmpty(osdModel.Id))
        {
            return 0;
        }
         
        osdModel.ObjectAuthorization = true;
        osdModel.Timestamp = DateTimeOffset.UtcNow;
        context.Update(osdModel);
        return await context.SaveChangesAsync();    
    }

public async Task <int> UpdateSecret(OpenSimAuthorizationFormData model)
    {
        
        await using var context = _OpenSimDbContextFactory.CreateContext();
        OpenSimulatorData osdModel = await context.Authorizations.Where(i => i.Id == model.Id && i.StoreId == model.StoreId && i.AvatarId == model.AvatarId && i.ObjectId == model.ObjectId).FirstOrDefaultAsync();
            if (string.IsNullOrEmpty(osdModel.Id))
        {
            return 0;
        }
         
        osdModel.Secret = NBitcoin.RandomUtils.GetUInt256().ToString().Substring(0, 9);
        context.Update(osdModel);
        return await context.SaveChangesAsync();    
    }

    public async Task<List<OpenSimulatorData>> GetDestinationsGuide()
    {
        await using var context = _OpenSimDbContextFactory.CreateContext();

        return await context.Authorizations.Where(a => a.ObjectAuthorization == true).ToListAsync();
    }
    public async Task<List<OpenSimulatorData>> GetAuthorizations(string storeId)
    {
        await using var context = _OpenSimDbContextFactory.CreateContext();

        return await context.Authorizations.Where(a => a.StoreId == storeId).ToListAsync();
    }

    public async Task<int> GetPendingAuthorizationsCount(string storeId, string avatarId)
    {
        await using var context = _OpenSimDbContextFactory.CreateContext();

        return await context.Authorizations.Where(a => a.StoreId == storeId && a.AvatarId == avatarId && a.ObjectAuthorization == false).CountAsync();
    }

    public async Task<List<OpenSimulatorData>> GetPendingAuthorizations(string storeId, string avatarId, string objectId)
    {
        await using var context = _OpenSimDbContextFactory.CreateContext();

        return await context.Authorizations.Where(a => a.StoreId == storeId && a.AvatarId == avatarId && a.ObjectId == objectId && a.ObjectAuthorization == false).ToListAsync();
    }

    public async Task<OpenSimulatorData> isAuthorized(string storeId, string avatarId, string objectId, string avatarHomeURL, string objectURL)
    {
        await using var context = _OpenSimDbContextFactory.CreateContext();

        return await context.Authorizations.Where(a => a.StoreId == storeId && a.AvatarId == avatarId && a.ObjectId == objectId && a.AvatarHomeURL == avatarHomeURL && a.ObjectURL == objectURL && a.ObjectAuthorization == true)
        .FirstOrDefaultAsync();
    }

    public async Task <OpenSimulatorData> CheckIfExists(string storeId, string avatarId, string objectId)
    {
        await using var context = _OpenSimDbContextFactory.CreateContext();
        return await context.Authorizations.Where(a => a.StoreId == storeId && a.AvatarId == avatarId && a.ObjectId == objectId)
        .FirstOrDefaultAsync();    
    }
}

