using WeddingFinancePlanner.Models;
using WeddingFinancePlanner.Models.Enums;

namespace WeddingFinancePlanner.Services;

public interface IPaymentStatusService
{
    PaymentStatus DetermineStatus(Payment payment);
}

public class PaymentStatusService : IPaymentStatusService
{
    public PaymentStatus DetermineStatus(Payment payment)
    {
        if (payment.PaidDate.HasValue)
            return PaymentStatus.Paid;

        if (payment.DueDate.HasValue && payment.DueDate.Value.Date < DateTime.Today)
            return PaymentStatus.Overdue;

        return PaymentStatus.Unpaid;
    }
}
