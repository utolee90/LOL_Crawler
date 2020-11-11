from flask import Flask
from flask_cors import CORS
import requests
from urllib import parse
from lxml import etree, html
import json, time, os

app = Flask(__name__)
CORS(app)

if os.path.isfile('data.json'):
    with open('data.json', 'r', encoding='utf8') as f:
        user_data = json.load(f)
else:
    user_data = {}

@app.route('/')
def index():
    return '<h1>LOL Crawler</h1>'

@app.route('/user/<name>')
def user(name):
    global user_data
    nowtime = float(time.time())
    if not user_data.get(name) or nowtime - user_data[name]['time']>86400: #데이터가 없거나 하루 이상 지날 때 추가
        user_data_new = {}
        p_name = parse.quote_plus(name)
        source = requests.get(f'https://www.op.gg/summoner/champions/userName={p_name}')
        source_txt = source.text
        tree = etree.HTML(source_txt)
        trs = tree.xpath("//*[@id=\"SummonerLayoutContent\"]/div[3]/div/div/div[2]/div[1]/table/tbody/tr")
        
        for tr in trs:
            try:
                champ = tr.xpath('./td[3]/a')[0].text
                win_cnt = tr.xpath('./td[4]/div/div/div[2]')[0].text.replace('W','승')
                lose_cnt = tr.xpath('./td[4]/div/div/div[4]')[0].text.replace('L','패')
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



if __name__ == '__main__':
    app.run(host='localhost', port=5000)