from flask import Flask
from flask_cors import CORS
import requests
from urllib import parse
from lxml import etree, html
import json, time, os
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

app = Flask(__name__)
CORS(app)

#chromedriver option - headless option
options = webdriver.ChromeOptions() #headless option  사용 - 창 띄우지 않고 실행
options.add_argument('headless') #반드시 지정
#options.add_argument('window-size=1920x1080') #size에 맞추어서 디자인. 사실 불필요. 
#options.add_argument("disable-gpu") #gpu 가속 끄기.


#champ id English
with open('champion_id_and_name_list.json', 'r', encoding='utf8') as f:
    id_name_list = json.load(f)
#champ id Korean
with open('champion_id_and_name_list_kor.json', 'r', encoding='utf8') as g:
    id_name_kor_list = json.load(g)

#champ name to lowercase - without space.
name_eng_simple = {}
for key, val  in id_name_list.items():
    if 'nunu' in val: #누누와 윌럼프 예외처리
        name_eng_simple[key] = 'nunu'
    else:
        name_eng_simple[key] = val.lower().replace('\'', '').replace(' ', '').replace('_', '').replace('%20','').replace('.', '')
name_kor_simple = {}
for key, val in id_name_kor_list.items():
    if '누누' in val:
        name_kor_simple[key] = '누누'
    else:
        name_kor_simple[key] = val.replace(' ', '').replace('_', '').replace('%20','').replace('.','')

def simplify(name): #단순화
    global id_name_list, id_name_kor_list, name_eng_simple, name_kor_simple
    name1 = ''
    if 'nunu' in name: #누누와 윌럼프 예외처리
        return 'nunu'
    elif '누누' in name: 
        return '누누'
    elif name[0] in [chr(i) for i in list(range(65,91))+list(range(97,123))]: #알파벳...
        name1= name.lower().replace('\'', '').replace(' ', '').replace('_', '').replace('%20','').replace('.','')
        return name1 if name1 in name_eng_simple.values()  else name
    elif name[0] in [chr(i) for i in range(44032, 55204)]: #한글로 시작
        name1= name.replace(' ', '').replace('_', '').replace('%20','').replace('.','.')
        return name1 if name1 in name_kor_simple.values() else name
    else:
        return name
    

def match_kor_eng(name, simple=False): #챔피언 이름 확인
    global id_name_list, id_name_kor_list, name_eng_simple, name_kor_simple
    key='0'
    if 'nunu' in name:  #누누는 예외처리.
        name = 'nunu'
    elif '누누' in name:
        name = '누누'
    else:
        name = name.lower().replace('\'', '').replace(' ', '').replace('_', '').replace('+','').replace('%20','').replace('.','')
    if name in name_eng_simple.values(): #영어 이름이면...
        for i in id_name_list.keys():
            if name_eng_simple[i] == name:
                key = str(i) #키값 찾기.
                break
        return name_kor_simple[key] if simple else id_name_kor_list[key]
    elif name in name_kor_simple.values():
        for i in id_name_kor_list.keys():
            if name_kor_simple[i] == name:
                key = str(i)
                break
        return name_eng_simple[key] if simple else id_name_list[key]
    elif name in id_name_list.keys():
        return name_kor_simple[key] if simple else id_name_kor_list[name]
    

@app.route('/')
def index():
    return '''<h1>LOL Crawler</h1>'''

