#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME=notion-lite-https
SERVICE_FILE="/home/rnd/ssd/sunny/practice/work-main/deploy/systemd-notion-lite-https.service"
TARGET_DIR="/etc/systemd/system"

if [[ $EUID -ne 0 ]]; then
  echo "root 권한이 필요합니다. sudo로 실행하세요."
  exit 1
fi

if [[ ! -f /home/rnd/ssd/sunny/practice/work-main/deploy/certs/notion-lite.crt || ! -f /home/rnd/ssd/sunny/practice/work-main/deploy/certs/notion-lite.key ]]; then
  echo "인증서가 없습니다. 다음을 먼저 실행하세요:"
  echo "  ./deploy/generate-self-signed-notion-lite-cert.sh"
  exit 1
fi

cp "$SERVICE_FILE" "${TARGET_DIR}/${SERVICE_NAME}.service"
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"
systemctl status "$SERVICE_NAME" --no-pager
echo "설치 완료: ${SERVICE_NAME}.service"
