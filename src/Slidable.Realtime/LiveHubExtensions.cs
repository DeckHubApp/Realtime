using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Slidable.Realtime.Models;

namespace Slidable.Realtime
{
    public static class LiveHubExtensions
    {
        public static Task SendSlideAvailable(this IHubContext<LiveHub> context, SlideAvailable slide) =>
            SendSlideAvailable(context, $"{slide.Presenter}/{slide.Slug}", slide.Number);

        private static Task SendSlideAvailable(this IHubContext<LiveHub> context, string groupName, int number) =>
            context.Clients.Group(groupName).SendAsync("slideAvailable", new {number});
        
        public static Task SendQuestion(this IHubContext<LiveHub> context, Question question) =>
            SendQuestion(context, $"{question.Presenter}/{question.Slug}", question.From, question.Text);

        private static Task SendQuestion(this IHubContext<LiveHub> context, string groupName, string from, string question) =>
            context.Clients.Group(groupName).SendAsync("slideAvailable", new {from, question});
    }
}