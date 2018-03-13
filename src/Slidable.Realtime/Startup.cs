using System;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using StackExchange.Redis;
using IHostingEnvironment = Microsoft.AspNetCore.Hosting.IHostingEnvironment;

namespace Slidable.Realtime
{
    [PublicAPI]
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        private IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            var redisHost = Configuration.GetSection("Redis").GetValue<string>("Host");
            var redisPort = Configuration.GetSection("Redis").GetValue<int>("Port");
            if (redisPort == 0)
            {
                redisPort = 6379;
            }

            services.AddSingleton(_ => ConnectionMultiplexer.Connect($"{redisHost}:{redisPort}"));
            services.AddSingleton<IHostedService, RedisSubscriber>();

            services.AddSignalR(o => { o.KeepAliveInterval = TimeSpan.FromSeconds(5); });
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            var pathBase = Configuration["Runtime:PathBase"];
            if (!string.IsNullOrEmpty(pathBase))
            {
                app.UsePathBase(pathBase);
            }

            app.UseStaticFiles();

            app.UseSignalR(routes => { routes.MapHub<LiveHub>("/live"); });
        }
    }
}
