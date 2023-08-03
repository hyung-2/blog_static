const scroller = new Scroller(false) //스크롤 객체 생성

window.addEventListener('load', (event) => {
  //테마변경 (다크모드/일반모드)
  const mode = document.querySelector('.mode')
  const header = document.querySelector('header')
  const icons = mode.querySelectorAll('.fa-solid')
  const title = document.querySelector('.post-container .post-title input')
  const postContents = document.querySelector('.post-container .post-contents')
  const tagInput = document.querySelector('.post-container .post-tags input')

  mode.addEventListener('click',(event) => {
    document.body.classList.toggle('dark')
    header.classList.toggle('dark')
    title.classList.toggle('dark')
    postContents.classList.toggle('dark')
    tagInput.classList.toggle('dark')

    for(const icon of icons){
      icon.classList.contains('active') ? 
        icon.classList.remove('active')
        : icon.classList.add('active')
    }
  })

  //태그 입력 기능
  const tagList = document.querySelector('.post-container .post-tags ul')
  const tagslimit = 10 // 태그 갯수 제한
  const tagsLength = 10 //태그 글자수 제한

  tagInput.addEventListener('keyup', function(event){
    console.log(this) //화살표함수대신 function을 사용해 this값 활용
    console.log('태그 입력중...', event.key, tagInput.value)
    
    const trimTag = this.value.trim() //글자 양쪽의 공백 제거
    if(event.key === 'Enter' && trimTag !=='' && trimTag.length <= tagsLength && tagList.children.length < tagslimit){
      const tag = document.createElement('li')
      tag.innerHTML = `#${trimTag}<a href="#">x</a>`
      tagList.appendChild(tag)
      // tagList.innerHTML += `#${trimTag}<a href="#">x</a>` 처럼주면 input의 이벤트핸들러함수가 사라짐
      this.value = '' //입력창 초기화
    }
  })

  //태그 삭제 기능(이벤트 위임)
  tagList.addEventListener('click',function(event){
    console.log(event.target, event.target.parentElement, event.target.hasAttribute('href')) //hasAttribute : '속성'을 포함하고있는지 판단해줌
    
    event.preventDefault() //클릭했을때 브라우저의 최상단으로 가는것 막기
    if(event.target.hasAttribute('href')){
      tagList.removeChild(event.target.parentElement)
    }
  })  

  //파일입력 처리
  postContents.focus() //첫 로딩시 커서 보이기
  postContents.insertAdjacentElement("afterbegin", createNewLine())
  let lastCaretLine = postContents.firstChild //Caret -> 커서 (커서 위치의 엘리먼트)
  const uploadInput = document.querySelector('.upload input')
  uploadInput.addEventListener('change', function(event){
    const files = this.files
    console.log(files)

    if(files.length > 0){
      for(const file of files){
        const fileType = file.type
        console.log(fileType)

        if(fileType.includes('image')){
          console.log('image')
          const img = buildMediaElement('img', {src : URL.createObjectURL(file)})
          /* const img = document.createElement('img')
           img.src = URL.createObjectURL(file) //파일 임시경로 생성 
           buildMediaElement 함수로 리팩토링*/
          //편집기의 마지막 커서 위치에 파일 추가 -같은 코드라 함수로 뺌
          lastCaretLine = addFileToCurrentLine(lastCaretLine, img) //반환되는값 업데이트(마지막위치)
        }else if(fileType.includes('video')){
          console.log('video')
          const video = buildMediaElement('video', 
            {className : 'video-file',
            controls : true,
            src : URL.createObjectURL(file)}
          )

          /*const video = document.createElement('video')
          video.className = 'video-file'
          video.controls = true //프리뷰 화면에서도 볼수있게 해줌
          video.src = URL.createObjectURL(file)
          buildMediaElement 함수로 리팩토링*/
          lastCaretLine = addFileToCurrentLine(lastCaretLine, video)
        }else if(fileType.includes('audio')){
          console.log('audio')
          const audio = buildMediaElement('audio',
            {className : 'audio-file',
             controls : true,
             src : URL.createObjectURL(file)}
          )
          /*const audio = document.createElement('audio')
          audio.className = 'audio-file'
          audio.controls = true
          audio.src = URL.createObjectURL(file)
          buildMediaElement 함수로 리팩토링*/
          lastCaretLine = addFileToCurrentLine(lastCaretLine, audio)
        }else{
          console.log('file', file.name, file.size)
          const div = document.createElement('div')
          div.className = 'normal-file'
          div.conetentEditable = false //편집이 되지 않도록 막아둠 (파일을 담는 div태그 안쪽에서)
          div.innerHTML = `
            <div class="file-icon">
              <span class="material-icons">folder</span>
            </div>
            <div class="file-info">
              <h3>${getFileName(file.name, 70)}</h3>
              <p>${getFileSize(file.size)}</p>
            </div>
            `
          lastCaretLine = addFileToCurrentLine(lastCaretLine, div)
        }
      }

      // 커서 위치를 마지막으로 추가한 파일 아래쪽에 보여주기
      const selection = document.getSelection() //사용자가 드래그로 선택한 범위
      selection.removeAllRanges() //selection 초기화

      const range = document.createRange()
      range.selectNodeContents(lastCaretLine) //해당 element를 범위로 지정
      range.collapse() //범위가 아니라 커서 지정
      selection.addRange(range) //새로운 범위 설정
      postContents.focus() //편집기에 커서 보여주기
    }
  })
  postContents.addEventListener('blur', function(evnet){
    lastCaretLine = document.getSelection().anchorNode //편집기가 blur 될때 마지막 커서 위치에 있는 element 저장
    console.log(lastCaretLine.parentNode, lastCaretLine, lastCaretLine.length)
  })

  //텍스트 포맷(스타일)
  const toolBox = document.querySelector('.toolbox')
  const textTool = document.querySelector('.text-tool')
  const colorBoxes = textTool.querySelectorAll('.text-tool .color-box')
  const fontBox = textTool.querySelector('.text-tool .font-box')
  textTool.addEventListener('click', function(event){
    event.preventDefault()
    event.stopPropagation() //document 클릭 이벤트와 충돌하지 않도록 설정
    console.log(event.target)
    switch(event.target.innerText){
      case 'format_bold': 
        activeIconToggle(event.target)
        changeTextFormat('bold') //사용자가 선택한 텍스트가 볼드체로 변경
        break
      case 'format_italic':
        activeIconToggle(event.target)
        changeTextFormat('italic')
        break
      case 'format_underlined':
        activeIconToggle(event.target)
        changeTextFormat('underline')
        break
      case 'format_strikethrough':
        activeIconToggle(event.target)
        changeTextFormat('strikeThrough')
        break
      case 'format_color_text':
        activeIconToggle(event.target)
        // changeTextFormat('foreColor', 'orange')
        hideDropdown(toolBox, 'format_color_text')
        colorBoxes[0].classList.toggle('show')
        break
      case 'format_color_fill':
        activeIconToggle(event.target)
        // changeTextFormat('backColor', 'black')
        hideDropdown(toolBox, 'format_color_fill')
        colorBoxes[1].classList.toggle('show')
        break
      case 'format_size':
        activeIconToggle(event.target)
        // changeTextFormat('fontSize', 7)
        hideDropdown(toolBox, 'format_size')
        fontBox.classList.toggle('show')
        break
    }
  })
  colorBoxes[0].addEventListener('click',(event) => changeColor(event, 'foreground')) //클릭할때마다 changeColor 실행, event객체말고 다른 인자값 넣고싶을때 이런형태로 씀
  colorBoxes[1].addEventListener('click',(event) => changeColor(event, 'background'))
  fontBox.addEventListener('click', changeFontSize)

  //텍스트 정렬
  const alignTool = document.querySelector('.align-tool')
  alignTool.addEventListener('click',function(event){
    console.log(event.target.innerText)
    switch(event.target.innerText){
      case 'format_align_left':
        changeTextFormat('justifyLeft')
        break
      case 'format_align_center':
        changeTextFormat('justifyCenter')
        break
      case 'format_align_right':
        changeTextFormat('justifyRight')
        break
      case 'format_align_justify':
        changeTextFormat('justifyFull')
        break
    }
  })

  //이모티콘 추가
  const linkTool = document.querySelector('.link-tool')
  const imoticonBox = linkTool.querySelector('.link-tool .imoticon-box')
  linkTool.addEventListener('click',function(event){
    event.stopPropagation()
    console.log(event.target.innerText)
    switch(event.target.innerText){
      case 'sentiment_satisfied':
        hideDropdown(toolBox, 'sentiment_satisfied')
        imoticonBox.classList.toggle('show')
        activeIconToggle(event.target)
        break
      case 'table_view':
        break
      case 'link':
        break
      case 'format_list_bulleted':
        break
    }
  })
  imoticonBox.addEventListener('click', addImotion)
})

