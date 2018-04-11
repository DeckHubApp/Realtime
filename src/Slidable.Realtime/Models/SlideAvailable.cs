using JetBrains.Annotations;
using MessagePack;

namespace Slidable.Realtime.Models
{
    [MessagePackObject]

    public class SlideAvailable
    {
        [Key(0)] public string Place { get; set; }
        [Key(1)] public string Presenter { get; set; }
        [Key(2)] public string Slug { get; set; }
        [Key(3)] public int Number { get; set; }
    }
}