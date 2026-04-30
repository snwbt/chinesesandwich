using WeddingFinancePlanner.Models.Enums;

namespace WeddingFinancePlanner.Models;

public class Payment
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? PaidDate { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Unpaid;
    public int? VendorId { get; set; }
    public int? ItemId { get; set; }
    public int? PaymentMethodId { get; set; }
    public SplitType SplitType { get; set; } = SplitType.FiftyFifty;
    public decimal? SplitPercentageA { get; set; }
    public decimal? SplitFixedAmountA { get; set; }
    public Partner? SplitPayingPartner { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Vendor? Vendor { get; set; }
    public Item? Item { get; set; }
    public PaymentMethod? PaymentMethod { get; set; }
}