//공백 라인(element) 생성
function createNewLine(){
  const newline = document.createElement('div')
  newline.innerHTML = `<br/>`
  return newline
}

function addFileToCurrentLine(line, file){
  console.log(line.nodeType) //nodeType이 3이면 텍스트 노드
  if(line.nodeType === 3){
    line = line.parentNode //div엘리먼트
  }
  line.insertAdjacentElement('afterend', createNewLine())
  line.nextSibling.insertAdjacentElement('afterbegin', file)
  line.nextSibling.insertAdjacentElement('afterend', createNewLine())
  return line.nextSibling.nextSibling // 파일 하단에 위치한 공백 라인
}

//일반 파일 이름길면 ...으로 설정 (파일이름... .exe)
function getFileName(name, limit){
  console.log(name.slice(0, limit))
  console.log(name.lastindexOf('.'), name.length)
  return name.length > limit ? `${name.slice(0, limit)}...${name.slice(name.lastIndexof('.'), name.length)}` : name
}
// number : 파일용량 (Bytes)
function getFileSize(number){
  if(number < 1024){ 
    return number + 'bytes'
  }else if(number >= 1024 && number < 1048576){ // 1048576 1메가바이트
    return (number/1024).toFixed(1) + 'KB' //KB설정 toFixed는 (1)까지 끊엉줌
  }else if(number >= 1048576){
    return (number/1048576).toFixed(1) + 'MB'
  }
}

