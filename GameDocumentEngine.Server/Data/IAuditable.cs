namespace GameDocumentEngine.Server.Data;

public interface IAuditable
{
	DateTimeOffset CreatedDate { get; }
	string? CreatedBy { get; }
	DateTimeOffset LastModifiedDate { get; }
	string? LastModifiedBy { get; }
}
