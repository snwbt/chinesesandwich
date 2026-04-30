namespace WeddingFinancePlanner.Models;

public class AppSettings
{
    public int Id { get; set; } = 1;
    public string PartnerAName { get; set; } = "Partner A";
    public string PartnerBName { get; set; } = "Partner B";
    public decimal TotalBudget { get; set; }
    public string CurrencySymbol { get; set; } = "$";
}
