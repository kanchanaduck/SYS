using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Newtonsoft.Json.Linq;
using System.Text.Json.Serialization;
using api_hrgis.Data;
using api_hrgis.Models;
using api_hrgis.Repository;

namespace api_hrgis
{
    public class Startup
    {
        readonly string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
        public Startup(IConfiguration configuration, IWebHostEnvironment env)
        {
            Configuration = configuration;
            Environment = env;
        }

        public IConfiguration Configuration { get; }
        public IWebHostEnvironment Environment { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            ///////////// Connect DbContext
            services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));

            services.AddDbContext<OracleDbContext>(options =>
                options.UseOracle(Configuration.GetConnectionString("OracleConnection")));

            ///////////// Set IRepository
            services.AddScoped<IRepository, Repository<ApplicationDbContext>>();
            ///////////// Check Environment
            if (Environment.IsDevelopment())
            {
                Console.WriteLine(Environment.EnvironmentName);
            }
            else if (Environment.IsStaging())
            {
                Console.WriteLine(Environment.EnvironmentName);
            }
            else
            {
                Console.WriteLine("Not dev or staging");
            }
            ///////////// Include Newtonsoft
            services.AddControllersWithViews()
                .AddJsonOptions(opts => opts.JsonSerializerOptions.PropertyNamingPolicy = null)
                .AddNewtonsoftJson();

            services.AddControllers().AddNewtonsoftJson(x =>
                x.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);

            services.AddControllers().AddJsonOptions(opt =>
            {
                opt.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });

            services.AddMvc(setupAction =>
            {
                setupAction.EnableEndpointRouting = false;
            }).AddJsonOptions(jsonOptions =>
            {
                jsonOptions.JsonSerializerOptions.PropertyNamingPolicy = null;
            })
                .SetCompatibilityVersion(CompatibilityVersion.Version_3_0);
            /////////////
            services.AddControllers();
            ///////////// Allow Origin
            services.AddCors(options =>
                        {
                            options.AddPolicy(name: MyAllowSpecificOrigins,
                            builder =>
                            {
                                builder.WithOrigins("*").AllowAnyOrigin()
                                    .AllowAnyHeader()
                                    .AllowAnyMethod();
                            });
                        });
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "api_hrgis", Version = "v1" });

                // To Enable authorization using Swagger (JWT)  
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 12345abcdef\"",
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                          new OpenApiSecurityScheme
                            {
                                Reference = new OpenApiReference
                                {
                                    Type = ReferenceType.SecurityScheme,
                                    Id = "Bearer"
                                }
                            },
                            new string[] {}

                    }
                });
                // End To Enable authorization using Swagger (JWT)  
            });

            // Adding Authentication
            // Microsoft.IdentityModel.Tokens, Microsoft.AspNetCore.Authentication.JwtBearer, System.IdentityModel.Tokens.Jwt
            // System.Text, System.Security.Claims, Newtonsoft.Json.Linq
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(option =>
            {
                option.RequireHttpsMetadata = false;
                option.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = Configuration["Jwt:ValidIssuer"],
                    ValidAudience = Configuration["Jwt:ValidAudience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["Jwt:Secret"]))
                };
                option.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = context =>
                    {
                        if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                        {
                            context.Response.Headers.Add("Token-Expired", "true");
                        }
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        JwtSecurityToken accessToken = context.SecurityToken as JwtSecurityToken;
                        if (accessToken != null)
                        {
                            ClaimsIdentity identity = context.Principal.Identity as ClaimsIdentity;
                            if (identity != null)
                            {
                                var handler = new JwtSecurityTokenHandler();
                                if (handler.CanReadToken(accessToken.RawData))
                                {
                                    var jwtToken = handler.ReadJwtToken(accessToken.RawData);
                                    var claimed = jwtToken.Claims.FirstOrDefault(claim => claim.Type == "user");

                                    JObject data = JObject.Parse("{" + claimed.ToString() + "}");
                                    Console.WriteLine(data);
                                    var emp_no = data["user"]["emp_no"];
                                    var title_name_en = data["user"]["title_name_en"];
                                    var firstname_en = data["user"]["firstname_en"];
                                    var lastname_en = data["user"]["lastname_en"];
                                    var fullname_en = data["user"]["fullname_en"];
                                    var shortname_en = data["user"]["shortname_en"];
                                    var div_code = data["user"]["div_code"];
                                    var div_abb = data["user"]["div_abb"];
                                    var dept_code = data["user"]["dept_code"];
                                    var dept_abb = data["user"]["dept_abb"];
                                    var org_code = data["user"]["org_code"];
                                    var band = data["user"]["band"];
                                    var position_name_en = data["user"]["position_name_en"];

                                    identity.AddClaim(new Claim("access_token", accessToken.RawData));
                                    // Console.WriteLine(empno);
                                    identity.AddClaim(new Claim("emp_no", emp_no.ToString()));
                                    identity.AddClaim(new Claim("title_name_en", title_name_en.ToString()));
                                    identity.AddClaim(new Claim("firstname_en", firstname_en.ToString()));
                                    identity.AddClaim(new Claim("lastname_en", lastname_en.ToString()));
                                    identity.AddClaim(new Claim("fullname_en", fullname_en.ToString()));
                                    identity.AddClaim(new Claim("shortname_en", shortname_en.ToString()));
                                    identity.AddClaim(new Claim("div_code", div_code.ToString()));
                                    identity.AddClaim(new Claim("div_abb", div_abb.ToString()));
                                    identity.AddClaim(new Claim("dept_code", dept_code.ToString()));
                                    identity.AddClaim(new Claim("dept_abb", dept_abb.ToString()));
                                    identity.AddClaim(new Claim("org_code", org_code.ToString()));
                                    identity.AddClaim(new Claim("band", band.ToString()));
                                    identity.AddClaim(new Claim("position_name_en", position_name_en.ToString()));
                                }
                            }
                        }
                        return Task.CompletedTask;
                    }
                };
            });
            // End Adding Authentication 
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();

                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "api_hrgis v1"));
                // app.UseSwaggerUI(c => c.SwaggerEndpoint("/api_hrgis/swagger/v1/swagger.json", "api_hrgis v1"));
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseCors(MyAllowSpecificOrigins); //Allow Post Hosting

            app.UseAuthentication();

            app.UseAuthorization();

            app.UseStatusCodePages();

            app.UseEndpoints(endpoints =>
            {
                 endpoints.MapDefaultControllerRoute();
            });
        }
    }
}