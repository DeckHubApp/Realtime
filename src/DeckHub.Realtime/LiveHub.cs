using System.Threading.Tasks;
using JetBrains.Annotations;
using Microsoft.AspNetCore.SignalR;
using DeckHub.Realtime.Models;

namespace DeckHub.Realtime
{
    [UsedImplicitly]
    public class LiveHub : Hub
    {
        [PublicAPI]
        public async Task Join(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        [PublicAPI]
        public async Task Leave(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }
    }
}