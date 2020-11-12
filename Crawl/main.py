from flask import Flask
from flask_cors import CORS
import requests
from urllib import parse
from lxml import etree, html
import json, time, os
from selenium import webdriver

app = Flask(__name__)
CORS(app)

#chromedriver option - headless option
options = webdriver.ChromeOptions() #headless option  사용 - 창 띄우지 않고 실행
options.add_argument('headless') #반드시 지정
options.add_argument('window-size=1920x1080') #size에 맞추어서 디자인. 사실 불필요. 
options.add_argument("disable-gpu") #gpu 가속 끄기.

#user data 생성
if os.path.isfile('data.json'):
    with open('data.json', 'r', encoding='utf8') as f:
        user_data = json.load(f)
else:
    user_data = {}
#champ_data 생성
if os.path.isfile('champ.json'):
    with open('champ.json', 'r', encoding='utf8') as f:
        champ_data = json.load(f)
else:
    champ_data = {}

#champ id English
with open('champion_id_and_name_list.json', 'r', encoding='utf8') as f:
    id_name_list = json.load(f)
#champ id Korean
with open('champion_id_and_name_list_kor.json', 'r', encoding='utf8') as g:
    id_name_kor_list = json.load(g)

def match_kor_eng(name): #이름 확인
    global id_name_list, id_name_kor_list

    if name in id_name_list.values():
        for i in id_name_list.keys():
            if id_name_list[i] == name:
                key = i
                break
        return id_name_kor_list[key]
    elif name in id_name_kor_list.values():
        for i in id_name_kor_list.keys():
            if id_name_list[i] == name:
                key = i
                break
        return id_name_list[key]
    elif name in id_name_list.keys():
        return id_name_kor_list[name]
    

@app.route('/')
def index():
    return '<h1>LOL Crawler</h1>'

@app.route('/user/<name>')
def user(name):
    global user_data, options
    nowtime = float(time.time())
    if not user_data.get(name) or nowtime - user_data[name]['time']>86400: #데이터가 없거나 하루 이상 지날 때 추가
        user_data_new = {}
        p_name = parse.quote_plus(name)
        driver = webdriver.Chrome(options=options)
        driver.get(f'https://www.op.gg/summoner/champions/userName={p_name}')
        driver.find_element_by_xpath('//*[@id="champion_season"]/li[2]/a').click()
        trs = driver.find_elements_by_xpath("//*[@id=\"SummonerLayoutContent\"]/div[3]/div/div/div[2]/div[1]/table/tbody/tr")
        
        for tr in trs:
            try:
                champ = tr.find_elements_by_xpath('./td[3]/a')[0].text
                win_cnt = tr.find_elements_by_xpath('./td[4]/div/div/div[2]')[0].text.replace('W','승')
                lose_cnt = tr.find_elements_by_xpath('./td[4]/div/div/div[4]')[0].text.replace('L','패')
                user_data_new[champ] = {'win':win_cnt, 'lose':lose_cnt}
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
    global champ_data, id_name_list, id_name_kor_list, options
    nowtime = float(time.time())
    if not champ_data.get(name) or nowtime - champ_data[name]['time']>86400: #데이터가 없거나 하루 이상 지날 때 추가
        champ_data_new = {}
        if name in id_name_list.values():
            p_name = name.lower() #소문자로 바꾸어주기...
        elif name in id_name_list.keys():
            p_name = id_name_list[name].lower()
        elif name in id_name_kor_list.values():
            p_name = match_kor_eng(name).lower()
        driver= webdriver.Chrome()#options=options) #창 띄우지 않고 작동.
        driver.get(f'https://www.leagueofgraphs.com/champions/stats/{p_name}/kr')
        time.sleep(10)
        total_popularity = driver.find_element_by_xpath("//*[@id=\"graphDD1\"]").text.strip()
        total_win_rate = driver.find_element_by_xpath("//*[@id=\"graphDD2\"]").text.strip()
        total_ban_rate = driver.find_element_by_xpath("//*[@id=\"graphDD3\"]").text.strip()
        champ_data_new[p_name] = {'popularity':total_popularity, 'win': total_win_rate, 'ban': total_ban_rate }
        
        trs = driver.find_elements_by_xpath("//*[@id=\"mainContent\"]/div[2]/div[2]/div[1]/table/tbody/tr")
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

    
    champ_data_str = json.dumps(champ_data[name])
    with open('champ.json', 'w', encoding='utf8') as f:
        json.dump(champ_data, f)
    driver.quit()
    return champ_data_str




if __name__ == '__main__':
    app.run(host='localhost', port=5000)