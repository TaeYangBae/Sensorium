#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="/home/rnd/ssd/sunny/practice/work-main/deploy"
CERT_DIR="${BASE_DIR}/certs"
CERT_FILE="${CERT_DIR}/notion-lite.crt"
KEY_FILE="${CERT_DIR}/notion-lite.key"

if [[ -d "${CERT_DIR}" && ! -w "${CERT_DIR}" ]]; then
  echo "오류: ${CERT_DIR}가 현재 사용자에게 쓰기 불가능합니다."
  echo "루트가 생성한 폴더일 수 있습니다. 아래 명령으로 삭제 후 다시 실행하세요."
  echo "  rm -rf ${CERT_DIR}"
  echo "  mkdir -p ${CERT_DIR}"
  exit 1
fi

mkdir -p "${CERT_DIR}"

openssl req -x509 -nodes -newkey rsa:2048 -sha256 -keyout "${KEY_FILE}" -out "${CERT_FILE}" -days 825 -subj "/C=KR/ST=Seoul/L=Seoul/O=notion-lite/CN=192.168.0.151"

chmod 600 "${KEY_FILE}"
chmod 644 "${CERT_FILE}"

echo "생성 완료:"
echo "  CERT: ${CERT_FILE}"
echo "  KEY : ${KEY_FILE}"
