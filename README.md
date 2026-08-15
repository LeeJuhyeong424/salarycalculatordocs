# 근태관리 계산기 — 사용법

근무자에게 공유하는 사용 안내 페이지입니다. 정적 파일 세 개가 전부이고
빌드 과정이 없습니다.

```
index.html          내용
assets/styles.css   화면
assets/app.js       목차 따라가기 · 휴무 수당 계산기 · 밝기 전환
```

## 보기

GitHub Pages 로 서비스합니다.

> Settings → Pages → Source: **Deploy from a branch** → `main` / `/ (root)`

주소: `https://leejuhyeong424.github.io/salarycalculatordocs/`

로컬에서 확인하려면 파일을 브라우저로 열거나:

```bash
python -m http.server 8000
```

## 고칠 때

`index.html` 만 고치면 됩니다. 내용은 계산기 저장소의 `docs/onboarding.md`
와 같은 것을 다루므로, 규칙이 바뀌면 **양쪽을 같이** 고쳐 주세요.

담긴 것 / 담지 않는 것:

- 담는다 — 화면 사용법, 근태 상태별 의미, 휴무 정산 방식, 자주 묻는 질문
- **담지 않는다** — 회사 급여 규정의 수당 금액·지급 조건.
  이 저장소는 공개라서, 수당 금액표는 여기 두지 않습니다.

## 계산 근거

| 항목 | 근거 |
|---|---|
| 연장 150% · 야간 가산 50% · 휴일 50% | 근로기준법 제56조 |
| 주휴수당 | 근로기준법 제55조 |
| 소득세 | 소득세법 시행령 [별표2] 근로소득 간이세액표 |
