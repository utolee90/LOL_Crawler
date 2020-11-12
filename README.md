# LOL_Crawler
## 특징
- [op.gg](https://op.gg/) 웹사이트에서 Python의 lxml 모듈을 이용해서 정보를 가져온 후에 React로 파일을 띄워주는 예제입니다. 
## 요구사항
- Python - flask, flask_cors, lxml, selenium 확장기능
- Node JS -  axios, antd 확장기능
## 사용방법
1. `git clone https://github.com/utolee90/LOL_Crawler`를 입력해서 이 리포지토리의 데이터를 가져옵니다.
1. 우선 커맨드창을 열고 `(설치한 디렉토리)/Crawl`로 이동한 후 `python main.py`라고 입력해서 파이썬 기반의 사이트를 실행시킵니다. (크롤러)
1. npm을 실행시키기 전에 `npm install package.json`을 입력해서 의존성 패키지들을 모두 설치합니다.
1. 그 다음에 다른 커맨드창을 열고, `(설치한 디렉토리)`에서 `npm start` (또는 yarn이 깔려있으면 `yarn start`)라고 입력합니다. (웹페이지 표시기)
1. 기본적으로 localhost:3000에 웹페이지가 실행됩니다. 이곳에서 사용하시면 됩니다.
