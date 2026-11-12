@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "CodePrint Preview" http://localhost:8000
  py -m http.server 8000
) else (
  start "CodePrint Preview" http://localhost:8000
  python -m http.server 8000
)
pause
