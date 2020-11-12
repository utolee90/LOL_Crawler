import React from 'react';
import Axios from 'axios';
import {Tabs} from 'antd';
import 'antd/dist/antd.css';
import './Main.css';
import BrowserRouter from 'react-router-dom';

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
            setResult(data)
        })
        .catch(error => console.log(error))
    }


    return (<div>
        <h2>소환사 이름으로 챔피언별 전적 검색</h2>
        <input type="text" name="username" onChange={changeName} />
        <input type="button" value="제출" onClick={submit_data}/>
        <br/>
        <span>출력 결과 </span>
        <div style={{'width':'400px', 'height':'500px', 'overflow':'scroll'}}>
        <table className="res-table">
            <thead>
                <tr>
                    <th>챔피언명</th><th>승리</th><th>패배</th><th>승률</th>
                </tr>
            </thead>
            {Object.keys(result).map(v => {
            return (v!=='time'?<tr>
                <td>{v}</td>
                <td>{(result[v]['win'])}</td>
                <td>{(result[v]['lose'])}</td>
                <td>{Math.round(parseInt(result[v]['win'])*10000/(parseInt(result[v]['win'])+parseInt(result[v]['lose'])))/100}{'%'}</td>
            </tr>:null);
        })}
        </table>
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
        setChampion(toTitleCase(e.target.value));
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


    return (<div>
        <h2>챔피언별 승률/전적</h2>
        <input type="text" name="username" onChange={changeName} />
        <input type="button" value="제출" onClick={submit_data}/>
        <br/>
        <span>출력 결과 </span>
        <div style={{'width':'400px', 'height':'500px', 'overflow':'scroll'}}>
        <span>전체 픽률 : {result[(champion.toLowerCase())]!=undefined? 
                            result[(champion.toLowerCase())]['popularity'] : null} </span>
        <span> 전체 승률 : {result[(champion.toLowerCase())]!=undefined?
                            result[(champion.toLowerCase())]['win'] : null} </span>
        <span> 전체 밴률 : {result[(champion.toLowerCase())]!=undefined? 
                            result[(champion.toLowerCase())]['ban']: null} </span>
        <table className="res-table">
            <thead>
                <tr>
                    <th>포지션</th><th>픽률</th><th>승률</th>
                </tr>
            </thead>
            {result[(champion.toLowerCase())]!=undefined?Object.keys(result[(champion.toLowerCase())]).map(v => {
            return (v!=='time'&&v!=='popularity'&&v!=='win'&&v!=='ban'?<tr>
                <td>{v}</td>
                <td>{(result[(champion.toLowerCase())][v]['popularity'])}</td>
                <td>{(result[(champion.toLowerCase())][v]['win'])}</td>
            </tr>:null);
        }):null}
        </table>
        </div> 

    </div>);
}

function Main() {
    return(
    <Tabs className="main-content" defaultActiveKey="1">
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