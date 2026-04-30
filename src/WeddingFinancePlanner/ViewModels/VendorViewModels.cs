using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using WeddingFinancePlanner.Helpers;
using WeddingFinancePlanner.Models;
using WeddingFinancePlanner.Models.Enums;
using WeddingFinancePlanner.Services;

namespace WeddingFinancePlanner.ViewModels;

public partial class VendorListViewModel : BaseViewModel, ILoadable
{
    private readonly IDatabaseService _db;
    private readonly INavigationService _navigation;

    [ObservableProperty] private List<Vendor> _vendors = new();
    [ObservableProperty] private List<Vendor> _filteredVendors = new();
    [ObservableProperty] private string _searchText = string.Empty;
    [ObservableProperty] private VendorCategory? _selectedCategory;

    public IReadOnlyList<VendorCategory?> Categories { get; } =
        new List<VendorCategory?> { null }
            .Concat(Enum.GetValues<VendorCategory>().Cast<VendorCategory?>())
            .ToList();

    public VendorListViewModel(IDatabaseService db, INavigationService navigation)
    {
        _db = db;
        _navigation = navigation;
        Title = "Vendors";
    }

    public async Task LoadAsync()
    {
        IsBusy = true;
        try { Vendors = await _db.GetVendorsAsync(); ApplyFilter(); }
        finally { IsBusy = false; }
    }

    partial void OnSearchTextChanged(string value) => ApplyFilter();
    partial void OnSelectedCategoryChanged(VendorCategory? value) => ApplyFilter();

    private void ApplyFilter()
    {
        var q = Vendors.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(SearchText))
            q = q.Where(v => v.Name.Contains(SearchText, StringComparison.OrdinalIgnoreCase));
        if (SelectedCategory.HasValue)
            q = q.Where(v => v.Category == SelectedCategory.Value);
        FilteredVendors = q.ToList();
    }

    [RelayCommand]
    private void AddVendor() => _navigation.NavigateTo(new VendorDetailViewModel(_db, _navigation, null));

    [RelayCommand]
    private void EditVendor(Vendor vendor) => _navigation.NavigateTo(new VendorDetailViewModel(_db, _navigation, vendor.Id));

    [RelayCommand]
    private void ClearCategory() => SelectedCategory = null;
}

public partial class VendorDetailViewModel : BaseViewModel, ILoadable
{
    private readonly IDatabaseService _db;
    private readonly INavigationService _navigation;
    private readonly int? _vendorId;

    [ObservableProperty] private string _name = string.Empty;
    [ObservableProperty] private VendorCategory _category;
    [ObservableProperty] private string _contactName = string.Empty;
    [ObservableProperty] private string _contactEmail = string.Empty;
    [ObservableProperty] private string _contactPhone = string.Empty;
    [ObservableProperty] private decimal _contractTotal;
    [ObservableProperty] private string _notes = string.Empty;
    [ObservableProperty] private List<Payment> _linkedPayments = new();
    [ObservableProperty] private bool _isNew;

    public VendorDetailViewModel(IDatabaseService db, INavigationService navigation, int? vendorId)
    {
        _db = db;
        _navigation = navigation;
        _vendorId = vendorId;
        IsNew = vendorId == null;
        Title = IsNew ? "Add Vendor" : "Edit Vendor";
    }

    public async Task LoadAsync()
    {
        if (_vendorId == null) return;
        IsBusy = true;
        try
        {
            var vendor = await _db.GetVendorByIdAsync(_vendorId.Value);
            if (vendor == null) return;
            Name = vendor.Name;
            Category = vendor.Category;
            ContactName = vendor.ContactName ?? string.Empty;
            ContactEmail = vendor.ContactEmail ?? string.Empty;
            ContactPhone = vendor.ContactPhone ?? string.Empty;
            ContractTotal = vendor.ContractTotal;
            Notes = vendor.Notes ?? string.Empty;
            LinkedPayments = await _db.GetPaymentsByVendorAsync(_vendorId.Value);
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        if (string.IsNullOrWhiteSpace(Name)) return;
        var vendor = new Vendor
        {
            Id = _vendorId ?? 0,
            Name = Name.Trim(),
            Category = Category,
            ContactName = string.IsNullOrWhiteSpace(ContactName) ? null : ContactName.Trim(),
            ContactEmail = string.IsNullOrWhiteSpace(ContactEmail) ? null : ContactEmail.Trim(),
            ContactPhone = string.IsNullOrWhiteSpace(ContactPhone) ? null : ContactPhone.Trim(),
            ContractTotal = ContractTotal,
            Notes = string.IsNullOrWhiteSpace(Notes) ? null : Notes.Trim()
        };
        if (IsNew) await _db.AddVendorAsync(vendor);
        else await _db.UpdateVendorAsync(vendor);
        _navigation.NavigateTo<VendorListViewModel>();
    }

    [RelayCommand]
    private void Cancel() => _navigation.NavigateTo<VendorListViewModel>();

    [RelayCommand]
    private async Task DeleteAsync()
    {
        if (_vendorId == null) return;
        await _db.DeleteVendorAsync(_vendorId.Value);
        _navigation.NavigateTo<VendorListViewModel>();
    }
}