//파일입력처리란 코드중복 함수 만들어 리팩토링
//options : {className : 'audio', controls: 'true'} - element에 들어가는 속성들을 객체형태로 만듬ㄹ
function buildMediaElement(tag, options){
  const mediaElement = document.createElement(tag)
  for(const option in options){ //생성한 element에 속성 설정
    mediaElement[option] = options[option]
  }
  return mediaElement
}

//텍스트 스타일 변경
function changeTextFormat(style, param){
  console.log(style)
  document.execCommand(style, false, param)
  // postContents.focus({preventScroll: true}) //커서 설정
}

//현재 사용중인 tool 색상 변경
function activeIconToggle(event){
  event.classList.toggle('active-icon')
}

//드롭다운 숨기기
function hideDropdown(toolbox, currentDropdown){
  const dropdown = toolbox.querySelector('.select-menu-dropdown.show')
  if(dropdown){
    console.log(currentDropdown) //현재 클릭한 아이콘
    console.log(dropdown?.parentElement)}
    //현재 text-tool 요소 안쪽에서 열려있는 드롭다운 메뉴 조회
    if(dropdown && dropdown.parentElement.querySelector('a span').innerText !== currentDropdown){
      dropdown.classList.remove('show')
      // dropdown.previousElementSibling.firstChild.classList.remove('active-icon')
      console.log(dropdown)
    }
}

//드롭다운 외부 클릭시 창 닫히기
document.addEventListener('click', function(e){
  console.log(e.target)
  //현재 열려있는 드롭다운 메뉴 조회
  const dropdown = document.querySelector('.select-menu-dropdown.show')
  console.log(dropdown.parentElement)
  if(dropdown && !dropdown.contains(e.target)){
    dropdown.classList.remove('show')
    dropdown.previousElementSibling.firstChild.classList.remove('active-icon')
    dropdown.parentElement.classList.remove('active-icon')
  }
})

//클릭한 색상으로 바꾸기
function changeColor(event, mode){
  event.stopPropagation() //상위요소로 클릭이벤트가 버블링되지 않게함

  if(!event.target.classList.contains('select-menu-dropdown')){
    console.log(mode, event.target)
    console.log(event.target.parentNode.parentNode)
    switch(mode){
      case 'foreground':
        changeTextFormat('foreColor', event.target.style.backgroundColor) //글자색 변경
        break
      case 'background':
        changeTextFormat('backColor', event.target.style.backgroundColor) //배경색 변경
        break  
    }
    event.target.parentElement.classList.remove('show') //색상 클릭시 드롭다운 숨기기
    // console.log(event.target.parentNode.previousElementSibling.firstChild)
    event.target.parentNode.previousElementSibling.firstChild.classList.remove('active-icon')
    event.target.parentNode.parentNode.classList.remove('active-icon')
  }
}

//클릭한 폰트사이즈로 바꾸기
function changeFontSize(event){
  event.stopPropagation() //상위요소로 클릭이벤트가 버블링되지 않게함

  if(!event.target.classList.contains('select-menu-dropdown')){
    changeTextFormat('fontSize', event.target.id) //폰트 크기 변경
    event.target.parentElement.classList.remove('show') //색상 클릭시 드롭다운 숨기기
    event.target.parentNode.previousElementSibling.firstChild.classList.remove('active-icon')
    event.target.parentNode.parentNode.classList.remove('active-icon')
  }
}

//클릭한 이모티콘 추가
function addImotion(event){
  event.stopPropagation()
  console.log(event.target)
  if(!event.target.classList.contains('select-menu-dropdown')){
    changeTextFormat('insertText', event.target.innerText)
    event.target.parentElement.classList.remove('show')
    event.target.parentNode.previousElementSibling.firstChild.classList.remove('active-icon')
  }
}