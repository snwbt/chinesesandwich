using WeddingFinancePlanner.Models;
using WeddingFinancePlanner.Models.Enums;

namespace WeddingFinancePlanner.Services;

public record PartnerBalance(
    decimal TotalPaidByA,
    decimal TotalPaidByB,
    decimal TotalOwedByA,
    decimal TotalOwedByB,
    decimal NetBalance,
    Partner? OwingPartner);

public record PaymentSplitDetail(
    int PaymentId,
    string Description,
    decimal Amount,
    Partner? ActualPayer,
    decimal PartnerAShare,
    decimal PartnerBShare);

public interface ISplitCalculationService
{
    (decimal partnerAShare, decimal partnerBShare) CalculateSplit(
        decimal amount, SplitType type,
        decimal? percentageA, decimal? fixedAmountA, Partner? payingPartner);

    PartnerBalance CalculatePartnerBalance(
        IEnumerable<Payment> payments,
        IEnumerable<PaymentMethod> methods);

    List<PaymentSplitDetail> GetDetailedSplitBreakdown(
        IEnumerable<Payment> payments,
        IEnumerable<PaymentMethod> methods);
}

public class SplitCalculationService : ISplitCalculationService
{
    public (decimal partnerAShare, decimal partnerBShare) CalculateSplit(
        decimal amount, SplitType type,
        decimal? percentageA, decimal? fixedAmountA, Partner? payingPartner)
    {
        if (amount == 0) return (0, 0);

        return type switch
        {
            SplitType.FiftyFifty => (Round(amount / 2), amount - Round(amount / 2)),
            SplitType.Percentage => CalculatePercentageSplit(amount, percentageA ?? 50),
            SplitType.CustomAmount => CalculateCustomAmountSplit(amount, fixedAmountA ?? 0),
            SplitType.OnePartnerPays => payingPartner == Partner.PartnerA ? (amount, 0) : (0, amount),
            _ => (Round(amount / 2), amount - Round(amount / 2))
        };
    }

    public PartnerBalance CalculatePartnerBalance(
        IEnumerable<Payment> payments,
        IEnumerable<PaymentMethod> methods)
    {
        var methodLookup = methods.ToDictionary(m => m.Id, m => m.Owner);
        var paymentList = payments.ToList();

        decimal totalPaidByA = 0;
        decimal totalPaidByB = 0;
        decimal totalOwedByA = 0;
        decimal totalOwedByB = 0;

        foreach (var payment in paymentList)
        {
            var (shareA, shareB) = CalculateSplit(
                payment.Amount, payment.SplitType,
                payment.SplitPercentageA, payment.SplitFixedAmountA, payment.SplitPayingPartner);

            totalOwedByA += shareA;
            totalOwedByB += shareB;

            if (payment.Status == PaymentStatus.Paid && payment.PaymentMethodId.HasValue)
            {
                if (methodLookup.TryGetValue(payment.PaymentMethodId.Value, out var owner))
                {
                    if (owner == Partner.PartnerA) totalPaidByA += payment.Amount;
                    else totalPaidByB += payment.Amount;
                }
            }
        }

        // Net balance: positive = A overpaid (B owes A), negative = B overpaid (A owes B)
        var netBalance = totalPaidByA - totalOwedByA;
        Partner? owingPartner = netBalance > 0 ? Partner.PartnerB : netBalance < 0 ? Partner.PartnerA : null;

        return new PartnerBalance(totalPaidByA, totalPaidByB, totalOwedByA, totalOwedByB, Math.Abs(netBalance), owingPartner);
    }

    public List<PaymentSplitDetail> GetDetailedSplitBreakdown(
        IEnumerable<Payment> payments,
        IEnumerable<PaymentMethod> methods)
    {
        var methodLookup = methods.ToDictionary(m => m.Id, m => m.Owner);
        var result = new List<PaymentSplitDetail>();

        foreach (var payment in payments)
        {
            var (shareA, shareB) = CalculateSplit(
                payment.Amount, payment.SplitType,
                payment.SplitPercentageA, payment.SplitFixedAmountA, payment.SplitPayingPartner);

            Partner? actualPayer = null;
            if (payment.Status == PaymentStatus.Paid && payment.PaymentMethodId.HasValue &&
                methodLookup.TryGetValue(payment.PaymentMethodId.Value, out var payer))
                actualPayer = payer;

            result.Add(new PaymentSplitDetail(
                payment.Id,
                payment.Description ?? payment.Vendor?.Name ?? payment.Item?.Name ?? "Payment",
                payment.Amount,
                actualPayer,
                shareA,
                shareB));
        }

        return result;
    }

    private static (decimal, decimal) CalculatePercentageSplit(decimal amount, decimal percentageA)
    {
        var shareA = Round(amount * percentageA / 100);
        return (shareA, amount - shareA);
    }

    private static (decimal, decimal) CalculateCustomAmountSplit(decimal amount, decimal fixedAmountA)
    {
        var shareA = Math.Min(fixedAmountA, amount);
        return (shareA, amount - shareA);
    }

    private static decimal Round(decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
