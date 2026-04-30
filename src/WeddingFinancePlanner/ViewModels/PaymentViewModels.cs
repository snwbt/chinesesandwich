using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using WeddingFinancePlanner.Helpers;
using WeddingFinancePlanner.Models;
using WeddingFinancePlanner.Models.Enums;
using WeddingFinancePlanner.Services;

namespace WeddingFinancePlanner.ViewModels;

public partial class PaymentListViewModel : BaseViewModel, ILoadable
{
    private readonly IDatabaseService _db;
    private readonly INavigationService _navigation;
    private readonly IPaymentStatusService _statusService;

    [ObservableProperty] private List<Payment> _payments = new();
    [ObservableProperty] private List<Payment> _filteredPayments = new();
    [ObservableProperty] private string _searchText = string.Empty;
    [ObservableProperty] private PaymentStatus? _statusFilter;
    [ObservableProperty] private List<Vendor> _vendors = new();
    [ObservableProperty] private Vendor? _selectedVendor;

    public PaymentListViewModel(IDatabaseService db, INavigationService navigation, IPaymentStatusService statusService)
    {
        _db = db;
        _navigation = navigation;
        _statusService = statusService;
        Title = "Payments";
    }

    public async Task LoadAsync()
    {
        IsBusy = true;
        try
        {
            Payments = await _db.GetPaymentsAsync();
            Vendors = await _db.GetVendorsAsync();
            ApplyFilter();
        }
        finally { IsBusy = false; }
    }

    partial void OnSearchTextChanged(string value) => ApplyFilter();
    partial void OnStatusFilterChanged(PaymentStatus? value) => ApplyFilter();
    partial void OnSelectedVendorChanged(Vendor? value) => ApplyFilter();

    private void ApplyFilter()
    {
        var q = Payments.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(SearchText))
            q = q.Where(p => (p.Description ?? string.Empty).Contains(SearchText, StringComparison.OrdinalIgnoreCase)
                           || (p.Vendor?.Name ?? string.Empty).Contains(SearchText, StringComparison.OrdinalIgnoreCase));
        if (StatusFilter.HasValue)
            q = q.Where(p => p.Status == StatusFilter.Value);
        if (SelectedVendor != null)
            q = q.Where(p => p.VendorId == SelectedVendor.Id);
        FilteredPayments = q.ToList();
    }

    [RelayCommand]
    private void AddPayment() => _navigation.NavigateTo(new PaymentDetailViewModel(_db, _navigation, _statusService, null));

    [RelayCommand]
    private void EditPayment(Payment payment) => _navigation.NavigateTo(new PaymentDetailViewModel(_db, _navigation, _statusService, payment.Id));

    [RelayCommand]
    private async Task MarkPaidAsync(Payment payment)
    {
        payment.PaidDate = DateTime.Today;
        payment.Status = PaymentStatus.Paid;
        await _db.UpdatePaymentAsync(payment);
        await LoadAsync();
    }

    [RelayCommand]
    private void ClearFilters()
    {
        SearchText = string.Empty;
        StatusFilter = null;
        SelectedVendor = null;
    }
}

public partial class PaymentDetailViewModel : BaseViewModel, ILoadable
{
    private readonly IDatabaseService _db;
    private readonly INavigationService _navigation;
    private readonly IPaymentStatusService _statusService;
    private readonly int? _paymentId;

    [ObservableProperty] private decimal _amount;
    [ObservableProperty] private string _description = string.Empty;
    [ObservableProperty] private DateTime? _dueDate;
    [ObservableProperty] private DateTime? _paidDate;
    [ObservableProperty] private PaymentStatus _status = PaymentStatus.Unpaid;
    [ObservableProperty] private int? _vendorId;
    [ObservableProperty] private int? _itemId;
    [ObservableProperty] private int? _paymentMethodId;
    [ObservableProperty] private SplitType _splitType = SplitType.FiftyFifty;
    [ObservableProperty] private decimal _splitPercentageA = 50;
    [ObservableProperty] private decimal _splitFixedAmountA;
    [ObservableProperty] private Partner _splitPayingPartner = Partner.PartnerA;
    [ObservableProperty] private List<Vendor> _vendors = new();
    [ObservableProperty] private List<Item> _vendorItems = new();
    [ObservableProperty] private List<PaymentMethod> _paymentMethods = new();
    [ObservableProperty] private bool _isNew;
    [ObservableProperty] private string _partnerAName = "Partner A";
    [ObservableProperty] private string _partnerBName = "Partner B";

