import React from 'react';
import Axios from 'axios';
import {Tabs, Input, Button, Table } from 'antd';
import 'antd/dist/antd.css';
import './Main.css';
import BrowserRouter from 'react-router-dom';
import {ChampData, array_id, array_en, array_kr} from './ChampData.jsx';

const {TabPane} = Tabs;
const GetURL = 'http://localhost:5000/'

function SearchBySummoner(){


    const [username, setUsername] = React.useState('');
    const [result, setResult] = React.useState(Object()); //빈 오브젝트 생성

    const changeName = (e) =>{ //이름 지정
        setUsername(e.target.value);
    }

    const submit_data = () =>{
        Axios.get(GetURL+'user/'+username)
        .then(res =>{ 
            const { data } = res;
            console.log(data);
            setResult(data);
        })
        .catch(error => console.log(error))
    }

    function champ_name_link(text) { 
        if (array_kr.indexOf(text) !==-1) {
        var valx = ChampData(text, 'kr', 'en').toLowerCase();
        var url = 'https://www.op.gg/champion/'+valx+'/statistics/'
        return <a href={url}>{text}</a>;
        }
        else{
            return text;
        }
    }

    const table_columns = [ 
        {title:'챔피언 이름', dataIndex:'champion', 
        render: (text)=>(champ_name_link(text)) 
        }, 
        {title:'승리', dataIndex:'win'}, 
        {title:'패배', dataIndex:'lost'}, 
        {title:'승률', dataIndex:'win_rate'}
    ]

    let table_data = []

    if (result['time']) {

    table_data = Object.entries(result).map((val) => {
        if (val && val[0]!=='time') {
        var win_rate_val = Math.round( parseInt(val[1][0])*10000/( parseInt(val[1][0])+parseInt(val[1][1])))/100;
        var win_rate = win_rate_val+'%';
        }
        return (val && val[0]!== 'time'? 
        {key:Object.entries(result).indexOf(val) , champion:val[0], win:val[1][0], lost:val[1][1], 
         win_rate:win_rate}
        : null);
    })
    }
    
    return (<div>
        <h2>소환사 이름으로 챔피언별 전적 검색</h2>
        <Input placeholder="소환사명" name="username" onChange={changeName} style={{'width':'300px', 'float':'left'}}/>
        <Button type="button" onClick={submit_data} style={{'width':'96px', 'float':'left'}}> 소환사 검색 </Button>
        <br/>
        <h3>출력 결과 </h3>
        <div style={{'width':'400px', 'height':'400px', 'overflow':'auto'}}>
        <Table columns={table_columns} dataSource={table_data?table_data:[]} pagination={{pageSize:5}}/>
        
        </div> 

    </div>);
}

function SearchByChampion(){

    const [champion, setChampion] = React.useState(''); 
    const [result, setResult] = React.useState(Object()); //빈 오브젝트 생성

    const toTitleCase = (str) => {
        return str.replace(
          /\w\S*/g,
          function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          }
        );
      }

    const changeName = (e) =>{ //이름 지정
        if (array_id.indexOf(e.target.value) !=-1) { //숫자
            setChampion(toTitleCase(ChampData(e.target.value, 'num', 'en')));
        }
        else if (array_en.indexOf(e.target.value) !=-1) { //영어
            setChampion(toTitleCase(e.target.value));
        }
        else if (array_en.indexOf(e.target.value) !=-1){ //한글
            setChampion(toTitleCase(ChampData(e.target.value, 'kr', 'en')));
            
        }
        console.log(champion)
    }

    const submit_data = () =>{
        Axios.get(GetURL+'champ/'+champion)
        .then(res =>{ 
            const { data } = res;
            console.log(data);
            setResult(data)
        })
        .catch(error => console.log(error))
    }

    const table_columns = [ 
        {title:'포지션', dataIndex:'position'}, 
        {title:'픽률', dataIndex:'pick_rate'}, 
        {title:'승률', dataIndex:'win_rate'}
    ];

    let table_data = []

    const null_drop = (arr) => {
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

    if (result['time']) {

    table_data = null_drop(  Object.keys(result[(champion.toLowerCase())]).map(v => {
        if (['Top', 'Mid', 'Jungler', 'Support','AD Carry'].indexOf(v)!=-1){
            return (v?
                {key:Object.keys(result[(champion.toLowerCase())]).indexOf(v),
                position : v,
                pick_rate : result[(champion.toLowerCase())][v]['popularity'],
                win_rate : result[(champion.toLowerCase())][v]['win']
                }
               :null);
            }
        }));
     
    }


    return (<div>
        <h2>챔피언별 승률/전적</h2>
        <Input placeholder="챔피언명(한글/영어)" name="champion" onChange={changeName} style={{'width':'300px', 'float':'left'}}/>
        <Button type="button" onClick={submit_data} style={{'width':'96px', 'float':'left'}}>챔피언 검색 </Button>
        <br/>
        <h3>출력 결과 </h3>
        <div style={{'width':'400px', 'height':'300px'}}>
        <span>전체 픽률 : {result[(champion.toLowerCase())]!=undefined? 
                            result[(champion.toLowerCase())]['popularity'] : null} </span>
        <span> 전체 승률 : {result[(champion.toLowerCase())]!=undefined?
                            result[(champion.toLowerCase())]['win'] : null} </span>
        <span> 전체 밴률 : {result[(champion.toLowerCase())]!=undefined? 
                            result[(champion.toLowerCase())]['ban']: null} </span>
        <Table columns={table_columns} dataSource={table_data?table_data:[]} pagination={{pageSize:6}}/>
        
        </div> 

    </div>);
}

function Main() {
    return(
    <Tabs className="main-content" defaultActiveKey="1" style={{'width':'400px'}}>
        <TabPane tab="소환사별 검색" key="1">
            <SearchBySummoner/>
        </TabPane>
        <TabPane tab="챔피언별 승률" key="2">
            <SearchByChampion/>
        </TabPane>
    </Tabs>
    );
}


export default Main;