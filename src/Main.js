import React from 'react';
import Axios from 'axios';
import {Tabs, Input, Button, Table, AutoComplete } from 'antd';
import 'antd/dist/antd.css';
import './Main.css';
import BrowserRouter from 'react-router-dom';
import {ChampData, array_id, array_en, array_kr, array_en_simple, array_kr_simple} from './ChampData.jsx';
import {LinkOutlined} from '@ant-design/icons';

const {TabPane} = Tabs;
const GetURL = 'http://localhost:5000/'

function SearchBySummoner(){

    const [result, setResult] = React.useState(Object()); //빈 오브젝트 생성
    const [userList, setUserList] = React.useState([]); // 빈 리스트 생성
    const [value, setValue] = React.useState('');
    const [table_data, setTableData] = React.useState([]); //테이블 데이터로 생성

    const changeName = (data) => {
        setValue(data);
      };

    const submit_data = () =>{
        var timerec = new Date().getTime(); //시간 추가
        setTableData([{key:0, champion:'데이터 로딩중'}]);

        Axios.get(GetURL+'user/'+value)
        .then(res =>{ 
            const { data } = res;
            console.log(data);
            setResult(data);
            setUserList([...userList, {value: value}]) // 성공시에 userlist 추가
            result['time']? //테이블 정보 갱신. 
                setTableData(Object.entries(result).map((val) => { //var i=0; ++i;
                if (val && val[0]!=='time') {
                var win_rate_val = Math.round( parseInt(val[1][0])*10000/( parseInt(val[1][0])+parseInt(val[1][1])))/100;
                var win_rate = win_rate_val+'%';
                }
                return (val && val[0]!== 'time'? 
                {key:Object.keys(result).indexOf(val[0]) , champion:val[0], win:val[1][0], lost:val[1][1], 
                 win_rate:win_rate}
                : null);
            })):
            setTableData([])
            console.log('조회시간', (new Date().getTime()-timerec)/1000);
        })
        .catch(error => console.log(error))
    }

    function champ_name_link(text) { 
        if (array_kr.indexOf(text) !==-1 ) {
        var valx = array_en_simple[array_kr.indexOf(text)] // en simple
        var url = 'https://www.op.gg/champion/'+valx+'/statistics/'
        return <a href={url}>{text}</a>;
        }
        else if (array_kr_simple.indexOf(text) !==-1 ) {
            valx = array_en_simple[array_kr_simple.indexOf(text)] // en simple
            url = 'https://www.op.gg/champion/'+valx+'/statistics/'
            return <a href={url}>{ChampData(text, 'kr', 'kr', false)}</a>; //원래 이름으로 출력
            }
        else if (array_en.indexOf(text) !==-1 ) {
                valx = array_en_simple[array_en.indexOf(text)] // en simple
                url = 'https://www.op.gg/champion/'+valx+'/statistics/'
                return <a href={url}>{text}</a>;
                }
        else if (array_en_simple.indexOf(text) !==-1 ) {
                    valx = text // en simple
                    url = 'https://www.op.gg/champion/'+valx+'/statistics/'
                    return <a href={url}>{ChampData(text, 'en', 'en', false)}</a>;
            }
        else {
            return text;
        }
    }

    const table_columns = [ 
        {title:'챔피언 이름', dataIndex:'champion', 
        render: (text)=> (champ_name_link(text)) 
        }, 
        {title:'승리', dataIndex:'win'}, 
        {title:'패배', dataIndex:'lost'}, 
        {title:'승률', dataIndex:'win_rate'}
    ]

    
    return (<div>
        <h2>소환사 이름으로 챔피언별 전적 검색</h2>
        <h3>참조 : <a href="https://op.gg/champion/"><LinkOutlined/> OP.GG</a> </h3>
        <div style={{'width':'480px'}}>
        <AutoComplete value={value} options={userList} placeholder="소환사명" name="username" onChange={changeName} style={{'width':'300px', 'float':'left'}}/>
        <Button type="button" onClick={submit_data} style={{'width':'96px'}}> 소환사 검색 </Button>
        </div>
        <br/>
        <h3>출력 결과 </h3>
        <div style={{'width':'480px', 'height':'400px', 'overflow':'auto'}}>
        <Table onChange={submit_data} columns={table_columns} dataSource={table_data?table_data:[]} pagination={{pageSize:5, padding:'20px', size:'small'}} style={{'width':'400px'}}/>
        
        </div> 

    </div>);
}

