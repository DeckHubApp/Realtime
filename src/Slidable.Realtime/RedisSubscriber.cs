using System.Threading;
using System.Threading.Tasks;
using JetBrains.Annotations;
using MessagePack;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Slidable.Realtime.Models;
using StackExchange.Redis;

namespace Slidable.Realtime
{
    [UsedImplicitly]
    public class RedisSubscriber : IHostedService
    {
        private readonly ConnectionMultiplexer _redis;
        private readonly IHubContext<LiveHub> _hub;
        private readonly ILogger<RedisSubscriber> _logger;

        public RedisSubscriber(ConnectionMultiplexer redis, IHubContext<LiveHub> hub, ILogger<RedisSubscriber> logger)
        {
            _redis = redis;
            _hub = hub;
            _logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken) => SubscribeAsync(_redis.GetSubscriber());

        public Task StopAsync(CancellationToken cancellationToken) => _redis.GetSubscriber().UnsubscribeAllAsync();

        private Task SubscribeAsync(ISubscriber subscriber) => Task.WhenAll(
            subscriber.SubscribeAsync("slidable:slide-available", HandleSlideMessage),
            subscriber.SubscribeAsync("slidable:question", HandleQuestionMessage)
        );

        private async void HandleQuestionMessage(RedisChannel channel, RedisValue value)
        {
            try
            {
                var question = MessagePackSerializer.Deserialize<Question>(value);
                await _hub.SendQuestion(question).ConfigureAwait(false);
                _logger.LogInformation($"Handled Question message {question.Id}");
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error handling Question message");
                throw;
            }
        }

        private async void HandleSlideMessage(RedisChannel channel, RedisValue value)
        {
            try
            {
                var slideAvailable = MessagePackSerializer.Deserialize<SlideAvailable>(value);
                await _hub.SendSlideAvailable(slideAvailable).ConfigureAwait(false);
                _logger.LogInformation($"Handled Slide message {slideAvailable.Number}");
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error handling Slide message");
                throw;
            }
        }
    }
}