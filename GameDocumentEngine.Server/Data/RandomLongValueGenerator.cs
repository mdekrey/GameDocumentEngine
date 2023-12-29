using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.ValueGeneration;
using System.Security.Cryptography;

namespace GameDocumentEngine.Server.Data;

class RandomLongValueGenerator : ValueGenerator<long>
{
	private static readonly RandomNumberGenerator generator = RandomNumberGenerator.Create();

	public override bool GeneratesTemporaryValues => false;

	public override long Next(EntityEntry entry)
	{
		var bytes = new byte[8];
		do
		{
			generator.GetBytes(bytes);
		} while (bytes.All(b => b == 0));
		return BitConverter.ToInt64(bytes);
	}
}