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
	}
}
