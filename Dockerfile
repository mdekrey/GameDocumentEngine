FROM mcr.microsoft.com/dotnet/aspnet:7.0.10 AS base
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:80

FROM mcr.microsoft.com/dotnet/sdk:7.0.400 AS build-dotnet
WORKDIR /src

COPY ./eng/ ./eng/
COPY ["./GameDocumentEngine.sln", "./"]
COPY ["./Directory.Build.props", "./"]
COPY ["./global.json", "./"]
COPY ["./GameDocumentEngine.Server/GameDocumentEngine.Server.csproj", "./GameDocumentEngine.Server/"]
RUN cd ./GameDocumentEngine.Server/ && dotnet restore --use-current-runtime

WORKDIR /src
COPY ./schemas/ ./schemas/
COPY ./GameDocumentEngine.Server/ ./GameDocumentEngine.Server/
COPY .editorconfig .editorconfig

RUN cd ./GameDocumentEngine.Server/ && dotnet build -c Release --no-restore --use-current-runtime --self-contained
RUN cd ./GameDocumentEngine.Server/ && dotnet publish -c Release -p:PublishReadyToRun=true --use-current-runtime --self-contained

FROM node:18-alpine AS build-ui
WORKDIR /src
# brotli is added for the `brotli` compression below
# OpenAPI Codegeneration is using dotnet7-runtime
RUN apk add --no-cache brotli dotnet7-sdk

COPY ./eng/ ./eng/
COPY ["./GameDocumentEngine.Ui/package.json", "./GameDocumentEngine.Ui/"]
COPY ["./GameDocumentEngine.Ui/package-lock.json", "./GameDocumentEngine.Ui/"]
COPY ["./GameDocumentEngine.Ui/GameDocumentEngine.Ui.esproj", "./GameDocumentEngine.Ui/"]
COPY ["./Directory.Build.props", "./"]
RUN cd ./GameDocumentEngine.Ui/ && dotnet restore -p:Configuration=Release

COPY ./schemas/ ./schemas/
COPY ./GameDocumentEngine.Ui/ ./GameDocumentEngine.Ui/

ARG GITHASH
ENV VITE_GITHASH=${GITHASH}
RUN cd ./GameDocumentEngine.Ui/ && dotnet build -p:Configuration=Release

WORKDIR /src/GameDocumentEngine.Ui/src
# Copy i18n files to /i18n, preserving folder structure
RUN cd utils/i18n && find . -type f -regex ".*/.*\.json" | cpio -dumv -p /i18n/core/.
RUN cd documents && find . -type f -regex ".*/i18n/.*\.json" | cpio -dumv -p /i18n/doc-types/.
RUN cd game-types && find . -type f -regex ".*/i18n/.*\.json" | cpio -dumv -p /i18n/game-types/.

WORKDIR /src/GameDocumentEngine.Server/wwwroot
RUN find . -type f -not -regex ".*\.\(avif\|jpg\|jpeg\|gif\|png\|webp\|mp4\|webm\)" -exec gzip -k "{}" \; -exec brotli -k "{}" \;

FROM base AS final
WORKDIR /app
ARG GITHASH
ENV BUILD__GITHASH=${GITHASH}
ENV LOCALIZATION__BUNDLEROOT=./i18n/core/<lang>.json
ENV LOCALIZATION__STANDARDROOT=./i18n/core/<namespace>/<lang>.json
ENV LOCALIZATION__GAMETYPESROOT=./i18n/game-types/<gametype>/i18n/<lang>.json
ENV LOCALIZATION__DOCUMENTTYPESROOT=./i18n/doc-types/<documenttype>/i18n/<lang>.json
COPY --from=build-dotnet /src/artifacts/bin/GameDocumentEngine.Server/Release/net7.0/linux-x64/publish .
COPY --from=build-ui /src/GameDocumentEngine.Server/wwwroot ./wwwroot
COPY --from=build-ui /i18n ./i18n


ENTRYPOINT ["dotnet", "GameDocumentEngine.Server.dll"]
