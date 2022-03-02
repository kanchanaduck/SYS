using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace AngularFirst.Controllers
{
    public class OidcConfigurationController : Controller
    {
        private readonly ILogger<OidcConfigurationController> _logger;

        public OidcConfigurationController(ILogger<OidcConfigurationController> logger)
        {
            _logger = logger;
        }

        [HttpGet("_configuration/{clientId}")]
        public IActionResult GetClientRequestParameters([FromRoute]string clientId)
        {
            /* var parameters = ClientRequestParametersProvider.GetClientParameters(HttpContext, clientId);
            return Ok(parameters); */
            return Ok();
        }
    }
}
