using System.Threading.Tasks;
using JetBrains.Annotations;
using Microsoft.AspNetCore.SignalR;
using Slidable.Realtime.Models;

namespace Slidable.Realtime
{
    [UsedImplicitly]
    public class LiveHub : Hub
    {
        [PublicAPI]
        public async Task Join(string groupName)
        {
            await Groups.AddAsync(Context.ConnectionId, groupName);
        }

        [PublicAPI]
        public async Task Leave(string groupName)
        {
            await Groups.RemoveAsync(Context.ConnectionId, groupName);
        }
    }
}