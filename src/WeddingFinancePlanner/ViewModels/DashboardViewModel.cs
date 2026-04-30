using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using WeddingFinancePlanner.Helpers;
using WeddingFinancePlanner.Models;
using WeddingFinancePlanner.Services;

namespace WeddingFinancePlanner.ViewModels;

public partial class DashboardViewModel : BaseViewModel, ILoadable
{
    private readonly IDatabaseService _db;
    private readonly IBudgetCalculationService _budget;
    private readonly ISplitCalculationService _split;

    [ObservableProperty] private decimal _totalBudget;
    [ObservableProperty] private decimal _totalCommitted;
    [ObservableProperty] private decimal _totalSpent;
    [ObservableProperty] private decimal _totalUnpaid;
    [ObservableProperty] private decimal _partnerBalance;
    [ObservableProperty] private string _partnerBalanceLabel = string.Empty;
    [ObservableProperty] private List<Payment> _upcomingPayments = new();
    [ObservableProperty] private List<Payment> _overduePayments = new();
    [ObservableProperty] private string _partnerAName = "Partner A";
    [ObservableProperty] private string _partnerBName = "Partner B";

    public DashboardViewModel(IDatabaseService db, IBudgetCalculationService budget, ISplitCalculationService split)
    {
        _db = db;
        _budget = budget;
        _split = split;
        Title = "Dashboard";
    }

    public async Task LoadAsync()
    {
        IsBusy = true;
        try
        {
            var settings = await _db.GetSettingsAsync();
            PartnerAName = settings.PartnerAName;
            PartnerBName = settings.PartnerBName;
            TotalBudget = settings.TotalBudget;

            var payments = await _db.GetPaymentsAsync();
            var methods = await _db.GetPaymentMethodsAsync();

            TotalCommitted = _budget.CalculateTotalCommitted(payments);
            TotalSpent = _budget.CalculateTotalSpent(payments);
            TotalUnpaid = _budget.CalculateTotalUnpaid(payments);

            var balance = _split.CalculatePartnerBalance(payments, methods);
            PartnerBalance = balance.NetBalance;
            if (balance.OwingPartner == null)
                PartnerBalanceLabel = "Settled up";
            else if (balance.OwingPartner == Models.Enums.Partner.PartnerB)
                PartnerBalanceLabel = $"{PartnerBName} owes {PartnerAName} {balance.NetBalance:C2}";
            else
                PartnerBalanceLabel = $"{PartnerAName} owes {PartnerBName} {balance.NetBalance:C2}";

            UpcomingPayments = await _db.GetUpcomingPaymentsAsync(30);
            OverduePayments = await _db.GetOverduePaymentsAsync();
        }
        finally { IsBusy = false; }
    }
}
