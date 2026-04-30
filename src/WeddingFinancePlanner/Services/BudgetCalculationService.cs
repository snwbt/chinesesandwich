using WeddingFinancePlanner.Models;
using WeddingFinancePlanner.Models.Enums;

namespace WeddingFinancePlanner.Services;

public interface IBudgetCalculationService
{
    decimal CalculateTotalSpent(IEnumerable<Payment> payments);
    decimal CalculateTotalCommitted(IEnumerable<Payment> payments);
    decimal CalculateRemaining(decimal budget, decimal committed);
    decimal CalculateTotalUnpaid(IEnumerable<Payment> payments);
    Dictionary<VendorCategory, decimal> CalculateSpendingByCategory(IEnumerable<Payment> payments);
}

public class BudgetCalculationService : IBudgetCalculationService
{
    public decimal CalculateTotalSpent(IEnumerable<Payment> payments) =>
        payments.Where(p => p.Status == PaymentStatus.Paid).Sum(p => p.Amount);

    public decimal CalculateTotalCommitted(IEnumerable<Payment> payments) =>
        payments.Sum(p => p.Amount);

    public decimal CalculateRemaining(decimal budget, decimal committed) =>
        budget - committed;

    public decimal CalculateTotalUnpaid(IEnumerable<Payment> payments) =>
        payments.Where(p => p.Status != PaymentStatus.Paid).Sum(p => p.Amount);

    public Dictionary<VendorCategory, decimal> CalculateSpendingByCategory(IEnumerable<Payment> payments)
    {
        return payments
            .Where(p => p.Vendor != null)
            .GroupBy(p => p.Vendor!.Category)
            .ToDictionary(g => g.Key, g => g.Sum(p => p.Amount));
    }
}
