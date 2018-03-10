using JetBrains.Annotations;
using MessagePack;

namespace Slidable.Realtime.Models
{
    [MessagePackObject]
    [UsedImplicitly]
    public class Question
    {
        [Key(0)]
        public string Presenter { get; [UsedImplicitly] set; }
        [Key(1)]
        public string Slug { get; [UsedImplicitly] set; }
        [Key(2)]
        public string From { get; [UsedImplicitly] set; }
        [Key(3)]
        public string Text { get; [UsedImplicitly] set; }
    }
}