(function () {
    const day = new Date();  //오늘 날짜 가져오기
    const container = document.querySelector('.container');
    let showyear = document.querySelector('.year');
    let showmonth = document.querySelector('.month');

    function makeWeek() {
        let week = document.querySelector('.week');

        const weekday = ['SUN', 'MON', 'TUE', 'WES', 'THR', 'FRI', 'SAT'];
        for (let i = 0; i < weekday.length; i++) {
            let daycell = document.createElement('div');
            daycell.classList.add('daycell');  //클래스 이름 추가
            daycell.textContent = weekday[i];
            week.appendChild(daycell); //week태그에 만들어준 daycell을 차례대로 붙여줌
        }
    }

    function createDayContainer(d,content) {  //달력 한 칸 한 칸에 들어갈 태그
        return `<div class="day-container">
                <div class="day">${d}</div>
                <div class="content">${content}</div>
            </div>`
    }

    function settingTodoList(date) {  //해당 달의 달력을 만들어줄때 가져올 todolist들이 있다면 만들어주기
        //console.log('settingTodoList()',date);
        const select = convertToKey(date);
        const list = getLocalStorage(select);
        //console.log('list확인',list);
        
        if(list === null) {
            return '';
        }

        let temp = '';
        
        if(list.length > 4) {
            for(let i = 0; i < list.length; i++){
                if(i === 3) {
                    temp += `<p class="todo">${list.length - 3}개 더보기</p>`
                }else {
                    temp += `<p class="todo">${list[i].text}</p>`;
                }
            }
        }else {
            for(let i = 0; i < list.length; i++){
                temp += `<p class="todo">${list[i].text}</p>`;
            }
        }

        return temp;
    }

    function presentforLastdate(d) { //해당 달의 마지막 날을 가져옴 /31인지 30일인지 28인지 다름
        return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    }

    function presentforFirstday(d) {  //해당 달의 첫번째 날의 요일을 가져옴
        return new Date(d.getFullYear(), d.getMonth(), 1).getDay();
    }

    function presentforLastday(d) {  //해당 달의 마지막 날의 요일을 가져옴
        return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDay();
    }

    function makeMonth(day) {  //보이는 전체 달력 이미지 만들어주는 부분
        showyear.textContent = `${new Date(day).getFullYear()}`;
        showmonth.textContent = `${new Date(day).getMonth() + 1}`;  //getMonth는 0부터 시작하니까 현재달을 구하려면 +1을 해줘야 함

        let temp = '';

        for (let i = 0; i < presentforFirstday(day); i++) {  //해당 달의 요일 시작 전까지 빈칸이어야 
            temp += createDayContainer('','');
        }
        for (let i = 0; i < presentforLastdate(day); i++) { //날짜 넣어주기
            const todoList = settingTodoList(i + 1); //만약에 로컬스토리에서 가져올 todo가 있다면 가져오기
            temp += createDayContainer(`${i + 1}`,todoList);  //그런 뒤에 content에 붙여넣기
        }

        for (let i = 0; i < 7 - presentforLastday(day) - 1; i++) {  //마지막 주의 끝까지 날짜가 없을 때 빈칸이어야 함
            temp += createDayContainer('','');
        }

        container.innerHTML = temp;
        
    }
    //원래 init()함수 넣었던 위치

    const today = document.querySelector('.today');
    today.textContent = `${day.getMonth() + 1}월 ${day.getDate()}일`;  //오늘 날짜인 day를 기준으로 오늘의 달과 일을 가져오기

    //이전을 눌렀을 때 현재 보여지는 달력의 이전 달을 보여줘야 함
    const navbar = document.querySelector('.navbar');

    navbar.addEventListener('click', function (event) {  //맨 위에 오늘, 보여지는 달 표시, 이전, 다음 표시
        const target = event.target;
        let textContent = target.textContent;
        let changeMonth;
        let year = showyear.textContent;  //2021

        let tempDate = day;
        console.log(tempDate);

        if (textContent === '이전') {
            changeMonth = Number(showmonth.textContent) - 2; //2를 빼줘야 전달이라는 것을 알 수 있음
            tempDate = new Date(year, changeMonth);
            console.log('tempDate',tempDate);
        } else if (textContent === '다음') {
            changeMonth = Number(showmonth.textContent);  //12
            tempDate = new Date(year, changeMonth); //2021.12 --> 2022.01로 바뀌는 것?
            //2022.1  
        }
        makeMonth(tempDate);
    });

    //연도,월,날짜를 키라고 생각하고 배열(객체로)로 값을 넣어줌 

    function setLocalStorage(selectDate,content) {
        let selectList = getLocalStorage(selectDate);
        //console.log('selectList content',selectList,content);
        if(selectList === null) {
            selectList = [content];  //맨처음에 todo가 없을때는 todo를 만들어줘야 함
        }else {
            selectList = content;
        }
        (localStorage.setItem(selectDate,JSON.stringify(selectList)));
    }

    function getLocalStorage(selectDate) {
        return JSON.parse(localStorage.getItem(selectDate));
    }

    //todolist추가하는 부분
    const modal_make = document.querySelector('.modal_make');  //todolist를 만들어주는 부분
    let modal_textcontent = modal_make.querySelector('.modal_textarea'); 

    const modal_modify = document.querySelector('.modal_modify');  //존재하는 todolist를 수정하는 모달
    let modify_text = modal_modify.querySelector('.modal_textarea');
    const modify = modal_modify.querySelector('.modify');  //수정 모달의 수정버튼
    const deleteButton = modal_modify.querySelector('.delete');  //수정 모달의 삭제 버튼
    const showAllTodo = document.querySelector('.modal_showAllTodo');
    let selectTarget;

    let selectDate;  //선택한 날짜(localstorage의 키)
    let tempSelectTargetText;  //선택된 todo의 textContent

    function convertToKey(x = selectDate) {  //누른 날짜 년,월,일을 키로 쓰기 위해서 변환
        let pushMonth = showmonth.textContent;
        let pushDate = x;

        if(Number(showmonth.textContent < 10)) {
            pushMonth = '0' + showmonth.textContent;
        }
        if(Number(x < 10)) {
            pushDate = '0' + x;
        }
        const storeDate = showyear.textContent + pushMonth + pushDate;

        return storeDate; //다른 곳에서 쓰기 위해서 현재 날짜를 보내줌
    }

    function findorder(text) {  //지금 선택한 할일이 그 날 목록에 몇번 째에 있는지 보이기
        const storeDate = convertToKey();
        const list = getLocalStorage(storeDate);
        let num = null;

        for(let i = 0; i < list.length; i++) {
            if(list[i].text === text) {
                num = i;
            }
        }
        return num;
    }

    //todolist 삭제
    deleteButton.addEventListener('click',function() {      
        const storeDate = convertToKey();  //target의 년월일 받아오기
        let list = getLocalStorage(storeDate);  //년월일로 그 날의 todolist가져오기
        list.splice(findorder(tempSelectTargetText),1);
        setLocalStorage(storeDate,list);//todolist에서 누른 todo의 text를 바꿔주기
    
        modal_textcontent.value = ''; //다시 초기화를 해주지 않으면 앞에서 넣어준 코드가 그대로 실행이 됨 그러므로 반드시 초기화 필수
        modal_modify.style.visibility = 'hidden';
        let tempDate = new Date(showyear.textContent, showmonth.textContent - 1);
        makeMonth(tempDate);  //지워줘서 localstorage가 갱신되었으므로 다시 그려줘야 함
    });

    //todolist 수정
    function goToDoList(text,day,top,left){  //todo를 눌렀을 때
        if(text.includes('더보기')){
            const select = convertToKey(day);  //누른 날짜의 todo 목록 가져오기 위해서 키가 생성
            const list = getLocalStorage(select);  //키값을 통해서 해당 날짜의 리스트 가져오기
            let temp = `<div class="day">${day}</div>`;
            for(let i = 0; i < list.length; i++) {
                temp += `<p class="todo">${list[i].text}</p>`; //모든 todolist를 보여주기 위해서 p태그를 만듬
            }
            showAllTodo.innerHTML = temp;  //innerHTML 기존에 있던 것들을 전부 덮어써버림

            showAllTodo.style.top = top - 30 + 'px';  //todolist전부 다 보여주는 모달창 위치 변경
            showAllTodo.style.left = left - 25 + 'px';
            showAllTodo.style.visibility = 'visible';            
        }else {
            modal_modify.style.visibility = 'visible';
            modify_text.value = text;
            tempSelectTargetText = text; //선택된 todo의 textContent
        }        
    }

    //~개 더보기를 눌렀을 때
    showAllTodo.addEventListener('click',function(event){
        showAllTodo.style.visibility = 'hidden';
        modal_modify.style.visibility = 'visible';
        console.log(event);
        modify_text.value = event.target.textContent; //수정된 내용 넣기
        selectTarget = event.target;  //selectTarget을 기존의 ~개 더보기에서 내가 누른 태그로 바꿔주기
        //바꿔줘야 내가 새롭게 누른 태그를 수정할 수 있음
        tempSelectTargetText = event.target.textContent;  //여기서 찾는 text변경(~개 더보기에서 내가 다시 누른 걸로)
    });

    
    modify.addEventListener('click',function(){  //수정을 하기위해서 수정버튼을 누르면 textarea에 커서가 있도록
        modify_text.focus();
    });

    const modify_replay = modal_modify.querySelector('.modify_replay');
    modify_replay.addEventListener('click', function () {   //todolist수정할 때 모달창에서 저장을 눌렀을 때
        selectTarget.textContent = modify_text.value; //수정된 내용 넣기
        
        const storeDate = convertToKey();  //target의 년월일 받아오기
        let list = getLocalStorage(storeDate);  //년월일로 그 날의 todolist가져오기

        list[findorder(tempSelectTargetText)] = {text: selectTarget.textContent};
         //todolist에서 누른 todo의 text를 바꿔주기

        setLocalStorage(storeDate,list);
    
        modal_textcontent.value = ''; //다시 초기화를 해주지 않으면 앞에서 넣어준 코드가 그대로 실행이 됨 그러므로 반드시 초기화 필수
        modal_modify.style.visibility = 'hidden';
        let tempDate = new Date(showyear.textContent, showmonth.textContent - 1);
        makeMonth(tempDate);
    });

    container.addEventListener('click', function (event) {  //container클릭하면
        let target = event.target;
        console.log('event',event);

        if(target.classList.contains('day-container')) {  //day-container 자체를 눌렀을때
            target = target.children[1];
        }
   
        if (target.classList.contains('todo')) {    //todo태그를 눌렀을 때
            selectDate = target.parentNode.previousElementSibling.textContent;  //day클래스 가져오기(누른 날짜)
            const left = Math.ceil(target.parentNode.parentNode.getBoundingClientRect().left);
            const top = Math.ceil(target.parentNode.parentNode.getBoundingClientRect().top);
            goToDoList(target.textContent,selectDate,top,left);
        }else{  //content태그를 눌렀을 때
            selectDate = target.previousElementSibling.textContent;  //선택한 날의 날짜
            modal_make.style.visibility = 'visible';
            modal_textcontent.focus();
        }

        selectTarget = target;

    });

    //todolist추가하는 부분
    modal_textcontent.addEventListener('keydown',function(event){
        //event.keycode도 동일하게 쓰일 수 있지만 event.key로 대체 할 수 있다면 대체해서 쓰는 것이 좋다

        if(event.key === 'Enter'){ //enter에 e가 대문자임을 주의!
            const p = document.createElement('p'); //문장 만드는 태그
            p.classList.add('todo');//li태그로 바꿨을 때는 왜 text-overflow가 안되는지 
            p.textContent = modal_textcontent.value;  //텍스트에 써진 문자 가져와서 p의 textContent를 넣어줌
            selectTarget.appendChild(p);

            const storeDate = convertToKey();  //년월일로 키만들어주기
            let list = getLocalStorage(storeDate);

            if(list === null) {  //만약에 list를 가져왔는데 아무것도 없다면 처음 넣어주는 것
                list = {text: modal_textcontent.value}; 
            }else {  //이제 부터 배열이니까 
                list.push({text: modal_textcontent.value});
            }
            setLocalStorage(storeDate,list); //위에서 만든 키로 todo저장

            modal_textcontent.value = '';
            modal_make.style.visibility = 'hidden';
            let tempDate = new Date(showyear.textContent, showmonth.textContent - 1);
            makeMonth(tempDate);
        }
    });

    const modal_replay = modal_make.querySelector('.modal_replay');
    modal_replay.addEventListener('click', function () {
        console.log(selectTarget);

        const p = document.createElement('p'); //문장 만드는 태그
        p.classList.add('todo');
        p.textContent = modal_textcontent.value;  //텍스트에 써진 문자 가져와서 p의 textContent를 넣어줌
        selectTarget.appendChild(p);

        const storeDate = convertToKey();  //년월일로 
        
        let list = getLocalStorage(storeDate);
        
        if(list === null) {
            list = {text: modal_textcontent.value};
        }else {
            list.push({text: modal_textcontent.value});
        }

        setLocalStorage(storeDate,list);

        modal_textcontent.value = ''; //다시 초기화를 해주지 않으면 앞에서 넣어준 코드가 그대로 실행이 됨 그러므로 반드시 초기화 필수
        modal_make.style.visibility = 'hidden';
        let tempDate = new Date(showyear.textContent, showmonth.textContent - 1);

        makeMonth(tempDate);
    });

    function init(){  //페이지에 들어가자마자 실행할 함수(월화수목금토일(요일 만들기), 달력 만들기)
        makeWeek(); //요일 만들어줌
        makeMonth(day);  //오늘에 해당하는 달을 만들어줌(달력html에 들어가자마자 보이는 페이지)
    }
    init(); 
}());
