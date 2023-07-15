using Microsoft.EntityFrameworkCore;

namespace GameDocumentEngine.Server.Data;

public class DocumentDbContext : DbContext
{
	public DocumentDbContext(DbContextOptions<DocumentDbContext> options) : base(options)
	{
	}

	public DbSet<Users.UserModel> Users { get; set; }
	public DbSet<Documents.GameModel> Games { get; set; }
	public DbSet<Documents.GameUserModel> GameUsers { get; set; }
	public DbSet<Documents.DocumentModel> Documents { get; set; }
	public DbSet<Documents.DocumentUserModel> DocumentUsers { get; set; }

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);

		modelBuilder.Entity<Users.UserModel>(entity =>
		{
			entity.HasKey(u => u.Id);
			entity.HasIndex(u => u.GoogleNameId);
			entity.HasMany(u => u.Games).WithOne(u => u.User).HasForeignKey(u => u.UserId);
		});

		modelBuilder.Entity<Documents.GameModel>(entity =>
		{
			entity.HasKey(g => g.Id);
			entity.HasMany(g => g.Players).WithOne(u => u.Game).HasForeignKey(u => u.GameId);
		});

		modelBuilder.Entity<Documents.GameUserModel>(entity =>
		{
			entity.HasKey(gu => new { gu.UserId, gu.GameId });
			entity.HasIndex(gu => gu.GameId);
		});

		modelBuilder.Entity<Documents.DocumentModel>(entity =>
		{
			entity.HasKey(d => d.Id);
			entity.HasIndex(d => new { d.GameId, d.Id });
			entity.HasMany(du => du.Players).WithOne(u => u.Document).HasPrincipalKey(d => new { d.GameId, d.Id }).HasForeignKey(du => new { du.GameId, du.DocumentId });
		});

		modelBuilder.Entity<Documents.DocumentUserModel>(entity =>
		{
			entity.HasKey(du => new { du.UserId, du.DocumentId });
			entity.HasIndex(d => new { d.DocumentId });
			entity.HasOne(du => du.GameUser).WithMany().HasForeignKey(gu => new { gu.GameId, gu.DocumentId });
			entity.HasOne(du => du.User).WithMany().HasForeignKey(du => du.UserId);
		});
	}
}
