import json

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
        name_eng_simple[key] = val.lower().replace('\'', '').replace(' ', '').replace('_', '').replace('%20','')
name_kor_simple = {}
for key, val in id_name_kor_list.items():
    if '누누' in val:
        name_kor_simple[key] = '누누'
    else:
        name_kor_simple[key] = val.replace(' ', '').replace('_', '').replace('%20','')

def simplify(name): #단순화
    global id_name_list, id_name_kor_list, name_eng_simple, name_kor_simple
    name1 = ''
    if 'nunu' in name: #누누와 윌럼프 예외처리
        return 'nunu'
    elif '누누' in name: 
        return '누누'
    elif name[0] in [chr(i) for i in list(range(65,91))+list(range(97,123))]: #알파벳...
        name1= name.lower().replace('\'', '').replace(' ', '').replace('_', '').replace('%20','')
        return name1 if name1 in name_eng_simple.values()  else name
    elif name[0] in [chr(i) for i in range(44032, 55204)]: #한글로 시작
        name1= name.replace(' ', '').replace('_', '').replace('%20','')
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
        name = name.lower().replace('\'', '').replace(' ', '').replace('_', '').replace('+','').replace('%20','')
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

with open('data.json', 'r', encoding='utf8') as f:
    user_data = json.load(f)

#print(simplify('Twisted%20Fate') in name_eng_simple.values())

#print(name_eng_simple)
print(user_data)