function SearchByChampion(){

    const [champion, setChampion] = React.useState(''); 
    const [temp, setTemp] = React.useState(''); //갱신 오류를 방지하기 위해 챔피언 이름 임시저장 변수 생성
    const [result, setResult] = React.useState(Object()); //빈 오브젝트 생성
    const [value, setValue] = React.useState('') // value
    const [options, setOptions] = React.useState([]); // 자동완성 옵션...
    const [table_data, setTableData] = React.useState([]);
    const array_champ = [...array_kr, ...array_en]; 

    const changeName = (data) =>{ //이름 지정
        setValue(data);

        if (array_id.indexOf(data) !==-1  ){ //숫자
            setChampion(ChampData(data, 'num', 'en', true));
        } 
        else {
            if (data.slice(0,4).toLowerCase() === 'nunu')
            setValue(data.replace(' ','').replace("'", "").replace('.','').replace('_', '').toLowerCase()); // 데이터 단순화. 
            if (array_en_simple.indexOf(data) !==-1 ) { //영어
                setChampion(ChampData(data, 'en', 'en', true));
            }
            else if (array_kr_simple.indexOf(data) !==-1 ){ //한글
                setChampion(ChampData(data, 'kr', 'en', true));
            }
        }
        console.log(champion)
    }

    const searchChamp = (text) => {
        setOptions(!text? 
            array_champ.map(v=>({value:v})) : 
            array_champ.map(v=> (text==v.slice(0, text.length)?({value:v}):undefined)).filter(Boolean)
        )
    }

    const null_drop = (arr) => { //null 없애기...
        var res = [];
        if (typeof(arr)=='object'){
        for (var v of arr){
            if (v){
                res.push(v)
            }
        }
    }
        return res;
    }

    const submit_data = () =>{
        setTemp(champion); // 변수명을 챔피언 이름으로 일시지정.
        setTableData([{key:0, position:'Data Loading'}])
        Axios.get(GetURL+'champ/'+champion)
        .then(res =>{ 
            const { data } = res;
            console.log(data);
            setResult(data);
            (result[(champion.toLowerCase())] && result['time'])?
            setTableData(null_drop(Object.keys(result[temp]).map(v => {
                if (['Top', 'Mid', 'Jungler', 'Support','AD Carry'].indexOf(v)!==-1){
                    return (v?
                        {key:Object.keys(result[temp]).indexOf(v),
                        position : v,
                        pick_rate : result[temp][v]['popularity'],
                        win_rate : result[temp][v]['win']
                        }
                       :null);
                    }
                }
                )))
            :setTableData([]);
            
             
        })
        .catch(error => console.log(error))
    }

    const table_columns = [ 
        {title:'포지션', dataIndex:'position'}, 
        {title:'픽률', dataIndex:'pick_rate'}, 
        {title:'승률', dataIndex:'win_rate'}
    ];
    

    return (<div>
        <h2>챔피언별 승률/전적</h2>
        <h3>참조 : <a href="https://leagueofgraphs.com/champions"><LinkOutlined/> League of Graphs</a> </h3>
        <div style={{'width':'480px'}}>
        <AutoComplete value={value} options={options} placeholder="챔피언명(한글/영어/챔피언ID)" name="champion" onSearch={searchChamp} onChange={changeName} style={{'width':'300px', 'float':'left'}}/>
        <Button type="button" onClick={submit_data} style={{'width':'96px'}}>챔피언 검색 </Button>
        </div>
        <br/>
        <h3>챔피언 {ChampData(champion, 'en', 'kr', false)} 전적</h3>
        <div style={{'width':'400px', 'height':'300px'}}>
        <span>전체 픽률 : {result[(temp.toLowerCase())]!==undefined? 
                            result[(temp.toLowerCase())]['popularity'] : null} </span>
        <span> 전체 승률 : {result[(temp.toLowerCase())]!==undefined?
                            result[(temp.toLowerCase())]['win'] : null} </span>
        <span> 전체 밴률 : {result[(temp.toLowerCase())]!==undefined? 
                            result[(temp.toLowerCase())]['ban']: null} </span>
        <Table onChange={submit_data} columns={table_columns} dataSource={table_data?table_data:[]} pagination={{pageSize:6, hideOnSinglePage:true}} style={{'width':'400px'}}/>
        
        </div> 

    </div>);
}

