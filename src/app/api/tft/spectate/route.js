import { NextResponse } from "next/server";

// TFT uses the same spectator infrastructure as League
const spectatorHosts = {
  BR1: "spectator.br.lol.riotgames.com:80",
  EUN1: "spectator.eu.lol.riotgames.com:8088",
  EUW1: "spectator.eu.lol.riotgames.com:8088",
  JP1: "spectator.jp.lol.riotgames.com:80",
  KR: "spectator.kr.lol.riotgames.com:8088",
  LA1: "spectator.na.lol.riotgames.com:80",
  LA2: "spectator.na.lol.riotgames.com:80",
  ME1: "spectator.eu.lol.riotgames.com:8088",
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
    const platformId = (
      searchParams.get("platformId") ||
      searchParams.get("region") ||
      searchParams.get("platform") ||
      ""
    ).toUpperCase();
    const encryptionKey = searchParams.get("encryptionKey") || searchParams.get("key");
    const rawGameId = searchParams.get("gameId") || searchParams.get("matchId") || searchParams.get("id");
    const gameId = (rawGameId || "").toString().replace(/[^0-9]/g, "");

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

    // Generate a robust .bat that prefers launching the game directly into spectator
    const bat = [
      "@echo off",
      "setlocal DisableDelayedExpansion",
      "",
      "REM ================= Discover Install Paths =================",
      "set RC_PATH=",
      "set LL_DIR=",
      "set LL_CLIENT=",
      "set GAME_EXE=",
      "",
      "REM 1) Try ProgramData RiotClientInstalls.json via PowerShell (discover both Riot client and League base dir)",
      "for /f \"usebackq delims=\" %%I in (`powershell -NoProfile -Command \"$p='C:\\ProgramData\\Riot Games\\RiotClientInstalls.json'; if(Test-Path $p){$j=Get-Content -Raw $p|ConvertFrom-Json; $rc=$j.rc_default; if($rc){Write-Output $rc}}\"`) do set RC_PATH=%%I",
      "for /f \"usebackq delims=\" %%I in (`powershell -NoProfile -Command \"$p='C:\\ProgramData\\Riot Games\\RiotClientInstalls.json'; if(Test-Path $p){$j=Get-Content -Raw $p|ConvertFrom-Json; $rc=$j.rc_default; if($rc){$base=Split-Path (Split-Path $rc -Parent) -Parent; $lld=Join-Path $base 'League of Legends'; if(Test-Path $lld){Write-Output $lld}}}\"`) do set LL_DIR=%%I",
      "",
      "REM 2) Try registry InstallLocation (League base dir)",
      "if not defined LL_DIR (",
      "  for /f \"tokens=2,*\" %%A in ('reg query \"HKLM\\SOFTWARE\\Riot Games, Inc\\League of Legends\" /v InstallLocation 2^>nul ^| find \"REG_SZ\"') do set LL_DIR=%%B",
      ")",
      "if not defined LL_DIR (",
      "  for /f \"tokens=2,*\" %%A in ('reg query \"HKLM\\SOFTWARE\\WOW6432Node\\Riot Games, Inc\\League of Legends\" /v InstallLocation 2^>nul ^| find \"REG_SZ\"') do set LL_DIR=%%B",
      ")",
      "",
      "REM 3) Try common install paths",
      "if not defined LL_DIR if exist \"C:\\Riot Games\\League of Legends\" set LL_DIR=C:\\Riot Games\\League of Legends",
      "if not defined LL_DIR if exist \"C:\\Program Files\\Riot Games\\League of Legends\" set LL_DIR=C:\\Program Files\\Riot Games\\League of Legends",
      "if not defined LL_DIR if exist \"C:\\Program Files (x86)\\Riot Games\\League of Legends\" set LL_DIR=C:\\Program Files (x86)\\Riot Games\\League of Legends",
      "",
      "REM Also try common Riot Client paths if still unknown",
      "if not defined RC_PATH if exist \"C:\\Riot Games\\Riot Client\\RiotClientServices.exe\" set RC_PATH=C:\\Riot Games\\Riot Client\\RiotClientServices.exe",
      "if not defined RC_PATH if exist \"C:\\Program Files\\Riot Games\\Riot Client\\RiotClientServices.exe\" set RC_PATH=C:\\Program Files\\Riot Games\\Riot Client\\RiotClientServices.exe",
      "if not defined RC_PATH if exist \"C:\\Program Files (x86)\\Riot Games\\Riot Client\\RiotClientServices.exe\" set RC_PATH=C:\\Program Files (x86)\\Riot Games\\Riot Client\\RiotClientServices.exe",
      "",
      "REM Derive specific executables",
      "if defined LL_DIR if exist \"%LL_DIR%\\LeagueClient.exe\" set LL_CLIENT=%LL_DIR%\\LeagueClient.exe",
      "if defined LL_DIR if exist \"%LL_DIR%\\Game\\League of Legends.exe\" set GAME_EXE=%LL_DIR%\\Game\\League of Legends.exe",
      "",
      "REM ================= Spectator Args =================",
      `set "SPEC_HOST=${host}"`,
      `set "SPEC_KEY=${encryptionKey}"`,
      `set "SPEC_GAME=${gameId}"`,
      `set "SPEC_PLATFORM=${platformId}"`,
      "set DEBUG=0",
      "",
      "echo [Clutch.GG] Preparing spectator...",
      "echo [Clutch.GG] Region=%SPEC_PLATFORM% Game=%SPEC_GAME%",
      "REM ================= Meta-style launch (pvp.net) =================",
      "set SPEC_PLATFORM_LC=%SPEC_PLATFORM%",
      "for /f \"delims=\" %%a in ('powershell -NoProfile -Command \"'%SPEC_PLATFORM_LC%'.ToLower()\"') do set SPEC_PLATFORM_LC=%%a",
      "set PVP_HOST1=spectator.%SPEC_PLATFORM_LC%.lol.pvp.net:8080",
      "set PVP_HOST2=spectator.%SPEC_PLATFORM_LC%.lol.pvp.net:80",
      "pushd \"%LL_DIR%\\Game\"",
      "set LOCALE=en_US",
      "if exist ..\\Config\\LeagueClientSettings.yaml (",
      "  for /f \"tokens=2 delims=:\" %%L in ('findstr /R /C:\"^ *locale: *.*\" ..\\Config\\LeagueClientSettings.yaml 2^>nul') do (",
      "    set L=%%L",
      "    set L=%L: =%",
      "    set L=%L:\"=%",
      "    if not \"%L%\"==\"\" set LOCALE=%L%",
      "  )",
      ")",
      "if \"%DEBUG%\"==\"1\" echo [Clutch.GG] Locale=%LOCALE%",
      "for /f \"usebackq delims=\" %%D in (`powershell -NoProfile -Command \"$u='http://spectator.%SPEC_PLATFORM_LC%.lol.pvp.net:8080/observer-mode/rest/consumer/getGameMetaData/%SPEC_PLATFORM%/%SPEC_GAME%/0/token'; try{(Invoke-RestMethod -TimeoutSec 5 -Uri $u).delayTime}catch{0}\"`) do set DELAY_TIME=%%D",
      "set /a DT=0+%DELAY_TIME%",
      "if %DT% LSS 65 set DELAY_TIME=65",
      "echo [Clutch.GG] Waiting %DELAY_TIME%s for spectator delay...",
      "timeout /t %DELAY_TIME% /nobreak >nul",
      "echo [Clutch.GG] Launching...",
      "if \"%DEBUG%\"==\"1\" echo CMD: \"League of Legends.exe\" \"spectator %PVP_HOST1% %SPEC_KEY% %SPEC_GAME% %SPEC_PLATFORM%\" -UseRads -GameBaseDir=.. \"-Locale=%LOCALE%\" -SkipBuild -EnableCrashpad=true -EnableLNP -Product=TFT",
      "start \"\" \"League of Legends.exe\" \"spectator %PVP_HOST1% %SPEC_KEY% %SPEC_GAME% %SPEC_PLATFORM%\" -UseRads -GameBaseDir=.. \"-Locale=%LOCALE%\" -SkipBuild -EnableCrashpad=true -EnableLNP -Product=TFT",
      "timeout /t 12 /nobreak >nul",
      "for /f \"delims=\" %%C in ('tasklist /FI \"IMAGENAME eq League of Legends.exe\" ^| find /C \"League of Legends.exe\"') do set POST_COUNT=%%C",
      "if NOT \"%POST_COUNT%\"==\"%PRE_COUNT%\" (popd & goto END_LAUNCHED)",
      "if \"%DEBUG%\"==\"1\" echo [Clutch.GG] Trying alternate port...",
      "if \"%DEBUG%\"==\"1\" echo CMD: \"League of Legends.exe\" \"spectator %PVP_HOST2% %SPEC_KEY% %SPEC_GAME% %SPEC_PLATFORM%\" -UseRads -GameBaseDir=.. \"-Locale=%LOCALE%\" -SkipBuild -EnableCrashpad=true -EnableLNP -Product=TFT",
      "start \"\" \"League of Legends.exe\" \"spectator %PVP_HOST2% %SPEC_KEY% %SPEC_GAME% %SPEC_PLATFORM%\" -UseRads -GameBaseDir=.. \"-Locale=%LOCALE%\" -SkipBuild -EnableCrashpad=true -EnableLNP -Product=TFT",
      "timeout /t 12 /nobreak >nul",
      "for /f \"delims=\" %%C in ('tasklist /FI \"IMAGENAME eq League of Legends.exe\" ^| find /C \"League of Legends.exe\"') do set POST_COUNT=%%C",
      "if NOT \"%POST_COUNT%\"==\"%PRE_COUNT%\" (popd & goto END_LAUNCHED)",
      "popd",
      "",
      "echo [Clutch.GG] Could not start spectator. Please try again shortly.",
      "",
      ":END",
      "if \"%DEBUG%\"==\"1\" echo If the game did not launch, run one of the printed CMD lines.",
      "",
      ":END_LAUNCHED",
      "echo If the spectator does not appear, wait a minute and try again.",
      "pause"
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
    console.error("[tft/spectate] Error generating .bat:", err);
    return NextResponse.json({ error: "Failed to generate spectate file" }, { status: 500 });
  }
}


