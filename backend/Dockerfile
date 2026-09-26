# Multi-stage Dockerfile for ASP.NET Core Production Build (.NET 10)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy build props, targets, editorconfig, and solution
COPY Directory.Build.props ./
COPY Directory.Build.targets ./
COPY .editorconfig ./
COPY EcommercePlatform.slnx ./

# Copy all project files for optimized layer caching
COPY src/Ecommerce.Domain/*.csproj src/Ecommerce.Domain/
COPY src/Ecommerce.Infrastructure/*.csproj src/Ecommerce.Infrastructure/
COPY src/Ecommerce.Modules.Catalog/*.csproj src/Ecommerce.Modules.Catalog/
COPY src/Ecommerce.Modules.Customers/*.csproj src/Ecommerce.Modules.Customers/
COPY src/Ecommerce.Modules.Identity/*.csproj src/Ecommerce.Modules.Identity/
COPY src/Ecommerce.Modules.Inventory/*.csproj src/Ecommerce.Modules.Inventory/
COPY src/Ecommerce.Modules.Orders/*.csproj src/Ecommerce.Modules.Orders/
COPY src/Ecommerce.Modules.Payments/*.csproj src/Ecommerce.Modules.Payments/
COPY src/Ecommerce.Api/*.csproj src/Ecommerce.Api/
COPY tests/Ecommerce.UnitTests/*.csproj tests/Ecommerce.UnitTests/

# Restore dependencies
RUN dotnet restore

# Copy all sources and build
COPY src/ src/
COPY tests/ tests/

# Run unit and architecture tests in build pipeline
RUN dotnet test tests/Ecommerce.UnitTests/Ecommerce.UnitTests.csproj --no-restore -c Release

# Publish API
RUN dotnet publish src/Ecommerce.Api/Ecommerce.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 5000

ENV ASPNETCORE_URLS=http://+:8080;http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Ecommerce.Api.dll"]
