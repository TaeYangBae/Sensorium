#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME=sensorium-https
SERVICE_FILE="/home/rnd/ssd/sunny/practice/work-main/deploy/systemd-sensorium-https.service"
TARGET_DIR="/etc/systemd/system"

if [[ $EUID -ne 0 ]]; then
  echo "root 권한이 필요합니다. sudo로 실행하세요."
  exit 1
fi

if [[ ! -f /home/rnd/ssd/sunny/practice/work-main/deploy/certs/sensorium.crt || ! -f /home/rnd/ssd/sunny/practice/work-main/deploy/certs/sensorium.key ]]; then
  echo "인증서가 없습니다. 다음을 먼저 실행하세요:"
  echo "  ./deploy/generate-self-signed-sensorium-cert.sh"
  exit 1
fi

cp "$SERVICE_FILE" "${TARGET_DIR}/${SERVICE_NAME}.service"
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"
systemctl status "$SERVICE_NAME" --no-pager
echo "설치 완료: ${SERVICE_NAME}.service"
