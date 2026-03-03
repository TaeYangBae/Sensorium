# Sensorium Studio Landing Page

센서리움 스타일의 순수 정적 웹사이트(HTML/CSS/JS)입니다.

## 파일 구성

- `index.html` : 랜딩 페이지 본문
- `style.css` : 스타일
- `app.js` : 인터랙션 스크립트
- `static/style.css`, `static/app.js` : 기존 정적 자산 백업본
- Python 서버(`app.py`)는 로컬 용도로만 참고하는 파일입니다.

## Cloudflare Pages 배포 (`sensorium-9pv`)

이 저장소는 정적 배포용으로 준비되어 있습니다.

1. Cloudflare Pages에서 `TaeYangBae/Sensorium` 레포지토리와 `main` 브랜치를 연결
2. Build settings
   - Build command: 비워두기
   - Build output directory: `.`
3. 배포 URL: `https://sensorium-9pv.pages.dev`

실시간 API나 서버 기능이 필요한 경우는 Workers/API 연동이 별도로 필요합니다.