function TeamChampWin() {
    //승률 함수
    const [winrate0, setWinRate0] = React.useState(''); //승률 정의
    const [winrate1, setWinRate1] = React.useState('');  //승률 정의
    const [winrate2, setWinRate2] = React.useState('');  //승률 정의
    const [winrate3, setWinRate3] = React.useState('');  //승률 정의
    const [winrate4, setWinRate4] = React.useState(''); //승률 정의
    
    const [user0, setUser0] = React.useState(''); //사용자 이름
    const [user1, setUser1] = React.useState(''); //사용자 이름
    const [user2, setUser2] = React.useState(''); //사용자 이름
    const [user3, setUser3] = React.useState(''); //사용자 이름
    const [user4, setUser4] = React.useState(''); //사용자 이름
    const [champ0, setChamp0] = React.useState(''); //챔피언 이름
    const [champ1, setChamp1] = React.useState(''); //챔피언 이름
    const [champ2, setChamp2] = React.useState(''); //챔피언 이름
    const [champ3, setChamp3] = React.useState(''); //챔피언 이름
    const [champ4, setChamp4] = React.useState(''); //챔피언 이름
    
    //사용자 이름 변경 함수
    const changeName0 = (data) => (setUser0(data.target.value));
    const changeName1 = (data) => (setUser1(data.target.value));
    const changeName2 = (data) => (setUser2(data.target.value));
    const changeName3 = (data) => (setUser3(data.target.value));
    const changeName4 = (data) => (setUser4(data.target.value));
   
    // 챔피언 이름 변경함수
    const changeChamp0 = (data) => (setChamp0(data.target.value));
    const changeChamp1 = (data) => (setChamp1(data.target.value));
    const changeChamp2 = (data) => (setChamp2(data.target.value));
    const changeChamp3 = (data) => (setChamp3(data.target.value));
    const changeChamp4 = (data) => (setChamp4(data.target.value));

    const setNameEng = (data) => { // 영어이름으로 고치기... 
        if (array_id.indexOf(data) !==-1  ){ //숫자
            return ChampData(data, 'num', 'en', true);
        }
        else {
            data = data.replace(' ','').replace("'", "").replace('.','').replace('_', '').toLowerCase(); // 문자 단순화
            if (data.slice(0,2) === '누누') {
                data='누누'; //데이터 단순화
            }
            else if (data.slice(0,4) === 'nunu') {
                data = 'nunu';
            }
            if (array_en_simple.indexOf(data) !==-1 ) { //영어
                return ChampData(data, 'en', 'en', true);
            }
            else if (array_kr_simple.indexOf(data) !==-1 ){ //한글
                return ChampData(data, 'kr', 'en', true);
            }
            else {
                return data;
            }
        }
    };

    let user = [user0, user1, user2, user3, user4]
    let champ = [champ0, champ1, champ2, champ3, champ4]
    let set_winrate = [setWinRate0, setWinRate1, setWinRate2, setWinRate3, setWinRate4] // Win Rate 함수

    const send_data = () =>{
        if (user.filter(Boolean).length + champ.filter(Boolean).length ===10) { //모두 null이 아닐 때에만 데이터 전송.
        var cname = [0,1,2,3,4].map(v=> setNameEng(champ[v]));
        
        [0,1,2,3,4].map( i=> {
            set_winrate[i]('자료없음');
            Axios.get(GetURL+'user/'+user[i])
            .then(res =>{ 
            const { data } = res;
            console.log(data);
            console.log(i, user[i], cname[i], data[cname[i]]);
        if (data['time'] && data[cname[i]]) { //승률 정보 갱신.
            var win_rate_dat = Math.round( parseInt(data[cname[i]][0])*10000/( parseInt(data[cname[i]][0])+parseInt(data[cname[i]][1])))/100 + '%'; 
            console.log(i, win_rate_dat);
            set_winrate[i](win_rate_dat)
        }
        else if (data['time'] && !data[cname[i]]) {
            set_winrate[i]('전적없음');
        }
        }).catch(error => {console.log(error);
            set_winrate[i]('조회실패');
            })
            
        });
        
    }

    }


    return(<div> <h2>팀원들의 각 챔피언 승률 및 전적</h2>
    <h3>참조 : <a href="https://op.gg/champion/"><LinkOutlined/> OP.GG</a> </h3>
    <div>사용자 ID와 챔피언 정보를 전부 입력해야 데이터를 조회할 수 있습니다.</div>
        <div style={{'width':'480px'}}>
                <div key={0}>
                    <Input addonBefore={'유저1'} placeholder={'유저명1'} style={{'width':'220px'}} onChange={changeName0} value={user0}/>
                    <Input placeholder={'챔피언1'} style={{'width':'160px'}} onChange={changeChamp0} value={champ0}/>
                    <div>전적: <span onChange={setWinRate0}>{winrate0}</span></div>
                </div>
                <div key={1}>
                    <Input addonBefore={'유저2'} placeholder={'유저명2'} style={{'width':'220px'}} onChange={changeName1} value={user1}/>
                    <Input placeholder={'챔피언2'} style={{'width':'160px'}} onChange={changeChamp1} value={champ1}/>
                    <div>전적 : <span onChange={setWinRate1}>{winrate1}</span></div>
                </div>
                <div key={2}>
                    <Input addonBefore={'유저3'} placeholder={'유저명3'} style={{'width':'220px'}} onChange={changeName2} value={user2}/>
                    <Input placeholder={'챔피언3'} style={{'width':'160px'}} onChange={changeChamp2} value={champ2}/>
                    <div>전적 : <span onChange={setWinRate2}>{winrate2}</span></div>
                </div>
                <div key={3}>
                    <Input addonBefore={'유저4'} placeholder={'유저명4'} style={{'width':'220px'}} onChange={changeName3} value={user3}/>
                    <Input placeholder={'챔피언4'} style={{'width':'160px'}} onChange={changeChamp3} value={champ3}/>
                    <div>전적 : <span onChange={setWinRate3}>{winrate3}</span></div>
                </div>
                <div key={4}>
                    <Input addonBefore={'유저5'} placeholder={'유저명5'} style={{'width':'220px'}} onChange={changeName4} value={user4}/>
                    <Input placeholder={'챔피언5'} style={{'width':'160px'}} onChange={changeChamp4} value={champ4}/>
                    <div>전적 : <span onChange={setWinRate4}>{winrate4}</span></div>
                </div>
            
            <Button onClick={send_data}>승/패 검색</Button>
        </div>
    </div>
    )

}

function Main() {
    return(
    <Tabs className="main-content" defaultActiveKey="1" style={{'width':'480px', 'padding':'10px'}}>
        <TabPane tab="소환사별 검색" key="1">
            <SearchBySummoner/>
        </TabPane>
        <TabPane tab="챔피언별 승률" key="2">
            <SearchByChampion/>
        </TabPane>
        <TabPane tab="팀 챔피언 승률" key="3">
            <TeamChampWin/>
        </TabPane>
    </Tabs>
    );
}


export default Main;