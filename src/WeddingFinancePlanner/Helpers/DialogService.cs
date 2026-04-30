using System.Windows;

namespace WeddingFinancePlanner.Helpers;

public interface IDialogService
{
    Task<bool> ConfirmDeleteAsync(string itemName);
    void ShowError(string message);
}

public class DialogService : IDialogService
{
    public Task<bool> ConfirmDeleteAsync(string itemName)
    {
        var result = MessageBox.Show(
            $"Delete \"{itemName}\"? This cannot be undone.",
            "Confirm Delete",
            MessageBoxButton.YesNo,
            MessageBoxImage.Warning);
        return Task.FromResult(result == MessageBoxResult.Yes);
    }

    public void ShowError(string message)
    {
        MessageBox.Show(message, "Error", MessageBoxButton.OK, MessageBoxImage.Error);
    }
}
