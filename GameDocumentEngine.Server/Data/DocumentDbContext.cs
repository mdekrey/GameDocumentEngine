using Microsoft.EntityFrameworkCore;

namespace GameDocumentEngine.Server.Data;

public class DocumentDbContext : DbContext
{

	public DocumentDbContext(DbContextOptions<DocumentDbContext> options) : base(options)
	{
	}

	public DbSet<Users.UserModel> Users { get; set; }

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);

		modelBuilder.Entity<Users.UserModel>()
			.HasPartitionKey(u => u.Id)
			.HasIndex(u => u.GoogleNameId);

	}
}
