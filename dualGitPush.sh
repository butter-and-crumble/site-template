#!/bin/sh
read -p 'Enter Commit Message: ' message
alias gitSQS='git --git-dir=.gitSQS'
alias gitHUB='git --git-dir=.gitHUB'

echo Adding Changes...
gitSQS add -A
gitHUB add -A

echo Commiting Squarespace Repo
gitSQS commit -m "$message"

echo Commiting Github Repo
gitHUB commit -m "$message"

echo Pushing Squarespace Repo
gitSQS push

echo Pushing Github Repo
gitHUB push