    public PaymentDetailViewModel(IDatabaseService db, INavigationService navigation, IPaymentStatusService statusService, int? paymentId)
    {
        _db = db;
        _navigation = navigation;
        _statusService = statusService;
        _paymentId = paymentId;
        IsNew = paymentId == null;
        Title = IsNew ? "Add Payment" : "Edit Payment";
    }

    public async Task LoadAsync()
    {
        IsBusy = true;
        try
        {
            var settings = await _db.GetSettingsAsync();
            PartnerAName = settings.PartnerAName;
            PartnerBName = settings.PartnerBName;
            Vendors = await _db.GetVendorsAsync();
            PaymentMethods = await _db.GetPaymentMethodsAsync();

            if (_paymentId == null) return;
            var payment = await _db.GetPaymentByIdAsync(_paymentId.Value);
            if (payment == null) return;
            Amount = payment.Amount;
            Description = payment.Description ?? string.Empty;
            DueDate = payment.DueDate;
            PaidDate = payment.PaidDate;
            Status = payment.Status;
            VendorId = payment.VendorId;
            ItemId = payment.ItemId;
            PaymentMethodId = payment.PaymentMethodId;
            SplitType = payment.SplitType;
            SplitPercentageA = payment.SplitPercentageA ?? 50;
            SplitFixedAmountA = payment.SplitFixedAmountA ?? 0;
            SplitPayingPartner = payment.SplitPayingPartner ?? Partner.PartnerA;

            if (VendorId.HasValue)
                VendorItems = await _db.GetItemsAsync().ContinueWith(t => t.Result.Where(i => i.VendorId == VendorId).ToList());
        }
        finally { IsBusy = false; }
    }

    partial void OnVendorIdChanged(int? value)
    {
        ItemId = null;
        _ = LoadVendorItemsAsync(value);
    }

    private async Task LoadVendorItemsAsync(int? vendorId)
    {
        if (vendorId == null) { VendorItems = new(); return; }
        var all = await _db.GetItemsAsync();
        VendorItems = all.Where(i => i.VendorId == vendorId).ToList();
    }

    partial void OnPaidDateChanged(DateTime? value)
    {
        var temp = new Payment { DueDate = DueDate, PaidDate = value };
        Status = _statusService.DetermineStatus(temp);
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        var payment = new Payment
        {
            Id = _paymentId ?? 0,
            Amount = Amount,
            Description = string.IsNullOrWhiteSpace(Description) ? null : Description.Trim(),
            DueDate = DueDate,
            PaidDate = PaidDate,
            Status = Status,
            VendorId = VendorId,
            ItemId = ItemId,
            PaymentMethodId = PaymentMethodId,
            SplitType = SplitType,
            SplitPercentageA = SplitType == SplitType.Percentage ? SplitPercentageA : null,
            SplitFixedAmountA = SplitType == SplitType.CustomAmount ? SplitFixedAmountA : null,
            SplitPayingPartner = SplitType == SplitType.OnePartnerPays ? SplitPayingPartner : null
        };
        if (IsNew) await _db.AddPaymentAsync(payment);
        else await _db.UpdatePaymentAsync(payment);
        _navigation.NavigateTo<PaymentListViewModel>();
    }

    [RelayCommand]
    private void Cancel() => _navigation.NavigateTo<PaymentListViewModel>();

    [RelayCommand]
    private async Task DeleteAsync()
    {
        if (_paymentId == null) return;
        await _db.DeletePaymentAsync(_paymentId.Value);
        _navigation.NavigateTo<PaymentListViewModel>();
    }
}
