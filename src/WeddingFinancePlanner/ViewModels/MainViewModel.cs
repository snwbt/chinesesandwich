using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using WeddingFinancePlanner.Helpers;

namespace WeddingFinancePlanner.ViewModels;

public partial class MainViewModel : BaseViewModel
{
    private readonly INavigationService _navigation;

    [ObservableProperty]
    private string _activeSection = "Dashboard";

    [ObservableProperty]
    private BaseViewModel? _currentView;

    public MainViewModel(INavigationService navigation)
    {
        _navigation = navigation;
        // Keep CurrentView in sync with the navigation service
        if (navigation is NavigationService nav)
            nav.PropertyChanged += (_, args) =>
            {
                if (args.PropertyName == nameof(NavigationService.CurrentView))
                    CurrentView = nav.CurrentView;
            };
    }

    public void Initialize()
    {
        NavigateToDashboard();
    }

    [RelayCommand]
    private void NavigateToDashboard()
    {
        ActiveSection = "Dashboard";
        _navigation.NavigateTo<DashboardViewModel>();
    }

    [RelayCommand]
    private void NavigateToVendors()
    {
        ActiveSection = "Vendors";
        _navigation.NavigateTo<VendorListViewModel>();
    }

    [RelayCommand]
    private void NavigateToItems()
    {
        ActiveSection = "Items";
        _navigation.NavigateTo<ItemListViewModel>();
    }

    [RelayCommand]
    private void NavigateToPayments()
    {
        ActiveSection = "Payments";
        _navigation.NavigateTo<PaymentListViewModel>();
    }

    [RelayCommand]
    private void NavigateToPaymentMethods()
    {
        ActiveSection = "PaymentMethods";
        _navigation.NavigateTo<PaymentMethodListViewModel>();
    }

    [RelayCommand]
    private void NavigateToSplitSummary()
    {
        ActiveSection = "SplitSummary";
        _navigation.NavigateTo<SplitSummaryViewModel>();
    }

    [RelayCommand]
    private void NavigateToSettings()
    {
        ActiveSection = "Settings";
        _navigation.NavigateTo<SettingsViewModel>();
    }
}
