using System.Threading;
using System.Threading.Tasks;
using JetBrains.Annotations;
using MessagePack;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Slidable.Realtime.Models;
using StackExchange.Redis;

namespace Slidable.Realtime
{
    [UsedImplicitly]
    public class RedisSubscriber : IHostedService
    {
        private readonly ConnectionMultiplexer _redis;
        private readonly IHubContext<LiveHub> _hub;

        public RedisSubscriber(ConnectionMultiplexer redis, IHubContext<LiveHub> hub)
        {
            _redis = redis;
            _hub = hub;
        }

        public Task StartAsync(CancellationToken cancellationToken) => SubscribeAsync(_redis.GetSubscriber());

        public Task StopAsync(CancellationToken cancellationToken) => _redis.GetSubscriber().UnsubscribeAllAsync();

        private Task SubscribeAsync(ISubscriber subscriber) => Task.WhenAll(
            subscriber.SubscribeAsync("slidable:slide-available", HandleSlideMessage),
            subscriber.SubscribeAsync("slidable:question", HandleQuestionMessage)
        );

        private async void HandleQuestionMessage(RedisChannel channel, RedisValue value)
        {
            var question = MessagePackSerializer.Deserialize<Question>(value);
            await _hub.SendQuestion(question).ConfigureAwait(false);
        }

        private async void HandleSlideMessage(RedisChannel channel, RedisValue value)
        {
            var slideAvailable = MessagePackSerializer.Deserialize<SlideAvailable>(value);
            await _hub.SendSlideAvailable(slideAvailable).ConfigureAwait(false);
        }
    }
}