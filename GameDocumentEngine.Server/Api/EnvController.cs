using GameDocumentEngine.Server.Api;
using Microsoft.Extensions.Options;

namespace GameDocumentEngine.Server.Api;

public class EnvController : EnvControllerBase
{
	private readonly BuildOptions buildOptions;

	public EnvController(IOptions<BuildOptions> buildOptions)
	{
		this.buildOptions = buildOptions.Value;
	}

	protected override Task<GetInfoActionResult> GetInfo()
	{
		return Task.FromResult(GetInfoActionResult.Ok(new GetInfoResponse(buildOptions.GitHash)));
	}
}
