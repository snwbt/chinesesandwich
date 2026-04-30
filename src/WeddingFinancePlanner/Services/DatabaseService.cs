using Microsoft.EntityFrameworkCore;
using WeddingFinancePlanner.Data;
using WeddingFinancePlanner.Models;
using WeddingFinancePlanner.Models.Enums;

namespace WeddingFinancePlanner.Services;

public class DatabaseService : IDatabaseService
{
    private readonly IDbContextFactory<AppDbContext> _contextFactory;

    public DatabaseService(IDbContextFactory<AppDbContext> contextFactory)
    {
        _contextFactory = contextFactory;
    }

    // Vendors
    public async Task<List<Vendor>> GetVendorsAsync()
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        return await db.Vendors.OrderBy(v => v.Name).ToListAsync();
    }

    public async Task<Vendor?> GetVendorByIdAsync(int id)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        return await db.Vendors.Include(v => v.Payments).Include(v => v.Items).FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task<Vendor> AddVendorAsync(Vendor vendor)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        vendor.CreatedAt = DateTime.UtcNow;
        vendor.UpdatedAt = DateTime.UtcNow;
        db.Vendors.Add(vendor);
        await db.SaveChangesAsync();
        return vendor;
    }

    public async Task<Vendor> UpdateVendorAsync(Vendor vendor)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        vendor.UpdatedAt = DateTime.UtcNow;
        db.Vendors.Update(vendor);
        await db.SaveChangesAsync();
        return vendor;
    }

    public async Task DeleteVendorAsync(int id)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        var vendor = await db.Vendors.FindAsync(id);
        if (vendor != null)
        {
            db.Vendors.Remove(vendor);
            await db.SaveChangesAsync();
        }
    }

    // Items
    public async Task<List<Item>> GetItemsAsync()
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        return await db.Items.Include(i => i.Vendor).OrderBy(i => i.Name).ToListAsync();
    }

    public async Task<Item?> GetItemByIdAsync(int id)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        return await db.Items.Include(i => i.Vendor).Include(i => i.Payments).ThenInclude(p => p.PaymentMethod).FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<Item> AddItemAsync(Item item)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        item.CreatedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;
        db.Items.Add(item);
        await db.SaveChangesAsync();
        return item;
    }

    public async Task<Item> UpdateItemAsync(Item item)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        item.UpdatedAt = DateTime.UtcNow;
        db.Items.Update(item);
        await db.SaveChangesAsync();
        return item;
    }

    public async Task DeleteItemAsync(int id)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        var item = await db.Items.FindAsync(id);
        if (item != null)
        {
            db.Items.Remove(item);
            await db.SaveChangesAsync();
        }
    }

    // Payments
    public async Task<List<Payment>> GetPaymentsAsync()
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        return await db.Payments
            .Include(p => p.Vendor)
            .Include(p => p.Item)
            .Include(p => p.PaymentMethod)
            .OrderByDescending(p => p.DueDate)
            .ToListAsync();
    }

    public async Task<List<Payment>> GetPaymentsByVendorAsync(int vendorId)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        return await db.Payments
            .Include(p => p.PaymentMethod)
            .Where(p => p.VendorId == vendorId)
            .OrderBy(p => p.DueDate)
            .ToListAsync();
    }

    public async Task<List<Payment>> GetPaymentsByItemAsync(int itemId)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        return await db.Payments
            .Include(p => p.PaymentMethod)
            .Where(p => p.ItemId == itemId)
            .OrderBy(p => p.DueDate)
            .ToListAsync();
    }

    public async Task<List<Payment>> GetUpcomingPaymentsAsync(int days = 30)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        var cutoff = DateTime.Today.AddDays(days);
        return await db.Payments
            .Include(p => p.Vendor)
            .Include(p => p.Item)
            .Include(p => p.PaymentMethod)
            .Where(p => p.Status != PaymentStatus.Paid && p.DueDate.HasValue && p.DueDate.Value >= DateTime.Today && p.DueDate.Value <= cutoff)
            .OrderBy(p => p.DueDate)
            .ToListAsync();
    }

    public async Task<List<Payment>> GetOverduePaymentsAsync()
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        return await db.Payments
            .Include(p => p.Vendor)
            .Include(p => p.Item)
            .Include(p => p.PaymentMethod)
            .Where(p => p.Status == PaymentStatus.Overdue || (p.Status != PaymentStatus.Paid && p.DueDate.HasValue && p.DueDate.Value < DateTime.Today))
            .OrderBy(p => p.DueDate)
            .ToListAsync();
    }

    public async Task<Payment?> GetPaymentByIdAsync(int id)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        return await db.Payments
            .Include(p => p.Vendor)
            .Include(p => p.Item)
            .Include(p => p.PaymentMethod)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Payment> AddPaymentAsync(Payment payment)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        payment.CreatedAt = DateTime.UtcNow;
        payment.UpdatedAt = DateTime.UtcNow;
        db.Payments.Add(payment);
        await db.SaveChangesAsync();
        return payment;
    }

    public async Task<Payment> UpdatePaymentAsync(Payment payment)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        payment.UpdatedAt = DateTime.UtcNow;
        db.Payments.Update(payment);
        await db.SaveChangesAsync();
        return payment;
    }

    public async Task DeletePaymentAsync(int id)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        var payment = await db.Payments.FindAsync(id);
        if (payment != null)
        {
            db.Payments.Remove(payment);
            await db.SaveChangesAsync();
        }
    }

    // Payment Methods
    public async Task<List<PaymentMethod>> GetPaymentMethodsAsync()
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        return await db.PaymentMethods.OrderBy(pm => pm.Name).ToListAsync();
    }

    public async Task<PaymentMethod?> GetPaymentMethodByIdAsync(int id)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        return await db.PaymentMethods.Include(pm => pm.Payments).FirstOrDefaultAsync(pm => pm.Id == id);
    }

    public async Task<PaymentMethod> AddPaymentMethodAsync(PaymentMethod method)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        method.CreatedAt = DateTime.UtcNow;
        method.UpdatedAt = DateTime.UtcNow;
        db.PaymentMethods.Add(method);
        await db.SaveChangesAsync();
        return method;
    }

    public async Task<PaymentMethod> UpdatePaymentMethodAsync(PaymentMethod method)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        method.UpdatedAt = DateTime.UtcNow;
        db.PaymentMethods.Update(method);
        await db.SaveChangesAsync();
        return method;
    }

    public async Task DeletePaymentMethodAsync(int id)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        var method = await db.PaymentMethods.FindAsync(id);
        if (method != null)
        {
            db.PaymentMethods.Remove(method);
            await db.SaveChangesAsync();
        }
    }

    // Settings
    public async Task<AppSettings> GetSettingsAsync()
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        return await db.AppSettings.FirstAsync();
    }

    public async Task SaveSettingsAsync(AppSettings settings)
    {
        await using var db = await _contextFactory.CreateDbContextAsync();
        db.AppSettings.Update(settings);
        await db.SaveChangesAsync();
    }
}
