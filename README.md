기록관리 웹사이트
====================================================
## Version 0.8


#### **디렉토리 설명**
1. /public
2. /routes
3. /views
   - EJS 파일로 이루어져 있는 프론트
   - HTML, CSS, JS, bootstrap5
4. /settings
   - /database DB 사용을 위한 config
   - /mysql-session 세션 DB 저장을 위한 config

#### **계정상태**
현재 계정 상태에 따라 접속 가능한 페이지가 달라집니다.
1. 학생 -> /student
2. 조교 -> /assistant
3. 휴학 및 기타상태 -> 접속거부 및 안내

#### **사용 가능 기능**
1. 학생

2. 조교

공사중..

-----
#### **버전 내역**
### V0.5
    - 최소한의 작동 가능
    - 버그 매우 많음, 학기에 따른 지원서 삭제 기능 미존재 
    
### V0.6
    - DB Connection Pool 코드 제거
    - DB Config 모듈화 및 불필요한 모듈 삽입 제거 
    
### V0.7
    - 조교 현재학기 인증학생 명단 다운로드 기능 추가
    - 조교 학생 전체 프론트 변경
    - 일부 DB 코드 변경
    - 패스워드 해시화 함수 분리 및 모듈화
    - 버그 픽스
    
### V0.8
    - 세션 메모리 저장 방식에서 DB저장 방식으로 변경
    
