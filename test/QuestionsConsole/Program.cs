using System;
using System.Threading;
using System.Threading.Tasks;
using MessagePack;
using StackExchange.Redis;

namespace QuestionsConsole
{
    class Program
    {
        static void Main(string[] args)
        {
            var pub = new RedisPublisher(ConnectionMultiplexer.Connect("localhost"));
            while (true)
            {
                Console.WriteLine("Enter question (blank to quit):");
                var q = Console.ReadLine();
                if (string.IsNullOrWhiteSpace(q))
                {
                    break;
                }
                pub.Publish(q);
            }
        }
    }
    [MessagePackObject]
    public class Question
    {
        [Key(0)]
        public string Presenter { get; set; }
        [Key(1)]
        public string Slug { get; set; }
        [Key(2)]
        public string From { get; set; }
        [Key(3)]
        public string Text { get; set; }
    }
    public class RedisPublisher
    {
        private readonly ConnectionMultiplexer _redis;

        public RedisPublisher(ConnectionMultiplexer redis)
        {
            _redis = redis;
        }

        public void Publish(string question)
        {
            var q = new Question
            {
                Presenter = "mark",
                Slug = "test",
                From = "Also Mark",
                Text = question
            };

            _redis.GetSubscriber().Publish("slidable:question", MessagePackSerializer.Serialize(q));
        }
    }
}
