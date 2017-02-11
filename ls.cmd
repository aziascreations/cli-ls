@echo off
REM 
REM You can use this batch script to use the ls command without installing cli-ls globally
REM 
REM Quick instructions:
REM 	Add the parent folder to the "PATH" environment variable.
REM 	And move this script to the parent folder
REM 
node %NODE_UTILS%\cli-ls\ %*