using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.IO;
using System.Windows;
using WeddingFinancePlanner.Data;
using WeddingFinancePlanner.Helpers;
using WeddingFinancePlanner.Services;
using WeddingFinancePlanner.ViewModels;

namespace WeddingFinancePlanner;

public partial class App : Application
{
    private ServiceProvider? _services;

    public App()
    {
        InitializeComponent();
    }

    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        try
        {
            var services = new ServiceCollection();
            ConfigureServices(services);
            _services = services.BuildServiceProvider();

            using var scope = _services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.Migrate();

            var mainVm = _services.GetRequiredService<MainViewModel>();

            var window = new WeddingFinancePlanner.Views.MainWindow
            {
                DataContext = mainVm
            };

            MainWindow = window;
            window.Show();
            mainVm.Initialize();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Startup error:\n\n{ex}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            Shutdown(1);
        }
    }

    protected override void OnExit(ExitEventArgs e)
    {
        _services?.Dispose();
        base.OnExit(e);
    }

    private static void ConfigureServices(IServiceCollection services)
    {
        var dbPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "WeddingFinancePlanner",
            "wedding.db");
        Directory.CreateDirectory(Path.GetDirectoryName(dbPath)!);

        services.AddDbContextFactory<AppDbContext>(options =>
            options.UseSqlite($"Data Source={dbPath}"));

        services.AddSingleton<IDatabaseService, DatabaseService>();
        services.AddSingleton<ISplitCalculationService, SplitCalculationService>();
        services.AddSingleton<IBudgetCalculationService, BudgetCalculationService>();
        services.AddSingleton<IPaymentStatusService, PaymentStatusService>();
        services.AddSingleton<IDialogService, DialogService>();

        services.AddSingleton<NavigationService>();
        services.AddSingleton<INavigationService>(sp => sp.GetRequiredService<NavigationService>());

        services.AddSingleton<MainViewModel>();
        services.AddTransient<DashboardViewModel>();
        services.AddTransient<VendorListViewModel>();
        services.AddTransient<ItemListViewModel>();
        services.AddTransient<PaymentListViewModel>();
        services.AddTransient<PaymentMethodListViewModel>();
        services.AddTransient<SplitSummaryViewModel>();
        services.AddTransient<SettingsViewModel>();
    }
}
