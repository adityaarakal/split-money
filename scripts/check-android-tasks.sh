#!/bin/bash

# Script to check if Android Gradle tasks exist and run them gracefully
# This prevents CI failures when Android project is in initial setup phase

set -e

TASK_NAME=$1
FALLBACK_TASK=$2

if [ -z "$TASK_NAME" ]; then
  echo "Usage: $0 <task_name> [fallback_task]"
  exit 1
fi

if [ ! -f "gradlew" ]; then
  echo "⚠️  Gradle wrapper not found - skipping Android check"
  exit 0
fi

# Check if task exists
if ./gradlew tasks --all --no-daemon 2>/dev/null | grep -qE "(^${TASK_NAME}|:${TASK_NAME})"; then
  echo "✅ Task '${TASK_NAME}' found - running..."
  ./gradlew "${TASK_NAME}" --no-daemon
  exit $?
elif [ -n "$FALLBACK_TASK" ] && ./gradlew tasks --all --no-daemon 2>/dev/null | grep -qE "(^${FALLBACK_TASK}|:${FALLBACK_TASK})"; then
  echo "✅ Fallback task '${FALLBACK_TASK}' found - running..."
  ./gradlew "${FALLBACK_TASK}" --no-daemon
  exit $?
else
  echo "⚠️  Android task '${TASK_NAME}' not configured - skipping check"
  echo "⚠️  This is expected for initial setup. Task will be enforced in later phases."
  exit 0
fi