@app.route('/user/<name>')
def user(name):
    #user data - 페이지 열 때에 생성
    if os.path.isfile('data.json'):
        with open('data.json', 'r', encoding='utf8') as f:
            user_data = json.load(f)
    else:
        user_data = {}

    global options
    nowtime = float(time.time())
    if not user_data.get(name) or nowtime - user_data[name]['time']>86400: #데이터가 없거나 하루 이상 지날 때 추가
        user_data_new = {}
        p_name = parse.quote_plus(name)
        driver = webdriver.Chrome(options=options)
        driver.get(f'https://www.op.gg/summoner/champions/userName={p_name}')
        driver.find_element_by_xpath('//*[@id="champion_season"]/li[2]/a').send_keys(Keys.ENTER)
        trs = driver.find_elements_by_xpath("//*[@id=\"SummonerLayoutContent\"]/div[3]/div/div/div[2]/div[1]/table/tbody/tr")
        
        for tr in trs:
            try:
                champ = tr.find_elements_by_xpath('./td[3]/a')[0].text
                win_cnt = tr.find_elements_by_xpath('./td[4]/div/div/div[2]')[0]
                lose_cnt = tr.find_elements_by_xpath('./td[4]/div/div/div[4]')[0]
                user_data_new[champ] = [win_cnt, lose_cnt] # 리스트로 긁어오기. React 오류 방지
            except:
                pass
        
        user_data_new['time'] = float(time.time())
        if len(user_data_new.keys())>1: #챔피언이 하나라도 등록될 때에만.
            user_data[name] = user_data_new

    
    user_data_str = json.dumps(user_data[name])
    with open('data.json', 'w', encoding='utf8') as f:
        json.dump(user_data, f)
    return user_data_str

@app.route('/champ/<name>')
def champ(name):
    #champ_data 생성
    if os.path.isfile('champ.json'):
        with open('champ.json', 'r', encoding='utf8') as f:
            champ_data = json.load(f)
    else:
        champ_data = {}

    global  id_name_list, id_name_kor_list, name_eng_simple, name_kor_simple, options
    nowtime = float(time.time())
    if str(type(name)) == "<class 'str'>":
        if name[0] in [chr(i) for i in range(44032, 55204)]:
            name = match_kor_eng(name, True).lower().replace(' ', '')  
        else: name = simplify(name) #영어 단순화
    
    print(name)

    if not champ_data.get(name) or nowtime - champ_data[name]['time']>86400: #데이터가 없거나 하루 이상 지날 때 추가
        champ_data_new = {}
        if name in name_eng_simple.values(): #english
            p_name = name
        elif name in id_name_list.keys():  #number
            p_name = name_eng_simple[name]
        driver= webdriver.Chrome() #headless가 오작동... 할수 없이 head 켜고 작동
        driver.get(f'https://www.leagueofgraphs.com/champions/stats/{p_name}/kr')
        time.sleep(10)
        total_popularity = driver.find_element_by_id("graphDD1").get_attribute('innerText')
        total_win_rate = driver.find_element_by_id("graphDD2").get_attribute('innerText')
        total_ban_rate = driver.find_element_by_id("graphDD3").get_attribute('innerText')
        champ_data_new[p_name] = {'popularity':total_popularity, 'win': total_win_rate, 'ban': total_ban_rate }
        
        trs = driver.find_elements_by_xpath("/html/body/div[2]/div[3]/div[3]/div[2]/div[2]/div[2]/div[2]/div[1]/table/tbody/tr")
        for tr in trs[1:]:
            try:
                pos = tr.find_element_by_xpath('./td[1]/a').text.strip()
                pop = tr.find_element_by_xpath('./td[2]/progressbar/div/div[2]').text.strip()
                win = tr.find_element_by_xpath('./td[3]/progressbar/div/div[2]').text.strip()
                if float(pop.replace('%',''))>5: #유의미한 점유일일 때만...
                    champ_data_new[p_name][pos] = {'popularity': pop, 'win':win}
            except:
                pass
        
        champ_data_new['time'] = float(time.time())
        if len(champ_data_new.keys())>1: #챔피언이 하나라도 등록될 때에만.
            champ_data[name] = champ_data_new
        
        driver.quit() #드라이버를 끄자..
        

    champ_data_str = json.dumps(champ_data[name])
    with open('champ.json', 'w', encoding='utf8') as f:
        json.dump(champ_data, f)
    
    return champ_data_str


if __name__ == '__main__':
    app.run(host='localhost', port=5000)
    