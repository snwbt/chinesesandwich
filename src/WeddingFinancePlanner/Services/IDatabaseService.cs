using Microsoft.EntityFrameworkCore;
using WeddingFinancePlanner.Data;
using WeddingFinancePlanner.Models;
using WeddingFinancePlanner.Models.Enums;

namespace WeddingFinancePlanner.Services;

public interface IDatabaseService
{
    Task<List<Vendor>> GetVendorsAsync();
    Task<Vendor?> GetVendorByIdAsync(int id);
    Task<Vendor> AddVendorAsync(Vendor vendor);
    Task<Vendor> UpdateVendorAsync(Vendor vendor);
    Task DeleteVendorAsync(int id);

    Task<List<Item>> GetItemsAsync();
    Task<Item?> GetItemByIdAsync(int id);
    Task<Item> AddItemAsync(Item item);
    Task<Item> UpdateItemAsync(Item item);
    Task DeleteItemAsync(int id);

    Task<List<Payment>> GetPaymentsAsync();
    Task<List<Payment>> GetPaymentsByVendorAsync(int vendorId);
    Task<List<Payment>> GetPaymentsByItemAsync(int itemId);
    Task<List<Payment>> GetUpcomingPaymentsAsync(int days = 30);
    Task<List<Payment>> GetOverduePaymentsAsync();
    Task<Payment?> GetPaymentByIdAsync(int id);
    Task<Payment> AddPaymentAsync(Payment payment);
    Task<Payment> UpdatePaymentAsync(Payment payment);
    Task DeletePaymentAsync(int id);

    Task<List<PaymentMethod>> GetPaymentMethodsAsync();
    Task<PaymentMethod?> GetPaymentMethodByIdAsync(int id);
    Task<PaymentMethod> AddPaymentMethodAsync(PaymentMethod method);
    Task<PaymentMethod> UpdatePaymentMethodAsync(PaymentMethod method);
    Task DeletePaymentMethodAsync(int id);

    Task<AppSettings> GetSettingsAsync();
    Task SaveSettingsAsync(AppSettings settings);
}
