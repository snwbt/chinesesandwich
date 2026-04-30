using System.Windows.Controls;
using System.Windows.Input;
using WeddingFinancePlanner.ViewModels;

namespace WeddingFinancePlanner.Views;

public partial class PaymentListView : UserControl
{
    public PaymentListView() => InitializeComponent();

    private void DataGrid_MouseDoubleClick(object sender, MouseButtonEventArgs e)
    {
        if (DataContext is PaymentListViewModel vm && ((DataGrid)sender).SelectedItem is Models.Payment p)
            vm.EditPaymentCommand.Execute(p);
    }
}
