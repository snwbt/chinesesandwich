using Microsoft.EntityFrameworkCore;
using WeddingFinancePlanner.Models;

namespace WeddingFinancePlanner.Data;

public class AppDbContext : DbContext
{
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<PaymentMethod> PaymentMethods => Set<PaymentMethod>();
    public DbSet<AppSettings> AppSettings => Set<AppSettings>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Vendor>(e =>
        {
            e.Property(v => v.Name).HasMaxLength(200).IsRequired();
            e.Property(v => v.ContactName).HasMaxLength(200);
            e.Property(v => v.ContactEmail).HasMaxLength(200);
            e.Property(v => v.ContactPhone).HasMaxLength(50);
            e.Property(v => v.Notes).HasMaxLength(2000);
            e.Property(v => v.ContractTotal).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Item>(e =>
        {
            e.Property(i => i.Name).HasMaxLength(200).IsRequired();
            e.Property(i => i.Description).HasMaxLength(2000);
            e.Property(i => i.EstimatedCost).HasPrecision(18, 2);
            e.Property(i => i.ActualCost).HasPrecision(18, 2);
            e.Property(i => i.SplitPercentageA).HasPrecision(5, 2);
            e.Property(i => i.SplitFixedAmountA).HasPrecision(18, 2);
            e.HasOne(i => i.Vendor).WithMany(v => v.Items).HasForeignKey(i => i.VendorId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Payment>(e =>
        {
            e.Property(p => p.Description).HasMaxLength(500);
            e.Property(p => p.Amount).HasPrecision(18, 2);
            e.Property(p => p.SplitPercentageA).HasPrecision(5, 2);
            e.Property(p => p.SplitFixedAmountA).HasPrecision(18, 2);
            e.HasOne(p => p.Vendor).WithMany(v => v.Payments).HasForeignKey(p => p.VendorId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(p => p.Item).WithMany(i => i.Payments).HasForeignKey(p => p.ItemId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(p => p.PaymentMethod).WithMany(pm => pm.Payments).HasForeignKey(p => p.PaymentMethodId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<PaymentMethod>(e =>
        {
            e.Property(pm => pm.Name).HasMaxLength(200).IsRequired();
            e.Property(pm => pm.LastFourDigits).HasMaxLength(4);
            e.Property(pm => pm.Notes).HasMaxLength(500);
        });

        modelBuilder.Entity<AppSettings>(e =>
        {
            e.Property(s => s.PartnerAName).HasMaxLength(100);
            e.Property(s => s.PartnerBName).HasMaxLength(100);
            e.Property(s => s.TotalBudget).HasPrecision(18, 2);
            e.Property(s => s.CurrencySymbol).HasMaxLength(5);
            e.HasData(new AppSettings
            {
                Id = 1,
                PartnerAName = "Partner A",
                PartnerBName = "Partner B",
                TotalBudget = 0,
                CurrencySymbol = "$"
            });
        });
    }
}
