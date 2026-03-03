#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME=notion-lite
SERVICE_FILE="/home/rnd/ssd/sunny/practice/work-main/deploy/systemd-notion-lite.service"
TARGET_DIR="/etc/systemd/system"

if [[ $EUID -ne 0 ]]; then
  echo "root 권한이 필요합니다. sudo로 실행하세요."
  exit 1
fi

cp "$SERVICE_FILE" "${TARGET_DIR}/${SERVICE_NAME}.service"
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"
systemctl status "$SERVICE_NAME" --no-pager
echo "설치 완료: ${SERVICE_NAME}.service"
