using System.Web.Mvc;

namespace Pong.Helper
{
    public static class ExtensionesUrl
    {
        private static readonly string AssemblyVersionParams = "?v=" + typeof(MvcApplication).Assembly.GetName().Version;

        public static string Script(this UrlHelper helper, string url)
        {
            return helper.Content(url + AssemblyVersionParams);
        }

        public static string Css(this UrlHelper helper, string url)
        {
            return helper.Content(url + AssemblyVersionParams);
        }
    }
}
