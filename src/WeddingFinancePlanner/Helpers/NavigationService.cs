using CommunityToolkit.Mvvm.ComponentModel;
using Microsoft.Extensions.DependencyInjection;
using WeddingFinancePlanner.ViewModels;

namespace WeddingFinancePlanner.Helpers;

public partial class NavigationService : ObservableObject, INavigationService
{
    private readonly IServiceProvider _services;

    [ObservableProperty]
    private BaseViewModel? _currentView;

    public NavigationService(IServiceProvider services)
    {
        _services = services;
    }

    public void NavigateTo<TViewModel>() where TViewModel : BaseViewModel
    {
        var vm = _services.GetRequiredService<TViewModel>();
        NavigateTo(vm);
    }

    public void NavigateTo(BaseViewModel viewModel)
    {
        CurrentView = viewModel;
        if (viewModel is ILoadable loadable)
            _ = loadable.LoadAsync();
    }
}

public interface ILoadable
{
    Task LoadAsync();
}
