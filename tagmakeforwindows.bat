@echo off
SETLOCAL

REM Navigate to the Git repository's root directory
REM (This script should work regardless of where it's placed within the repo)
FOR /F "delims=" %%i IN ('git rev-parse --show-toplevel 2^>NUL') DO SET "REPO_ROOT=%%i"
IF NOT DEFINED REPO_ROOT (
    echo.
    echo ERROR: Not a Git repository.
    echo.
    pause
    EXIT /B 1
)
CD /D "%REPO_ROOT%"

REM Get current date and time in YYYYMMDD-HHMMSS format
REM Using %date% and %time% variables, then parsing
REM Adjust for different date/time formats if needed (e.g., locale-specific)

REM Get Date
SET "CURRENT_DATE=%date%"
REM For Japanese locale (YYYY/MM/DD), example: 2025/05/29
SET "YY=%CURRENT_DATE:~0,4%"
SET "MM=%CURRENT_DATE:~5,2%"
SET "DD=%CURRENT_DATE:~8,2%"

REM Get Time
SET "CURRENT_TIME=%time%"
REM Example: 22:19:24.12
SET "HH=%CURRENT_TIME:~0,2%"
SET "MI=%CURRENT_TIME:~3,2%"
SET "SS=%CURRENT_TIME:~6,2%"

REM Pad single digit hour with leading zero if necessary (e.g., " 9" to "09")
IF "%HH:~0,1%"==" " SET "HH=0%HH:~1,1%"

SET "TAG_NAME=%YY%%MM%%DD%-%HH%%MI%%SS%"

echo.
echo ===========================================
echo Creating Git Tag
echo ===========================================
echo.
echo Tag name to be created: %TAG_NAME%
echo.

REM Create an annotated tag
git tag -a "%TAG_NAME%" -m "Release %TAG_NAME%"

IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to create tag.
    echo Please check if a tag with the same name already exists.
    echo.
    pause
    EXIT /B %ERRORLEVEL%
)

echo.
echo Tag created successfully. Local tags list:
git tag -n1
echo.

REM Confirm push to remote repository
SET /P PUSH_TO_REMOTE="Do you want to push this tag to the remote repository? (y/n): "

IF /I "%PUSH_TO_REMOTE%"=="y" (
    echo.
    echo Pushing to remote repository...
    git push origin "%TAG_NAME%"
    IF %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Failed to push to remote.
        echo.
        pause
        EXIT /B %ERRORLEVEL%
    )
    echo.
    echo Tag successfully pushed to the remote repository.
) ELSE (
    echo.
    echo Tag was not pushed. You can push it manually if needed.
)

echo.
echo Operation complete.
echo.
pause
ENDLOCAL