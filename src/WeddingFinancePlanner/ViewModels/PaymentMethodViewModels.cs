using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using WeddingFinancePlanner.Helpers;
using WeddingFinancePlanner.Models;
using WeddingFinancePlanner.Models.Enums;
using WeddingFinancePlanner.Services;

namespace WeddingFinancePlanner.ViewModels;

public partial class PaymentMethodListViewModel : BaseViewModel, ILoadable
{
    private readonly IDatabaseService _db;
    private readonly INavigationService _navigation;

    [ObservableProperty] private List<PaymentMethod> _methods = new();

    public PaymentMethodListViewModel(IDatabaseService db, INavigationService navigation)
    {
        _db = db;
        _navigation = navigation;
        Title = "Payment Methods";
    }

    public async Task LoadAsync()
    {
        IsBusy = true;
        try { Methods = await _db.GetPaymentMethodsAsync(); }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private void AddMethod() => _navigation.NavigateTo(new PaymentMethodDetailViewModel(_db, _navigation, null));

    [RelayCommand]
    private void EditMethod(PaymentMethod method) => _navigation.NavigateTo(new PaymentMethodDetailViewModel(_db, _navigation, method.Id));
}

public partial class PaymentMethodDetailViewModel : BaseViewModel, ILoadable
{
    private readonly IDatabaseService _db;
    private readonly INavigationService _navigation;
    private readonly int? _methodId;

    [ObservableProperty] private string _name = string.Empty;
    [ObservableProperty] private PaymentMethodType _type = PaymentMethodType.CreditCard;
    [ObservableProperty] private Partner _owner = Partner.PartnerA;
    [ObservableProperty] private string _lastFourDigits = string.Empty;
    [ObservableProperty] private string _notes = string.Empty;
    [ObservableProperty] private bool _isActive = true;
    [ObservableProperty] private bool _isNew;
    [ObservableProperty] private string _partnerAName = "Partner A";
    [ObservableProperty] private string _partnerBName = "Partner B";

    public PaymentMethodDetailViewModel(IDatabaseService db, INavigationService navigation, int? methodId)
    {
        _db = db;
        _navigation = navigation;
        _methodId = methodId;
        IsNew = methodId == null;
        Title = IsNew ? "Add Payment Method" : "Edit Payment Method";
    }

    public async Task LoadAsync()
    {
        IsBusy = true;
        try
        {
            var settings = await _db.GetSettingsAsync();
            PartnerAName = settings.PartnerAName;
            PartnerBName = settings.PartnerBName;

            if (_methodId == null) return;
            var method = await _db.GetPaymentMethodByIdAsync(_methodId.Value);
            if (method == null) return;
            Name = method.Name;
            Type = method.Type;
            Owner = method.Owner;
            LastFourDigits = method.LastFourDigits ?? string.Empty;
            Notes = method.Notes ?? string.Empty;
            IsActive = method.IsActive;
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        if (string.IsNullOrWhiteSpace(Name)) return;
        var method = new PaymentMethod
        {
            Id = _methodId ?? 0,
            Name = Name.Trim(),
            Type = Type,
            Owner = Owner,
            LastFourDigits = string.IsNullOrWhiteSpace(LastFourDigits) ? null : LastFourDigits.Trim(),
            Notes = string.IsNullOrWhiteSpace(Notes) ? null : Notes.Trim(),
            IsActive = IsActive
        };
        if (IsNew) await _db.AddPaymentMethodAsync(method);
        else await _db.UpdatePaymentMethodAsync(method);
        _navigation.NavigateTo<PaymentMethodListViewModel>();
    }

    [RelayCommand]
    private void Cancel() => _navigation.NavigateTo<PaymentMethodListViewModel>();

    [RelayCommand]
    private async Task DeleteAsync()
    {
        if (_methodId == null) return;
        await _db.DeletePaymentMethodAsync(_methodId.Value);
        _navigation.NavigateTo<PaymentMethodListViewModel>();
    }
}
