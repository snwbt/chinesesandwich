using WeddingFinancePlanner.ViewModels;

namespace WeddingFinancePlanner.Helpers;

public interface INavigationService
{
    void NavigateTo<TViewModel>() where TViewModel : BaseViewModel;
    void NavigateTo(BaseViewModel viewModel);
}
