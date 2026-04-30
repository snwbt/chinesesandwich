using WeddingFinancePlanner.Models.Enums;

namespace WeddingFinancePlanner.Models;

public class Item
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal EstimatedCost { get; set; }
    public decimal? ActualCost { get; set; }
    public DateTime? Deadline { get; set; }
    public int? VendorId { get; set; }
    public SplitType SplitType { get; set; } = SplitType.FiftyFifty;
    public decimal? SplitPercentageA { get; set; }
    public decimal? SplitFixedAmountA { get; set; }
    public Partner? SplitPayingPartner { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Vendor? Vendor { get; set; }
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
