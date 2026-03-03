# Notion-Lite Workspace (MVP)

노션과 유사한 위키 스타일 웹 워크스페이스를 **직접 호스팅**하기 위한 최소 구현체입니다.

## 실행 방법

```bash
cd /home/rnd/ssd/sunny/practice/work-main
python3 app.py
```

- 기본 바인딩: `0.0.0.0:8081`
- 기본 허용 네트워크: `192.168.0.0/24`

원하면 IP/포트/허용 대역대는 변경할 수 있습니다.

```bash
python3 app.py --host 0.0.0.0 --port 8081 --allow 192.168.0.0/24 --allow 127.0.0.1/32
```

LAN 내에서만 접근하려면 해당 장비의 주소가 `192.168.0.151`이면 브라우저에서
`http://192.168.0.151:8081`으로 열면 됩니다.

## HTTPS 사용(선택 3)

내부 테스트용으로 자기서명 인증서를 사용해 HTTPS로 구동할 수 있습니다.

```bash
cd /home/rnd/ssd/sunny/practice/work-main
chmod +x deploy/generate-self-signed-notion-lite-cert.sh
chmod +x deploy/deploy-notion-lite-https.sh
sudo ./deploy/generate-self-signed-notion-lite-cert.sh
sudo ./deploy/deploy-notion-lite-https.sh
```

브라우저 접속:
- `https://192.168.0.151:8081`

브라우저에서 인증서 경고가 뜨면 예외로 처리해 접속하면 됩니다.
운영에서는 Let’s Encrypt 등 공인 인증서를 권장합니다.

## service로 상시 실행 (선택 1)

운영용으로 항상 켜두려면 아래 스크립트로 systemd에 등록하세요.

```bash
cd /home/rnd/ssd/sunny/practice/work-main
chmod +x deploy/deploy-notion-lite.sh
sudo ./deploy/deploy-notion-lite.sh
```

서비스 명령:

```bash
sudo systemctl status notion-lite
sudo systemctl restart notion-lite
sudo systemctl stop notion-lite
sudo journalctl -u notion-lite -f
```

서비스 기본값은 `192.168.0.0/24` + `127.0.0.1/32`를 허용합니다.

현재 HTTPS는 사용자 실행권한(`User=sunny`) 기준입니다. 인증서 폴더가 root 소유라면 접속이 안될 수 있으니 아래로 재생성하세요.

```bash
cd /home/rnd/ssd/sunny/practice/work-main
rm -rf deploy/certs
mkdir -p deploy/certs
./deploy/generate-self-signed-notion-lite-cert.sh
sudo ./deploy/deploy-notion-lite-https.sh
```

## API 요약

- `GET /api/pages`
- `POST /api/pages` (`{ title }`)
- `GET /api/pages/{pageId}`
- `PATCH /api/pages/{pageId}` (`{ title }`)
- `POST /api/pages/{pageId}/blocks` (`{ type, content, checked }`)
- `PATCH /api/pages/{pageId}/blocks/{blockId}` (`{ type, content, checked }`)
- `DELETE /api/pages/{pageId}`
- `DELETE /api/pages/{pageId}/blocks/{blockId}`

## 저장 위치

`workspace_data.json`에 페이지/블록 데이터가 저장됩니다.
