using System.Windows.Controls;
using System.Windows.Input;
using WeddingFinancePlanner.ViewModels;

namespace WeddingFinancePlanner.Views;

public partial class ItemListView : UserControl
{
    public ItemListView() => InitializeComponent();

    private void DataGrid_MouseDoubleClick(object sender, MouseButtonEventArgs e)
    {
        if (DataContext is ItemListViewModel vm && ((DataGrid)sender).SelectedItem is Models.Item item)
            vm.EditItemCommand.Execute(item);
    }
}
