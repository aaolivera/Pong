﻿using Microsoft.Owin;
using Owin;
using Pong;

[assembly: OwinStartup(typeof(Startup))]
namespace Pong
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            // Any connection or hub wire up and configuration should go here
            app.MapSignalR();
        }
    }
}