using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Slidable.Realtime.Models;

namespace Slidable.Realtime
{
    public static class LiveHubExtensions
    {
        public static Task SendSlideAvailable(this IHubContext<LiveHub> context, SlideAvailable slide) =>
            SendSlideAvailable(context, $"{slide.Place}/{slide.Presenter}/{slide.Slug}", slide.Number);

        private static Task SendSlideAvailable(this IHubContext<LiveHub> context, string groupName, int number) =>
            context.Clients.Group(groupName).SendAsync("slideAvailable", new {number});

        public static Task SendQuestion(this IHubContext<LiveHub> context, Question question) =>
            SendQuestion(context, question.Show, question.Id, question.From, question.Text, question.Slide);

        private static Task SendQuestion(this IHubContext<LiveHub> context,
            string groupName, string id, string from, string text, int slide) =>
            context.Clients.Group(groupName).SendAsync("question", new {id, from, text, slide});
    }
}