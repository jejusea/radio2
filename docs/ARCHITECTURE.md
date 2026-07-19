# 시스템 설계

## 데스크탑과 최종 전시 구조

두 환경은 같은 브라우저 앱 코어와 manifest를 사용한다. 데스크탑은 키보드·터치 입력과 혼합 오디오 출력, Raspberry Pi는 GPIO/ESP32 브리지 입력과 Chromium 키오스크를 사용한다. 입력 장치는 `ReceiverCommand`만 전달하며 재생 로직을 직접 다루지 않는다.

```text
Keyboard / Touch ─┐
GPIO WebSocket ───┼─ InputAdapter → AppController
ESP32 Serial/WS ──┘                  ├─ VideoController → video output
                                    ├─ RadioController → audio output
videos.json / radio.json → MediaLibrary
                                    └─ UI + Diagnostics + Watchdog
```

## 상태와 입력 잠금

앱은 `standby → running`으로 한 번만 시작한다. 영상은 `playing → whiteout(300ms) → loading → playing`, 라디오는 `playing → fade-out → tuning(650ms) → random seek → playing` 상태를 가진다. 각 전환 동안 해당 입력만 잠기므로 영상과 라디오는 서로 독립적이다. 인덱스는 manifest 배열 길이를 사용해 원형 순환한다.

## Manifest

`public/data/videos.json`과 `public/data/radio.json`이 유일한 재생 목록이다. 파일명 연속성이나 영상·라디오 개수 일치는 요구하지 않는다. 브라우저 캐시를 피하기 위해 앱 시작마다 manifest URL에 버전 값을 붙인다. 실제 파일이 없거나 손상되면 진단 목록에 기록하고 화면 플레이스홀더를 유지한다.

## 하드웨어 Adapter 메시지

WebSocket 또는 Serial 브리지는 UTF-8 텍스트 한 줄로 아래 명령을 보낸다.

- `PREVIOUS_VIDEO`
- `NEXT_VIDEO`
- `PREVIOUS_RADIO`
- `NEXT_RADIO`

Pi가 TFT에 되돌려 주는 권장 JSON은 `{"type":"RADIO_STATUS","id":"r01","country":"KOREA","city":"SEOUL","station":"SEOUL 93.1","frequency":"93.1","state":"PLAYING"}`이다. 실제 TFT·엔코더 모델이 정해진 뒤 전기적 디바운싱과 핀 배치를 확정한다.

## 9시간 안정성

video/audio DOM 객체를 각각 하나만 재사용하고, 전환 타이머와 이벤트 리스너를 정리하며, 오류 로그를 최근 20개로 제한한다. watchdog은 재생 중 정지·stalled 상태를 확인하되 무한 재시도하지 않고 다음 항목으로 넘긴다. 실제 미디어를 넣은 뒤 9시간 실시간 시험과 수백 회 전환 가속 시험에서 메모리, 오디오 끊김, 열 상태를 함께 기록한다.

## Raspberry Pi 부팅과 종료

systemd가 정적 서버를 시작하고 실패 시 재시작한다. 데스크탑 세션의 autostart가 Chromium을 `--kiosk http://127.0.0.1:4173`으로 연다. 화면보호기와 자동 업데이트 알림을 끄고, GPIO 종료 버튼은 `systemctl poweroff`를 실행한다. 종료 완료 전 전원 차단은 금지한다. 안정화 뒤 예비 microSD와 전체 이미지 백업을 만들고 OverlayFS 적용 여부를 실제 쓰기 요구와 함께 검토한다.
