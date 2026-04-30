using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using WeddingFinancePlanner.Helpers;
using WeddingFinancePlanner.Models;
using WeddingFinancePlanner.Models.Enums;
using WeddingFinancePlanner.Services;

namespace WeddingFinancePlanner.ViewModels;

public partial class ItemListViewModel : BaseViewModel, ILoadable
{
    private readonly IDatabaseService _db;
    private readonly INavigationService _navigation;

    [ObservableProperty] private List<Item> _items = new();
    [ObservableProperty] private List<Item> _filteredItems = new();
    [ObservableProperty] private string _searchText = string.Empty;
    [ObservableProperty] private List<Vendor> _vendors = new();
    [ObservableProperty] private Vendor? _selectedVendor;

    public ItemListViewModel(IDatabaseService db, INavigationService navigation)
    {
        _db = db;
        _navigation = navigation;
        Title = "Items";
    }

    public async Task LoadAsync()
    {
        IsBusy = true;
        try
        {
            Items = await _db.GetItemsAsync();
            Vendors = await _db.GetVendorsAsync();
            ApplyFilter();
        }
        finally { IsBusy = false; }
    }

    partial void OnSearchTextChanged(string value) => ApplyFilter();
    partial void OnSelectedVendorChanged(Vendor? value) => ApplyFilter();

    private void ApplyFilter()
    {
        var q = Items.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(SearchText))
            q = q.Where(i => i.Name.Contains(SearchText, StringComparison.OrdinalIgnoreCase));
        if (SelectedVendor != null)
            q = q.Where(i => i.VendorId == SelectedVendor.Id);
        FilteredItems = q.ToList();
    }

    [RelayCommand]
    private void AddItem() => _navigation.NavigateTo(new ItemDetailViewModel(_db, _navigation, null));

    [RelayCommand]
    private void EditItem(Item item) => _navigation.NavigateTo(new ItemDetailViewModel(_db, _navigation, item.Id));

    [RelayCommand]
    private void ClearVendor() => SelectedVendor = null;
}

public partial class ItemDetailViewModel : BaseViewModel, ILoadable
{
    private readonly IDatabaseService _db;
    private readonly INavigationService _navigation;
    private readonly int? _itemId;

    [ObservableProperty] private string _name = string.Empty;
    [ObservableProperty] private string _description = string.Empty;
    [ObservableProperty] private decimal _estimatedCost;
    [ObservableProperty] private decimal? _actualCost;
    [ObservableProperty] private DateTime? _deadline;
    [ObservableProperty] private int? _vendorId;
    [ObservableProperty] private SplitType _splitType = SplitType.FiftyFifty;
    [ObservableProperty] private decimal _splitPercentageA = 50;
    [ObservableProperty] private decimal _splitFixedAmountA;
    [ObservableProperty] private Partner _splitPayingPartner = Partner.PartnerA;
    [ObservableProperty] private List<Vendor> _vendors = new();
    [ObservableProperty] private List<Payment> _linkedPayments = new();
    [ObservableProperty] private bool _isNew;
    [ObservableProperty] private string _partnerAName = "Partner A";
    [ObservableProperty] private string _partnerBName = "Partner B";

    public ItemDetailViewModel(IDatabaseService db, INavigationService navigation, int? itemId)
    {
        _db = db;
        _navigation = navigation;
        _itemId = itemId;
        IsNew = itemId == null;
        Title = IsNew ? "Add Item" : "Edit Item";
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

            if (_itemId == null) return;
            var item = await _db.GetItemByIdAsync(_itemId.Value);
            if (item == null) return;
            Name = item.Name;
            Description = item.Description ?? string.Empty;
            EstimatedCost = item.EstimatedCost;
            ActualCost = item.ActualCost;
            Deadline = item.Deadline;
            VendorId = item.VendorId;
            SplitType = item.SplitType;
            SplitPercentageA = item.SplitPercentageA ?? 50;
            SplitFixedAmountA = item.SplitFixedAmountA ?? 0;
            SplitPayingPartner = item.SplitPayingPartner ?? Partner.PartnerA;
            LinkedPayments = await _db.GetPaymentsByItemAsync(_itemId.Value);
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        if (string.IsNullOrWhiteSpace(Name)) return;
        var item = new Item
        {
            Id = _itemId ?? 0,
            Name = Name.Trim(),
            Description = string.IsNullOrWhiteSpace(Description) ? null : Description.Trim(),
            EstimatedCost = EstimatedCost,
            ActualCost = ActualCost,
            Deadline = Deadline,
            VendorId = VendorId,
            SplitType = SplitType,
            SplitPercentageA = SplitType == SplitType.Percentage ? SplitPercentageA : null,
            SplitFixedAmountA = SplitType == SplitType.CustomAmount ? SplitFixedAmountA : null,
            SplitPayingPartner = SplitType == SplitType.OnePartnerPays ? SplitPayingPartner : null
        };
        if (IsNew) await _db.AddItemAsync(item);
        else await _db.UpdateItemAsync(item);
        _navigation.NavigateTo<ItemListViewModel>();
    }

    [RelayCommand]
    private void Cancel() => _navigation.NavigateTo<ItemListViewModel>();

    [RelayCommand]
    private async Task DeleteAsync()
    {
        if (_itemId == null) return;
        await _db.DeleteItemAsync(_itemId.Value);
        _navigation.NavigateTo<ItemListViewModel>();
    }
}
