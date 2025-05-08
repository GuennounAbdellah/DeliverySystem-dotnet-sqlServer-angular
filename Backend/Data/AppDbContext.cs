using Microsoft.EntityFrameworkCore;
using Backend.Entities;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Role> Roles { get; set; }
        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<RolesUser> RolesUsers { get; set; }
        public virtual DbSet<Client> Clients { get; set; }
        public virtual DbSet<Compteur> Compteurs { get; set; }
        public virtual DbSet<Unite> Unites { get; set; }
        public virtual DbSet<Famille> Familles { get; set; }
        public virtual DbSet<Article> Articles { get; set; }
        public virtual DbSet<Livraison> Livraisons { get; set; }
        public virtual DbSet<DetailLivraison> DetailLivraisons { get; set; }
        public virtual DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
                        // Article
            modelBuilder.Entity<Article>().Property(a => a.PuHt).HasPrecision(18, 2);
            modelBuilder.Entity<Article>().Property(a => a.MontantHt).HasPrecision(18, 2);

            // DetailLivraison
            modelBuilder.Entity<DetailLivraison>().Property(d => d.PuHt).HasPrecision(18, 2);
            modelBuilder.Entity<DetailLivraison>().Property(d => d.PuHtRemise).HasPrecision(18, 2);
            modelBuilder.Entity<DetailLivraison>().Property(d => d.PuTtc).HasPrecision(18, 2);
            modelBuilder.Entity<DetailLivraison>().Property(d => d.PuTtcRemise).HasPrecision(18, 2);
            modelBuilder.Entity<DetailLivraison>().Property(d => d.MontantHt).HasPrecision(18, 2);
            modelBuilder.Entity<DetailLivraison>().Property(d => d.MontantTtc).HasPrecision(18, 2);
            modelBuilder.Entity<DetailLivraison>().Property(d => d.RemiseHt).HasPrecision(18, 2);
            modelBuilder.Entity<DetailLivraison>().Property(d => d.RemiseTtc).HasPrecision(18, 2);

            // Livraison
            modelBuilder.Entity<Livraison>().Property(l => l.Escompte).HasPrecision(18, 2);
            modelBuilder.Entity<Livraison>().Property(l => l.TotalHt).HasPrecision(18, 2);
            modelBuilder.Entity<Livraison>().Property(l => l.TotalTva).HasPrecision(18, 2);
            modelBuilder.Entity<Livraison>().Property(l => l.TotalTtc).HasPrecision(18, 2);

            base.OnModelCreating(modelBuilder);

            // RoleUser: configure unique constraint if needed
            modelBuilder.Entity<RolesUser>()
                .HasOne(ru => ru.Role)
                .WithMany(r => r.RolesUsers)
                .HasForeignKey(ru => ru.RoleId);

            modelBuilder.Entity<RolesUser>()
                .HasOne(ru => ru.User)
                .WithMany(u => u.RolesUsers)
                .HasForeignKey(ru => ru.UserId);

            // User ⇄ Livraison
            modelBuilder.Entity<Livraison>()
                .HasOne(l => l.User)
                .WithMany(u => u.Livraisons)
                .HasForeignKey(l => l.UserId);

            // Client ⇄ Livraison
            modelBuilder.Entity<Livraison>()
                .HasOne(l => l.Client)
                .WithMany(c => c.Livraisons)
                .HasForeignKey(l => l.ClientId);

            // Livraison ⇄ DetailLivraison
            modelBuilder.Entity<DetailLivraison>()
                .HasOne(d => d.Livraison)
                .WithMany(l => l.DetailLivraisons)
                .HasForeignKey(d => d.LivraisonId);

            // Article ⇄ DetailLivraison
            modelBuilder.Entity<DetailLivraison>()
                .HasOne(d => d.Article)
                .WithMany(a => a.DetailLivraisons)
                .HasForeignKey(d => d.ArticleId);

            // Unite ⇄ Article
            modelBuilder.Entity<Article>()
                .HasOne(a => a.Unite)
                .WithMany(u => u.Articles)
                .HasForeignKey(a => a.UniteId);

            // Famille ⇄ Article
            modelBuilder.Entity<Article>()
                .HasOne(a => a.Famille)
                .WithMany(f => f.Articles)
                .HasForeignKey(a => a.FamilleId);

            // AuditLog ⇄ User
            modelBuilder.Entity<AuditLog>()
                .HasOne(al => al.User)
                .WithMany(u => u.AuditLogs)
                .HasForeignKey(al => al.UserId);

            // Additional configurations can be added here
        }
    }
}
