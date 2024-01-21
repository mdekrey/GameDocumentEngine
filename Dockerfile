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

FROM node:18.17-alpine AS build-ui
WORKDIR /src
# brotli is added for the `brotli` compression below
# OpenAPI Codegeneration is using dotnet7-runtime
RUN apk add --no-cache brotli dotnet7-sdk curl git

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PNPM_VERSION=v8.3.1
ENV PATH=$PATH:$PNPM_HOME
RUN curl -fsSL "https://github.com/pnpm/pnpm/releases/download/${PNPM_VERSION}/pnpm-linuxstatic-x64" -o /bin/pnpm && chmod +x /bin/pnpm

COPY ./eng/ ./eng/
COPY ["./GameDocumentEngine.Ui/package.json", "./GameDocumentEngine.Ui/"]
COPY ["./package.json", "./package.json"]
COPY ["./pnpm-lock.yaml", "./"]
COPY ["./pnpm-workspace.yaml", "./"]
COPY ["./.npmrc", "./"]
COPY ["./GameDocumentEngine.Ui/GameDocumentEngine.Ui.esproj", "./GameDocumentEngine.Ui/"]
COPY ["./Directory.Build.props", "./"]
COPY ["./eng/pnpm/", "./eng/pnpm/"]
RUN pnpm install --frozen-lockfile && cd ./GameDocumentEngine.Ui/ && dotnet restore -p:Configuration=Release

COPY ./schemas/ ./schemas/
COPY ./GameDocumentEngine.Ui/ ./GameDocumentEngine.Ui/

ARG GITHASH
ENV VITE_GITHASH=${GITHASH}
RUN cd ./GameDocumentEngine.Ui/ && dotnet build -p:Configuration=Release

WORKDIR /src/GameDocumentEngine.Ui/src
# Copy json config files to /src/GameDocumentEngine.Server/config, preserving folder structure
RUN cd utils/i18n && find . -type f -regex ".*\.json" | cpio -dumv -p /src/GameDocumentEngine.Server/config/core/.
RUN cd doc-types && find . -type f -regex ".*\.json" | cpio -dumv -p /src/GameDocumentEngine.Server/config/doc-types/.
RUN cd game-types && find . -type f -regex ".*\.json" | cpio -dumv -p /src/GameDocumentEngine.Server/config/game-types/.

WORKDIR /src/GameDocumentEngine.Server/wwwroot
RUN find . -type f -not -regex ".*\.\(avif\|jpg\|jpeg\|gif\|png\|webp\|mp4\|webm\)" -exec gzip -k "{}" \; -exec brotli -k "{}" \;

FROM base AS final
WORKDIR /app
ARG GITHASH
ENV BUILD__GITHASH=${GITHASH}
ENV DYNAMICTYPES__GAMETYPESROOT=./config/game-types
ENV DYNAMICTYPES__DOCUMENTTYPESROOT=./config/doc-types
ENV DYNAMICTYPES__DOCUMENTSCHEMAPATH=./config/doc-types/<documenttype>/schema.json
ENV LOCALIZATION__BUNDLEPATH=./config/core/<lang>.json
ENV LOCALIZATION__STANDARDPATH=./config/core/<namespace>/<lang>.json
ENV LOCALIZATION__GAMETYPESPATH=./config/game-types/<gametype>/i18n/<lang>.json
ENV LOCALIZATION__DOCUMENTTYPESPATH=./config/doc-types/<documenttype>/i18n/<lang>.json
COPY --from=build-dotnet /src/artifacts/bin/GameDocumentEngine.Server/Release/net7.0/linux-x64/publish .
COPY --from=build-ui /src/GameDocumentEngine.Server/wwwroot ./wwwroot
COPY --from=build-ui /src/GameDocumentEngine.Server/config ./config


ENTRYPOINT ["dotnet", "GameDocumentEngine.Server.dll"]
