using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using WeddingFinancePlanner.Helpers;
using WeddingFinancePlanner.Models;
using WeddingFinancePlanner.Services;

namespace WeddingFinancePlanner.ViewModels;

public partial class SplitSummaryViewModel : BaseViewModel, ILoadable
{
    private readonly IDatabaseService _db;
    private readonly ISplitCalculationService _split;

    [ObservableProperty] private decimal _totalPaidByA;
    [ObservableProperty] private decimal _totalPaidByB;
    [ObservableProperty] private decimal _totalOwedByA;
    [ObservableProperty] private decimal _totalOwedByB;
    [ObservableProperty] private decimal _netBalance;
    [ObservableProperty] private string _balanceSummary = string.Empty;
    [ObservableProperty] private List<PaymentSplitDetail> _breakdown = new();
    [ObservableProperty] private string _partnerAName = "Partner A";
    [ObservableProperty] private string _partnerBName = "Partner B";

    public SplitSummaryViewModel(IDatabaseService db, ISplitCalculationService split)
    {
        _db = db;
        _split = split;
        Title = "Split Summary";
    }

    public async Task LoadAsync()
    {
        IsBusy = true;
        try
        {
            var settings = await _db.GetSettingsAsync();
            PartnerAName = settings.PartnerAName;
            PartnerBName = settings.PartnerBName;

            var payments = await _db.GetPaymentsAsync();
            var methods = await _db.GetPaymentMethodsAsync();

            var balance = _split.CalculatePartnerBalance(payments, methods);
            TotalPaidByA = balance.TotalPaidByA;
            TotalPaidByB = balance.TotalPaidByB;
            TotalOwedByA = balance.TotalOwedByA;
            TotalOwedByB = balance.TotalOwedByB;
            NetBalance = balance.NetBalance;

            if (balance.OwingPartner == null)
                BalanceSummary = "All settled up!";
            else if (balance.OwingPartner == Models.Enums.Partner.PartnerB)
                BalanceSummary = $"{PartnerBName} owes {PartnerAName} {balance.NetBalance:C2}";
            else
                BalanceSummary = $"{PartnerAName} owes {PartnerBName} {balance.NetBalance:C2}";

            Breakdown = _split.GetDetailedSplitBreakdown(payments, methods);
        }
        finally { IsBusy = false; }
    }
}

public partial class SettingsViewModel : BaseViewModel, ILoadable
{
    private readonly IDatabaseService _db;

    [ObservableProperty] private string _partnerAName = "Partner A";
    [ObservableProperty] private string _partnerBName = "Partner B";
    [ObservableProperty] private decimal _totalBudget;
    [ObservableProperty] private string _currencySymbol = "$";
    private int _settingsId = 1;

    public SettingsViewModel(IDatabaseService db)
    {
        _db = db;
        Title = "Settings";
    }

    public async Task LoadAsync()
    {
        IsBusy = true;
        try
        {
            var settings = await _db.GetSettingsAsync();
            _settingsId = settings.Id;
            PartnerAName = settings.PartnerAName;
            PartnerBName = settings.PartnerBName;
            TotalBudget = settings.TotalBudget;
            CurrencySymbol = settings.CurrencySymbol;
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        await _db.SaveSettingsAsync(new Models.AppSettings
        {
            Id = _settingsId,
            PartnerAName = PartnerAName.Trim(),
            PartnerBName = PartnerBName.Trim(),
            TotalBudget = TotalBudget,
            CurrencySymbol = CurrencySymbol.Trim()
        });
    }
}
