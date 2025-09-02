import { NextResponse } from "next/server";

// Map platformId (e.g., NA1) to spectator host
// Source: common usage by community tools; Riot routes spectator over 80
const spectatorHosts = {
  BR1: "spectator.br.lol.riotgames.com:80",
  EUN1: "spectator.eu.lol.riotgames.com:80",
  EUW1: "spectator.eu.lol.riotgames.com:80",
  JP1: "spectator.jp.lol.riotgames.com:80",
  KR: "spectator.kr.lol.riotgames.com:80",
  LA1: "spectator.na.lol.riotgames.com:80",
  LA2: "spectator.na.lol.riotgames.com:80",
  ME1: "spectator.eu.lol.riotgames.com:80",
  NA1: "spectator.na.lol.riotgames.com:80",
  OC1: "spectator.oc1.lol.riotgames.com:80",
  RU: "spectator.ru.lol.riotgames.com:80",
  TR1: "spectator.tr.lol.riotgames.com:80",
  SG2: "spectator.sg.lol.riotgames.com:80",
  TW2: "spectator.tw.lol.riotgames.com:80",
  VN2: "spectator.vn.lol.riotgames.com:80",
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const platformId = (searchParams.get("platformId") || "").toUpperCase();
    const encryptionKey = searchParams.get("encryptionKey");
    const gameId = searchParams.get("gameId");

    if (!platformId || !encryptionKey || !gameId) {
      return NextResponse.json(
        { error: "platformId, encryptionKey, and gameId are required" },
        { status: 400 }
      );
    }

    const host = spectatorHosts[platformId];
    if (!host) {
      return NextResponse.json(
        { error: `Unsupported platformId: ${platformId}` },
        { status: 400 }
      );
    }

    // Two widely compatible invocation formats exist. We'll use the classic 8394 launcher args
    // which the client parses to run spectator mode regardless of install path.
    // Users double-click the .bat file; it tries common install locations and then fallback to registry-less path.

    const bat = [
      "@echo off",
      "setlocal enabledelayedexpansion",
      "",
      "REM ================= Path Discovery =================",
      "set CLIENT_PATH=",
      "",
      "REM 1) Try ProgramData RiotClientInstalls.json via PowerShell",
      "for /f \"usebackq delims=\" %%I in (`powershell -NoProfile -Command \"$p='C:\\ProgramData\\Riot Games\\RiotClientInstalls.json'; if(Test-Path $p){$j=Get-Content -Raw $p|ConvertFrom-Json; $rc=$j.rc_default; if($rc){$base=Split-Path (Split-Path $rc -Parent) -Parent; $l=Join-Path $base 'League of Legends\\LeagueClient.exe'; if(Test-Path $l){Write-Output $l}}}\"\"`) do set CLIENT_PATH=\"%%I\"",
      "",
      "REM 2) Try registry InstallLocation (64-bit)",
      "if not defined CLIENT_PATH (",
      "  for /f \"tokens=2,*\" %%A in ('reg query \"HKLM\\SOFTWARE\\Riot Games, Inc\\League of Legends\" /v InstallLocation 2^>nul ^| find \"REG_SZ\"') do set LL_DIR=%%B",
      "  if defined LL_DIR if exist \"%LL_DIR%\\LeagueClient.exe\" set CLIENT_PATH=\"%LL_DIR%\\LeagueClient.exe\"",
      ")",
      "",
      "REM 3) Try registry InstallLocation (WOW6432Node)",
      "if not defined CLIENT_PATH (",
      "  for /f \"tokens=2,*\" %%A in ('reg query \"HKLM\\SOFTWARE\\WOW6432Node\\Riot Games, Inc\\League of Legends\" /v InstallLocation 2^>nul ^| find \"REG_SZ\"') do set LL_DIR32=%%B",
      "  if defined LL_DIR32 if exist \"%LL_DIR32%\\LeagueClient.exe\" set CLIENT_PATH=\"%LL_DIR32%\\LeagueClient.exe\"",
      ")",
      "",
      "REM 4) Try common install paths",
      "if not defined CLIENT_PATH if exist \"C:\\Riot Games\\League of Legends\\LeagueClient.exe\" set CLIENT_PATH=\"C:\\Riot Games\\League of Legends\\LeagueClient.exe\"",
      "if not defined CLIENT_PATH if exist \"C:\\Program Files\\Riot Games\\League of Legends\\LeagueClient.exe\" set CLIENT_PATH=\"C:\\Program Files\\Riot Games\\League of Legends\\LeagueClient.exe\"",
      "if not defined CLIENT_PATH if exist \"C:\\Program Files (x86)\\Riot Games\\League of Legends\\LeagueClient.exe\" set CLIENT_PATH=\"C:\\Program Files (x86)\\Riot Games\\League of Legends\\LeagueClient.exe\"",
      "",
      "REM Final check",
      "if not defined CLIENT_PATH (",
      "  echo [Clutch.GG] Could not locate LeagueClient.exe automatically.",
      "  echo Please edit this file and set the line: set CLIENT_PATH=\"Full\\Path\\To\\LeagueClient.exe\"",
      "  echo Example: set CLIENT_PATH=\"C:\\Riot Games\\League of Legends\\LeagueClient.exe\"",
      "  pause",
      "  exit /b 1",
      ")",
      "",
      "REM ================= Spectator Args =================",
      `set SPEC_ARGS=\"--spectator ${host} ${encryptionKey} ${gameId} ${platformId}\"`,
      "",
      "REM ================= Launch with mild retry =================",
      "set RETRIES=2",
      ":LAUNCH_TRY",
      "echo [Clutch.GG] Launching spectator...",
      "start \"\" %CLIENT_PATH% %SPEC_ARGS%",
      "if %ERRORLEVEL% NEQ 0 (",
      "  if %RETRIES% GTR 0 (",
      "    set /a RETRIES-=1",
      "    echo [Clutch.GG] Retry in 2s...",
      "    timeout /t 2 /nobreak >nul",
      "    goto LAUNCH_TRY",
      "  )",
      ")",
      "echo If you see \"Unable to download spectator data\", wait a minute and try again.",
    ].join("\r\n");

    return new NextResponse(bat, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename=ClutchGG_spectate_${platformId}_${gameId}.bat`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[league/spectate] Error generating .bat:", err);
    return NextResponse.json({ error: "Failed to generate spectate file" }, { status: 500 });
  }
}


